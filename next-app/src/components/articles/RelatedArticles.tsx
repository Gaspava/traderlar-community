'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { ArticleWithAuthor } from '@/lib/supabase/types';
import { Clock, Eye, Heart } from 'lucide-react';

interface RelatedArticlesProps {
  currentArticleId: string;
  categories: Array<{ id: string; name: string; slug: string; color: string }>;
}

export default function RelatedArticles({ currentArticleId, categories }: RelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<ArticleWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedArticles();
  }, [currentArticleId, categories]);

  const fetchRelatedArticles = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Get category IDs
      const categoryIds = categories.map(cat => cat.id);
      
      let query = supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          cover_image,
          author_id,
          published_at,
          view_count,
          author:users!articles_author_id_fkey(name, username, avatar_url),
          categories:article_categories(category:categories(id, name, slug, color))
        `)
        .eq('is_published', true)
        .neq('id', currentArticleId)
        .order('published_at', { ascending: false })
        .limit(5);

      // If we have categories, prioritize articles from same categories
      if (categoryIds.length > 0) {
        const { data: categoryArticles } = await supabase
          .from('article_categories')
          .select('article_id')
          .in('category_id', categoryIds);
        
        const relatedArticleIds = categoryArticles?.map(ac => ac.article_id) || [];
        
        if (relatedArticleIds.length > 0) {
          query = query.in('id', relatedArticleIds);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching related articles:', error);
        return;
      }

      // Transform the data
      const transformedArticles: ArticleWithAuthor[] = (data || []).map((article: any) => ({
        ...article,
        author_name: article.author?.name || 'Unknown Author',
        author_username: article.author?.username || 'unknown',
        author_avatar: article.author?.avatar_url,
        author_role: article.author?.role || 'user',
        categories: article.categories?.map((c: any) => c.category).filter(Boolean) || [],
        like_count: 0,
        comment_count: 0,
        is_liked: false,
        is_saved: false
      }));

      setRelatedArticles(transformedArticles);
    } catch (error) {
      console.error('Error fetching related articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (relatedArticles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          İlgili makale bulunamadı
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {relatedArticles.map((article) => (
        <Link
          key={article.id}
          href={`/makaleler/${article.slug}`}
          className="block group hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-lg p-4 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
        >
          <div className="flex gap-3">
            {article.cover_image && (
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2 leading-snug mb-2">
                {article.title}
              </h4>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(article.published_at!).toLocaleDateString('tr-TR', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.view_count}
                  </span>
                </div>
              </div>
              
              {article.categories.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {article.categories.slice(0, 1).map((category) => (
                    <span
                      key={category.id}
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: `${category.color}15`,
                        color: category.color
                      }}
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}