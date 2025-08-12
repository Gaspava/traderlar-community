'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import ForumSidebar from '@/components/forum/ForumSidebar';
import { 
  MessageCircle,
  Eye,
  ArrowUp,
  ArrowDown,
  Flame,
  Sparkles,
  MoreHorizontal,
  Share,
  Bookmark,
  Star
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
  icon: string;
  topic_count: number;
  post_count: number;
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentTopics, setRecentTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { theme } = useTheme();
  const router = useRouter();

  const isDarkMode = mounted ? theme === 'dark' : false;

  useEffect(() => {
    setMounted(true);
    fetchCategories();
    fetchRecentTopics();
  }, []);

  useEffect(() => {
    fetchRecentTopics();
  }, [sortBy]);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Mock categories fallback
      const mockCategories = [
        {
          id: '1',
          name: 'Genel Tartışma',
          slug: 'genel-tartisma',
          description: 'Genel trading konuları ve sohbet',
          icon: '💬',
          color: '#10B981',
          topic_count: 0,
          post_count: 0
        },
        {
          id: '2',
          name: 'Algoritmik Ticaret',
          slug: 'algoritmik-ticaret',
          description: 'Otomatik trading sistemleri ve algoritmalar',
          icon: '🤖',
          color: '#3B82F6',
          topic_count: 2,
          post_count: 13
        },
        {
          id: '3',
          name: 'Strateji Paylaşımı',
          slug: 'strateji-paylasimi',
          description: 'Trading stratejilerinizi paylaşın ve tartışın',
          icon: '📊',
          color: '#EF4444',
          topic_count: 0,
          post_count: 0
        },
        {
          id: '4',
          name: 'Prop Firm ve Fon Yönetimi',
          slug: 'prop-firm-fon-yonetimi',
          description: 'Proprietary trading firmalar ve fon yönetimi',
          icon: '🏢',
          color: '#8B5CF6',
          topic_count: 0,
          post_count: 0
        },
        {
          id: '5',
          name: 'Yazılım ve Otomasyon',
          slug: 'yazilim-otomasyon',
          description: 'Trading yazılımları ve otomasyon araçları',
          icon: '⚙️',
          color: '#F59E0B',
          topic_count: 0,
          post_count: 0
        },
        {
          id: '6',
          name: 'Portföy ve Performans',
          slug: 'portfoy-performans',
          description: 'Portföy yönetimi ve performans analizi',
          icon: '📈',
          color: '#06B6D4',
          topic_count: 0,
          post_count: 0
        },
        {
          id: '7',
          name: 'Piyasa Analizleri',
          slug: 'piyasa-analizleri',
          description: 'Teknik ve temel analiz paylaşımları',
          icon: '📉',
          color: '#84CC16',
          topic_count: 0,
          post_count: 0
        },
        {
          id: '8',
          name: 'Eğitim Kaynakları',
          slug: 'egitim-kaynaklari',
          description: 'Trading eğitimi ve öğrenme materyalleri',
          icon: '📚',
          color: '#A855F7',
          topic_count: 0,
          post_count: 0
        },
        {
          id: '9',
          name: 'Trade Psikolojisi',
          slug: 'trade-psikolojisi',
          description: 'Trading psikolojisi ve mindset',
          icon: '🧠',
          color: '#EC4899',
          topic_count: 0,
          post_count: 0
        },
        {
          id: '10',
          name: 'Hukuk ve Vergilendirme',
          slug: 'hukuk-vergilendirme',
          description: 'Trading ile ilgili hukuki konular ve vergilendirme',
          icon: '⚖️',
          color: '#6B7280',
          topic_count: 0,
          post_count: 0
        }
      ];
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTopics = async () => {
    try {
      const supabase = createClient();
      
      let query = supabase
        .from('forum_topics')
        .select(`
          *,
          author:users!forum_topics_author_id_fkey (
            id,
            name,
            username,
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
        `)
        .limit(50);

      // Apply sorting based on sortBy parameter
      switch (sortBy) {
        case 'new':
          query = query.order('created_at', { ascending: false });
          break;
        case 'top':
          query = query.order('vote_score', { ascending: false });
          break;
        case 'hot':
        default:
          // Hot algorithm: combine vote_score, reply_count, and recency
          // For simplicity, we'll order by a combination of factors
          query = query.order('vote_score', { ascending: false })
                      .order('reply_count', { ascending: false })
                      .order('created_at', { ascending: false });
          break;
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
      
      setRecentTopics(data || []);
    } catch (error) {
      console.error('Error fetching recent topics:', error);
      // Mock topics fallback
      const mockTopics = [
        {
          id: '1',
          title: 'Algoritmik Trading Başlangıç Rehberi',
          slug: 'algoritmik-trading-baslangic-rehberi',
          content: 'Algoritmik trading dünyasına giriş yapmak isteyenler için kapsamlı rehber.',
          author: {
            id: '1',
            name: 'Ali Trader',
            username: 'alitrader',
            avatar_url: null
          },
          category: {
            id: '1',
            name: 'Algoritmik Ticaret',
            slug: 'algoritmik-ticaret',
            color: '#3B82F6'
          },
          is_pinned: true,
          is_locked: false,
          view_count: 1240,
          reply_count: 23,
          vote_score: 45,
          created_at: new Date().toISOString()
        }
      ];
      setRecentTopics(mockTopics);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'şimdi';
    if (diffInHours < 24) return `${diffInHours}s`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}g`;
    return date.toLocaleDateString('tr-TR').split('.').slice(0, 2).join('.');
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
      const currentTopic = recentTopics.find(t => t.id === topicId);
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
      setRecentTopics(topics => 
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

  const createPostsWithAds = (topics: ForumTopic[]) => {
    const result: (ForumTopic | any)[] = [];
    const adContent = {
      id: 'ad-' + Math.random(),
      title: 'Sponsorlu İçerik',
      content: 'En iyi trading topluluğuna katıl',
      type: 'ad'
    };

    topics.forEach((topic, index) => {
      result.push(topic);
      if ((index + 1) % 5 === 0) {
        result.push({...adContent, id: 'ad-' + index});
      }
    });

    return result;
  };

  const filteredTopics = recentTopics.filter(topic =>
    searchTerm === '' ||
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const postsWithAds = createPostsWithAds(filteredTopics);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* Forum Sidebar Component */}
      <ForumSidebar />

      {/* Main Content with Left Margin for Fixed Sidebar */}
      <div className="md:ml-60">
        {/* Main Content Area with proper spacing and max-width */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 max-w-[800px] space-y-6">
              {/* Sort Tabs */}
              <div className={`flex items-center gap-4 mb-4 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                {[
                  { value: 'hot', label: 'Popüler', icon: Flame },
                  { value: 'new', label: 'Yeni', icon: Sparkles },
                  { value: 'top', label: 'En İyi', icon: Star }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSortBy(value as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      sortBy === value
                        ? (isDarkMode ? 'bg-primary text-primary-foreground' : 'bg-primary text-white')
                        : (isDarkMode ? 'text-muted-foreground hover:text-foreground hover:bg-muted' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>



              {/* Posts - Reddit Style */}
              <div className="space-y-2">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className={`rounded-lg border transition-colors duration-200 animate-pulse ${
                        isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex p-3">
                          <div className={`w-10 h-16 rounded mr-3 ${
                            isDarkMode ? 'bg-background' : 'bg-gray-200'
                          }`}></div>
                          <div className="flex-1">
                            <div className={`h-4 rounded w-3/4 mb-2 ${
                              isDarkMode ? 'bg-background' : 'bg-gray-200'
                            }`}></div>
                            <div className={`h-3 rounded w-1/2 mb-2 ${
                              isDarkMode ? 'bg-background' : 'bg-gray-200'
                            }`}></div>
                            <div className={`h-3 rounded w-1/4 ${
                              isDarkMode ? 'bg-background' : 'bg-gray-200'
                            }`}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {postsWithAds.map((item, index) => {
                      if (item.type === 'ad') {
                        // Ad Card - Reddit Style
                        return (
                          <div key={item.id} className={`rounded-lg border transition-colors duration-200 hover:shadow-sm ${
                            isDarkMode ? 'bg-card border-border hover:bg-background' : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}>
                            <div className="flex p-3">
                              {/* Vote section */}
                              <div className="flex flex-col items-center w-10 mr-3">
                                <div className="text-xs text-emerald-500 font-medium">AD</div>
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">₺</span>
                                  </div>
                                  <span className={`text-xs ${
                                    isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                                  }`}>Sponsorlu • 3 saat önce</span>
                                </div>
                                
                                <h3 className={`font-medium text-base mb-2 line-clamp-2 ${
                                  isDarkMode ? 'text-foreground' : 'text-gray-900'
                                }`}>
                                  {item.title}
                                </h3>
                                
                                <p className={`text-sm mb-3 line-clamp-2 ${
                                  isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                                }`}>
                                  {item.content}
                                </p>
                                
                                <div className="flex items-center gap-4 text-xs">
                                  <button className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                                    isDarkMode ? 'text-muted-foreground hover:bg-muted' : 'text-gray-500'
                                  }`}>
                                    <MessageCircle className="w-3 h-3" />
                                    Yorumlar
                                  </button>
                                  <button className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                                    isDarkMode ? 'text-muted-foreground hover:bg-muted' : 'text-gray-500'
                                  }`}>
                                    <Share className="w-3 h-3" />
                                    Paylaş
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Regular Post - Reddit Style
                        const topic = item as ForumTopic;
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
                                    style={{ backgroundColor: topic.category.color }}
                                  >
                                    {topic.category.name.charAt(0)}
                                  </div>
                                  <Link href={`/forum/${topic.category.slug}`} className={`text-xs font-medium hover:underline ${
                                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                                  }`}>
                                    r/{topic.category.name}
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
                                <Link href={`/forum/${topic.category.slug}/${topic.slug}`} className="block group">
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
                                    {formatNumber(topic.reply_count)} Yorum
                                  </button>
                                  <button className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                                    isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
                                  }`}>
                                    <Share className="w-3 h-3" />
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
                      }
                    })}

                    {recentTopics.length === 0 && (
                      <div className="text-center py-12">
                        <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${
                          isDarkMode ? 'text-muted-foreground' : 'text-gray-400'
                        }`} />
                        <h3 className={`text-lg font-medium mb-2 ${
                          isDarkMode ? 'text-foreground' : 'text-gray-900'
                        }`}>Henüz konu yok</h3>
                        <p className={`mb-4 ${
                          isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                        }`}>Forum'da ilk konuyu sen oluştur!</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Sidebar - Premium Eğitim ve İstatistikler */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24 space-y-6">
              {/* Premium Eğitim Card */}
              <div className={`rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 text-white text-center rounded-t-lg">
                  <h3 className="font-bold mb-2">Premium Eğitim</h3>
                  <p className="text-sm opacity-90 mb-3">Profesyonel trading eğitimi al</p>
                  <button className="w-full bg-white text-purple-600 font-semibold py-2 px-4 rounded">
                    Şimdi Başla
                  </button>
                </div>
              </div>

              {/* Forum İstatistikleri */}
              <div className={`rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 border-b transition-colors duration-200 ${
                  isDarkMode ? 'border-border' : 'border-gray-100'
                }`}>
                  <h3 className={`font-semibold ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>Forum İstatistikleri</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Toplam Üye</span>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>1,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Çevrimiçi</span>
                    <span className="font-medium text-emerald-500">89</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Bugün ki Konu</span>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Bugün ki Mesaj</span>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>156</span>
                  </div>
                </div>
              </div>

              {/* Trading Botları */}
              <div className={`rounded-lg border overflow-hidden transition-colors duration-200 ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-white text-center">
                  <h3 className="font-bold mb-2">Trading Botları</h3>
                  <p className="text-sm opacity-90 mb-3">7/24 otomatik trading</p>
                  <button className="w-full bg-white text-cyan-600 font-semibold py-2 px-4 rounded">
                    Daha Fazla Bilgi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}