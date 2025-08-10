'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  Download,
  Heart,
  Clock,
  DollarSign,
  Activity,
  BarChart3,
  Shield,
  Zap,
  Award,
  ArrowUpRight,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';

interface Strategy {
  id: string;
  name: string;
  description: string;
  author: string;
  authorAvatar: string;
  authorUsername: string;
  category: string;
  tags: string[];
  performance: {
    totalReturn: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
    profitFactor: number;
    totalTrades: number;
    percentageReturn?: number;
  };
  rating: number;
  likes: number;
  downloads: number;
  views: number;
  isPremium: boolean;
  timeframe: string;
  createdAt: string;
}

interface StrategyCardProps {
  strategy: Strategy;
  index: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: (strategyId: string, e: React.MouseEvent) => void;
  onBookmark: (strategyId: string, e: React.MouseEvent) => void;
}

// Format large numbers
function formatLargeNumber(num: number): string {
  const absNum = Math.abs(num);
  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return Math.round(num).toString();
}

export function StrategyCard({ 
  strategy, 
  index, 
  isLiked, 
  isBookmarked, 
  onLike, 
  onBookmark 
}: StrategyCardProps) {
  // Strategy kategori renkleri
  const categoryColors = {
    'Forex': '#10b981',
    'Crypto': '#f59e0b', 
    'Hisse': '#3b82f6',
    'Emtia': '#ef4444',
    'Endeks': '#8b5cf6'
  };

  const categoryColor = categoryColors[strategy.category as keyof typeof categoryColors] || '#6b7280';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative group"
    >
      <Link href={`/trading-stratejileri/${strategy.id}`} className="block">
        <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl dark:shadow-gray-900/50 transition-all duration-300 transform hover:-translate-y-1 h-full">
          {/* Hero Image Area - Forum CourseCard tarzında */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            {/* Gradient overlay with category color */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{ backgroundColor: categoryColor }}
            ></div>
            
            {/* Strategy Performance Indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="p-6 rounded-full shadow-lg backdrop-blur-sm flex flex-col items-center"
                style={{ 
                  backgroundColor: `${categoryColor}20`,
                  border: `2px solid ${categoryColor}40`
                }}
              >
                <div className={`trading-price ${
                  strategy.performance.totalReturn > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {strategy.performance.totalReturn > 0 ? '+' : ''}{formatLargeNumber(strategy.performance.totalReturn)}%
                </div>
                <div className="text-caption mt-1">Toplam Getiri</div>
              </div>
            </div>
            
            {/* Premium/Category Badge */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm" style={{ backgroundColor: `${categoryColor}CC` }}>
              {strategy.isPremium ? 'PREMIUM' : strategy.category}
            </div>
            
            {/* Bookmark Button */}
            <button 
              onClick={(e) => onBookmark(strategy.id, e)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-green-600 fill-current' : 'text-gray-600 dark:text-gray-400'}`} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-5">
            <h3 className="card-title text-gray-900 dark:text-gray-100 mb-3 text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-1">
              {strategy.name}
            </h3>
            
            <p className="body-text text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {strategy.description}
            </p>
            
            {/* Progress-style Performance Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-caption mb-1">
                <span className="metric-value">{strategy.performance.winRate}% Başarı</span>
                <span>Aktif</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: categoryColor,
                    width: `${Math.min(100, strategy.performance.winRate)}%`
                  }}
                />
              </div>
            </div>
            
            {/* Author/Creator Info - Forum CourseCard tarzında */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: categoryColor }}>
                {strategy.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{strategy.author}</p>
                <p className="text-caption">{strategy.timeframe} • <span className="metric-value">{strategy.performance.totalTrades}</span> işlem</p>
              </div>
              
              {/* Like Button */}
              <button
                onClick={(e) => onLike(strategy.id, e)}
                className={`ml-2 p-1.5 rounded-lg transition-all ${
                  isLiked 
                    ? 'bg-red-500/20 text-red-500' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}