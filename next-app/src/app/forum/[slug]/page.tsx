'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
  Eye,
  ChevronRight,
  ArrowLeft,
  Plus,
  Pin,
  Lock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  User
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchCategory();
  }, [categorySlug]);

  useEffect(() => {
    if (category) {
      fetchTopics();
    }
  }, [category, sortBy, page]);

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
      const response = await fetch(`/api/forum/topics?category=${categorySlug}&sort=${sortBy}&page=${page}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setTopics(data.topics || []);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const mockTopics: ForumTopic[] = [
    {
      id: '1',
      title: 'Forum nasıl kullanılır?',
      slug: 'forum-nasil-kullanilir',
      content: 'Forumun kullanımı hakkında genel bilgiler...',
      author: {
        id: '1',
        name: 'Test Kullanıcı',
        username: 'testuser',
        avatar_url: undefined
      },
      category: category,
      is_pinned: true,
      is_locked: false,
      view_count: 150,
      reply_count: 12,
      vote_score: 8,
      user_vote: undefined,
      last_reply_at: '2024-01-15T10:30:00Z',
      last_reply_user: {
        name: 'Son Yanıt User',
        username: 'lastuser'
      },
      created_at: '2024-01-10T08:00:00Z'
    },
    {
      id: '2',
      title: 'Yeni özellikler hakkında',
      slug: 'yeni-ozellikler-hakkinda',
      content: 'Yeni eklenen özellikler ve güncellemeler...',
      author: {
        id: '2',
        name: 'Admin',
        username: 'admin',
        avatar_url: undefined
      },
      category: category,
      is_pinned: false,
      is_locked: false,
      view_count: 89,
      reply_count: 5,
      vote_score: 12,
      user_vote: undefined,
      last_reply_at: '2024-01-14T15:20:00Z',
      last_reply_user: {
        name: 'Yanıt User',
        username: 'replyuser'
      },
      created_at: '2024-01-12T14:00:00Z'
    }
  ];


  const sortedTopics = [...topics].sort((a, b) => {
    // Pinned topics always come first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;

    switch (sortBy) {
      case 'popular':
        return b.vote_score - a.vote_score;
      case 'replies':
        return b.reply_count - a.reply_count;
      case 'recent':
      default:
        return new Date(b.last_reply_at || b.created_at).getTime() - 
               new Date(a.last_reply_at || a.created_at).getTime();
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };


  if (!category) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-6 mb-8">
                <Link 
                  href="/forum"
                  className="p-3 hover:bg-muted/50 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-4 rounded-xl shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${category.color}15, ${category.color}25)`,
                    borderColor: `${category.color}30`
                  }}
                >
                  <div className="w-8 h-8" style={{ backgroundColor: category.color }}></div>
                </motion.div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-foreground mb-2 break-long-words">{category.name}</h1>
                  <p className="text-muted-foreground text-lg break-long-words">{category.description}</p>
                </div>
                <Link 
                  href={`/forum/${category.slug}/new-topic`}
                  className="hidden md:flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Konu
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg"
                >
                  <div className="text-3xl font-bold text-foreground mb-1">{topics.length}</div>
                  <div className="text-muted-foreground font-medium">Konu</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg"
                >
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {topics.reduce((sum, topic) => sum + topic.reply_count, 0)}
                  </div>
                  <div className="text-muted-foreground font-medium">Yanıt</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg"
                >
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {topics.reduce((sum, topic) => sum + topic.view_count, 0)}
                  </div>
                  <div className="text-muted-foreground font-medium">Görüntüleme</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Sort Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-full p-1 border border-border/50 shadow-lg">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    sortBy === 'recent'
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Son Yanıtlar
                  </span>
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    sortBy === 'popular'
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    En Popüler
                  </span>
                </button>
                <button
                  onClick={() => setSortBy('replies')}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    sortBy === 'replies'
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    En Çok Yanıt
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Topics List */}
          <div className="space-y-4">
            {sortedTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/forum/${category.slug}/${topic.slug}`} className="block group">
                  <motion.div 
                    whileHover={{ scale: 1.01, y: -2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl p-8 border border-border/50 hover:border-primary/20 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-6">
                      {/* Author Avatar */}
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="flex-shrink-0"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center shadow-lg border border-primary/10">
                          <User className="w-7 h-7 text-primary" />
                        </div>
                      </motion.div>

                      {/* Topic Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            {topic.is_pinned && (
                              <motion.div
                                whileHover={{ rotate: 15 }}
                                className="p-1 bg-primary/10 rounded-full"
                              >
                                <Pin className="w-4 h-4 text-primary" />
                              </motion.div>
                            )}
                            {topic.is_locked && (
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="p-1 bg-muted/20 rounded-full"
                              >
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              </motion.div>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 break-long-words">
                            {topic.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
                            <User className="w-3 h-3" />
                            <span className="font-medium">{topic.author.name}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(topic.created_at)}</span>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 leading-relaxed break-long-words">
                          {topic.content}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                              <Eye className="w-3 h-3 text-primary" />
                              <span className="text-sm font-semibold text-primary">{topic.view_count}</span>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                              <MessageSquare className="w-3 h-3 text-secondary" />
                              <span className="text-sm font-semibold text-secondary">{topic.reply_count}</span>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                              <ThumbsUp className="w-3 h-3 text-primary" />
                              <span className="text-sm font-semibold text-primary">{topic.vote_score}</span>
                            </div>
                          </div>

                          {topic.last_reply_at && topic.last_reply_user && (
                            <div className="text-xs text-muted-foreground text-right bg-muted/20 rounded-lg p-3">
                              <div className="font-medium">Son yanıt: {topic.last_reply_user.name}</div>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(topic.last_reply_at)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {topics.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
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
                <MessageCircle className="w-12 h-12 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Henüz konu yok
              </h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Bu kategoride ilk konuyu sen aç ve tartışmayı başlat!
              </p>
              <Link 
                href={`/forum/${category.slug}/new-topic`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Yeni Konu Aç
              </Link>
            </motion.div>
          )}

          {/* Mobile New Topic Button */}
          <Link 
            href={`/forum/${category.slug}/new-topic`}
            className="md:hidden fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transition-colors z-10"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}