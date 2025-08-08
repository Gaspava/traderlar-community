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

    // Build query
    let query = supabase
      .from('forum_topics')
      .select(`
        *,
        users!forum_topics_author_id_fkey (
          id,
          name,
          username,
          avatar_url,
          role
        ),
        categories!forum_topics_category_id_fkey (
          id,
          name,
          slug,
          color
        ),
        last_reply_user:users!forum_topics_last_reply_user_id_fkey (
          id,
          name,
          username
        ),
        forum_topic_votes (count)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    // Filter by category if provided
    if (categorySlug) {
      // First get the category ID
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
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
        query = query.order('last_reply_at', { ascending: false, nullsFirst: false })
                    .order('created_at', { ascending: false });
        break;
    }

    // Add pinned topics at the top
    query = query.order('is_pinned', { ascending: false });

    const { data: topics, error, count } = await query;

    if (error) {
      console.error('Error fetching topics:', error);
      return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
    }

    // Get current user's votes
    const { data: { user } } = await supabase.auth.getUser();
    if (user && topics) {
      const topicIds = topics.map(t => t.id);
      const { data: userVotes } = await supabase
        .from('forum_topic_votes')
        .select('topic_id, vote_type')
        .eq('user_id', user.id)
        .in('topic_id', topicIds);

      // Map user votes to topics
      const voteMap = new Map(userVotes?.map(v => [v.topic_id, v.vote_type]));
      topics.forEach(topic => {
        topic.user_vote = voteMap.get(topic.id) || null;
      });
    }

    // Transform the data to match the expected format
    const transformedTopics = topics?.map(topic => ({
      ...topic,
      author: topic.users,
      category: topic.categories,
      vote_count: topic.forum_topic_votes?.[0]?.count || 0
    })) || [];

    return NextResponse.json({
      topics: transformedTopics,
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

    // Create topic
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
        users!forum_topics_author_id_fkey (
          id,
          name,
          username,
          avatar_url,
          role
        ),
        categories!forum_topics_category_id_fkey (
          id,
          name,
          slug,
          color
        )
      `)
      .single();

    if (error) {
      console.error('Error creating topic:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ 
        error: 'Failed to create topic',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    // Transform the response to match expected format
    const transformedTopic = {
      ...topic,
      author: topic.users,
      category: topic.categories
    };

    return NextResponse.json({ topic: transformedTopic }, { status: 201 });
  } catch (error) {
    console.error('Error in create topic:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}