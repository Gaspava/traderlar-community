'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  topic_count: number;
  post_count: number;
  last_post?: {
    title: string;
    author: string;
    date: string;
  };
}

interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  created_at: string;
  reply_count: number;
  view_count: number;
  is_pinned?: boolean;
  is_locked?: boolean;
}

const iconMap: { [key: string]: JSX.Element } = {
  MessageCircle: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  TrendingUp: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  LineChart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  GraduationCap: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  Code: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Bitcoin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.767 12.57c-.178.87-1.283.613-1.726.483l.343-1.374c.444.11 1.559.283 1.383.891zm.261-2.881c-.16.784-1.097.544-1.469.436l.312-1.25c.372.093 1.319.225 1.157.814zm3.615-.186c.184-.739-.114-1.037-.584-1.272l.224-.9-.548-.136-.218.873a10.016 10.016 0 00-.439-.103l.22-.88-.547-.137-.224.898c-.115-.026-.228-.052-.338-.078l.001-.004-.755-.189-.145.584s.407.093.398.099c.222.055.262.203.255.32l-.255 1.024c.016.004.036.01.058.019l-.059-.015-.357 1.432c-.027.067-.096.167-.25.129.005.008-.399-.1-.399-.1l-.272.628.712.178.395.1-.226.909.547.136.224-.9c.148.04.291.076.432.11l-.223.893.548.136.226-.907c.921.174 1.613.104 1.903-.729.234-.668-.012-1.052-.493-1.303.351-.081.615-.312.686-.788zm-4.59 6.438c-.167.668-1.292.307-1.656.217l.295-1.183c.365.091 1.533.272 1.361.966zm5.922-6.441c0 5.247-4.253 9.5-9.5 9.5S2 17.247 2 12 6.253 2.5 11.5 2.5s9.5 4.253 9.5 9.5z"/>
    </svg>
  ),
  Bot: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [recentTopics, setRecentTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'recent'>('categories');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchRecentTopics();
  }, []);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      const categoriesWithStats = await Promise.all(
        (categories || []).map(async (category) => {
          const { count: topicCount } = await supabase
            .from('forum_topics')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          const { data: lastTopic } = await supabase
            .from('forum_topics')
            .select(`
              title,
              created_at,
              author:users!forum_topics_author_id_fkey(name)
            `)
            .eq('category_id', category.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...category,
            topic_count: topicCount || 0,
            post_count: 0,
            last_post: lastTopic ? {
              title: lastTopic.title,
              author: lastTopic.author?.name || 'Anonim',
              date: formatDate(lastTopic.created_at)
            } : undefined
          };
        })
      );

      setCategories(categoriesWithStats);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTopics = async () => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          slug,
          content,
          created_at,
          reply_count,
          view_count,
          is_pinned,
          is_locked,
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
          )
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentTopics(data || []);
    } catch (error) {
      console.error('Error fetching recent topics:', error);
      setRecentTopics([]);
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

  const filteredCategories = categories.filter(cat =>
    searchTerm === '' ||
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTopics = recentTopics.filter(topic =>
    searchTerm === '' ||
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Modern Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Title & Stats */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Forum</h1>
                <p className="text-sm text-muted-foreground mt-1">Trading topluluğuna katılın ve deneyimlerinizi paylaşın</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-primary/10 rounded-lg">
                  <span className="text-sm font-medium text-primary">{categories.length} Kategori</span>
                </div>
                <div className="px-4 py-2 bg-accent/10 rounded-lg">
                  <span className="text-sm font-medium text-accent">{recentTopics.length} Aktif Konu</span>
                </div>
              </div>
            </div>

            {/* Search & Tabs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Forum'da ara..."
                    className="w-full px-4 py-2.5 pl-10 bg-card/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'categories'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Kategoriler
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'recent'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Son Konular
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Categories View */}
            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/forum/${category.slug}`}
                    className="group bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-lg p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${category.color}15`,
                          color: category.color
                        }}
                      >
                        {iconMap[category.icon] || iconMap.MessageCircle}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-base mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        {category.topic_count} konu
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {category.post_count} mesaj
                      </span>
                    </div>
                    
                    {category.last_post && (
                      <div className="pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Son:</span>
                          <span className="text-foreground font-medium truncate flex-1">
                            {category.last_post.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{category.last_post.author}</span>
                          <span>•</span>
                          <span>{category.last_post.date}</span>
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Recent Topics View */}
            {activeTab === 'recent' && (
              <div className="space-y-3">
                {filteredTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/forum/${topic.category.slug}/${topic.slug}`}
                    className="block bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-lg p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {topic.author.avatar ? (
                          <img
                            src={topic.author.avatar}
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
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                            {topic.is_pinned && (
                              <span className="inline-flex items-center gap-1 mr-2">
                                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                                </svg>
                              </span>
                            )}
                            {topic.is_locked && (
                              <span className="inline-flex items-center gap-1 mr-2">
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </span>
                            )}
                            {topic.title}
                          </h3>
                          <span
                            className="px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: `${topic.category.color}15`,
                              color: topic.category.color
                            }}
                          >
                            {topic.category.name}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {topic.content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-medium">{topic.author.name}</span>
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
                          <span>{formatDate(topic.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {filteredTopics.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-muted-foreground">Henüz konu bulunmuyor</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}