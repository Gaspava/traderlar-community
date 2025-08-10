import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();

    // Get a random article
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        author_name,
        category:categories(name, slug),
        created_at,
        read_time,
        view_count,
        like_count
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(100); // Get recent 100 articles to randomize from

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No articles found' },
        { status: 404 }
      );
    }

    // Pick a random article
    const randomIndex = Math.floor(Math.random() * articles.length);
    const randomArticle = articles[randomIndex];

    return NextResponse.json({
      success: true,
      article: randomArticle
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}