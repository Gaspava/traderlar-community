import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Get topic by id or slug
    let query = supabase
      .from('forum_topics')
      .select(`
        *,
        author:users!author_id (
          id,
          name,
          username,
          avatar_url,
          role
        ),
        category:categories!category_id (
          id,
          name,
          slug,
          color
        ),
        last_reply_user:users!last_reply_user_id (
          id,
          name,
          username
        )
      `);

    // Check if id is a UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: topic, error } = await query.single();

    if (error || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Calculate and update vote score from database
    const { data: allVotes } = await supabase
      .from('forum_topic_votes')
      .select('vote_type')
      .eq('topic_id', topic.id);
    
    const actualVoteScore = allVotes?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0;
    
    // Update topic with correct vote score if it differs
    if (topic.vote_score !== actualVoteScore) {
      await supabase
        .from('forum_topics')
        .update({ vote_score: actualVoteScore })
        .eq('id', topic.id);
      
      topic.vote_score = actualVoteScore;
    }

    // Get current user's vote
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userVote } = await supabase
        .from('forum_topic_votes')
        .select('vote_type')
        .eq('topic_id', topic.id)
        .eq('user_id', user.id)
        .single();

      topic.user_vote = userVote?.vote_type || null;
    }

    // Increment view count
    await supabase
      .from('forum_topics')
      .update({ view_count: topic.view_count + 1 })
      .eq('id', topic.id);

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, is_locked, is_pinned } = body;

    // Get topic to check permissions
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Check if user is author or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAuthor = topic.author_id === user.id;
    const isAdmin = userData?.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (is_locked !== undefined && isAdmin) updateData.is_locked = is_locked;
    if (is_pinned !== undefined && isAdmin) updateData.is_pinned = is_pinned;

    // Update topic
    const { data: updatedTopic, error } = await supabase
      .from('forum_topics')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:users!author_id (
          id,
          name,
          username,
          avatar_url,
          role
        ),
        category:categories!category_id (
          id,
          name,
          slug,
          color
        )
      `)
      .single();

    if (error) {
      console.error('Error updating topic:', error);
      return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
    }

    return NextResponse.json({ topic: updatedTopic });
  } catch (error) {
    console.error('Error in update topic:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'admin';

    // Get topic to check permissions
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const isAuthor = topic.author_id === user.id;

    // Only allow delete if user is author or admin
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden - You do not have permission to delete this topic' }, { status: 403 });
    }

    // Use admin client for admin deletions to bypass RLS
    let deleteClient = supabase;
    
    // If admin is deleting and service role key is available, use admin client
    if (isAdmin && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        deleteClient = createAdminClient();
      } catch (err) {
        console.log('Service role key not configured, using regular client');
      }
    }

    // First, delete all related data to avoid foreign key constraints
    // Delete votes on the topic
    await deleteClient
      .from('forum_topic_votes')
      .delete()
      .eq('topic_id', id);

    // Delete votes on posts related to this topic
    const { data: posts } = await deleteClient
      .from('forum_posts')
      .select('id')
      .eq('topic_id', id);

    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      await deleteClient
        .from('forum_post_votes')
        .delete()
        .in('post_id', postIds);
    }

    // Delete posts related to this topic
    await deleteClient
      .from('forum_posts')
      .delete()
      .eq('topic_id', id);

    // Now delete the topic
    const { error } = await deleteClient
      .from('forum_topics')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting topic:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      
      // If it's a permission error for admin, suggest RLS policy update
      if (isAdmin && error.code === '42501') {
        return NextResponse.json({ 
          error: 'Permission denied. Please run FIX_ADMIN_DELETE_POLICY.sql in Supabase SQL Editor or add SUPABASE_SERVICE_ROLE_KEY to environment variables.', 
          details: 'Admin deletion requires either proper RLS policies or service role key.'
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to delete topic', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error in delete topic:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}