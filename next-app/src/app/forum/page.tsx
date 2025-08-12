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
  Flame,
  Sparkles,
  MoreHorizontal,
  Share,
  Star
} from 'lucide-react';
import VoteButtons from '@/components/ui/VoteButtons';

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
  const [currentTheme, setCurrentTheme] = useState<string>('dark');

  const { theme } = useTheme();
  const router = useRouter();

  // Better theme detection
  useEffect(() => {
    const detectTheme = () => {
      if (typeof window !== 'undefined') {
        const htmlClassList = document.documentElement.classList;
        const isDark = htmlClassList.contains('dark');
        const computedStyle = getComputedStyle(document.documentElement);
        const bgColor = computedStyle.getPropertyValue('background-color');
        
        // Multiple checks for theme detection
        const themeFromStorage = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let detectedTheme = 'light';
        
        if (isDark || bgColor === 'rgb(3, 7, 18)' || bgColor === 'rgb(9, 9, 11)') {
          detectedTheme = 'dark';
        } else if (themeFromStorage === 'dark' || (themeFromStorage === 'auto' && systemDark)) {
          detectedTheme = 'dark';
        }
        
        setCurrentTheme(detectedTheme);
      }
    };
    
    detectTheme();
    setMounted(true);
    
    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
    }
    
    return () => observer.disconnect();
  }, [theme]);

  const isDarkMode = currentTheme === 'dark';

  useEffect(() => {
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

  // Vote handling is now done by VoteButtons component
  // Remove handleVote function

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
                        
                        return (
                          <div key={topic.id} className={`rounded-lg border transition-colors duration-200 hover:shadow-sm ${
                            isDarkMode ? 'bg-card border-border hover:bg-background' : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}>
                            <div className="flex p-3">
                              {/* Vote section */}
                              <div className="flex flex-col items-center w-10 mr-3">
                                <VoteButtons
                                  targetType="topic"
                                  targetId={topic.id}
                                  initialVoteScore={topic.vote_score}
                                  initialUserVote={topic.user_vote || null}
                                  size="sm"
                                  orientation="vertical"
                                />
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                {/* Meta */}
                                <div className="flex items-center gap-2 mb-2">
                                  <div 
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                                    style={{ backgroundColor: topic.category.color }}
                                  >
                                    {(() => {
                                      const categoryIcons: { [key: string]: JSX.Element } = {
                                        'Genel Tartışma': (
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                                          </svg>
                                        ),
                                        'Algoritmik Ticaret': (
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                          </svg>
                                        ),
                                        'Strateji Paylaşımı': (
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                                            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                                          </svg>
                                        ),
                                        'Prop Firm ve Fon Yönetimi': (
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
                                            <path d="M2 8h16v2H2zM6 12h8v2H6z"/>
                                          </svg>
                                        ),
                                        'Yazılım ve Otomasyon': (
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                                          </svg>
                                        ),
                                        'Portföy ve Performans': (
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                          </svg>
                                        ),
                                        'Piyasa Analizleri': (
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd"/>
                                          </svg>
                                        ),
                                        'Eğitim Kaynakları': (
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                                          </svg>
                                        ),
                                        'Trade Psikolojisi': (
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd"/>
                                          </svg>
                                        ),
                                        'Hukuk ve Vergilendirme': (
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/>
                                          </svg>
                                        )
                                      };
                                      return categoryIcons[topic.category.name] || <span>{topic.category.name.charAt(0)}</span>;
                                    })()}
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

            {/* Right Sidebar - Clean & Minimal */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24 space-y-4">
                {/* Forum Stats */}
                <div className={`rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                  isDarkMode 
                    ? 'bg-card/50 border-border/50 hover:bg-card/80' 
                    : 'bg-white/70 border-gray-200/50 hover:bg-white/90'
                }`}>
                  <div className="p-6">
                    <h3 className={`text-lg font-semibold mb-6 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>Forum İstatistikleri</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                          }`}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                          }`}>Toplam Üye</span>
                        </div>
                        <span className={`text-lg font-bold ${
                          isDarkMode ? 'text-foreground' : 'text-gray-900'
                        }`}>1.2K</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                          </div>
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                          }`}>Çevrimiçi</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-500">89</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'
                          }`}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                            </svg>
                          </div>
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                          }`}>Bugün</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${
                            isDarkMode ? 'text-foreground' : 'text-gray-900'
                          }`}>12 konu</div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                          }`}>156 mesaj</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={`rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                  isDarkMode 
                    ? 'bg-card/50 border-border/50 hover:bg-card/80' 
                    : 'bg-white/70 border-gray-200/50 hover:bg-white/90'
                }`}>
                  <div className="p-6">
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>Hızlı Erişim</h3>
                    
                    <div className="space-y-2">
                      <button className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                        isDarkMode 
                          ? 'hover:bg-primary/10 text-muted-foreground hover:text-foreground' 
                          : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                      }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'
                        }`}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-sm">Yeni Konu</div>
                          <div className="text-xs opacity-70">Tartışma başlat</div>
                        </div>
                      </button>
                      
                      <button className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                        isDarkMode 
                          ? 'hover:bg-primary/10 text-muted-foreground hover:text-foreground' 
                          : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                      }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDarkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
                        }`}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-sm">Premium</div>
                          <div className="text-xs opacity-70">Özel içerikler</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trending Topics */}
                <div className={`rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                  isDarkMode 
                    ? 'bg-card/50 border-border/50 hover:bg-card/80' 
                    : 'bg-white/70 border-gray-200/50 hover:bg-white/90'
                }`}>
                  <div className="p-6">
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>Trend Konular</h3>
                    
                    <div className="space-y-3">
                      {[
                        { title: "Algoritmik Trading Başlangıç", replies: 23, trend: "+12%" },
                        { title: "Prop Firm Deneyimleri", replies: 18, trend: "+8%" },
                        { title: "Python ile Bot Geliştirme", replies: 31, trend: "+15%" }
                      ].map((topic, index) => (
                        <div key={index} className={`p-3 rounded-lg transition-colors cursor-pointer ${
                          isDarkMode ? 'hover:bg-muted/50' : 'hover:bg-gray-50'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-sm leading-tight line-clamp-2 ${
                                isDarkMode ? 'text-foreground' : 'text-gray-900'
                              }`}>{topic.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs ${
                                  isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                                }`}>{topic.replies} yanıt</span>
                                <span className="text-xs text-emerald-500 font-medium">{topic.trend}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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