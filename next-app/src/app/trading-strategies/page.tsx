'use client';

import { useState, useEffect } from 'react';

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
  Calendar
} from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  author: string;
  authorAvatar: string;
  category: 'Forex' | 'Crypto' | 'Stock' | 'All';
  tags: string[];
  performance: {
    totalReturn: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  rating: number;
  likes: number;
  downloads: number;
  views: number;
  isPremium: boolean;
  timeframe: string;
  createdAt: string;
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
      sharpeRatio: 2.1
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
      sharpeRatio: 1.8
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
    category: 'Stock',
    tags: ['M5', 'Scalping'],
    performance: {
      totalReturn: 87.3,
      winRate: 61.2,
      maxDrawdown: -8.9,
      sharpeRatio: 1.5
    },
    rating: 4.2,
    likes: 123,
    downloads: 3456,
    views: 890,
    isPremium: false,
    timeframe: 'M5',
    createdAt: '2024-01-20'
  }
];

const categories = ['Tüm Stratejiler', 'Ücretsiz', 'Premium'];
const timeframes = ['Tümü', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
const strategyTypes = ['Tümü', 'Scalping', 'Swing', 'Breakout', 'Trend', 'RSI', 'MACD', 'Bollinger', 'EMA'];

export default function TradingStrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tüm Stratejiler');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Tümü');
  const [selectedType, setSelectedType] = useState('Tümü');
  const [sortBy, setSortBy] = useState('En Popüler');
  const [showFilters, setShowFilters] = useState(false);

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tüm Stratejiler' || 
                          (selectedCategory === 'Ücretsiz' && !strategy.isPremium) ||
                          (selectedCategory === 'Premium' && strategy.isPremium);
    const matchesTimeframe = selectedTimeframe === 'Tümü' || strategy.timeframe === selectedTimeframe;
    const matchesType = selectedType === 'Tümü' || strategy.tags.some(tag => 
      tag.toLowerCase().includes(selectedType.toLowerCase())
    );
    
    return matchesSearch && matchesCategory && matchesTimeframe && matchesType;
  });

  const getPerformanceColor = (value: number, type: 'return' | 'drawdown') => {
    if (type === 'return') {
      return value >= 100 ? 'text-green-400' : value >= 50 ? 'text-green-300' : 'text-yellow-400';
    } else {
      return value <= -20 ? 'text-red-400' : value <= -10 ? 'text-yellow-400' : 'text-green-400';
    }
  };

  return (
    
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-background via-card/30 to-background border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Trading Stratejileri
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Profesyonel traderlar tarafından geliştirilmiş ve test edilmiş stratejileri keşfedin.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Strateji ara..."
                    className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-4">
                <div className="flex bg-card rounded-xl p-1 border border-border">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtreler</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-card rounded-xl border border-border"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Timeframe Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Zaman Dilimi
                    </label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      {timeframes.map((tf) => (
                        <option key={tf} value={tf}>{tf}</option>
                      ))}
                    </select>
                  </div>

                  {/* Strategy Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Strateji Tipi
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      {strategyTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sıralama
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      <option value="En Popüler">En Popüler</option>
                      <option value="En Yüksek Getiri">En Yüksek Getiri</option>
                      <option value="En Düşük Risk">En Düşük Risk</option>
                      <option value="En Yeni">En Yeni</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('Tüm Stratejiler');
                      setSelectedTimeframe('Tümü');
                      setSelectedType('Tümü');
                      setSearchTerm('');
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Popular Tags */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-3">Popüler Etiketler</h3>
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

          {/* Strategies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStrategies.map((strategy, index) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl border border-border/50 hover:border-primary/20 transition-all duration-300 overflow-hidden group hover:shadow-xl"
              >
                {/* Strategy Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                          {strategy.name}
                        </h3>
                        {strategy.isPremium && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                        {strategy.description}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1 mb-4">
                    {strategy.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tag === 'Premium'
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30'
                            : tag.includes('H') || tag.includes('M')
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-primary/20 text-primary border border-primary/30'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="px-6 pb-4">
                  <div className="bg-background/50 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Total Return */}
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getPerformanceColor(strategy.performance.totalReturn, 'return')}`}>
                          +{strategy.performance.totalReturn}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Toplam Kar</div>
                      </div>

                      {/* Win Rate */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {strategy.performance.winRate}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Başarı Oranı</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/30">
                      {/* Max Drawdown */}
                      <div className="text-center">
                        <div className={`text-sm font-medium ${getPerformanceColor(strategy.performance.maxDrawdown, 'drawdown')}`}>
                          {strategy.performance.maxDrawdown}%
                        </div>
                        <div className="text-xs text-muted-foreground">Max Drawdown</div>
                      </div>

                      {/* Sharpe Ratio */}
                      <div className="text-center">
                        <div className="text-sm font-medium text-foreground">
                          {strategy.performance.sharpeRatio}
                        </div>
                        <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strategy Footer */}
                <div className="px-6 pb-6">
                  {/* Author */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm">{strategy.authorAvatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{strategy.author}</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(strategy.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          {strategy.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{strategy.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{strategy.downloads}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{strategy.views}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium rounded-xl transition-all duration-300 group-hover:shadow-lg">
                    {strategy.isPremium ? 'Premium İndir' : 'Ücretsiz İndir'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors font-medium">
              Daha Fazla Strateji Yükle
            </button>
          </div>
        </div>
      </div>
    
  );
}