import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Create Supabase client with error handling
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('Failed to create Supabase client:', clientError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    // Get current user to check likes
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch comments with user info and counts
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        users!comments_user_id_fkey (
          name,
          username,
          avatar_url
        ),
        mentioned_user:users!comments_mentioned_user_id_fkey (
          username
        ),
        comment_likes (
          user_id
        )
      `)
      .eq('article_id', id)
      .order('created_at', { ascending: true });
    
    if (error) {
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Format comments
    const formattedComments = comments?.map(comment => {
      const likeCount = comment.comment_likes?.length || 0;
      const isLiked = user ? comment.comment_likes?.some((like: any) => like.user_id === user.id) : false;
      
      return {
        ...comment,
        user_name: comment.users?.name,
        user_username: comment.users?.username,
        user_avatar: comment.users?.avatar_url,
        mentioned_username: comment.mentioned_user?.username,
        like_count: likeCount,
        is_liked: isLiked,
        reply_count: 0, // Will be calculated below
        replies: []
      };
    }) || [];
    
    // Organize comments in a 2-level structure: root comments and their replies
    const commentMap = new Map();
    const rootComments: any[] = [];
    
    // First pass: create map of all comments
    formattedComments.forEach(comment => {
      commentMap.set(comment.id, comment);
    });
    
    // Second pass: organize into 2-level structure
    formattedComments.forEach(comment => {
      if (!comment.parent_id) {
        // Root comment
        rootComments.push(comment);
      } else {
        // This is a reply - find the root parent
        let rootParent = comment;
        let currentComment = comment;
        
        // Traverse up to find the root comment
        while (currentComment.parent_id) {
          const parent = commentMap.get(currentComment.parent_id);
          if (parent) {
            rootParent = parent;
            currentComment = parent;
          } else {
            break;
          }
        }
        
        // Add reply to the root comment's replies
        if (rootParent && !rootParent.parent_id) {
          rootParent.replies.push(comment);
          rootParent.reply_count++;
        }
      }
    });
    
    return NextResponse.json({ comments: rootComments });
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await context.params;
    
    // Create Supabase client with error handling
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('Failed to create Supabase client:', clientError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { content, parent_id, mentioned_user_id } = body;
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    const commentData: any = {
      article_id: articleId,
      user_id: user.id,
      content: content.trim(),
      parent_id: parent_id || null,
      mentioned_user_id: mentioned_user_id || null,
    };
    
    const { data: comment, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select(`
        *,
        users!comments_user_id_fkey (
          name,
          username,
          avatar_url
        )
      `)
      .single();
    
    if (error) {
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Format the response to match the expected structure
    const formattedComment = {
      ...comment,
      user_name: comment.users?.name,
      user_username: comment.users?.username,
      user_avatar: comment.users?.avatar_url,
      like_count: 0,
      is_liked: false,
      reply_count: 0,
      replies: []
    };
    
    return NextResponse.json({ comment: formattedComment }, { status: 201 });
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}