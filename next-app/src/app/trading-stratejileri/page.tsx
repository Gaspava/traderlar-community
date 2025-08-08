'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
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
    name: 'MA Cross Scalper',
    description: 'Hareketli ortalama kesişimleri ile hızlı scalping işlemleri için optimize edilmiş strateji.',
    author: 'ScalpKing',
    authorAvatar: '👤',
    category: 'Hisse',
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
    createdAt: '2024-01-20'
  },
  {
    id: '4',
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
    id: '5',
    name: 'Grid Trading System',
    description: 'Otomatik grid trading stratejisi ile piyasa dalgalanmalarından kar elde edin.',
    author: 'GridMaster',
    authorAvatar: '👤',
    authorUsername: 'gridmaster',
    category: 'Crypto',
    tags: ['M15', 'Grid'],
    performance: {
      totalReturn: -4933.25,
      winRate: 89.12,
      maxDrawdown: -12.61,
      sharpeRatio: -0.14,
      profitFactor: 0.95,
      totalTrades: 197,
      percentageReturn: -4933.25
    },
    rating: 3.8,
    likes: 456,
    downloads: 7890,
    views: 2134,
    isPremium: true,
    timeframe: 'M15',
    createdAt: '2024-01-18'
  },
  {
    id: '6',
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
        setStrategies(data.strategies || []);
        setPagination(data.pagination || pagination);
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
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                En gelişmiş trading stratejileri
              </div>
              <h1 className="text-5xl font-bold text-foreground mb-4">
                Trading Stratejileri
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Profesyonel traderlar tarafından geliştirilmiş, backtest edilmiş ve 
                gerçek piyasa koşullarında test edilmiş stratejileri keşfedin.
              </p>
              
              {/* Quick Stats */}
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <div className="text-sm text-muted-foreground">Strateji</div>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground">Kullanıcı</div>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">85%</div>
                  <div className="text-sm text-muted-foreground">Başarı Oranı</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors font-medium w-full justify-center"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Filtreleri Gizle' : 'Filtreleri Göster'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className={`lg:w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'} ${showFilters ? 'w-full lg:w-80' : ''}`}>
              {/* Search */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Strateji ara..."
                    className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
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
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Piyasa */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Piyasa
                    </label>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                            selectedCategory === category
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zaman Dilimi */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Zaman Dilimi
                    </label>
                    <div className="space-y-2">
                      {timeframes.map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setSelectedTimeframe(tf)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                            selectedTimeframe === tf
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strateji Tipi */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Strateji Tipi
                    </label>
                    <div className="space-y-2">
                      {strategyTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                            selectedType === type
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Başarı Oranı Slider */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Başarı Oranı: 0% - 100%
                    </label>
                    <div className="px-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="100"
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  {/* Show Only Free */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Sadece Ücretsiz Stratejiler
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Popular Tags */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <h3 className="font-semibold text-foreground mb-4">Popüler Etiketler</h3>
                <div className="flex flex-wrap gap-2">
                  {['RSI', 'MACD', 'Bollinger', 'EMA', 'Scalping', 'Swing', 'Breakout', 'Trend'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedType(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        selectedType === tag
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary'
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
              {/* Top Bar */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {['Tüm Stratejiler', 'Ücretsiz', 'Premium'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                          selectedCategory === category
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl hover:bg-muted/50 transition-colors text-sm font-medium"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Filtreler
                    </button>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                    >
                      <option value="En Popüler">En Popüler</option>
                      <option value="En Yüksek Getiri">En Yüksek Getiri</option>
                      <option value="En Düşük Risk">En Düşük Risk</option>
                      <option value="En Yeni">En Yeni</option>
                    </select>

                    <Link 
                      href="/trading-stratejileri/new"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:shadow-lg transition-all font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Strateji Oluştur</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Strategies Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  <div className="text-sm text-muted-foreground text-center">
                    <span>{pagination.total} stratejiden </span>
                    <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                    <span> arası gösteriliyor</span>
                  </div>
                  
                  {/* Load More Button */}
                  {pagination.page < pagination.pages && (
                    <button 
                      onClick={() => fetchStrategies(pagination.page + 1)}
                      disabled={loading}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full"></div>
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
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card border border-border hover:bg-muted/50 text-muted-foreground'
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
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card border border-border hover:bg-muted/50 text-muted-foreground'
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
                  <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
                </div>
              )}

              {/* No results */}
              {!loading && strategies.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-muted-foreground mb-4">
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
    </MainLayout>
  );
}