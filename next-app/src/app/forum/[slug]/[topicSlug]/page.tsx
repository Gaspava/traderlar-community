'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  Clock,
  User,
  Calendar,
  Pin,
  Lock,
  Flag,
  Share2,
  Bookmark,
  MoreHorizontal,
  Reply,
  Edit,
  Trash2,
  Send,
  AlertCircle,
  Sparkles,
  Heart,
  Shield,
  CheckCircle,
  Users
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    role: 'user' | 'admin';
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  vote_score: number;
  user_vote?: 1 | -1;
  created_at: string;
  updated_at: string;
}

interface ForumPost {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    role: 'user' | 'admin';
  };
  parent_id?: string;
  vote_score: number;
  user_vote?: 1 | -1;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  replies?: ForumPost[];
}

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [sortBy, setSortBy] = useState<'oldest' | 'newest' | 'popular'>('oldest');

  useEffect(() => {
    if (params.slug && params.topicSlug) {
      fetchTopicAndPosts(params.slug as string, params.topicSlug as string);
    }
  }, [params.slug, params.topicSlug]);

  const fetchTopicAndPosts = async (categorySlug: string, topicSlug: string) => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Get topic by slug
      const { data: topic, error: topicError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          author:users!forum_topics_author_id_fkey (
            id,
            name,
            username,
            avatar_url,
            role
          ),
          category:categories!forum_topics_category_id_fkey (
            id,
            name,
            slug,
            color
          ),
          last_reply_user:users!forum_topics_last_reply_user_id_fkey (
            id,
            name,
            username
          )
        `)
        .eq('slug', topicSlug)
        .single();

      if (topicError || !topic) {
        console.error('Topic not found:', topicError);
        setTopic(null);
        return;
      }

      // Check if topic belongs to the correct category
      if (topic.category.slug !== categorySlug) {
        console.error('Topic does not belong to this category');
        router.push(`/forum/${topic.category.slug}/${topicSlug}`);
        return;
      }

      // Get current user's vote for topic
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: topicVote } = await supabase
          .from('forum_topic_votes')
          .select('vote_type')
          .eq('topic_id', topic.id)
          .eq('user_id', user.id)
          .single();

        topic.user_vote = topicVote?.vote_type;
      }

      setTopic({
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        content: topic.content,
        author: topic.author,
        category: topic.category,
        is_pinned: topic.is_pinned,
        is_locked: topic.is_locked,
        view_count: topic.view_count,
        reply_count: topic.reply_count,
        vote_score: topic.vote_score || 0,
        user_vote: topic.user_vote,
        created_at: topic.created_at,
        updated_at: topic.updated_at
      });

      // Increment view count
      await fetch(`/api/forum/topics/${topic.id}`, {
        method: 'GET'
      });

      // Get posts
      const response = await fetch(`/api/forum/topics/${topic.id}/posts?sort=${sortBy}`);
      if (response.ok) {
        const { posts } = await response.json();
        setPosts(posts || []);
      }
    } catch (error) {
      console.error('Error fetching topic and posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: 'up' | 'down', targetType: 'topic' | 'post', targetId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const voteValue = type === 'up' ? 1 : -1;
      const currentVote = targetType === 'topic' ? topic?.user_vote : 
        posts.find(p => p.id === targetId)?.user_vote || 
        posts.flatMap(p => p.replies || []).find(r => r.id === targetId)?.user_vote;

      const newVoteType = currentVote === voteValue ? null : voteValue;

      // Send vote request
      const endpoint = targetType === 'topic' ? 
        `/api/forum/topics/${targetId}/vote` : 
        `/api/forum/posts/${targetId}/vote`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: newVoteType })
      });

      if (!response.ok) {
        console.error('Error voting');
        return;
      }

      const { vote_score } = await response.json();

      // Update local state
      if (targetType === 'topic' && topic) {
        setTopic({
          ...topic,
          vote_score,
          user_vote: newVoteType
        });
      } else {
        const updatePostVote = (posts: ForumPost[]): ForumPost[] => {
          return posts.map(post => {
            if (post.id === targetId) {
              return {
                ...post,
                vote_score,
                user_vote: newVoteType
              };
            }
            
            if (post.replies) {
              return {
                ...post,
                replies: updatePostVote(post.replies)
              };
            }
            
            return post;
          });
        };
        
        setPosts(updatePostVote(posts));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleReply = async (parentId?: string) => {
    if (!replyContent.trim() || !topic) return;

    try {
      setSubmittingReply(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Create post
      const response = await fetch(`/api/forum/topics/${topic.id}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
          parent_id: parentId
        })
      });

      if (!response.ok) {
        console.error('Error creating post');
        return;
      }

      const { post: newPost } = await response.json();

      if (parentId) {
        // Add as reply to specific post
        const updatePosts = (posts: ForumPost[]): ForumPost[] => {
          return posts.map(post => {
            if (post.id === parentId) {
              return {
                ...post,
                replies: [...(post.replies || []), newPost]
              };
            }
            
            if (post.replies) {
              return {
                ...post,
                replies: updatePosts(post.replies)
              };
            }
            
            return post;
          });
        };
        
        setPosts(updatePosts(posts));
      } else {
        // Add as main post
        setPosts([...posts, newPost]);
      }

      setReplyContent('');
      setReplyingTo(null);
      
      // Update topic reply count
      if (topic) {
        setTopic({
          ...topic,
          reply_count: topic.reply_count + 1
        });
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const renderPost = (post: ForumPost, level: number = 0) => (
    <div key={post.id} className={`${level > 0 ? 'ml-6 mt-4' : 'mb-6'}`}>
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-start gap-4">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium text-foreground">{post.author.name}</span>
              {post.author.role === 'admin' && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded">
                  Admin
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {formatDate(post.created_at)}
              </span>
              {post.is_edited && (
                <span className="text-xs text-muted-foreground italic">
                  (düzenlendi)
                </span>
              )}
            </div>

            <div className="prose prose-sm max-w-none mb-4">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {paragraph || '\u00A0'}
                </p>
              ))}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Vote Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleVote('up', 'post', post.id)}
                    className={`p-1 rounded transition-colors ${
                      post.user_vote === 1
                        ? 'text-green-600 bg-green-100'
                        : 'text-muted-foreground hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-foreground min-w-[1.5rem] text-center">
                    {post.vote_score}
                  </span>
                  <button
                    onClick={() => handleVote('down', 'post', post.id)}
                    className={`p-1 rounded transition-colors ${
                      post.user_vote === -1
                        ? 'text-red-600 bg-red-100'
                        : 'text-muted-foreground hover:text-red-600'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Reply Button */}
                <button
                  onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Yanıtla
                </button>
              </div>

              {/* More Actions */}
              <div className="flex items-center gap-2">
                <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                  <Flag className="w-4 h-4" />
                </button>
                <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reply Form */}
            {replyingTo === post.id && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Yanıtınızı yazın..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => handleReply(post.id)}
                    disabled={!replyContent.trim() || submittingReply}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground text-sm font-medium rounded-lg transition-colors"
                  >
                    {submittingReply ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Gönder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render Replies */}
      {post.replies && post.replies.map(reply => renderPost(reply, level + 1))}
    </div>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="animate-pulse space-y-8"
            >
              <div className="h-12 bg-gradient-to-r from-muted via-muted/60 to-muted rounded-xl w-3/4"></div>
              <div className="bg-gradient-to-br from-card via-card/80 to-card/60 rounded-2xl p-8 border border-border/50 shadow-lg">
                <div className="h-40 bg-gradient-to-r from-muted via-muted/60 to-muted rounded-xl"></div>
              </div>
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-card via-card/80 to-card/60 rounded-2xl p-6 border border-border/50 shadow-lg"
                >
                  <div className="h-24 bg-gradient-to-r from-muted via-muted/60 to-muted rounded-xl"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!topic) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
            >
              <MessageSquare className="w-12 h-12 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Konu bulunamadı</h1>
            <p className="text-muted-foreground text-lg mb-8">Aradığınız konu mevcut değil veya kaldırılmış olabilir.</p>
            <Link 
              href="/forum" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Forum ana sayfasına dön
            </Link>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b border-border/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Link 
                  href={`/forum/${topic.category.slug}`}
                  className="p-3 hover:bg-muted/50 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-3 rounded-xl shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${topic.category.color}15, ${topic.category.color}25)`,
                    borderColor: `${topic.category.color}30`
                  }}
                >
                  <div className="w-6 h-6" style={{ backgroundColor: topic.category.color }}></div>
                </motion.div>
                <div className="text-sm text-muted-foreground bg-muted/30 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
                  <Link href="/forum" className="hover:text-foreground transition-colors">Forum</Link>
                  <span className="mx-2">•</span>
                  <Link href={`/forum/${topic.category.slug}`} className="hover:text-foreground transition-colors">
                    {topic.category.name}
                  </Link>
                </div>
              </div>

              {/* Topic Header */}
              <div className="flex items-start gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    {topic.is_pinned && (
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        className="p-2 bg-primary/10 rounded-full"
                      >
                        <Pin className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                    {topic.is_locked && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="p-2 bg-muted/20 rounded-full"
                      >
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    )}
                    <h1 className="text-3xl font-bold text-foreground break-long-words">{topic.title}</h1>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50 shadow-lg"
                    >
                      <User className="w-5 h-5 text-primary mx-auto mb-1" />
                      <div className="text-sm font-medium text-foreground">{topic.author.name}</div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50 shadow-lg"
                    >
                      <Calendar className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <div className="text-sm font-medium text-foreground">{formatDate(topic.created_at)}</div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50 shadow-lg"
                    >
                      <Eye className="w-5 h-5 text-primary mx-auto mb-1" />
                      <div className="text-sm font-medium text-foreground">{topic.view_count}</div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50 shadow-lg"
                    >
                      <MessageSquare className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <div className="text-sm font-medium text-foreground">{topic.reply_count}</div>
                    </motion.div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 text-muted-foreground hover:text-foreground transition-all duration-300 bg-card/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl border border-border/50"
                  >
                    <Bookmark className="w-5 h-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 text-muted-foreground hover:text-foreground transition-all duration-300 bg-card/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl border border-border/50"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 text-muted-foreground hover:text-foreground transition-all duration-300 bg-card/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl border border-border/50"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Topic Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl backdrop-blur-sm mb-8"
          >
            <div className="flex items-start gap-6">
              {/* Author Avatar */}
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex-shrink-0"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center shadow-lg border border-primary/10">
                  <User className="w-8 h-8 text-primary" />
                </div>
              </motion.div>

              {/* Topic Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xl font-bold text-foreground">{topic.author.name}</span>
                  {topic.author.role === 'admin' && (
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-sm font-semibold rounded-full border border-primary/20"
                    >
                      Admin
                    </motion.span>
                  )}
                  <div className="text-sm text-muted-foreground bg-muted/20 px-3 py-1 rounded-full">
                    {formatDate(topic.created_at)}
                  </div>
                </div>

                <div className="prose prose-lg max-w-none mb-8 break-long-words">
                  {topic.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0 leading-relaxed text-foreground">
                      {paragraph || '\u00A0'}
                    </p>
                  ))}
                </div>

                {/* Topic Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                  <div className="flex items-center gap-6">
                    {/* Vote Buttons */}
                    <div className="flex items-center gap-2 bg-muted/20 backdrop-blur-sm rounded-full p-2 border border-border/50">
                      <motion.button
                        onClick={() => handleVote('up', 'topic', topic.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-full transition-all duration-300 ${
                          topic.user_vote === 1
                            ? 'text-green-600 bg-green-600/20 shadow-lg'
                            : 'text-muted-foreground hover:text-green-600 hover:bg-green-600/10'
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </motion.button>
                      <motion.span 
                        key={topic.vote_score}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                        className="text-lg font-bold text-foreground min-w-[3rem] text-center px-2"
                      >
                        {topic.vote_score}
                      </motion.span>
                      <motion.button
                        onClick={() => handleVote('down', 'topic', topic.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-full transition-all duration-300 ${
                          topic.user_vote === -1
                            ? 'text-red-600 bg-red-600/20 shadow-lg'
                            : 'text-muted-foreground hover:text-red-600 hover:bg-red-600/10'
                        }`}
                      >
                        <ThumbsDown className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Reply Button */}
                    {!topic.is_locked && (
                      <motion.button
                        onClick={() => setReplyingTo(replyingTo === 'main' ? null : 'main')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-primary/5 text-primary hover:from-primary/20 hover:to-primary/10 rounded-xl transition-all duration-300 border border-primary/20 shadow-lg hover:shadow-xl"
                      >
                        <Reply className="w-5 h-5" />
                        <span className="font-semibold">Yanıtla</span>
                      </motion.button>
                    )}
                  </div>

                  {/* More Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 text-muted-foreground hover:text-red-500 transition-all duration-300 bg-card/50 backdrop-blur-sm rounded-xl hover:bg-red-500/10 border border-border/50"
                    >
                      <Flag className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Main Reply Form */}
                {replyingTo === 'main' && !topic.is_locked && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 p-6 bg-gradient-to-br from-muted/20 via-muted/10 to-transparent backdrop-blur-sm rounded-2xl border border-border/50"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Reply className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Yanıt Yaz</h3>
                    </div>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Yanıtınızı yazın... Saygılı ve yapıcı bir dil kullanın."
                      rows={5}
                      className="w-full px-4 py-3 bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 break-long-words"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-muted-foreground">
                        💡 İpucu: Markdown desteklenmektedir
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 font-medium"
                        >
                          İptal
                        </motion.button>
                        <motion.button
                          onClick={() => handleReply()}
                          disabled={!replyContent.trim() || submittingReply}
                          whileHover={{ scale: submittingReply ? 1 : 1.05 }}
                          whileTap={{ scale: submittingReply ? 1 : 0.95 }}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary disabled:from-muted disabled:to-muted/80 disabled:text-muted-foreground text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed disabled:scale-100"
                        >
                          {submittingReply ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              <span>Gönderiliyor...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              <span>Gönder</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Posts */}
          {posts.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Yanıtlar ({posts.length})
                </h2>
                
                {/* Sort Options */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sırala:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="oldest">En Eski</option>
                    <option value="newest">En Yeni</option>
                    <option value="popular">En Popüler</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {posts.map(post => renderPost(post))}
              </div>
            </>
          )}

          {posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
              >
                <MessageSquare className="w-12 h-12 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Henüz yanıt yok
              </h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Bu konuda ilk yanıtı sen ver ve tartışmayı başlat!
              </p>
              {!topic.is_locked && (
                <motion.button
                  onClick={() => setReplyingTo('main')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Reply className="w-5 h-5" />
                  <span>İlk Yanıtı Ver</span>
                </motion.button>
              )}
            </motion.div>
          )}

          {topic.is_locked && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/20 backdrop-blur-sm rounded-xl border border-border/50 text-muted-foreground">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Lock className="w-6 h-6" />
                </motion.div>
                <span className="font-medium">Bu konu kilitlenmiş, yeni yanıt yazamazsınız.</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}