import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sort') || 'oldest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        author:users!author_id (
          id,
          name,
          username,
          avatar_url,
          role
        ),
        mentioned_user:users!mentioned_user_id (
          id,
          name,
          username
        ),
        vote_count:forum_post_votes(count)
      `, { count: 'exact' })
      .eq('topic_id', id)
      .is('parent_id', null) // Only get top-level posts
      .range(offset, offset + limit - 1);

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popular':
        query = query.order('vote_score', { ascending: false });
        break;
      case 'oldest':
      default:
        query = query.order('created_at', { ascending: true });
        break;
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // Get replies for each post
    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      
      const { data: replies } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:users!author_id (
            id,
            name,
            username,
            avatar_url,
            role
          ),
          mentioned_user:users!mentioned_user_id (
            id,
            name,
            username
          ),
          vote_count:forum_post_votes(count)
        `)
        .in('parent_id', postIds)
        .order('created_at', { ascending: true });

      // Group replies by parent_id
      const repliesMap = new Map();
      replies?.forEach(reply => {
        if (!repliesMap.has(reply.parent_id)) {
          repliesMap.set(reply.parent_id, []);
        }
        repliesMap.get(reply.parent_id).push(reply);
      });

      // Attach replies to posts
      posts.forEach(post => {
        post.replies = repliesMap.get(post.id) || [];
      });
    }

    // Get current user's votes and calculate vote scores
    const { data: { user } } = await supabase.auth.getUser();
    if (posts) {
      const allPostIds = posts.flatMap(p => [p.id, ...(p.replies?.map((r: any) => r.id) || [])]);
      
      // Get all votes for these posts
      const { data: allVotes } = await supabase
        .from('forum_post_votes')
        .select('post_id, vote_type, user_id')
        .in('post_id', allPostIds);

      // Calculate vote scores and user votes
      const voteScores = new Map();
      const userVotes = new Map();
      
      allVotes?.forEach(vote => {
        // Calculate vote score
        const currentScore = voteScores.get(vote.post_id) || 0;
        voteScores.set(vote.post_id, currentScore + vote.vote_type);
        
        // Track user's vote
        if (user && vote.user_id === user.id) {
          userVotes.set(vote.post_id, vote.vote_type);
        }
      });
      
      posts.forEach(post => {
        post.vote_score = voteScores.get(post.id) || 0;
        post.user_vote = userVotes.get(post.id) || null;
        post.replies?.forEach((reply: any) => {
          reply.vote_score = voteScores.get(reply.id) || 0;
          reply.user_vote = userVotes.get(reply.id) || null;
        });
      });
    }

    return NextResponse.json({
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in posts route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, parent_id, mentioned_user_id } = body;

    // Validate input
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if topic exists and is not locked
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('is_locked')
      .eq('id', id)
      .single();

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    if (topic.is_locked) {
      return NextResponse.json({ error: 'Topic is locked' }, { status: 403 });
    }

    // Create post
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({
        topic_id: id,
        author_id: user.id,
        parent_id,
        content,
        mentioned_user_id,
        is_edited: false
      })
      .select(`
        *,
        author:users!author_id (
          id,
          name,
          username,
          avatar_url,
          role
        ),
        mentioned_user:users!mentioned_user_id (
          id,
          name,
          username
        )
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    // Add vote score to the response
    post.vote_score = 0;
    post.user_vote = null;

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error in create post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}