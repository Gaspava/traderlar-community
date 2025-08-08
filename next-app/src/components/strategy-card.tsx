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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative h-full"
    >
      <Link href={`/trading-stratejileri/${strategy.id}`}>
        <div className="relative h-full bg-card border border-border/50 rounded-2xl overflow-hidden">
          {/* Premium Badge */}
          {strategy.isPremium && (
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
                <Award className="w-3 h-3" />
                PREMIUM
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="p-5 pb-4">
            {/* Author & Rating */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm">{strategy.authorAvatar}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{strategy.author}</div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2.5 h-2.5 ${
                          i < Math.floor(strategy.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({strategy.rating})
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => onLike(strategy.id, e)}
                  className={`p-1.5 rounded-lg transition-all ${
                    isLiked 
                      ? 'bg-red-500/20 text-red-500' 
                      : 'bg-muted/50 text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => onBookmark(strategy.id, e)}
                  className={`p-1.5 rounded-lg transition-all ${
                    isBookmarked 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-base font-bold text-foreground mb-1.5 line-clamp-1">
              {strategy.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {strategy.description}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded whitespace-nowrap">
                <Clock className="w-3 h-3" />
                {strategy.timeframe}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-medium rounded whitespace-nowrap">
                <BarChart3 className="w-3 h-3" />
                {strategy.category}
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="px-5 pb-5">
            <div className="bg-gradient-to-br from-background/50 to-background/30 rounded-xl p-3 border border-border/50">
              {/* Main Stats */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    strategy.performance.totalReturn > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {strategy.performance.totalReturn > 0 ? '+' : ''}{formatLargeNumber(strategy.performance.totalReturn)}%
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Toplam<br/>Getiri</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">
                    {strategy.performance.winRate}%
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Başarı<br/>Oranı</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-500">
                    {Math.abs(strategy.performance.maxDrawdown)}%
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Max DD</div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                <div className="text-center">
                  <div className="text-xs font-medium">{strategy.performance.sharpeRatio.toFixed(2)}</div>
                  <div className="text-[10px] text-muted-foreground">Sharpe</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium">{strategy.performance.profitFactor?.toFixed(2) || '0.00'}</div>
                  <div className="text-[10px] text-muted-foreground">P.Factor</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium">{strategy.performance.totalTrades}</div>
                  <div className="text-[10px] text-muted-foreground">İşlemler</div>
                </div>
              </div>
            </div>

            {/* Social Stats */}
            <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {strategy.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {strategy.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {strategy.downloads}
                </span>
              </div>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}