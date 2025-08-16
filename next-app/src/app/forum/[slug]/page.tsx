'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useThemeDetection } from '@/hooks/useThemeDetection';
import { 
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  User
} from 'lucide-react';

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
  user_vote?: number;
  last_reply_at?: string;
  last_reply_user?: {
    name: string;
    username: string;
  };
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export default function ForumCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.slug as string;
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'replies'>('recent');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const { isDarkMode, mounted } = useThemeDetection();

  useEffect(() => {
    fetchCategory();
  }, [categorySlug]);

  useEffect(() => {
    if (category) {
      fetchTopics();
    }
  }, [category, sortBy]);

  const fetchCategory = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (error) throw error;
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
      router.push('/forum');
    }
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      let query = supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          slug,
          content,
          is_pinned,
          is_locked,
          view_count,
          reply_count,
          vote_score,
          created_at,
          last_reply_at,
          category:categories!forum_topics_category_id_fkey(
            id,
            name,
            slug,
            color
          ),
          author:users!forum_topics_author_id_fkey(
            id,
            name,
            username,
            avatar_url
          ),
          last_reply_user:users!forum_topics_last_reply_user_id_fkey(
            name,
            username
          )
        `)
        .eq('category_id', category?.id);

      // Apply sorting
      if (sortBy === 'popular') {
        query = query.order('vote_score', { ascending: false });
      } else if (sortBy === 'replies') {
        query = query.order('reply_count', { ascending: false });
      } else {
        query = query.order('last_reply_at', { ascending: false, nullsFirst: false })
                     .order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Get current user's votes for these topics
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const topicIds = data.map(topic => topic.id);
        const { data: userVotes } = await supabase
          .from('forum_topic_votes')
          .select('topic_id, vote_type')
          .eq('user_id', user.id)
          .in('topic_id', topicIds);

        // Map user votes to topics
        const voteMap = new Map(userVotes?.map(v => [v.topic_id, v.vote_type]));
        data.forEach(topic => {
          topic.user_vote = voteMap.get(topic.id) || null;
        });
      }
      
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleVote = async (type: 'up' | 'down', topicId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const voteValue = type === 'up' ? 1 : -1;
      const currentTopic = topics.find(t => t.id === topicId);
      const currentVote = currentTopic?.user_vote;
      
      const newVoteType = currentVote === voteValue ? null : voteValue;

      // Send vote request
      const response = await fetch(`/api/forum/topics/${topicId}/vote`, {
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
      setTopics(topics => 
        topics.map(topic => 
          topic.id === topicId
            ? { ...topic, vote_score, user_vote: newVoteType }
            : topic
        )
      );
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const sortedTopics = [...topics].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0;
  });

  if (!category) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
    );
  }

  return (
      <div className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-background' : 'bg-gray-50'
      }`}>
      {/* Main Content */}
      <div>
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Breadcrumb & Actions */}
            <div className="flex items-center justify-between mb-6">
              <nav className="flex items-center gap-2 text-sm">
                <Link href="/forum" className="text-muted-foreground hover:text-foreground transition-colors">
                  Forum
                </Link>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-foreground font-medium">{category.name}</span>
              </nav>
              <Link
                href={`/forum/${category.slug}/new-topic`}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Yeni Konu</span>
              </Link>
            </div>

            {/* Category Info */}
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${category.color}15`,
                  color: category.color
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-1">{category.name}</h1>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>

            {/* Stats & Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Konular:</span>
                  <span className="font-medium text-foreground">{topics.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Yanıtlar:</span>
                  <span className="font-medium text-foreground">
                    {topics.reduce((sum, topic) => sum + topic.reply_count, 0)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sırala:</span>
                <div className="flex gap-1 bg-card rounded-lg p-1">
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                      sortBy === 'recent'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Son Aktivite
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                      sortBy === 'popular'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Popüler
                  </button>
                  <button
                    onClick={() => setSortBy('replies')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                      sortBy === 'replies'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    En Çok Yanıt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full mb-3"></div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Reddit-Style Posts */}
            <div className="space-y-2">
              {sortedTopics.map((topic) => {
                const voteScore = topic.vote_score || 0;
                
                return (
                  <div key={topic.id} className={`rounded-lg border transition-colors duration-200 hover:shadow-sm ${
                    isDarkMode ? 'bg-card border-border hover:bg-background' : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex p-3">
                      {/* Vote section */}
                      <div className="flex flex-col items-center w-10 mr-3">
                        <button 
                          onClick={() => handleVote('up', topic.id)}
                          className={`p-1 rounded transition-colors ${
                            topic.user_vote === 1
                              ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30'
                              : (isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-emerald-500' : 'text-gray-400 hover:bg-gray-100 hover:text-emerald-500')
                          }`}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <span className={`text-xs font-bold py-1 ${
                          voteScore > 0 ? 'text-emerald-500' : voteScore < 0 ? 'text-red-500' : (isDarkMode ? 'text-foreground' : 'text-gray-600')
                        }`}>
                          {Math.abs(voteScore) > 1000 ? `${(Math.abs(voteScore)/1000).toFixed(1)}k` : voteScore}
                        </span>
                        <button 
                          onClick={() => handleVote('down', topic.id)}
                          className={`p-1 rounded transition-colors ${
                            topic.user_vote === -1
                              ? 'text-red-600 bg-red-100 dark:bg-red-900/30'
                              : (isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-red-500' : 'text-gray-400 hover:bg-gray-100 hover:text-red-500')
                          }`}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Meta */}
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name.charAt(0)}
                          </div>
                          <Link href={`/forum/${category.slug}`} className={`text-xs font-medium hover:underline ${
                            isDarkMode ? 'text-foreground' : 'text-gray-900'
                          }`}>
                            r/{category.name}
                          </Link>
                          <span className={`text-xs ${
                            isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                          }`}>
                            • u/{topic.author.username} • {formatDate(topic.created_at)} önce
                          </span>
                          {topic.is_pinned && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                              📌 Sabitlenmiş
                            </span>
                          )}
                        </div>
                        
                        {/* Title and Content */}
                        <Link href={`/forum/${category.slug}/${topic.slug}`} className="block group">
                          <h3 className={`font-medium text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors ${
                            isDarkMode ? 'text-foreground' : 'text-gray-900'
                          }`}>
                            {topic.title}
                          </h3>
                          
                          {topic.content && topic.content.length > 50 && (
                            <p className={`text-sm mb-3 line-clamp-3 ${
                              isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                            }`}>
                              {topic.content}
                            </p>
                          )}
                        </Link>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-4 text-xs">
                          <button className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                            isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
                          }`}>
                            <MessageCircle className="w-3 h-3" />
                            {topic.reply_count} Yorum
                          </button>
                          <button className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                            isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
                          }`}>
                            <Share2 className="w-3 h-3" />
                            Paylaş
                          </button>
                          <button className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                            isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
                          }`}>
                            <Bookmark className="w-3 h-3" />
                            Kaydet
                          </button>
                          <button className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                            isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
                          }`}>
                            <MoreHorizontal className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {topics.length === 0 && (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-semibold text-foreground mb-2">Henüz konu yok</h3>
                <p className="text-muted-foreground mb-6">Bu kategoride ilk konuyu sen aç!</p>
                <Link
                  href={`/forum/${category.slug}/new-topic`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Konu Aç
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      </div>
      </div>
  );
}