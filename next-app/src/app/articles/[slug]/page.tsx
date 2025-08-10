'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Eye, 
  Heart, 
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ArticleWithAuthor, CommentWithUser } from '@/lib/supabase/types';
import CommentSection from '@/components/articles/CommentSection';
import { 
  LeaderboardAd, 
  RectangleAd, 
  LargeRectangleAd, 
  HalfPageAd, 
  ResponsiveHeaderAd,
  InContentAd,
  ArticleInContentAd
} from '@/components/ads';
import { DEFAULT_AD_CONFIG } from '@/components/ads';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [article, setArticle] = useState<ArticleWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    fetchArticle();
    checkCurrentUser();
  }, [slug]);

  const checkCurrentUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      
      // First, get basic article info
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          cover_image,
          author_id,
          is_published,
          published_at,
          view_count,
          created_at,
          updated_at
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (articleError) {
        console.error('Article fetch error:', articleError);
        throw new Error(`Article not found: ${articleError.message}`);
      }

      if (!articleData) {
        throw new Error('Article not found');
      }


      // Get author info separately
      const { data: authorData, error: authorError } = await supabase
        .from('users')
        .select('id, name, username, avatar_url, role')
        .eq('id', articleData.author_id)
        .single();

      if (authorError) {
        console.warn('Author fetch error:', authorError);
      }

      // Get categories separately
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('article_categories')
        .select(`
          category:categories(id, name, slug, color)
        `)
        .eq('article_id', articleData.id);

      if (categoriesError) {
        console.warn('Categories fetch error:', categoriesError);
      }

      // Get like info separately
      const { data: { user } } = await supabase.auth.getUser();
      let articleLikeCount = 0;
      let userHasLiked = false;

      const { count: likeCount } = await supabase
        .from('article_likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleData.id);

      articleLikeCount = likeCount || 0;

      if (user) {
        const { data: userLike } = await supabase
          .from('article_likes')
          .select('id')
          .eq('article_id', articleData.id)
          .eq('user_id', user.id)
          .single();

        userHasLiked = !!userLike;
      }

      // Transform the data
      const transformedArticle: ArticleWithAuthor = {
        ...articleData,
        author_name: authorData?.name || 'Unknown Author',
        author_username: authorData?.username || 'unknown',
        author_avatar: authorData?.avatar_url,
        author_role: authorData?.role || 'user',
        categories: categoriesData?.map((c: any) => c.category).filter(Boolean) || [],
        like_count: articleLikeCount,
        comment_count: 0,
        is_liked: userHasLiked,
        is_saved: false
      };

      setArticle(transformedArticle);
      setLikeCount(articleLikeCount);
      setIsLiked(userHasLiked);

      // Increment view count (fire and forget)
      supabase
        .from('articles')
        .update({ view_count: (articleData.view_count || 0) + 1 })
        .eq('id', articleData.id)
        .then(() => {})
        .catch(err => console.warn('View count update failed:', err));

    } catch (error) {
      console.error('Error fetching article:', error);
      setArticle(null);
      // Show user-friendly error
      alert('Makale yüklenirken hata oluştu. Sayfayı yenilemeyi deneyin.');
    } finally {
      setLoading(false);
    }
  };


  const handleLike = async () => {
    if (!currentUser || !article) {
      router.push('/auth/login');
      return;
    }

    if (liking) return; // Prevent double clicks
    
    setLiking(true);
    const wasLiked = isLiked;
    
    // Optimistic update
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`/api/articles/${article.id}/like`, {
        method: wasLiked ? 'DELETE' : 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update like');
      }

      // Update with server response
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      alert('Beğeni güncellenirken hata oluştu');
    } finally {
      setLiking(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setIsSaved(!isSaved);
    // TODO: Implement actual save functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href
      });
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  const handleDelete = async () => {
    if (confirm('Bu makaleyi silmek istediğinizden emin misiniz?')) {
      // TODO: Implement delete functionality
      router.push('/articles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-background dark:via-card/30 dark:to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-200/50 dark:border-border/50 shadow-xl overflow-hidden p-8 lg:p-12">
            <div className="animate-pulse">
              <div className="h-6 bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 rounded-full w-1/4 mb-6"></div>
              <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl w-3/4 mb-8"></div>
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-background dark:via-card/30 dark:to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-200/50 dark:border-border/50 shadow-xl overflow-hidden p-8 lg:p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📝</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-4">
              Makale Bulunamadı
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Aradığınız makale mevcut değil veya kaldırılmış olabilir.
            </p>
            <Link 
              href="/articles" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25"
            >
              <ArrowLeft className="w-5 h-5" />
              Makalelere Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Safety check - don't render if article is still loading or null
  if (loading || !article) {
    return null;
  }

  const isAuthor = currentUser?.id === article.author_id;
  const isAdmin = currentUser?.role === 'admin';
  const canEdit = isAuthor || isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-background dark:via-card/30 dark:to-background">
      {/* Above-the-fold Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <ResponsiveHeaderAd adSlot={DEFAULT_AD_CONFIG.adSlots.articleTop} />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Content Grid with Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Article Content */}
          <article className="xl:col-span-3 bg-white dark:bg-card rounded-xl border border-gray-200/50 dark:border-border/50 shadow-lg overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="p-6 lg:p-8"
            >
            {/* Back button - Inside card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4"
            >
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Makalelere Dön</span>
              </Link>
            </motion.div>

            {/* Categories */}
            <div className="flex items-center gap-3 mb-6">
              {article.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/articles?category=${category.slug}`}
                  className="text-sm px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-sm backdrop-blur-sm"
                  style={{
                    backgroundColor: `${category.color}15`,
                    color: category.color,
                    border: `1px solid ${category.color}30`
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </div>

          {/* Title */}
          <h1 className="h1 text-gray-900 dark:text-white mb-6 break-long-words leading-tight">
            {article.title}
          </h1>

          {/* Author and Meta - Minimized */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/50 dark:border-border/50">
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${article.author_username}`}
                className="flex items-center gap-3 group"
              >
                <img
                  src={article.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author_username}`}
                  alt={article.author_name}
                  className="w-10 h-10 rounded-full ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-300 group-hover:ring-green-400 dark:group-hover:ring-green-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {article.author_name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{new Date(article.published_at!).toLocaleDateString('tr-TR')}</span>
                    <span>•</span>
                    <span>5 dk okuma</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Actions */}
            {canEdit && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/articles/${article.slug}/edit`}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Cover Image */}
          {article.cover_image && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-auto max-h-80 object-cover"
              />
            </div>
          )}

          {/* In-Content Ad - Strategic Placement */}
          <div className="my-8">
            <ArticleInContentAd adSlot={DEFAULT_AD_CONFIG.adSlots.articleInContent} />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-10 break-long-words">
            <style jsx global>{`
              .prose {
                color: rgb(55 65 81);
              }
              .dark .prose {
                color: rgb(229 231 235);
              }
              .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
                color: rgb(17 24 39);
                font-family: var(--font-montserrat);
                margin-top: 2rem;
                margin-bottom: 1rem;
              }
              .dark .prose h1, .dark .prose h2, .dark .prose h3, .dark .prose h4, .dark .prose h5, .dark .prose h6 {
                color: rgb(255 255 255);
              }
              .prose p {
                line-height: 1.7;
                margin-bottom: 1.25rem;
                font-size: 1.05rem;
                font-family: var(--font-jakarta);
              }
              .prose strong {
                color: rgb(16 185 129);
                font-weight: 600;
              }
              .dark .prose strong {
                color: rgb(52 211 153);
              }
              .prose blockquote {
                border-left: 3px solid rgb(16 185 129);
                background: rgb(246 254 249);
                padding: 1rem 1.5rem;
                margin: 1.5rem 0;
                border-radius: 0.5rem;
                font-style: italic;
              }
              .dark .prose blockquote {
                background: rgb(6 78 59);
                border-left-color: rgb(52 211 153);
              }
              .prose code {
                background: rgb(243 244 246);
                padding: 0.2rem 0.4rem;
                border-radius: 0.25rem;
                font-size: 0.9rem;
                font-family: var(--font-mono);
              }
              .dark .prose code {
                background: rgb(55 65 81);
                color: rgb(52 211 153);
              }
            `}</style>
            {article.content ? (
              <div 
                className="break-long-words text-gray-700 dark:text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }} 
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">İçerik yüklenemedi.</p>
            )}
          </div>

          {/* Stats and Actions - Minimized */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-t border-gray-200/50 dark:border-border/50 mb-8">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                <Eye className="w-4 h-4" />
                <span className="metric-value">{article.view_count}</span>
              </span>
              
              <motion.button
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center gap-1 transition-colors ${
                  isLiked 
                    ? 'text-red-500' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-red-500'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`w-4 h-4 transition-all duration-300 ${
                    isLiked ? 'fill-current' : ''
                  }`} />
                </motion.div>
                <motion.span
                  key={likeCount}
                  className="metric-value"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.2 }}
                >
                  {likeCount}
                </motion.span>
              </motion.button>
              
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                <MessageCircle className="w-4 h-4" />
                <span className="metric-value">{commentCount}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved
                    ? 'text-green-500'
                    : 'text-gray-600 dark:text-gray-300 hover:text-green-500'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Article Ad */}
          <div className="mt-8 mb-6">
            <div className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/40 dark:border-gray-700/40 p-6">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3 uppercase tracking-wide font-medium">
                Reklam
              </div>
              <div className="flex justify-center">
                <LargeRectangleAd adSlot={DEFAULT_AD_CONFIG.adSlots.articleBottom} />
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-4">
            <CommentSection 
              articleId={article.id} 
              onCommentCountChange={setCommentCount}
            />
          </div>
        </motion.div>
        </article>

          {/* Sidebar Ads */}
          <div className="hidden xl:block xl:col-span-1 space-y-6">
            {/* Top Sidebar Ad - Half Page for High CPM */}
            <div className="sticky top-4">
              <div className="bg-white dark:bg-card rounded-xl border border-gray-200/50 dark:border-border/50 shadow-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3 uppercase tracking-wide font-medium">
                  Sponsor
                </div>
                <div className="flex justify-center">
                  <HalfPageAd adSlot={DEFAULT_AD_CONFIG.adSlots.articleSidebar} />
                </div>
              </div>
            </div>

            {/* Bottom Sidebar Ad */}
            <div className="mt-6">
              <div className="bg-white dark:bg-card rounded-xl border border-gray-200/50 dark:border-border/50 shadow-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3 uppercase tracking-wide font-medium">
                  Reklam
                </div>
                <div className="flex justify-center">
                  <RectangleAd adSlot={DEFAULT_AD_CONFIG.adSlots.sidebarBottom} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}