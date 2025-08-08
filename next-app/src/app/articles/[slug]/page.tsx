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
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!loading && !article) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Makale bulunamadı</h1>
          <p className="text-muted-foreground mb-6">Aradığınız makale mevcut değil veya kaldırılmış olabilir.</p>
          <Link 
            href="/articles" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Makalelere Dön
          </Link>
        </div>
      </MainLayout>
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
    <MainLayout>
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Makalelere Dön
        </Link>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Categories */}
          <div className="flex items-center gap-2 mb-4">
            {article.categories.map((category) => (
              <Link
                key={category.id}
                href={`/articles?category=${category.slug}`}
                className="text-sm px-3 py-1 rounded-md transition-colors"
                style={{
                  backgroundColor: `${category.color}20`,
                  color: category.color
                }}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-foreground mb-6 break-long-words">{article.title}</h1>

          {/* Author and Meta */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link
                href={`/profile/${article.author_username}`}
                className="flex items-center gap-3 group"
              >
                <img
                  src={article.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author_username}`}
                  alt={article.author_name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {article.author_name}
                  </p>
                  <p className="text-sm text-muted-foreground">@{article.author_username}</p>
                </div>
              </Link>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.published_at!).toLocaleDateString('tr-TR')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  5 dk okuma
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {canEdit && (
                <>
                  <Link
                    href={`/articles/${article.slug}/edit`}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {article.cover_image && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg prose-foreground max-w-none mb-12 break-long-words">
            {article.content ? (
              <div 
                className="break-long-words"
                dangerouslySetInnerHTML={{ __html: article.content }} 
              />
            ) : (
              <p className="text-muted-foreground italic">İçerik yüklenemedi.</p>
            )}
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between py-6 border-t border-b border-border mb-12">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-5 h-5" />
                {article.view_count} görüntülenme
              </span>
              <motion.button
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center gap-1 transition-colors ${
                  isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
                } disabled:opacity-50`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`w-5 h-5 transition-all duration-300 ${
                    isLiked ? 'fill-current text-red-500' : ''
                  }`} />
                </motion.div>
                <motion.span
                  key={likeCount}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.2 }}
                >
                  {likeCount} beğeni
                </motion.span>
              </motion.button>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5" />
                {commentCount} yorum
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <CommentSection 
            articleId={article.id} 
            onCommentCountChange={setCommentCount}
          />
        </motion.div>
      </article>
    </MainLayout>
  );
}