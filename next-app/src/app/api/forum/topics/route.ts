import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const sortBy = searchParams.get('sort') || 'hot';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
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
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('vote_score', { ascending: false });
        break;
      case 'hot':
      default:
        // Hot algorithm: prioritize pinned, then by score/activity
        query = query
          .order('is_pinned', { ascending: false })
          .order('vote_score', { ascending: false })
          .order('reply_count', { ascending: false })
          .order('created_at', { ascending: false });
        break;
    }

    const { data: topics, error, count } = await query;

    if (error) {
      
      return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
    }

    // Fix vote scores and reply counts for fetched topics (batch operation)
    if (topics && topics.length > 0) {
      try {
        const topicIds = topics.map(t => t.id);
        
        // Get all votes for these topics in one query
        const { data: allVotes } = await supabase
          .from('forum_topic_votes')
          .select('topic_id, vote_type')
          .in('topic_id', topicIds);
        
        // Get actual reply counts for these topics
        const { data: allPosts } = await supabase
          .from('forum_posts')
          .select('topic_id')
          .in('topic_id', topicIds);
        
        // Group votes by topic_id
        const votesByTopic = (allVotes || []).reduce((acc, vote) => {
          if (!acc[vote.topic_id]) acc[vote.topic_id] = [];
          acc[vote.topic_id].push(vote);
          return acc;
        }, {} as Record<string, any[]>);
        
        // Group posts by topic_id
        const postsByTopic = (allPosts || []).reduce((acc, post) => {
          if (!acc[post.topic_id]) acc[post.topic_id] = 0;
          acc[post.topic_id]++;
          return acc;
        }, {} as Record<string, number>);
        
        // Calculate scores and reply counts, batch update if needed
        const topicsToUpdate = [];
        
        for (const topic of topics) {
          const votes = votesByTopic[topic.id] || [];
          const actualVoteScore = votes.reduce((sum, vote) => sum + vote.vote_type, 0);
          const actualReplyCount = postsByTopic[topic.id] || 0;
          
          let needsUpdate = false;
          const updates: any = {};
          
          if (topic.vote_score !== actualVoteScore) {
            updates.vote_score = actualVoteScore;
            topic.vote_score = actualVoteScore;
            needsUpdate = true;
          }
          
          if (topic.reply_count !== actualReplyCount) {
            updates.reply_count = actualReplyCount;
            topic.reply_count = actualReplyCount;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            topicsToUpdate.push({ id: topic.id, ...updates });
          }
        }
        
        // Batch update topics if needed
        if (topicsToUpdate.length > 0) {
          for (const update of topicsToUpdate) {
            const { id, ...updateData } = update;
            await supabase
              .from('forum_topics')
              .update(updateData)
              .eq('id', id);
          }
        }
      } catch (error) {
        console.error('Error updating topic metrics:', error);
      }
    }

    // Get current user's votes for these topics
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && topics && topics.length > 0) {
      const topicIds = topics.map(topic => topic.id);
      const { data: userVotes } = await supabase
        .from('forum_topic_votes')
        .select('topic_id, vote_type')
        .eq('user_id', user.id)
        .in('topic_id', topicIds);

      // Map user votes to topics
      const voteMap = new Map(userVotes?.map(v => [v.topic_id, v.vote_type]) || []);
      topics.forEach(topic => {
        topic.user_vote = voteMap.get(topic.id) || null;
      });
    }

    return NextResponse.json({
      topics: topics || [],
      totalCount: count || 0,
      page,
      limit,
      hasMore: count ? (offset + limit) < count : false
    });
  } catch (error) {
    
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

    // Extract mentioned strategies from content
    const mentionRegex = /@strateji:([^:]+):([^@\s]+)/g;
    const mentionedStrategies: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const strategyId = match[1];
      if (!mentionedStrategies.includes(strategyId)) {
        mentionedStrategies.push(strategyId);
      }
    }

    // Create a unique slug by checking for duplicates
    let uniqueSlug = slug;
    let counter = 1;
    
    while (true) {
      const { data: existingTopic } = await supabase
        .from('forum_topics')
        .select('id')
        .eq('slug', uniqueSlug)
        .single();

      if (!existingTopic) {
        // Slug is unique, break the loop
        break;
      }

      // If slug exists, append a number and try again
      uniqueSlug = `${slug}-${counter}`;
      counter++;
      
      // Prevent infinite loop (safety check)
      if (counter > 100) {
        return NextResponse.json({ error: 'Unable to generate unique slug' }, { status: 400 });
      }
    }

    // Create topic - simple insert like articles
    const insertData: any = {
      title,
      slug: uniqueSlug,
      content,
      author_id: user.id,
      category_id,
      view_count: 0,
      reply_count: 0,
      vote_score: 0,
      is_pinned: false,
      is_locked: false
    };

    // Add mentioned_strategies if there are any (graceful handling if column doesn't exist)
    if (mentionedStrategies.length > 0) {
      insertData.mentioned_strategies = mentionedStrategies;
    }

    const { data: topic, error } = await supabase
      .from('forum_topics')
      .insert(insertData)
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
      
      return NextResponse.json({ 
        error: 'Failed to create topic',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}