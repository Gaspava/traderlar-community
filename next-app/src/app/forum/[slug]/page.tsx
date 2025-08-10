'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
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
            <div className="space-y-3">
              {sortedTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/forum/${category.slug}/${topic.slug}`}
                  className="block group"
                >
                  <div className="bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-lg p-4 transition-all hover:shadow-md">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {topic.author.avatar_url ? (
                          <img
                            src={topic.author.avatar_url}
                            alt={topic.author.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">
                            {topic.author.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title & Badges */}
                        <div className="flex items-start gap-2 mb-2">
                          {topic.is_pinned && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                              </svg>
                              Sabit
                            </span>
                          )}
                          {topic.is_locked && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-medium">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Kilitli
                            </span>
                          )}
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
                            {topic.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {topic.content}
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {topic.author.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {topic.reply_count} yanıt
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {topic.view_count} görüntüleme
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            {topic.vote_score}
                          </span>
                          {topic.last_reply_at && (
                            <>
                              <span>•</span>
                              <span>Son yanıt: {formatDate(topic.last_reply_at)}</span>
                              {topic.last_reply_user && (
                                <span className="font-medium">{topic.last_reply_user.name}</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
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
  );
}