import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FeedContent, FeedResponse, SortOption, ContentType, FeedFilters } from '@/types/feedContent';

const ITEMS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  console.log('=== FEED API CALLED ===');
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || ITEMS_PER_PAGE.toString());
    const sort = (searchParams.get('sort') || 'hot') as SortOption;
    const type = (searchParams.get('type') || 'all') as ContentType | 'all';
    const category = searchParams.get('category');
    const timeRange = searchParams.get('timeRange') as '24h' | '7d' | '30d' | 'all' | null;

    const supabase = await createClient();
    const offset = (page - 1) * limit;

    // Get current user for vote data
    const { data: { user } } = await supabase.auth.getUser();

    let allContent: FeedContent[] = [];
    
    // Fetch forum topics
    if (type === 'all' || type === 'forum') {
      const forumContent = await fetchForumContent(supabase, user?.id, limit, sort, category, timeRange);
      allContent.push(...forumContent);
    }

    // Fetch articles
    if (type === 'all' || type === 'article') {
      console.log('About to fetch articles, type:', type);
      const articleContent = await fetchArticleContent(supabase, user?.id, limit, sort, category, timeRange);
      console.log('Article content fetched:', articleContent.length, 'items');
      allContent.push(...articleContent);
    }

    // Fetch strategies
    if (type === 'all' || type === 'strategy') {
      const strategyContent = await fetchStrategyContent(supabase, user?.id, limit, sort, category, timeRange);
      allContent.push(...strategyContent);
    }

    // Sort mixed content
    allContent = sortMixedContent(allContent, sort);
    
    // Paginate
    const totalCount = allContent.length;
    const paginatedContent = allContent.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    const response: FeedResponse = {
      content: paginatedContent,
      hasMore,
      totalCount,
      page
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed content' },
      { status: 500 }
    );
  }
}

async function fetchForumContent(
  supabase: any,
  userId?: string,
  limit: number = ITEMS_PER_PAGE,
  sort: SortOption = 'hot',
  category?: string | null,
  timeRange?: string | null
) {
  try {
    let query = supabase
      .from('forum_topics')
      .select(`
        id,
        title,
        content,
        slug,
        created_at,
        updated_at,
        vote_score,
        view_count,
        reply_count,
        is_pinned,
        is_locked,
        last_reply_at,
        author:users!forum_topics_author_id_fkey (
          id,
          username,
          name,
          avatar_url
        ),
        category:categories!forum_topics_category_id_fkey (
          id,
          name,
          slug,
          color
        ),
        last_reply_user:users!forum_topics_last_reply_user_id_fkey (
          name,
          username
        )
      `);

    // Apply category filter
    if (category) {
      query = query.eq('category.slug', category);
    }

    // Apply time range filter
    if (timeRange && timeRange !== 'all') {
      const timeFilter = getTimeFilter(timeRange);
      query = query.gte('created_at', timeFilter);
    }

    // Apply sorting
    switch (sort) {
      case 'hot':
        query = query.order('vote_score', { ascending: false })
                    .order('reply_count', { ascending: false })
                    .order('view_count', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('vote_score', { ascending: false })
                    .order('view_count', { ascending: false });
        break;
    }

    query = query.limit(limit * 2); // Fetch more to mix with other content

    const { data, error } = await query;
    if (error) throw error;

    // Get user votes if authenticated
    let userVotes = new Map();
    if (userId && data?.length) {
      const topicIds = data.map(topic => topic.id);
      const { data: votes } = await supabase
        .from('forum_topic_votes')
        .select('target_id, vote_type')
        .eq('user_id', userId)
        .in('target_id', topicIds);
      
      userVotes = new Map(votes?.map(v => [v.target_id, v.vote_type]) || []);
    }

    return (data || []).map(topic => ({
      id: topic.id,
      type: 'forum' as const,
      title: topic.title,
      content: topic.content,
      author: {
        id: topic.author.id,
        username: topic.author.username,
        name: topic.author.name,
        avatar_url: topic.author.avatar_url
      },
      category: topic.category,
      created_at: topic.created_at,
      updated_at: topic.updated_at,
      vote_score: topic.vote_score || 0,
      user_vote: userVotes.get(topic.id) || null,
      view_count: topic.view_count || 0,
      reply_count: topic.reply_count || 0,
      last_reply_at: topic.last_reply_at,
      last_reply_user: topic.last_reply_user,
      is_pinned: topic.is_pinned,
      is_locked: topic.is_locked,
      slug: topic.slug
    }));

  } catch (error) {
    console.error('Error fetching forum content:', error);
    return [];
  }
}

async function fetchArticleContent(
  supabase: any,
  userId?: string,
  limit: number = ITEMS_PER_PAGE,
  sort: SortOption = 'hot',
  category?: string | null,
  timeRange?: string | null
) {
  try {
    console.log('Fetching articles from Supabase...');
    
    // Simpler query similar to articles page
    let query = supabase
      .from('articles')
      .select(`
        *,
        users!articles_author_id_fkey (
          id,
          username,
          name,
          avatar_url
        ),
        article_categories (
          categories (
            id,
            name,
            slug,
            color
          )
        )
      `)
      .eq('is_published', true);

    // Apply sorting
    switch (sort) {
      case 'new':
        query = query.order('published_at', { ascending: false });
        break;
      case 'top':
        query = query.order('view_count', { ascending: false });
        break;
      case 'hot':
      default:
        query = query.order('published_at', { ascending: false });
        break;
    }

    query = query.limit(limit);

    const { data, error } = await query;
    console.log('Articles query result:', { data, error, count: data?.length });
    if (error) {
      console.error('Articles fetch error:', error);
      throw error;
    }

    // Get comment counts
    const articleIds = (data || []).map(article => article.id);
    let commentCounts = new Map();
    if (articleIds.length > 0) {
      const { data: comments } = await supabase
        .from('article_comments')
        .select('article_id')
        .in('article_id', articleIds);
      
      const counts = (comments || []).reduce((acc, comment) => {
        acc[comment.article_id] = (acc[comment.article_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      commentCounts = new Map(Object.entries(counts));
    }

    return (data || []).map(article => {
      // Get first category if exists
      const firstCategory = article.article_categories?.[0]?.categories;
      
      return {
        id: article.id,
        type: 'article' as const,
        title: article.title || 'Başlıksız Makale',
        content: article.excerpt || article.content || '',
        author: {
          id: article.users?.id || article.author_id || '1',
          username: article.users?.username || 'anonymous',
          name: article.users?.name || 'Anonymous User',
          avatar_url: article.users?.avatar_url || null
        },
        category: {
          id: firstCategory?.id || '1',
          name: firstCategory?.name || 'Genel',
          slug: firstCategory?.slug || 'genel',
          color: firstCategory?.color || '#3B82F6'
        },
        created_at: article.created_at || article.published_at,
        updated_at: article.updated_at,
        vote_score: 0,
        user_vote: null,
        view_count: article.view_count || 0,
        read_time: article.read_time || 5,
        featured_image: article.cover_image || article.featured_image,
        slug: article.slug,
        comment_count: commentCounts.get(article.id) || 0
      };
    });

  } catch (error) {
    console.error('Error fetching article content:', error);
    return [];
  }
}

async function fetchStrategyContent(
  supabase: any,
  userId?: string,
  limit: number = ITEMS_PER_PAGE,
  sort: SortOption = 'hot',
  category?: string | null,
  timeRange?: string | null
) {
  try {
    console.log('Fetching strategies from Supabase...');
    // Simpler query without joins that might fail
    let query = supabase
      .from('trading_strategies')
      .select('*');

    // Apply sorting
    switch (sort) {
      case 'hot':
        query = query.order('downloads', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('likes', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    console.log('Strategies query result:', { data, error, count: data?.length });
    
    return (data || []).map(strategy => ({
      id: strategy.id,
      type: 'strategy' as const,
      title: strategy.name || 'İsimsiz Strateji',
      content: strategy.description || '',
      description: strategy.description || '',
      author: {
        id: strategy.author_id || '1',
        username: 'trader',
        name: 'Trader',
        avatar_url: null
      },
      category: {
        id: strategy.category || '1',
        name: strategy.category || 'Strateji',
        slug: strategy.category?.toLowerCase() || 'strateji',
        color: '#10B981'
      },
      created_at: strategy.created_at,
      updated_at: strategy.updated_at,
      vote_score: strategy.likes || 0,
      user_vote: null,
      view_count: strategy.views || 0,
      performance: {
        total_return: strategy.total_return_percentage || strategy.total_net_profit || 0,
        win_rate: strategy.win_rate || 0,
        total_trades: strategy.total_trades || 0
      },
      timeframe: strategy.timeframe,
      tags: strategy.tags || [],
      download_count: strategy.downloads || 0,
      like_count: strategy.likes || 0,
      is_premium: strategy.is_premium || false,
      slug: strategy.id // Use ID as slug if no slug field
    }));

  } catch (error) {
    console.error('Error fetching strategy content:', error);
    return [];
  }
}

function sortMixedContent(content: FeedContent[], sort: SortOption): FeedContent[] {
  switch (sort) {
    case 'hot':
      return content.sort((a, b) => {
        // Prioritize pinned forum posts
        if (a.type === 'forum' && b.type === 'forum') {
          if ((a as any).is_pinned && !(b as any).is_pinned) return -1;
          if (!(a as any).is_pinned && (b as any).is_pinned) return 1;
        }
        
        // Calculate engagement score
        const scoreA = calculateEngagementScore(a);
        const scoreB = calculateEngagementScore(b);
        
        return scoreB - scoreA;
      });
      
    case 'new':
      return content.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
    case 'top':
      return content.sort((a, b) => {
        const scoreA = a.vote_score + a.view_count;
        const scoreB = b.vote_score + b.view_count;
        return scoreB - scoreA;
      });
      
    default:
      return content;
  }
}

function calculateEngagementScore(content: FeedContent): number {
  let score = content.vote_score * 3 + content.view_count * 0.1;
  
  switch (content.type) {
    case 'forum':
      score += (content as any).reply_count * 2;
      if ((content as any).is_pinned) score += 1000;
      break;
    case 'article':
      score += (content as any).comment_count * 2;
      break;
    case 'strategy':
      score += (content as any).download_count * 1.5 + (content as any).like_count * 2;
      break;
  }
  
  // Boost recent content
  const hoursSinceCreation = (Date.now() - new Date(content.created_at).getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation < 24) {
    score *= 1.5;
  } else if (hoursSinceCreation < 168) { // 7 days
    score *= 1.2;
  }
  
  return score;
}

function getTimeFilter(timeRange: string): string {
  const now = new Date();
  switch (timeRange) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(0).toISOString();
  }
}