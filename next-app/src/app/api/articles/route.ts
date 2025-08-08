import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const author = searchParams.get('author');
    
    const offset = (page - 1) * limit;
    
    const supabase = await createClient();
    
    let query = supabase
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
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (category) {
      query = query.contains('article_categories', [{ category_id: category }]);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }
    
    if (author) {
      query = query.eq('author_id', author);
    }
    
    const { data: articles, error, count } = await query;
    
    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const articlesWithDetails = articles?.map(article => ({
      ...article,
      author_name: article.users?.name,
      author_username: article.users?.username,
      author_avatar: article.users?.avatar_url,
      author_role: article.users?.role,
      categories: article.article_categories?.map((ac: any) => ac.categories).filter(Boolean) || [],
      like_count: article.article_likes?.[0]?.count || 0,
      comment_count: article.comments?.[0]?.count || 0,
    }));
    
    return NextResponse.json({
      articles: articlesWithDetails,
      total: count,
      page,
      pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, slug, excerpt, content, cover_image, is_published, selected_categories } = body;
    
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (existingArticle) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    
    const articleData: any = {
      title,
      slug,
      excerpt,
      content,
      cover_image,
      author_id: user.id,
      is_published,
    };
    
    if (is_published) {
      articleData.published_at = new Date().toISOString();
    }
    
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single();
    
    if (articleError) {
      console.error('Error creating article:', articleError);
      return NextResponse.json({ error: articleError.message }, { status: 500 });
    }
    
    if (selected_categories && selected_categories.length > 0) {
      const categoryRelations = selected_categories.map((categoryId: string) => ({
        article_id: article.id,
        category_id: categoryId,
      }));
      
      const { error: categoryError } = await supabase
        .from('article_categories')
        .insert(categoryRelations);
      
      if (categoryError) {
        console.error('Error associating categories:', categoryError);
      }
    }
    
    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}