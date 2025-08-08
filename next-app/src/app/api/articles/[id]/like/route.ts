import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await context.params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('article_likes')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', user.id)
      .single();
    
    if (existingLike) {
      return NextResponse.json({ error: 'Already liked' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('article_likes')
      .insert({
        article_id: articleId,
        user_id: user.id,
      });
    
    if (error) {
      console.error('Error liking article:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Get updated like count
    const { count } = await supabase
      .from('article_likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);
    
    return NextResponse.json({ 
      message: 'Article liked successfully', 
      likeCount: count || 0 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/articles/[id]/like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await context.params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { error } = await supabase
      .from('article_likes')
      .delete()
      .eq('article_id', articleId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error unliking article:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Get updated like count
    const { count } = await supabase
      .from('article_likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);
    
    return NextResponse.json({ 
      message: 'Article unliked successfully',
      likeCount: count || 0
    });
  } catch (error) {
    console.error('Error in DELETE /api/articles/[id]/like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}