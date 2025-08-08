import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        users!articles_author_id_fkey (
          name,
          username,
          avatar_url,
          role
        ),
        article_categories (
          categories (
            id,
            name,
            slug,
            color
          )
        ),
        article_likes (count),
        comments (count)
      `)
      .eq('id', id)
      .single();
    
    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    const articleWithDetails = {
      ...article,
      author_name: article.users?.name,
      author_username: article.users?.username,
      author_avatar: article.users?.avatar_url,
      author_role: article.users?.role,
      categories: article.article_categories?.map((ac: any) => ac.categories).filter(Boolean) || [],
      like_count: article.article_likes?.[0]?.count || 0,
      comment_count: article.comments?.[0]?.count || 0,
    };
    
    return NextResponse.json({ article: articleWithDetails });
  } catch (error) {
    console.error('Error in GET /api/articles/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (existingArticle.author_id !== user.id && userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const { title, slug, excerpt, content, cover_image, is_published, selected_categories } = body;
    
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const { data: slugCheck } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();
    
    if (slugCheck) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    
    const updateData: any = {
      title,
      slug,
      excerpt,
      content,
      cover_image,
      is_published,
    };
    
    if (is_published && !existingArticle.is_published) {
      updateData.published_at = new Date().toISOString();
    }
    
    const { data: article, error: updateError } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating article:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    await supabase
      .from('article_categories')
      .delete()
      .eq('article_id', id);
    
    if (selected_categories && selected_categories.length > 0) {
      const categoryRelations = selected_categories.map((categoryId: string) => ({
        article_id: id,
        category_id: categoryId,
      }));
      
      const { error: categoryError } = await supabase
        .from('article_categories')
        .insert(categoryRelations);
      
      if (categoryError) {
        console.error('Error updating categories:', categoryError);
      }
    }
    
    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error in PUT /api/articles/[id]:', error);
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
    
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (article.author_id !== user.id && userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting article:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/articles/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}