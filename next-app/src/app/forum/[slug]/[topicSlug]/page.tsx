'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Eye,
  Calendar,
  Pin,
  Lock,
  Share2,
  Bookmark,
  MoreHorizontal,
  Reply,
  Send,
  User,
  ChevronRight,
  Bell,
  BellOff
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ForumSidebar from '@/components/forum/ForumSidebar';
import ForumContentRenderer from '@/components/forum/ForumContentRenderer';
import { addRecentItem } from '@/lib/utils/recent-items';
import { useThemeDetection } from '@/hooks/useThemeDetection';

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
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [relatedTopics, setRelatedTopics] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const { isDarkMode, mounted } = useThemeDetection();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Toggle replies visibility
  const toggleReplies = (postId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedReplies(newExpanded);
  };

  useEffect(() => {
    if (params.slug && params.topicSlug) {
      fetchTopicAndPosts(params.slug as string, params.topicSlug as string);
    }
  }, [params.slug, params.topicSlug]);

  // Fetch related topics when topic is loaded
  useEffect(() => {
    if (topic && topic.id) {
      fetchRelatedTopics(topic.id);
    }
  }, [topic?.id]);

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

      // Use mock data fallback if needed
      if (!topic) {
        setTopic({
          id: '1',
          title: 'Örnek Konu Başlığı',
          slug: topicSlug,
          content: 'Bu konunun içeriği burada yer alacak. Detaylı açıklamalar ve bilgiler paylaşılabilir.',
          author: {
            id: '1',
            name: 'Kullanıcı',
            username: 'user123',
            role: 'user' as const
          },
          category: {
            id: '1',
            name: 'Algoritmik Ticaret',
            slug: categorySlug,
            color: '#3B82F6'
          },
          is_pinned: false,
          is_locked: false,
          view_count: 156,
          reply_count: 8,
          vote_score: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        return;
      }

      // Get current user's vote for topic and follow status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: topicVote } = await supabase
          .from('forum_topic_votes')
          .select('vote_type')
          .eq('topic_id', topic.id)
          .eq('user_id', user.id)
          .single();

        topic.user_vote = topicVote?.vote_type;

        // Check if user is following this topic
        const { data: followData } = await supabase
          .from('topic_follows')
          .select('id')
          .eq('topic_id', topic.id)
          .eq('user_id', user.id)
          .single();

        setIsFollowing(!!followData);
      }

      const topicData = {
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
      };

      setTopic(topicData);

      // Fetch total vote count for this topic
      const { data: voteCount } = await supabase
        .from('forum_topic_votes')
        .select('id')
        .eq('topic_id', topic.id);
      
      setTotalVotes(voteCount?.length || 0);

      // Add to recent items
      addRecentItem({
        id: topicData.id,
        title: topicData.title,
        url: `/forum/${categorySlug}/${topicSlug}`,
        type: 'forum-topic',
        category: topicData.category.name,
        author: topicData.author.username
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
      // Use mock data fallback
      setTopic({
        id: '1',
        title: 'Örnek Konu Başlığı',
        slug: topicSlug,
        content: 'Bu konunun içeriği burada yer alacak. Detaylı açıklamalar ve bilgiler paylaşılabilir.',
        author: {
          id: '1',
          name: 'Kullanıcı',
          username: 'user123',
          role: 'user' as const
        },
        category: {
          id: '1',
          name: 'Algoritmik Ticaret',
          slug: categorySlug,
          color: '#3B82F6'
        },
        is_pinned: false,
        is_locked: false,
        view_count: 156,
        reply_count: 8,
        vote_score: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedTopics = async (topicId: string) => {
    try {
      setRelatedLoading(true);
      const response = await fetch(`/api/forum/topics/${topicId}/related`);
      
      if (response.ok) {
        const data = await response.json();
        setRelatedTopics(data.related_topics || []);
      } else {
        console.error('Failed to fetch related topics');
        setRelatedTopics([]);
      }
    } catch (error) {
      console.error('Error fetching related topics:', error);
      setRelatedTopics([]);
    } finally {
      setRelatedLoading(false);
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

        // Update total votes count when voting on topic
        if (currentVote === undefined && newVoteType !== null) {
          // New vote added
          setTotalVotes(prev => prev + 1);
        } else if (currentVote !== undefined && newVoteType === null) {
          // Vote removed
          setTotalVotes(prev => Math.max(0, prev - 1));
        }
        // If changing vote type (currentVote !== undefined && newVoteType !== null), total count stays same
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

  const handleReply = async (parentId?: string, mentionUsername?: string) => {
    if (!replyContent.trim() || !topic) return;

    try {
      setSubmittingReply(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Prepare content with @mention if needed
      let finalContent = replyContent.trim();
      
      // If replying to a reply (level > 0) and no @mention exists, add it
      if (mentionUsername && !finalContent.startsWith('@')) {
        finalContent = `@${mentionUsername} ${finalContent}`;
      }

      // Create post
      const response = await fetch(`/api/forum/topics/${topic.id}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: finalContent,
          parent_id: parentId
        })
      });

      if (!response.ok) {
        console.error('Error creating post');
        return;
      }

      const { post: newPost } = await response.json();

      if (parentId) {
        // Add as reply to specific post (YouTube-style: all replies go to main comment)
        const updatePosts = (posts: ForumPost[]): ForumPost[] => {
          return posts.map(post => {
            if (post.id === parentId) {
              return {
                ...post,
                replies: [...(post.replies || []), newPost]
              };
            }
            return post;
          });
        };
        
        setPosts(updatePosts(posts));
        
        // Auto-expand replies when a new reply is added
        setExpandedReplies(prev => new Set(prev).add(parentId));
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

  const handleToggleFollow = async () => {
    if (!topic) return;

    try {
      setFollowLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (isFollowing) {
        // Unfollow the topic
        const { error } = await supabase
          .from('topic_follows')
          .delete()
          .eq('topic_id', topic.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Follow the topic
        const { error } = await supabase
          .from('topic_follows')
          .insert({
            topic_id: topic.id,
            user_id: user.id
          });

        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
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

  // YouTube-style comment rendering (max 2 levels)
  const renderPost = (post: ForumPost, level: number = 0, parentPost?: ForumPost) => {
    const isReply = level > 0;
    const replyCount = post.replies?.length || 0;
    
    return (
      <div key={post.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-6'}`}>
        <div className={`rounded-lg border transition-all duration-200 ${
          isDarkMode ? 'bg-card border-border hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
        } ${isReply ? 'border-l-4 border-l-blue-200 dark:border-l-blue-800' : ''}`}>
          <div className="p-4">
            {/* Post Header */}
            <div className={`flex items-center gap-3 mb-3 text-sm ${
              isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-muted' : 'bg-gray-100'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{post.author.name}</span>
                {post.author.role === 'admin' && (
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">
                    Admin
                  </span>
                )}
                <span>•</span>
                <span>{formatDate(post.created_at)}</span>
                {post.is_edited && (
                  <>
                    <span>•</span>
                    <span className="italic text-xs">(düzenlendi)</span>
                  </>
                )}
              </div>
            </div>

            {/* Post Content */}
            <div className={`text-sm mb-4 leading-6 ${
              isDarkMode ? 'text-foreground' : 'text-gray-900'
            }`}>
              <ForumContentRenderer 
                content={post.content}
                className="text-sm"
              />
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {/* Vote Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleVote('up', 'post', post.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      post.user_vote === 1
                        ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30'
                        : (isDarkMode 
                          ? 'text-muted-foreground hover:bg-muted hover:text-emerald-500' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-emerald-500')
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                    {post.vote_score || 0}
                  </button>
                  <button 
                    onClick={() => handleVote('down', 'post', post.id)}
                    className={`p-1.5 rounded-full transition-colors ${
                      post.user_vote === -1
                        ? 'text-red-600 bg-red-100 dark:bg-red-900/30'
                        : (isDarkMode 
                          ? 'text-muted-foreground hover:bg-muted hover:text-red-500' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-red-500')
                    }`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Show/Hide Replies Button - Compact Version */}
                {!isReply && post.replies && post.replies.length > 0 && (
                  <button 
                    onClick={() => toggleReplies(post.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                      expandedReplies.has(post.id)
                        ? (isDarkMode 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15' 
                          : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100')
                        : (isDarkMode 
                          ? 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900')
                    }`}
                  >
                    <ChevronRight className={`w-3 h-3 transform transition-transform duration-200 ${
                      expandedReplies.has(post.id) ? 'rotate-90' : ''
                    }`} />
                    <span>{replyCount}</span>
                    <MessageCircle className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-muted-foreground hover:bg-muted hover:text-foreground' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Reply className="w-3 h-3" />
                  Yanıtla
                </button>
                <button className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-muted-foreground hover:bg-muted hover:text-foreground' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}>
                  <Share2 className="w-3 h-3" />
                  Paylaş
                </button>
              </div>
            </div>

            {/* Reply Form */}
            {replyingTo === post.id && (
              <div className={`mt-4 p-4 rounded-lg border ${
                isDarkMode ? 'bg-muted/50 border-border' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}`}>
                    {isReply ? `@${post.author.username} kullanıcısına yanıt veriyorsunuz:` : 'Yoruma yanıt veriyorsunuz:'}
                  </span>
                </div>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={isReply ? `@${post.author.username} ` : "Yanıtınızı yazın..."}
                  rows={3}
                  style={{ fontSize: '14px' }}
                  className={`w-full px-3 py-2 rounded-lg border transition-all resize-none ${
                    isDarkMode 
                      ? 'bg-background border-border text-foreground placeholder-muted-foreground focus:border-emerald-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500'
                  } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                />
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    style={{ fontSize: '14px' }}
                    className={`px-4 py-2 font-medium transition-colors ${
                      isDarkMode ? 'text-muted-foreground hover:text-foreground' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => handleReply(level === 0 ? post.id : parentPost?.id || post.id, post.author.username)}
                    disabled={!replyContent.trim() || submittingReply}
                    style={{ fontSize: '14px' }}
                    className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
                      submittingReply || !replyContent.trim()
                        ? (isDarkMode ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                        : (isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white')
                    }`}
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

        {/* Render Replies (Only for main comments, not nested replies) */}
        {!isReply && post.replies && post.replies.length > 0 && expandedReplies.has(post.id) && (
          <div className="mt-4">
            {/* Replies Container - Collapsible */}
            <div className="space-y-3">
              {post.replies.map(reply => renderPost(reply, 1, post))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 pt-4 ${
        isDarkMode ? 'bg-background' : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${
              isDarkMode ? 'border-emerald-400' : 'border-emerald-500'
            }`}></div>
            <p className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className={`min-h-screen transition-colors duration-200 pt-4 flex items-center justify-center ${
        isDarkMode ? 'bg-background' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
          }`} />
          <h1 className={`text-2xl font-bold mb-4 ${
            isDarkMode ? 'text-foreground' : 'text-gray-900'
          }`}>Konu bulunamadı</h1>
          <p className={`mb-8 ${
            isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
          }`}>Aradığınız konu mevcut değil veya kaldırılmış olabilir.</p>
          <Link 
            href="/forum" 
            className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
              isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Forum ana sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* Forum Sidebar Component */}
      <ForumSidebar activeCategory={topic?.category?.slug} />

      {/* Main Content with Left Margin for Fixed Sidebar */}
      <div className="md:ml-60">
        {/* Modern Hero Header - Full Width */}
        <div className={`relative overflow-hidden border-b ${
          isDarkMode 
            ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-border' 
            : 'bg-gradient-to-r from-gray-50 via-white to-gray-50 border-gray-200'
        }`}>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? 'rgb(34 197 94)' : 'rgb(16 185 129)'} 1px, transparent 0)`
            }}></div>
          </div>
          
          {/* Clean geometric shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute -top-24 -right-24 w-48 h-48 ${
              isDarkMode ? 'bg-emerald-500/5' : 'bg-emerald-500/8'
            } rounded-full blur-3xl`}></div>
            <div className={`absolute top-1/2 -left-32 w-64 h-64 ${
              isDarkMode ? 'bg-green-500/3' : 'bg-green-500/5'
            } rounded-full blur-3xl`}></div>
          </div>
          
          {/* Content overlay with subtle backdrop */}
          <div className={`relative backdrop-blur-[1px] ${
            isDarkMode 
              ? 'bg-background/95' 
              : 'bg-white/60'
          }`}>
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-6">
              <Link 
                href={`/forum/${topic.category.slug}`}
                className={`p-2 rounded-lg border transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300 hover:text-emerald-300' 
                    : 'bg-white/80 hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-emerald-600'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{ backgroundColor: topic.category.color }}
                >
                  {topic.category.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className={`text-2xl font-bold ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-900'
                    }`}>{topic.title}</h1>
                    {topic.is_pinned && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 backdrop-blur-sm text-emerald-300 rounded-full text-xs font-medium border border-emerald-400/30">
                        <Pin className="w-3 h-3" />
                        Sabitlenmiş
                      </div>
                    )}
                    {topic.is_locked && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 backdrop-blur-sm text-red-300 rounded-full text-xs font-medium border border-red-400/30">
                        <Lock className="w-3 h-3" />
                        Kilitli
                      </div>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>r/{topic.category.name} topluluğunda tartışma</p>
                </div>
              </div>
            </div>
            
            <div className={`flex items-center gap-6 text-sm ${
              isDarkMode ? 'text-slate-300' : 'text-slate-500'
            }`}>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{formatNumber(topic.view_count)} Görüntüleme</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{topic.reply_count} Yanıt</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{topic.author.name} tarafından</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(topic.created_at)}</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Main Content Area with proper spacing and max-width */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 max-w-[800px] space-y-6">

            {/* Topic Content Card */}
            <div className={`rounded-lg border transition-colors duration-200 ${
              isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
            }`}>
              <div className="p-6">
                {/* Topic Content */}
                <div className={`text-sm mb-6 leading-6 ${
                  isDarkMode ? 'text-foreground' : 'text-gray-900'
                }`}>
                  <ForumContentRenderer 
                    content={topic.content}
                    className="text-sm"
                  />
                </div>

                {/* Vote and Actions Section */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleVote('up', 'topic', topic.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        topic.user_vote === 1
                          ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30'
                          : (isDarkMode 
                            ? 'text-muted-foreground hover:bg-muted hover:text-emerald-500' 
                            : 'text-gray-500 hover:bg-gray-100 hover:text-emerald-500')
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                      {topic.vote_score}
                    </button>
                    <button 
                      onClick={() => handleVote('down', 'topic', topic.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        topic.user_vote === -1
                          ? 'text-red-600 bg-red-100 dark:bg-red-900/30'
                          : (isDarkMode 
                            ? 'text-muted-foreground hover:bg-muted hover:text-red-500' 
                            : 'text-gray-500 hover:bg-gray-100 hover:text-red-500')
                      }`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {!topic.is_locked && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === 'main' ? null : 'main')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          isDarkMode 
                            ? 'text-muted-foreground hover:bg-muted hover:text-foreground' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <Reply className="w-4 h-4" />
                        Yanıtla
                      </button>
                    )}
                    <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-muted-foreground hover:bg-muted hover:text-foreground' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}>
                      <Share2 className="w-4 h-4" />
                      Paylaş
                    </button>
                    <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-muted-foreground hover:bg-muted hover:text-foreground' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}>
                      <Bookmark className="w-4 h-4" />
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Reply Form */}
            {replyingTo === 'main' && !topic.is_locked && (
              <div className={`rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className="p-4">
                  <h3 className={`text-sm font-medium mb-3 ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>Yanıt Yaz</h3>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Yanıtınızı yazın..."
                    rows={4}
                    style={{ fontSize: '14px' }}
                    className={`w-full px-3 py-2 rounded-lg border transition-all resize-none ${
                      isDarkMode 
                        ? 'bg-background border-border text-foreground placeholder-muted-foreground focus:border-emerald-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500'
                    } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                  />
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                      style={{ fontSize: '14px' }}
                      className={`px-4 py-2 font-medium transition-colors ${
                        isDarkMode ? 'text-muted-foreground hover:text-foreground' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      İptal
                    </button>
                    <button
                      onClick={() => handleReply()}
                      disabled={!replyContent.trim() || submittingReply}
                      style={{ fontSize: '14px' }}
                      className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
                        submittingReply || !replyContent.trim()
                          ? (isDarkMode ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                          : (isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white')
                      }`}
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
              </div>
            )}

            {/* Replies Section */}
            {posts.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>
                    Yanıtlar ({posts.length})
                  </h2>
                  
                  {/* Sort Options */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                    }`}>Sırala:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className={`px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                        isDarkMode 
                          ? 'bg-background border-border text-foreground' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="oldest">En Eski</option>
                      <option value="newest">En Yeni</option>
                      <option value="popular">En Popüler</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {posts.map(post => renderPost(post))}
                </div>
              </>
            )}

            {/* Empty State */}
            {posts.length === 0 && (
              <div className={`text-center py-12 rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <h3 className={`text-lg font-medium mb-2 ${
                  isDarkMode ? 'text-foreground' : 'text-gray-900'
                }`}>Henüz yanıt yok</h3>
                <p className={`mb-6 ${
                  isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                }`}>Bu konuda ilk yanıtı sen ver ve tartışmayı başlat!</p>
                {!topic.is_locked && (
                  <button
                    onClick={() => setReplyingTo('main')}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    <Reply className="w-4 h-4" />
                    İlk Yanıtı Ver
                  </button>
                )}
              </div>
            )}

            {/* Locked Topic Notice */}
            {topic.is_locked && (
              <div className={`text-center py-8 rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg ${
                  isDarkMode ? 'bg-muted/20 text-muted-foreground' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Bu konu kilitlenmiş, yeni yanıt yazamazsınız.</span>
                </div>
              </div>
            )}
            </div>

            {/* Right Sidebar */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Topic Stats Card */}
                <div className={`rounded-xl border transition-colors duration-200 ${
                  isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
                }`}>
                  <div className={`px-6 py-4 border-b ${
                    isDarkMode ? 'border-border' : 'border-gray-100'
                  }`}>
                    <h3 className={`font-semibold text-lg ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>Konu İstatistikleri</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}`}>
                          Görüntüleme
                        </span>
                      </div>
                      <span className={`font-semibold ${isDarkMode ? 'text-foreground' : 'text-gray-900'}`}>
                        {formatNumber(topic.view_count)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}`}>
                          Yanıt
                        </span>
                      </div>
                      <span className={`font-semibold ${isDarkMode ? 'text-foreground' : 'text-gray-900'}`}>
                        {topic.reply_count}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowUp className={`w-4 h-4 ${topic.vote_score >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}`}>
                          Oy Puanı
                        </span>
                      </div>
                      <span className={`font-semibold ${
                        topic.vote_score >= 0 ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {topic.vote_score > 0 ? '+' : ''}{topic.vote_score}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                          isDarkMode ? 'border-purple-400 text-purple-400' : 'border-purple-500 text-purple-500'
                        }`}>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                        </div>
                        <span className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}`}>
                          Toplam Oy
                        </span>
                      </div>
                      <span className={`font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}>
                        {totalVotes}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}`}>
                          Oluşturulma
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-foreground' : 'text-gray-900'}`}>
                        {formatDate(topic.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Follow Topic Button */}
                <div className={`rounded-xl border transition-colors duration-200 ${
                  isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
                }`}>
                  <div className="p-6">
                    <button
                      onClick={handleToggleFollow}
                      disabled={followLoading}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                        isFollowing
                          ? (isDarkMode 
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' 
                            : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200')
                          : (isDarkMode 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white')
                      } ${followLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {followLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>İşleniyor...</span>
                        </>
                      ) : isFollowing ? (
                        <>
                          <BellOff className="w-4 h-4" />
                          <span>Takibi Bırak</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          <span>Takip Et</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Related Topics Card */}
                <div className={`rounded-xl border transition-colors duration-200 ${
                  isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
                }`}>
                  <div className={`px-6 py-4 border-b ${
                    isDarkMode ? 'border-border' : 'border-gray-100'
                  }`}>
                    <h3 className={`font-semibold text-lg ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>Benzer Konular</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {relatedLoading ? (
                      // Loading state
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`p-3 rounded-lg animate-pulse ${
                            isDarkMode ? 'bg-muted' : 'bg-gray-100'
                          }`}>
                            <div className={`h-4 rounded mb-2 ${
                              isDarkMode ? 'bg-background' : 'bg-gray-200'
                            }`}></div>
                            <div className={`h-3 rounded w-2/3 ${
                              isDarkMode ? 'bg-background' : 'bg-gray-200'
                            }`}></div>
                          </div>
                        ))}
                      </div>
                    ) : relatedTopics.length > 0 ? (
                      // Dynamic related topics
                      relatedTopics.map((relatedTopic) => (
                        <Link
                          key={relatedTopic.id}
                          href={`/forum/${relatedTopic.category.slug}/${relatedTopic.slug}`}
                          className={`block p-3 rounded-lg transition-colors ${
                            isDarkMode ? 'hover:bg-muted' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-medium text-sm line-clamp-2 flex-1 ${
                              isDarkMode ? 'text-foreground' : 'text-gray-900'
                            }`}>
                              {relatedTopic.title}
                            </h4>
                            {relatedTopic.similarity_score && relatedTopic.similarity_score > 0.7 && (
                              <span className="text-xs px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">
                                {Math.round(relatedTopic.similarity_score * 100)}%
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}`}>
                            {relatedTopic.reply_count} yanıt • {relatedTopic.time_ago}
                          </p>
                        </Link>
                      ))
                    ) : (
                      // No related topics found
                      <div className={`text-center py-4 ${
                        isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                      }`}>
                        <p className="text-sm">Henüz benzer konu bulunamadı</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}