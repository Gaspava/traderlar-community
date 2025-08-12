import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const sortBy = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get category ID first if filtering by category
    let categoryId = null;
    if (categorySlug) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      categoryId = categoryData?.id;
    }

    // Build simple query
    let query = supabase
      .from('forum_topics')
      .select(`
        *,
        author:users!forum_topics_author_id_fkey (
          id,
          name,
          username,
          avatar_url,
          role
        ),
        category:categories!forum_topics_category_id_fkey (
          id,
          name,
          slug,
          color
        )
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    // Filter by category if provided
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('vote_score', { ascending: false });
        break;
      case 'replies':
        query = query.order('reply_count', { ascending: false });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data: topics, error, count } = await query;

    if (error) {
      console.error('Error fetching topics:', error);
      return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
    }

    // Fix vote scores for fetched topics (batch operation)
    if (topics && topics.length > 0) {
      try {
        // Get all votes for these topics in one query
        const topicIds = topics.map(t => t.id);
        const { data: allVotes } = await supabase
          .from('forum_topic_votes')
          .select('topic_id, vote_type')
          .in('topic_id', topicIds);
        
        // Group votes by topic_id
        const votesByTopic = (allVotes || []).reduce((acc, vote) => {
          if (!acc[vote.topic_id]) acc[vote.topic_id] = [];
          acc[vote.topic_id].push(vote);
          return acc;
        }, {} as Record<string, any[]>);
        
        // Calculate scores and batch update if needed
        const topicsToUpdate = [];
        
        for (const topic of topics) {
          const votes = votesByTopic[topic.id] || [];
          const actualVoteScore = votes.reduce((sum, vote) => sum + vote.vote_type, 0);
          
          if (topic.vote_score !== actualVoteScore) {
            topicsToUpdate.push({ id: topic.id, vote_score: actualVoteScore });
            // Update in memory for response
            topic.vote_score = actualVoteScore;
          }
        }
        
        // Batch update topics if needed
        if (topicsToUpdate.length > 0) {
          for (const update of topicsToUpdate) {
            await supabase
              .from('forum_topics')
              .update({ vote_score: update.vote_score })
              .eq('id', update.id);
          }
          console.log(`Synced vote scores for ${topicsToUpdate.length} topics`);
        }
      } catch (voteError) {
        console.error('Error syncing vote scores:', voteError);
      }
    }

    return NextResponse.json({
      topics: topics || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in topics route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category_id, slug } = body;

    // Validate input
    if (!title || !content || !category_id || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slug is unique
    const { data: existingTopic } = await supabase
      .from('forum_topics')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingTopic) {
      return NextResponse.json({ error: 'Topic with this slug already exists' }, { status: 400 });
    }

    // Create topic - simple insert like articles
    const { data: topic, error } = await supabase
      .from('forum_topics')
      .insert({
        title,
        slug,
        content,
        author_id: user.id,
        category_id,
        view_count: 0,
        reply_count: 0,
        vote_score: 0,
        is_pinned: false,
        is_locked: false
      })
      .select(`
        *,
        author:users!forum_topics_author_id_fkey (
          id,
          name,
          username,
          avatar_url,
          role
        ),
        category:categories!forum_topics_category_id_fkey (
          id,
          name,
          slug,
          color
        )
      `)
      .single();

    if (error) {
      console.error('Error creating topic:', error);
      return NextResponse.json({ 
        error: 'Failed to create topic',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    console.error('Error in create topic:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}