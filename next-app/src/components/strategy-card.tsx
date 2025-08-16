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
  // Parite türüne göre renkler - Ana tema uyumlu
  const getParityColor = (category: string) => {
    if (category.includes('USD') || category.includes('EUR') || category.includes('GBP') || category.includes('JPY')) {
      return 'hsl(142, 76%, 36%)'; // Forex - ana tema yeşili
    } else if (category.includes('BTC') || category.includes('ETH') || category.includes('USDT')) {
      return 'hsl(142, 76%, 45%)'; // Crypto - açık yeşil
    } else if (category === 'GOLD' || category === 'SILVER') {
      return 'hsl(43, 74%, 50%)'; // Emtia - altın sarısı
    } else {
      return 'hsl(142, 60%, 30%)'; // Hisse - koyu yeşil
    }
  };

  const categoryColor = getParityColor(strategy.category);
  const isPositive = strategy.performance.totalReturn > 0;

  // Gerçek performans verilerine dayalı grafik data generator
  const generateRealChartData = () => {
    const months = 12;
    const data = [];
    const totalReturn = strategy.performance.totalReturn;
    const winRate = strategy.performance.winRate;
    
    // Başlangıç değeri
    let currentValue = 10000;
    data.push(currentValue);
    
    // Her ay için gerçekçi getiri hesapla
    for (let i = 1; i < months; i++) {
      const monthlyReturn = (totalReturn / 100) / months;
      const volatility = (100 - winRate) / 100 * 0.1; // Düşük win rate = yüksek volatilite
      const randomFactor = (Math.random() - 0.5) * volatility;
      
      currentValue *= (1 + monthlyReturn + randomFactor);
      data.push(currentValue);
    }
    
    return data;
  };

  const chartData = generateRealChartData();

  // Create SVG path for performance chart
  const createPath = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 320;
    const height = 120;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative group w-full"
    >
      <Link href={`/trading-stratejileri/${strategy.id}`} className="block">
        <div className="relative rounded-2xl overflow-hidden bg-card dark:bg-card shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full w-full border border-border">
          
          {/* Performance Chart - En üste taşındı */}
          <div className="p-4 pb-2">
            <div className="relative">
              {/* Parite bilgisi sağ üst köşede */}
              <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                <div 
                  className="px-2 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                  style={{ backgroundColor: `${categoryColor}CC` }}
                >
                  {strategy.category}
                </div>
                {strategy.isPremium && (
                  <div className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    PRO
                  </div>
                )}
              </div>
              
              {/* Bookmark button sol üst köşede */}
              <button 
                onClick={(e) => onBookmark(strategy.id, e)}
                className="absolute top-2 left-2 z-10 w-8 h-8 bg-background/90 rounded-full flex items-center justify-center hover:bg-background transition-colors backdrop-blur-sm border border-border"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-primary fill-current' : 'text-muted-foreground'}`} />
              </button>
              
              {/* Getiri oranı ortada */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className={`text-2xl font-bold drop-shadow-lg ${
                  isPositive ? 'text-primary' : 'text-destructive'
                }`}>
                  {isPositive ? '+' : ''}{strategy.performance.totalReturn.toFixed(1)}%
                </div>
              </div>
              
              {/* Ana Grafik - tam genişlik */}
              <svg width="100%" height="120" viewBox="0 0 320 120" className="overflow-visible">
                <defs>
                  <linearGradient id={`gradient-${strategy.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={isPositive ? 'hsl(142, 76%, 36%)' : 'hsl(0, 75%, 55%)'} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={isPositive ? 'hsl(142, 76%, 36%)' : 'hsl(0, 75%, 55%)'} stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                
                {/* Chart area fill */}
                <path
                  d={`${createPath(chartData).replace(/280/g, '320').replace(/80/g, '120')} L 320,120 L 0,120 Z`}
                  fill={`url(#gradient-${strategy.id})`}
                />
                
                {/* Chart line */}
                <path
                  d={createPath(chartData).replace(/280/g, '320').replace(/80/g, '120')}
                  fill="none"
                  stroke={isPositive ? 'hsl(142, 76%, 36%)' : 'hsl(0, 75%, 55%)'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Başlık ve Açıklama - daha küçük */}
          <div className="px-4 pb-3">
            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {strategy.name}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {strategy.description}
            </p>
          </div>

          {/* Metrikler */}
          <div className="px-4 mb-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <div className="text-sm font-bold text-primary">
                  {strategy.performance.winRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Başarı</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <div className="text-sm font-bold text-accent">
                  {Math.abs(strategy.performance.maxDrawdown).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Düşüş</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <div className="text-sm font-bold text-foreground">
                  {formatLargeNumber(strategy.performance.totalTrades)}
                </div>
                <div className="text-xs text-muted-foreground">İşlem</div>
              </div>
            </div>
          </div>
          
          {/* Footer - sadeleştirilmiş */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: categoryColor }}
                >
                  {strategy.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {strategy.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {strategy.timeframe}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span>{formatLargeNumber(strategy.views)}</span>
                </div>
                <button
                  onClick={(e) => onLike(strategy.id, e)}
                  className={`p-1.5 rounded-lg transition-all ${
                    isLiked 
                      ? 'bg-destructive/20 text-destructive' 
                      : 'bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}