'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { 
  LeaderboardAd, 
  RectangleAd, 
  LargeRectangleAd, 
  HalfPageAd, 
  ResponsiveHeaderAd,
  InContentAd
} from '@/components/ads';
import { DEFAULT_AD_CONFIG } from '@/components/ads';
import RecentItems from '@/components/RecentItems';

interface ForumTopic {
  id: string;
  title: string;
  author: string;
  replies: number;
  views: number;
  lastActivity: string;
  category: string;
  isHot: boolean;
  isPinned: boolean;
  vote_score?: number;
  user_vote?: number;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  author: {
    name: string;
    verified: boolean;
    avatar: string;
  };
  performance: {
    weekly: number;
    monthly: number;
    yearly: number;
  };
  metrics: {
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    avgTrade: number;
    totalTrades: number;
    rrRatio: number;
    calmarRatio: number;
  };
  followers: number;
  isLive: boolean;
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
  category: string;
  chartData: number[];
  lastSignal: {
    asset: string;
    direction: 'LONG' | 'SHORT';
    price: number | string;
    time: string;
  } | null;
  tags: string[];
  roi: number;
}

interface Article {
  id: string;
  title: string;
  author: string;
  readTime: string;
  category: string;
  image: string;
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [hotTopics, setHotTopics] = useState<ForumTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetchHotTopics();
  }, []);

  // Fetch hot forum topics from API
  const fetchHotTopics = async () => {
    setTopicsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
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
          )
        `)
        .order('vote_score', { ascending: false })
        .order('reply_count', { ascending: false })
        .limit(3);

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

      // Transform to interface format
      const transformedTopics: ForumTopic[] = data?.map(topic => ({
        id: topic.id,
        title: topic.title,
        author: topic.author?.username || 'Unknown',
        replies: topic.reply_count,
        views: topic.view_count,
        lastActivity: formatTimeAgo(topic.created_at),
        category: topic.category?.name || 'General',
        isHot: topic.vote_score > 10,
        isPinned: topic.is_pinned,
        vote_score: topic.vote_score || 0,
        user_vote: topic.user_vote || null
      })) || [];

      setHotTopics(transformedTopics);
    } catch (error) {
      console.error('Error fetching hot topics:', error);
      // Fallback to mock data
      setHotTopics([
        {
          id: '1',
          title: 'Bitcoin 50.000$ seviyesine çıkabilir mi?',
          author: 'CryptoExpert',
          replies: 124,
          views: 2341,
          lastActivity: '2 dk önce',
          category: 'Kripto',
          isHot: true,
          isPinned: true,
          vote_score: 45,
          user_vote: null
        },
        {
          id: '2', 
          title: 'EUR/USD paritesi için haftalık analiz',
          author: 'ForexPro',
          replies: 89,
          views: 1567,
          lastActivity: '15 dk önce',
          category: 'Forex',
          isHot: true,
          isPinned: false,
          vote_score: 23,
          user_vote: null
        },
        {
          id: '3',
          title: 'Altcoin sezonuna hazır mıyız?',
          author: 'AltTrader',
          replies: 67,
          views: 923,
          lastActivity: '1 saat önce', 
          category: 'Kripto',
          isHot: false,
          isPinned: false,
          vote_score: 12,
          user_vote: null
        }
      ]);
    } finally {
      setTopicsLoading(false);
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  // Handle vote for forum topics
  const handleTopicVote = async (type: 'up' | 'down', topicId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const voteValue = type === 'up' ? 1 : -1;
      const currentTopic = hotTopics.find(t => t.id === topicId);
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
      setHotTopics(topics => 
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

  // Real strategy data from trading-stratejileri
  const [topStrategies, setTopStrategies] = useState<any[]>([]);
  const [strategiesLoading, setStrategiesLoading] = useState(false);

  // Fetch top strategies
  const fetchTopStrategies = async () => {
    setStrategiesLoading(true);
    try {
      const response = await fetch('/api/strategies?limit=4&sortBy=En+Yüksek+Getiri');
      if (response.ok) {
        const data = await response.json();
        if (data.strategies && data.strategies.length > 0) {
          setTopStrategies(data.strategies);
        } else {
          // Fallback to mock data if API returns empty
          setTopStrategies([
            {
              id: '1',
              name: 'RSI Divergence Master',
              description: 'RSI divergence tespit ile güçlü giriş noktalarını bulun momentum stratejisi yüksek başarı.',
              author: 'AlgoTrader',
              authorAvatar: '👤',
              category: 'Forex',
              tags: ['H4', 'Momentum'],
              performance: {
                totalReturn: 156.8,
                winRate: 68.5,
                maxDrawdown: -12.3,
                sharpeRatio: 2.1,
                profitFactor: 1.85,
                totalTrades: 1245,
                percentageReturn: 156.8
              },
              rating: 4.5,
              likes: 234,
              downloads: 5678,
              views: 1234,
              isPremium: false,
              timeframe: 'H4',
              createdAt: '2024-01-15'
            },
            {
              id: '2',
              name: 'Bollinger Band Breakout Pro',
              description: 'Bollinger bantları ve volume analizi ile breakout fırsatlarını yakalayan güçlü strateji.',
              author: 'QuantMaster',
              authorAvatar: '👤',
              category: 'Crypto',
              tags: ['H1', 'Breakout', 'Premium'],
              performance: {
                totalReturn: 289.5,
                winRate: 72.3,
                maxDrawdown: -18.7,
                sharpeRatio: 1.8,
                profitFactor: 2.1,
                totalTrades: 856,
                percentageReturn: 289.5
              },
              rating: 4.8,
              likes: 567,
              downloads: 8901,
              views: 2341,
              isPremium: true,
              timeframe: 'H1',
              createdAt: '2024-01-10'
            },
            {
              id: '3',
              name: 'MACD Momentum Pro',
              description: 'MACD göstergesi ile momentum tabanlı alım satım sinyalleri üreten yüksek performanslı strateji.',
              author: 'ProTrader',
              authorAvatar: '👤',
              authorUsername: 'protrader',
              category: 'Forex',
              tags: ['H1', 'MACD'],
              performance: {
                totalReturn: 4390573.39,
                winRate: 73.39,
                maxDrawdown: -15.52,
                sharpeRatio: 1.28,
                profitFactor: 1.75,
                totalTrades: 218,
                percentageReturn: 4390573.39
              },
              rating: 4.7,
              likes: 890,
              downloads: 12345,
              views: 3456,
              isPremium: false,
              timeframe: 'H1',
              createdAt: '2024-01-25'
            },
            {
              id: '4',
              name: 'Fibonacci Retracement',
              description: 'Fibonacci seviyeleri ile destek ve direnç noktalarını tespit eden gelişmiş strateji.',
              author: 'FiboExpert',
              authorAvatar: '👤',
              authorUsername: 'fiboexpert',
              category: 'Emtia',
              tags: ['D1', 'Fibonacci'],
              performance: {
                totalReturn: 16516.70,
                winRate: 70.09,
                maxDrawdown: -8.37,
                sharpeRatio: 2.43,
                profitFactor: 2.85,
                totalTrades: 866,
                percentageReturn: 16516.70
              },
              rating: 4.9,
              likes: 1234,
              downloads: 23456,
              views: 5678,
              isPremium: false,
              timeframe: 'D1',
              createdAt: '2024-01-12'
            }
          ]);
        }
      } else {
        // Fallback to mock data
        setTopStrategies([
          {
            id: '1',
            name: 'RSI Divergence Master',
            description: 'RSI divergence tespit ile güçlü giriş noktalarını bulun momentum stratejisi yüksek başarı.',
            author: 'AlgoTrader',
            authorAvatar: '👤',
            category: 'Forex',
            tags: ['H4', 'Momentum'],
            performance: {
              totalReturn: 156.8,
              winRate: 68.5,
              maxDrawdown: -12.3,
              sharpeRatio: 2.1,
              profitFactor: 1.85,
              totalTrades: 1245,
              percentageReturn: 156.8
            },
            rating: 4.5,
            likes: 234,
            downloads: 5678,
            views: 1234,
            isPremium: false,
            timeframe: 'H4',
            createdAt: '2024-01-15'
          },
          {
            id: '2',
            name: 'Bollinger Band Breakout Pro',
            description: 'Bollinger bantları ve volume analizi ile breakout fırsatlarını yakalayan güçlü strateji.',
            author: 'QuantMaster',
            authorAvatar: '👤',
            category: 'Crypto',
            tags: ['H1', 'Breakout', 'Premium'],
            performance: {
              totalReturn: 289.5,
              winRate: 72.3,
              maxDrawdown: -18.7,
              sharpeRatio: 1.8,
              profitFactor: 2.1,
              totalTrades: 856,
              percentageReturn: 289.5
            },
            rating: 4.8,
            likes: 567,
            downloads: 8901,
            views: 2341,
            isPremium: true,
            timeframe: 'H1',
            createdAt: '2024-01-10'
          },
          {
            id: '3',
            name: 'MACD Momentum Pro',
            description: 'MACD göstergesi ile momentum tabanlı alım satım sinyalleri üreten yüksek performanslı strateji.',
            author: 'ProTrader',
            authorAvatar: '👤',
            authorUsername: 'protrader',
            category: 'Forex',
            tags: ['H1', 'MACD'],
            performance: {
              totalReturn: 4390573.39,
              winRate: 73.39,
              maxDrawdown: -15.52,
              sharpeRatio: 1.28,
              profitFactor: 1.75,
              totalTrades: 218,
              percentageReturn: 4390573.39
            },
            rating: 4.7,
            likes: 890,
            downloads: 12345,
            views: 3456,
            isPremium: false,
            timeframe: 'H1',
            createdAt: '2024-01-25'
          },
          {
            id: '4',
            name: 'Fibonacci Retracement',
            description: 'Fibonacci seviyeleri ile destek ve direnç noktalarını tespit eden gelişmiş strateji.',
            author: 'FiboExpert',
            authorAvatar: '👤',
            authorUsername: 'fiboexpert',
            category: 'Emtia',
            tags: ['D1', 'Fibonacci'],
            performance: {
              totalReturn: 16516.70,
              winRate: 70.09,
              maxDrawdown: -8.37,
              sharpeRatio: 2.43,
              profitFactor: 2.85,
              totalTrades: 866,
              percentageReturn: 16516.70
            },
            rating: 4.9,
            likes: 1234,
            downloads: 23456,
            views: 5678,
            isPremium: false,
            timeframe: 'D1',
            createdAt: '2024-01-12'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching top strategies:', error);
      // Fallback to mock data
      setTopStrategies([
        {
          id: '1',
          name: 'RSI Divergence Master',
          description: 'RSI divergence tespit ile güçlü giriş noktalarını bulun momentum stratejisi yüksek başarı.',
          author: 'AlgoTrader',
          authorAvatar: '👤',
          category: 'Forex',
          tags: ['H4', 'Momentum'],
          performance: {
            totalReturn: 156.8,
            winRate: 68.5,
            maxDrawdown: -12.3,
            sharpeRatio: 2.1,
            profitFactor: 1.85,
            totalTrades: 1245,
            percentageReturn: 156.8
          },
          rating: 4.5,
          likes: 234,
          downloads: 5678,
          views: 1234,
          isPremium: false,
          timeframe: 'H4',
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Bollinger Band Breakout Pro',
          description: 'Bollinger bantları ve volume analizi ile breakout fırsatlarını yakalayan güçlü strateji.',
          author: 'QuantMaster',
          authorAvatar: '👤',
          category: 'Crypto',
          tags: ['H1', 'Breakout', 'Premium'],
          performance: {
            totalReturn: 289.5,
            winRate: 72.3,
            maxDrawdown: -18.7,
            sharpeRatio: 1.8,
            profitFactor: 2.1,
            totalTrades: 856,
            percentageReturn: 289.5
          },
          rating: 4.8,
          likes: 567,
          downloads: 8901,
          views: 2341,
          isPremium: true,
          timeframe: 'H1',
          createdAt: '2024-01-10'
        },
        {
          id: '3',
          name: 'MACD Momentum Pro',
          description: 'MACD göstergesi ile momentum tabanlı alım satım sinyalleri üreten yüksek performanslı strateji.',
          author: 'ProTrader',
          authorAvatar: '👤',
          authorUsername: 'protrader',
          category: 'Forex',
          tags: ['H1', 'MACD'],
          performance: {
            totalReturn: 4390573.39,
            winRate: 73.39,
            maxDrawdown: -15.52,
            sharpeRatio: 1.28,
            profitFactor: 1.75,
            totalTrades: 218,
            percentageReturn: 4390573.39
          },
          rating: 4.7,
          likes: 890,
          downloads: 12345,
          views: 3456,
          isPremium: false,
          timeframe: 'H1',
          createdAt: '2024-01-25'
        },
        {
          id: '4',
          name: 'Fibonacci Retracement',
          description: 'Fibonacci seviyeleri ile destek ve direnç noktalarını tespit eden gelişmiş strateji.',
          author: 'FiboExpert',
          authorAvatar: '👤',
          authorUsername: 'fiboexpert',
          category: 'Emtia',
          tags: ['D1', 'Fibonacci'],
          performance: {
            totalReturn: 16516.70,
            winRate: 70.09,
            maxDrawdown: -8.37,
            sharpeRatio: 2.43,
            profitFactor: 2.85,
            totalTrades: 866,
            percentageReturn: 16516.70
          },
          rating: 4.9,
          likes: 1234,
          downloads: 23456,
          views: 5678,
          isPremium: false,
          timeframe: 'D1',
          createdAt: '2024-01-12'
        }
      ]);
    } finally {
      setStrategiesLoading(false);
    }
  };

  useEffect(() => {
    fetchTopStrategies();
  }, []);

  const latestArticles: Article[] = [
    {
      id: '1',
      title: 'Bitcoin Teknik Analizi - 2024 Hedefleri',
      author: 'Ahmet Yılmaz',
      readTime: '5 dk',
      category: 'Teknik Analiz',
      image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Forex Piyasasında Risk Yönetimi',
      author: 'Elif Demir',
      readTime: '8 dk',
      category: 'Eğitim',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'DeFi Yatırım Stratejileri',
      author: 'Mehmet Öz',
      readTime: '6 dk',
      category: 'Kripto',
      image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop'
    }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background animate-pulse">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 dark:bg-muted rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 dark:bg-muted rounded-xl"></div>
            </div>
            <div className="h-96 bg-gray-200 dark:bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-background dark:via-card/30 dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Above-the-Fold Ad - High CPM Position */}
        <div className="ad-container-wrapper my-8">
          <div className="flex justify-center items-center p-4 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/40 dark:border-gray-700/40 min-h-[100px]">
            <div className="ad-container ad-unit ad-large-rectangle large-rectangle-ad" style={{display: 'block', textAlign: 'center', minHeight: '280px'}}>
              <div></div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">

          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Popular Topics - Reddit Style */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-border bg-gray-50 dark:bg-card/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03z" clipRule="evenodd"/>
                    </svg>
                    Popüler Konular
                  </h2>
                  <Link 
                    href="/forum" 
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                  >
                    Tümünü gör →
                  </Link>
                </div>
              </div>

              {/* Topics List */}
              <div className="divide-y divide-gray-100 dark:divide-border">
                {hotTopics.map((topic, index) => (
                  <Link key={topic.id} href={`/forum/${topic.id}`} className="block">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-card/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* Vote Section - Reddit Style */}
                        <div className="flex flex-col items-center text-center min-w-0 w-10">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleTopicVote('up', topic.id);
                            }}
                            className={`p-1 rounded transition-colors ${
                              topic.user_vote === 1
                                ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30'
                                : 'text-gray-400 hover:bg-gray-100 hover:text-emerald-500 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-emerald-400'
                            }`}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <span className={`text-xs font-bold py-1 ${
                            (topic.vote_score || 0) > 0 ? 'text-emerald-500' : (topic.vote_score || 0) < 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {Math.abs(topic.vote_score || 0) > 1000 ? `${(Math.abs(topic.vote_score || 0)/1000).toFixed(1)}k` : (topic.vote_score || 0)}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleTopicVote('down', topic.id);
                            }}
                            className={`p-1 rounded transition-colors ${
                              topic.user_vote === -1
                                ? 'text-red-600 bg-red-100 dark:bg-red-900/30'
                                : 'text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-red-400'
                            }`}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title & Badges */}
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1">
                              {topic.title}
                            </h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {topic.isHot && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                  🔥
                                </span>
                              )}
                              {topic.isPinned && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                  📌
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Meta Information */}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 leading-tight">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${{
                              'Kripto': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
                              'Forex': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            }[topic.category] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'}`}>
                              {topic.category}
                            </span>
                            <span>•</span>
                            <span>u/{topic.author}</span>
                            <span>•</span>
                            <span>{topic.replies} yanıt</span>
                            <span>•</span>
                            <span>{topic.lastActivity}</span>
                            <span>•</span>
                            <span>{topic.views} görüntüleme</span>
                          </div>
                        </div>

                        {/* Trend Indicator */}
                        <div className="flex-shrink-0 w-2">
                          {topic.isHot && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Top Strategies - Reddit Style */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-border bg-gray-50 dark:bg-card/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                    En İyi Stratejiler
                  </h2>
                  <Link 
                    href="/trading-stratejileri" 
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                  >
                    Tümünü gör →
                  </Link>
                </div>
              </div>
              
              {/* Content */}
              {strategiesLoading ? (
                <div className="p-6 flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin w-4 h-4 border-2 border-gray-200 dark:border-border border-t-gray-600 dark:border-t-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Yükleniyor...</span>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-border">
                  {topStrategies.slice(0, 4).map((strategy, index) => {
                    // Format large numbers
                    const formatNumber = (num: number): string => {
                      const absNum = Math.abs(num);
                      if (absNum >= 1000000) {
                        return (num / 1000000).toFixed(1) + 'M';
                      } else if (absNum >= 1000) {
                        return (num / 1000).toFixed(1) + 'K';
                      }
                      return Math.round(num).toString();
                    };

                    return (
                      <Link key={strategy.id} href={`/trading-stratejileri/${strategy.id}`} className="block">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-card/50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {/* Performance Score */}
                            <div className="flex flex-col items-center text-center min-w-0 w-14">
                              <div className={`text-sm font-bold ${
                                strategy.performance.totalReturn > 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-500 dark:text-red-400'
                              }`}>
                                {strategy.performance.totalReturn > 0 ? '+' : ''}{formatNumber(strategy.performance.totalReturn)}%
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                getiri
                              </div>
                            </div>

                            {/* Strategy Content */}
                            <div className="flex-1 min-w-0">
                              {/* Title & Premium Badge */}
                              <div className="flex items-start gap-2 mb-2">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1">
                                  {strategy.name}
                                </h3>
                                {strategy.isPremium && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                    PRO
                                  </span>
                                )}
                              </div>

                              {/* Description */}
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                                {strategy.description}
                              </p>

                              {/* Meta Information - Two Rows */}
                              <div className="space-y-1">
                                {/* First Row: Category, Author, Timeframe */}
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 leading-tight">
                                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${{
                                    'Forex': 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                                    'Crypto': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
                                    'Hisse': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                                    'Emtia': 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                  }[strategy.category] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'}`}>
                                    {strategy.category}
                                  </span>
                                  <span>•</span>
                                  <span>u/{strategy.author}</span>
                                  <span>•</span>
                                  <span>{strategy.timeframe}</span>
                                </div>
                                
                                {/* Second Row: Performance Metrics */}
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 leading-tight">
                                  <span>{strategy.performance.winRate.toFixed(0)}% başarı</span>
                                  <span>•</span>
                                  <span>{formatNumber(strategy.performance.totalTrades)} işlem</span>
                                  <span>•</span>
                                  <span>{formatNumber(strategy.downloads || strategy.likes)} indirme</span>
                                  {strategy.tags && strategy.tags.slice(0, 2).map(tag => (
                                    <React.Fragment key={tag}>
                                      <span>•</span>
                                      <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">
                                        {tag}
                                      </span>
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Status Indicator */}
                            <div className="flex-shrink-0 w-3 flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full ${
                                strategy.performance.totalReturn > 0 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                              }`}></div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1 lg:sticky lg:top-8 space-y-6"
          >
            {/* Recent Items */}
            <RecentItems />
            
            {/* Sidebar Ad */}
            <div className="ad-container-wrapper">
              <div className="flex justify-center items-center p-6 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/40 dark:border-gray-700/40">
                <div className="ad-container ad-unit ad-large-rectangle large-rectangle-ad w-full" style={{display: 'block', textAlign: 'center', minHeight: '400px'}}>
                  <div></div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom Sections */}
        <div className="mt-8 space-y-8">
          {/* In-Content Ad */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <InContentAd 
              adSlot={DEFAULT_AD_CONFIG.adSlots.homepageMiddle} 
              preferLarge={true}
            />
          </motion.div>

          {/* Latest Articles */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📰</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Güncel Makaleler</h2>
                </div>
                <Link href="/articles" className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 transition-colors">
                  Tümü →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {latestArticles.map((article) => (
                  <Link key={article.id} href={`/articles/${article.id}`}>
                    <div className="bg-gray-50 dark:bg-muted rounded-xl overflow-hidden hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors border border-gray-200 dark:border-border hover:border-purple-300 dark:hover:border-purple-600 group">
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full font-medium">
                            {article.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">📖 {article.readTime}</span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{article.author[0]}</span>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-300">@{article.author}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Custom Ad Container */}
          <div className="ad-container-wrapper my-8">
            <div className="flex justify-center items-center p-4 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/40 dark:border-gray-700/40 min-h-[100px]">
              <div className="ad-container ad-unit ad-large-rectangle large-rectangle-ad" style={{display: 'block', textAlign: 'center', minHeight: '280px'}}>
                <div></div>
              </div>
            </div>
          </div>

          {/* Bottom Page Ad */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex justify-center"
          >
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                Reklam
              </div>
              <LeaderboardAd adSlot={DEFAULT_AD_CONFIG.adSlots.homepageBottom} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}