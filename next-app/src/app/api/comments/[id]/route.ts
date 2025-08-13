import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { content } = body;
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    // Check if user owns the comment
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (!existingComment || existingComment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { data: comment, error } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
        is_edited: true,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ comment });
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user owns the comment or is admin
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (existingComment.user_id !== user.id && userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // İlişkili verileri temizle
    const cleanupPromises = [
      // Comment likes sil
      supabase.from('comment_likes').delete().eq('comment_id', id),
      
      // Child comments sil (eğer reply sistemi varsa)
      supabase.from('comments').delete().eq('parent_id', id)
    ];
    
    // Tüm ilişkili verileri sil
    const cleanupResults = await Promise.allSettled(cleanupPromises);
    
    // Başarısız temizlik işlemlerini logla
    cleanupResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Comment cleanup operation ${index} failed:`, result.reason);
      }
    });
    
    // Ana yorumu sil
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Comment deletion failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Comment and all related data deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/comments/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}