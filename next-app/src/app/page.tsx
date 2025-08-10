'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LeaderboardAd, 
  RectangleAd, 
  LargeRectangleAd, 
  HalfPageAd, 
  ResponsiveHeaderAd,
  InContentAd
} from '@/components/ads';
import { DEFAULT_AD_CONFIG } from '@/components/ads';

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data
  const hotTopics: ForumTopic[] = [
    {
      id: '1',
      title: 'Bitcoin 50.000$ seviyesine çıkabilir mi?',
      author: 'CryptoExpert',
      replies: 124,
      views: 2341,
      lastActivity: '2 dk önce',
      category: 'Kripto',
      isHot: true,
      isPinned: true
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
      isPinned: false
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
      isPinned: false
    }
  ];

  const topStrategies: Strategy[] = [
    {
      id: '1',
      name: 'Bitcoin Momentum Pro',
      description: 'AI destekli Bitcoin momentum yakalama stratejisi',
      author: {
        name: 'CryptoMaster',
        verified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoMaster'
      },
      performance: {
        weekly: 12.4,
        monthly: 67.8,
        yearly: 234.5
      },
      metrics: {
        profitFactor: 2.34,
        sharpeRatio: 1.87,
        maxDrawdown: 12.3,
        winRate: 74.2,
        avgTrade: 1.8,
        totalTrades: 247,
        rrRatio: 2.8,
        calmarRatio: 1.95
      },
      followers: 2847,
      isLive: true,
      riskLevel: 'Yüksek',
      category: 'MOMENTUM',
      chartData: [100, 103, 101, 108, 112, 115, 118, 122, 119, 125, 134, 142, 138, 145, 152, 148, 155, 162, 159, 167, 174, 172, 178, 185, 192, 188, 195, 203, 198, 208],
      lastSignal: {
        asset: 'BTC/USDT',
        direction: 'LONG',
        price: '67,450$',
        time: '5 dk önce'
      },
      tags: ['AI', 'Momentum', 'High-Frequency'],
      roi: 108.0
    },
    {
      id: '2',
      name: 'Forex Scalping Elite',
      description: 'Ultra hızlı scalping stratejisi',
      author: {
        name: 'ForexGuru',
        verified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ForexGuru'
      },
      performance: {
        weekly: 8.3,
        monthly: 45.2,
        yearly: 198.7
      },
      metrics: {
        profitFactor: 1.89,
        sharpeRatio: 2.14,
        maxDrawdown: 8.7,
        winRate: 82.4,
        avgTrade: 0.6,
        totalTrades: 1847,
        rrRatio: 1.9,
        calmarRatio: 2.31
      },
      followers: 1934,
      isLive: true,
      riskLevel: 'Orta',
      category: 'SCALPING',
      chartData: [100, 102, 104, 103, 106, 108, 107, 110, 112, 115, 113, 117, 119, 122, 120, 124, 127, 125, 129, 132, 135, 133, 137, 140, 138, 142, 145, 148, 146, 151],
      lastSignal: {
        asset: 'EUR/USD',
        direction: 'SHORT',
        price: '1.0875',
        time: '2 dk önce'
      },
      tags: ['Scalping', 'Forex', 'High-Win-Rate'],
      roi: 51.0
    },
    {
      id: '3',
      name: 'DeFi Yield Harvester',
      description: 'Otomatik yield farming stratejisi',
      author: {
        name: 'DeFiExpert',
        verified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DeFiExpert'
      },
      performance: {
        weekly: 2.8,
        monthly: 18.4,
        yearly: 87.3
      },
      metrics: {
        profitFactor: 3.12,
        sharpeRatio: 1.45,
        maxDrawdown: 15.2,
        winRate: 68.9,
        avgTrade: 2.4,
        totalTrades: 89,
        rrRatio: 3.7,
        calmarRatio: 1.73
      },
      followers: 1256,
      isLive: true,
      riskLevel: 'Düşük',
      category: 'DEFI',
      chartData: [100, 101, 103, 105, 104, 107, 109, 111, 108, 112, 115, 118, 116, 119, 122, 120, 124, 127, 125, 128, 131, 129, 133, 136, 134, 137, 140, 138, 142, 145],
      lastSignal: {
        asset: 'USDC-USDT LP',
        direction: 'LONG',
        price: '14.2% APY',
        time: '1 saat önce'
      },
      tags: ['DeFi', 'Yield-Farming', 'Low-Risk'],
      roi: 45.0
    },
    {
      id: '4',
      name: 'Altcoin Swing Master',
      description: 'Orta vadeli altcoin swing trading',
      author: {
        name: 'AltTrader',
        verified: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AltTrader'
      },
      performance: {
        weekly: 18.7,
        monthly: 89.3,
        yearly: 312.8
      },
      metrics: {
        profitFactor: 2.67,
        sharpeRatio: 1.73,
        maxDrawdown: 22.1,
        winRate: 71.6,
        avgTrade: 4.3,
        totalTrades: 134,
        rrRatio: 3.2,
        calmarRatio: 1.41
      },
      followers: 892,
      isLive: true,
      riskLevel: 'Yüksek',
      category: 'SWING',
      chartData: [100, 98, 104, 110, 108, 115, 122, 118, 126, 134, 131, 140, 148, 145, 153, 162, 158, 167, 175, 172, 181, 189, 186, 195, 203, 200, 209, 218, 215, 225],
      lastSignal: {
        asset: 'AVAX/USDT',
        direction: 'LONG',
        price: '38.4$',
        time: '30 dk önce'
      },
      tags: ['Swing', 'Altcoin', 'Technical-Analysis'],
      roi: 212.8
    }
  ];

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
      {/* Hero Section - Compact */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 dark:from-green-700 dark:via-emerald-600 dark:to-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-white mb-3"
            >
              Türkiye'nin En Büyük<br />Trader Topluluğu
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-green-100 mb-6 max-w-2xl mx-auto"
            >
              Bilgi, deneyim ve strateji etrafında birleşen, başarıyı hedefleyen kolektif bir gelişim ortamı.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link href="/strategies" className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-105">
                🚀 Stratejileri Keşfet
              </Link>
              <Link href="/forum" className="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg">
                💬 Foruma Katıl
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Above-the-Fold Ad - High CPM Position */}
        <ResponsiveHeaderAd adSlot={DEFAULT_AD_CONFIG.adSlots.homepageTop} />

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          
          {/* Live Stats Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="col-span-12 md:col-span-6 lg:col-span-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-100">CANLI</span>
              </div>
              <div className="text-2xl font-bold mb-1">₿67,450</div>
              <div className="text-sm text-emerald-100">+2.4% (24h)</div>
              <div className="text-xs text-emerald-200 mt-2">Bitcoin/USDT</div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 md:col-span-6 lg:col-span-3 bg-white dark:bg-card rounded-2xl p-6 border border-gray-200 dark:border-border"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hızlı Erişim</h3>
            <div className="space-y-3">
              <Link href="/forum/new" className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💬</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Konu Aç</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Forum</div>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
              
              <Link href="/strategies" className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📈</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Stratejiler</div>
                  <div className="text-xs text-green-600 dark:text-green-400">Keşfet</div>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Community Pulse */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 md:col-span-6 lg:col-span-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
            <div className="relative z-10">
              <div className="text-sm font-medium text-purple-100 mb-2">Topluluk</div>
              <div className="text-2xl font-bold mb-1">2,847</div>
              <div className="text-sm text-purple-100">Aktif kullanıcı</div>
              <div className="flex items-center gap-1 mt-3">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full border-2 border-purple-400"></div>
                  <div className="w-6 h-6 bg-white/20 rounded-full border-2 border-purple-400"></div>
                  <div className="w-6 h-6 bg-white/20 rounded-full border-2 border-purple-400"></div>
                </div>
                <span className="text-xs text-purple-200 ml-2">+24 yeni üye</span>
              </div>
            </div>
          </motion.div>

          {/* Today's Performance */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="col-span-12 md:col-span-6 lg:col-span-3 bg-white dark:bg-card rounded-2xl p-6 border border-gray-200 dark:border-border"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Günün Performansı</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">En İyi Strateji</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">+12.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Forum Aktivitesi</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">+89 yeni</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Canlı Sinyaller</span>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">4 aktif</span>
              </div>
            </div>
          </motion.div>

          {/* Hot Forum Topics - Compact */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="col-span-12 lg:col-span-6 bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🔥</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Popüler Konular</h2>
                </div>
                <Link href="/forum" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 transition-colors">
                  Tümü →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-border">
              {hotTopics.slice(0, 4).map((topic, index) => (
                <Link key={topic.id} href={`/forum/${topic.id}`} className="block">
                  <div className="p-4 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{topic.author[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.isHot && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full font-medium">Popüler</span>}
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            topic.category === 'Kripto' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                            topic.category === 'Forex' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          }`}>{topic.category}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>💬 {topic.replies}</span>
                          <span>👁 {topic.views}</span>
                          <span>⏰ {topic.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Sidebar Ad - Half Page for High CPM */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="col-span-12 lg:col-span-6 xl:col-span-4 bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden flex flex-col items-center justify-center p-6"
          >
            <div className="text-xs text-gray-400 text-center mb-2 uppercase tracking-wide">
              Sponsor
            </div>
            <HalfPageAd adSlot={DEFAULT_AD_CONFIG.adSlots.homepageSidebar} />
          </motion.div>

          {/* Top Strategies - Compact Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-12 lg:col-span-6 xl:col-span-8 bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📈</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">En İyi Stratejiler</h2>
                </div>
                <Link href="/strategies" className="text-green-600 dark:text-green-400 text-sm font-medium hover:text-green-700 transition-colors">
                  Tümü →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topStrategies.slice(0, 4).map((strategy) => (
                  <Link key={strategy.id} href={`/strategies/${strategy.id}`}>
                    <div className="bg-gray-50 dark:bg-muted rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors border border-gray-200 dark:border-border hover:border-green-300 dark:hover:border-green-600">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={strategy.author.avatar} alt="" className="w-8 h-8 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate hover:text-green-600 transition-colors">
                            {strategy.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-300">@{strategy.author.name}</p>
                        </div>
                        {strategy.isLive && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">+{strategy.roi.toFixed(0)}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ROI</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{strategy.metrics.winRate.toFixed(0)}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Win</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{strategy.followers.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Takip</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          strategy.riskLevel === 'Düşük' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          strategy.riskLevel === 'Orta' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          {strategy.riskLevel} Risk
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{strategy.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* In-Content Ad - Between Sections for High Engagement */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="col-span-12 flex justify-center py-4"
          >
            <InContentAd 
              adSlot={DEFAULT_AD_CONFIG.adSlots.homepageMiddle} 
              preferLarge={true}
            />
          </motion.div>

          {/* Latest Articles - Compact */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="col-span-12 bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📰</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Güncel Makaleler</h2>
                </div>
                <Link href="/articles" className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 transition-colors">
                  Tümü →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestArticles.map((article, index) => (
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
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">
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



          {/* Community Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="col-span-12 bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Topluluk Aktivitesi</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                { user: 'TradeMaster', action: 'yeni strateji paylaştı', time: '5 dk', avatar: 'T', color: 'from-blue-500 to-cyan-500' },
                { user: 'CryptoKing', action: 'Bitcoin analizi yazdı', time: '12 dk', avatar: 'C', color: 'from-orange-500 to-red-500' },
                { user: 'ForexPro', action: 'EUR/USD sinyali verdi', time: '18 dk', avatar: 'F', color: 'from-green-500 to-teal-500' },
                { user: 'AnalystAli', action: 'forum konusu açtı', time: '25 dk', avatar: 'A', color: 'from-purple-500 to-pink-500' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-muted rounded-xl transition-colors">
                  <div className={`w-10 h-10 bg-gradient-to-br ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-sm">{activity.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time} önce</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              ))}
              
              <Link href="/forum" className="block w-full text-center py-3 bg-gray-50 dark:bg-muted rounded-xl text-green-600 dark:text-green-400 font-medium hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors">
                Tüm Aktiviteyi Gör →
              </Link>
            </div>
          </motion.div>

          {/* Bottom Page Ad - Leaderboard for Good Visibility */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="col-span-12 flex justify-center mt-6"
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