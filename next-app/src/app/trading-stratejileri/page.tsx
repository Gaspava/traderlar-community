'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  Download,
  Heart,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Target,
  ChevronDown,
  Play,
  Users,
  Calendar,
  Plus,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { StrategyCard } from '@/components/strategy-card';

interface Strategy {
  id: string;
  name: string;
  description: string;
  author: string;
  authorAvatar: string;
  authorUsername: string;
  category: 'Forex' | 'Crypto' | 'Hisse' | 'Emtia' | 'Endeks' | 'All';
  tags: string[];
  performance: {
    totalReturn: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
    profitFactor: number;
    totalTrades: number;
    percentageReturn: number;
  };
  rating: number;
  likes: number;
  downloads: number;
  views: number;
  isPremium: boolean;
  timeframe: string;
  createdAt: string;
}

interface ApiResponse {
  strategies: Strategy[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: 'RSI Divergence Master',
    description: 'RSI divergence tespit ile güçlü giriş noktalarını bulun momentum stratejisi yüksek başarı.',
    author: 'AlgoTrader',
    authorAvatar: '👤',
    category: 'EUR/USD',
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
    createdAt: 'Ocak 2024'
  },
  {
    id: '2',
    name: 'Bollinger Band Breakout Pro',
    description: 'Bollinger bantları ve volume analizi ile breakout fırsatlarını yakalayan güçlü strateji.',
    author: 'QuantMaster',
    authorAvatar: '👤',
    category: 'BTC/USDT',
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
    createdAt: 'Ocak 2024'
  },
  {
    id: '3',
    name: 'MA Cross Scalper',
    description: 'Hareketli ortalama kesişimleri ile hızlı scalping işlemleri için optimize edilmiş strateji.',
    author: 'ScalpKing',
    authorAvatar: '👤',
    category: 'TSLA',
    tags: ['M5', 'Scalping'],
    performance: {
      totalReturn: 87.3,
      winRate: 61.2,
      maxDrawdown: -8.9,
      sharpeRatio: 1.5,
      profitFactor: 1.65,
      totalTrades: 432,
      percentageReturn: 87.3
    },
    rating: 4.2,
    likes: 123,
    downloads: 3456,
    views: 890,
    isPremium: false,
    timeframe: 'M5',
    createdAt: 'Ocak 2024'
  },
  {
    id: '4',
    name: 'MACD Momentum Pro',
    description: 'MACD göstergesi ile momentum tabanlı alım satım sinyalleri üreten yüksek performanslı strateji.',
    author: 'ProTrader',
    authorAvatar: '👤',
    authorUsername: 'protrader',
    category: 'GBP/JPY',
    tags: ['H1', 'MACD'],
    performance: {
      totalReturn: 273.39,
      winRate: 73.39,
      maxDrawdown: -15.52,
      sharpeRatio: 1.28,
      profitFactor: 1.75,
      totalTrades: 218,
      percentageReturn: 273.39
    },
    rating: 4.7,
    likes: 890,
    downloads: 12345,
    views: 3456,
    isPremium: false,
    timeframe: 'H1',
    createdAt: 'Ocak 2024'
  },
  {
    id: '5',
    name: 'Grid Trading System',
    description: 'Otomatik grid trading stratejisi ile piyasa dalgalanmalarından kar elde edin.',
    author: 'GridMaster',
    authorAvatar: '👤',
    authorUsername: 'gridmaster',
    category: 'ETH/USDT',
    tags: ['M15', 'Grid'],
    performance: {
      totalReturn: -25.12,
      winRate: 89.12,
      maxDrawdown: -12.61,
      sharpeRatio: -0.14,
      profitFactor: 0.95,
      totalTrades: 197,
      percentageReturn: -25.12
    },
    rating: 3.8,
    likes: 456,
    downloads: 7890,
    views: 2134,
    isPremium: true,
    timeframe: 'M15',
    createdAt: 'Ocak 2024'
  },
  {
    id: '6',
    name: 'Fibonacci Retracement',
    description: 'Fibonacci seviyeleri ile destek ve direnç noktalarını tespit eden gelişmiş strateji.',
    author: 'FiboExpert',
    authorAvatar: '👤',
    authorUsername: 'fiboexpert',
    category: 'GOLD',
    tags: ['D1', 'Fibonacci'],
    performance: {
      totalReturn: 165.70,
      winRate: 70.09,
      maxDrawdown: -8.37,
      sharpeRatio: 2.43,
      profitFactor: 2.85,
      totalTrades: 866,
      percentageReturn: 165.70
    },
    rating: 4.9,
    likes: 1234,
    downloads: 23456,
    views: 5678,
    isPremium: false,
    timeframe: 'D1',
    createdAt: 'Aralık 2023'
  }
];

const categories = ['Tüm Stratejiler', 'Forex', 'Crypto', 'Hisse', 'Emtia', 'Endeks', 'Ücretsiz', 'Premium'];
const timeframes = ['Tümü', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
const strategyTypes = ['Tümü', 'Scalping', 'Swing', 'Breakout', 'Trend', 'RSI', 'MACD', 'Bollinger', 'EMA'];

export default function TradingStratejileriPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tüm Stratejiler');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Tümü');
  const [selectedType, setSelectedType] = useState('Tümü');
  const [sortBy, setSortBy] = useState('En Popüler');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  
  // User interactions
  const [likedStrategies, setLikedStrategies] = useState<Set<string>>(new Set());
  const [bookmarkedStrategies, setBookmarkedStrategies] = useState<Set<string>>(new Set());

  const handleLike = async (strategyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Update local state immediately for better UX
      const newLikedStrategies = new Set(likedStrategies);
      if (likedStrategies.has(strategyId)) {
        newLikedStrategies.delete(strategyId);
      } else {
        newLikedStrategies.add(strategyId);
      }
      setLikedStrategies(newLikedStrategies);
      
      // Update strategy likes count
      setStrategies(prevStrategies => 
        prevStrategies.map(strategy => 
          strategy.id === strategyId 
            ? { ...strategy, likes: strategy.likes + (likedStrategies.has(strategyId) ? -1 : 1) }
            : strategy
        )
      );
      
      // Here you would make an API call to save the like
      // await fetch(`/api/strategies/${strategyId}/like`, { method: 'POST' });
      
    } catch (error) {
      console.error('Error liking strategy:', error);
    }
  };

  const handleBookmark = async (strategyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const newBookmarkedStrategies = new Set(bookmarkedStrategies);
      if (bookmarkedStrategies.has(strategyId)) {
        newBookmarkedStrategies.delete(strategyId);
      } else {
        newBookmarkedStrategies.add(strategyId);
      }
      setBookmarkedStrategies(newBookmarkedStrategies);
      
      // Here you would make an API call to save the bookmark
      // await fetch(`/api/strategies/${strategyId}/bookmark`, { method: 'POST' });
      
    } catch (error) {
      console.error('Error bookmarking strategy:', error);
    }
  };

  // Fetch strategies
  const fetchStrategies = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(selectedCategory !== 'Tüm Stratejiler' && { category: selectedCategory }),
        ...(selectedTimeframe !== 'Tümü' && { timeframe: selectedTimeframe }),
        ...(selectedType !== 'Tümü' && { type: selectedType }),
        ...(searchTerm && { search: searchTerm }),
        sortBy,
      });

      const response = await fetch(`/api/strategies?${params}`);
      if (response.ok) {
        const data = await response.json();
        // If no strategies returned from API, use mock data
        if (data.strategies && data.strategies.length > 0) {
          setStrategies(data.strategies);
          setPagination(data.pagination || pagination);
        } else {
          console.log('API returned empty strategies, using mock data');
          setStrategies(mockStrategies);
        }
      } else {
        console.error('Failed to fetch strategies');
        // Fallback to mock data
        setStrategies(mockStrategies);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
      // Fallback to mock data
      setStrategies(mockStrategies);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies(1);
  }, [selectedCategory, selectedTimeframe, selectedType, searchTerm, sortBy]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '') {
        fetchStrategies(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Use strategies directly since filtering is done on the server
  const filteredStrategies = strategies;


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pt-14 sm:pt-16">
        {/* Header - Mobil optimize edilmiş */}
        <div className="sticky top-14 sm:top-16 z-30 bg-gray-50/80 dark:bg-background/80 backdrop-blur-xl border-b border-gray-200/30 dark:border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center lg:text-left lg:items-start"
            >
              {/* Page Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground mb-2">Trading Stratejileri</h1>
                <p className="text-gray-600 dark:text-muted-foreground text-sm">
                  Profesyonel trading stratejilerini keşfedin ve kar grafiklerini inceleyin
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors font-medium w-full justify-center"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Filtreleri Gizle' : 'Filtreleri Göster'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className={`lg:w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'} ${showFilters ? 'w-full lg:w-80' : ''}`}>

              {/* Filters */}
              <div className="bg-white dark:bg-card rounded-2xl p-6 border border-gray-200/50 dark:border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtreler
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedCategory('Tüm Stratejiler');
                      setSelectedTimeframe('Tümü');
                      setSelectedType('Tümü');
                      setSearchTerm('');
                    }}
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Piyasa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-foreground mb-3">
                      Piyasa
                    </label>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                            selectedCategory === category
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-border'
                              : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-muted'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zaman Dilimi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-foreground mb-3">
                      Zaman Dilimi
                    </label>
                    <div className="space-y-2">
                      {timeframes.map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setSelectedTimeframe(tf)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                            selectedTimeframe === tf
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-border'
                              : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-muted'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strateji Tipi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-foreground mb-3">
                      Strateji Tipi
                    </label>
                    <div className="space-y-2">
                      {strategyTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                            selectedType === type
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-border'
                              : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-muted'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Başarı Oranı Slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-foreground mb-3">
                      Başarı Oranı: 0% - 100%
                    </label>
                    <div className="px-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="100"
                        className="w-full h-2 bg-gray-200 dark:bg-muted rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  {/* Show Only Free */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-foreground">
                      Sadece Ücretsiz Stratejiler
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Popular Tags */}
              <div className="bg-white dark:bg-card rounded-2xl p-6 border border-gray-200/50 dark:border-border/50">
                <h3 className="font-semibold text-gray-900 dark:text-foreground mb-4">Popüler Etiketler</h3>
                <div className="flex flex-wrap gap-2">
                  {['RSI', 'MACD', 'Bollinger', 'EMA', 'Scalping', 'Swing', 'Breakout', 'Trend'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedType(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        selectedType === tag
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-muted text-gray-700 dark:text-muted-foreground hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 ${showFilters ? 'lg:block' : ''}`}>
              {/* Stats ve Actions - Mobil optimize */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-gray-600 dark:text-muted-foreground">
                  <span>{filteredStrategies.length} strateji</span>
                  <span className="hidden sm:inline">{filteredStrategies.reduce((sum, s) => sum + s.downloads, 0)} indirilme</span>
                  <span className="hidden md:inline">{filteredStrategies.reduce((sum, s) => sum + s.views, 0)} görüntüleme</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm text-gray-500 dark:text-muted-foreground hidden sm:inline">Sırala:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 sm:flex-none px-3 py-2 text-sm bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  >
                    <option value="En Popüler">En Popüler</option>
                    <option value="En Yüksek Getiri">En Yüksek Getiri</option>
                    <option value="En Düşük Risk">En Düşük Risk</option>
                    <option value="En Yeni">En Yeni</option>
                  </select>
                  <Link 
                    href="/trading-stratejileri/new"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Yeni Strateji</span>
                    <span className="sm:hidden">Yeni</span>
                  </Link>
                </div>
              </div>

              {/* Strategies Grid - Mobil optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredStrategies.map((strategy, index) => (
                  <StrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    index={index}
                    isLiked={likedStrategies.has(strategy.id)}
                    isBookmarked={bookmarkedStrategies.has(strategy.id)}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-12 flex flex-col items-center gap-6">
                  {/* Page info */}
                  <div className="text-sm text-gray-500 dark:text-muted-foreground text-center">
                    <span>{pagination.total} stratejiden </span>
                    <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                    <span> arası gösteriliyor</span>
                  </div>
                  
                  {/* Load More Button */}
                  {pagination.page < pagination.pages && (
                    <button 
                      onClick={() => fetchStrategies(pagination.page + 1)}
                      disabled={loading}
                      className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          Daha Fazla Strateji Yükle
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Page indicators */}
                  <div className="flex items-center gap-2">
                    {[...Array(Math.min(pagination.pages, 5))].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchStrategies(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            pageNum === pagination.page
                              ? 'bg-green-600 text-white'
                              : 'bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted text-gray-600 dark:text-muted-foreground'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {pagination.pages > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <button
                          onClick={() => fetchStrategies(pagination.pages)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            pagination.pages === pagination.page
                              ? 'bg-green-600 text-white'
                              : 'bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted text-gray-600 dark:text-muted-foreground'
                          }`}
                        >
                          {pagination.pages}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {loading && strategies.length === 0 && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin w-8 h-8 border-4 border-green-200 dark:border-border border-t-green-600 dark:border-t-green-400 rounded-full"></div>
                </div>
              )}

              {/* No results */}
              {!loading && strategies.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-gray-500 dark:text-muted-foreground mb-4">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Henüz strateji bulunamadı.</p>
                    <p className="text-sm">İlk stratejiyi oluşturmak için yukarıdaki butonu kullanın.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}