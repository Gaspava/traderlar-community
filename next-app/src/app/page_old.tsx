'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

// Mini Chart Component
const MiniChart = ({ data, color = '#10B981' }: { data: number[]; color?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-16 relative">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="drop-shadow-lg"
        />
        <polygon
          fill={`url(#gradient-${color})`}
          points={`${points} 100,100 0,100`}
          className="opacity-60"
        />
      </svg>
    </div>
  );
};

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
      description: 'AI destekli Bitcoin momentum yakalama stratejisi. Makine öğrenmesi algoritmaları ile piyasa trendlerini analiz eder ve yüksek volatilite dönemlerinde optimal giriş/çıkış noktalarını belirler.',
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
      description: 'Ultra hızlı scalping stratejisi. EUR/USD, GBP/USD paritelerinde yüksek frekanslı işlem yapıyor. Spread optimizasyonu ve mikro trend analizi ile maksimum karlılık sağlar.',
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
      description: 'Otomatik yield farming ve likidite sağlama stratejisi. DeFi protokollerinde en iyi APY oranlarını takip eder, impermanent loss riskini minimize eder ve compound faiz stratejileri uygular.',
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
      description: 'Orta vadeli altcoin swing trading stratejisi. Teknik analiz ve on-chain verilerle güçlü sinyaller üretiyor. Market cap analizi ve trend following yaklaşımı ile yüksek getiri hedefliyor.',
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content - Forum */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Forum Section */}
            <section className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-3xl shadow-xl border border-blue-200 dark:border-blue-800/50 overflow-hidden">
              <div className="p-8 border-b border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        💬 Aktif Forum Konuları
                      </h2>
                      <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">Topluluktan sıcak tartışmalar</p>
                    </div>
                  </div>
                  <Link 
                    href="/forum" 
                    className="group bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105"
                  >
                    <span>Foruma Git</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-blue-100 dark:divide-blue-800/30">
                {hotTopics.map((topic, index) => (
                  <Link key={topic.id} href={`/forum/${topic.id}`}>
                    <div className="group p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {topic.isPinned && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                📌 Sabitlendi
                              </span>
                            )}
                            {topic.isHot && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
                                🔥 Popüler
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                              topic.category === 'Kripto' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' : 
                              topic.category === 'Forex' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}>
                              {topic.category}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {topic.title}
                          </h3>
                          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{topic.author[0]}</span>
                              </div>
                              <span>@{topic.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-blue-500">💬</span>
                              <span>{topic.replies} yanıt</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-green-500">👁️</span>
                              <span>{topic.views} görüntüleme</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-purple-500">⏰</span>
                              <span>{topic.lastActivity}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Trading Strategies Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-purple-950 dark:to-black rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"></div>
              
              <div className="relative p-8 border-b border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-12 h-12 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/50">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                        🚀 Popüler Stratejiler
                      </h2>
                      <p className="text-purple-200 text-sm mt-1">Canlı performans takibi</p>
                    </div>
                  </div>
                  <Link 
                    href="/strategies" 
                    className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
                  >
                    <span>Tümünü Gör</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {topStrategies.map((strategy) => (
                    <Link key={strategy.id} href={`/strategies/${strategy.id}`}>
                      <div className="group bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 hover:border-green-500 dark:hover:border-green-400">
                          
                          {/* Main card */}
                          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 group-hover:scale-[1.02] transition-all duration-500">
                            
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="flex items-center space-x-2">
                                    <img 
                                      src={strategy.author.avatar}
                                      alt={strategy.author.name}
                                      className={`w-10 h-10 rounded-full border-2 border-gradient-to-r ${gradients[index]}`}
                                    />
                                    <div>
                                      <div className="flex items-center space-x-1">
                                        <span className="text-white font-medium text-sm">{strategy.author.name}</span>
                                        {strategy.author.verified && (
                                          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                          </svg>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-400">{strategy.category}</span>
                                    </div>
                                  </div>
                                  {strategy.isLive && (
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                      <span className="text-red-400 text-xs font-medium">LIVE</span>
                                    </div>
                                  )}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                                  {strategy.name}
                                </h3>
                                <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                                  {strategy.description}
                                </p>
                              </div>
                              
                              {/* Performance badge */}
                              <div className="ml-4">
                                <div className={`bg-gradient-to-r ${gradients[index]} text-white px-3 py-1.5 rounded-xl font-bold text-lg ${shadowColors[index]} shadow-lg`}>
                                  {strategy.performance.weekly > 0 ? '+' : ''}{strategy.performance.weekly.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-400 text-center mt-1">bu hafta</div>
                              </div>
                            </div>

                            {/* Performance Chart */}
                            <div className="mb-4 bg-black/30 rounded-2xl p-4 border border-white/10">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-300">Performans Trendi</span>
                                <div className="flex items-center space-x-4 text-xs">
                                  <span className="text-green-400">+{strategy.performance.yearly.toFixed(1)}% (1Y)</span>
                                  <span className="text-blue-400">{strategy.followers.toLocaleString()} takipçi</span>
                                </div>
                              </div>
                              <MiniChart data={strategy.chartData} color={chartColors[index]} />
                            </div>

                            {/* Primary Metrics Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="bg-black/30 rounded-xl p-3 border border-white/10 text-center hover:bg-black/40 transition-colors">
                                <div className={`text-lg font-bold ${strategy.metrics.profitFactor >= 2.0 ? 'text-green-400' : strategy.metrics.profitFactor >= 1.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {strategy.metrics.profitFactor.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-400">Profit Factor</div>
                              </div>
                              <div className="bg-black/30 rounded-xl p-3 border border-white/10 text-center hover:bg-black/40 transition-colors">
                                <div className={`text-lg font-bold ${strategy.metrics.sharpeRatio >= 1.5 ? 'text-green-400' : strategy.metrics.sharpeRatio >= 1.0 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {strategy.metrics.sharpeRatio.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-400">Sharpe Ratio</div>
                              </div>
                              <div className="bg-black/30 rounded-xl p-3 border border-white/10 text-center hover:bg-black/40 transition-colors">
                                <div className={`text-lg font-bold ${strategy.metrics.winRate >= 70 ? 'text-green-400' : strategy.metrics.winRate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {strategy.metrics.winRate.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-400">Win Rate</div>
                              </div>
                            </div>

                            {/* Secondary Metrics Grid */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                              <div className="bg-black/20 rounded-lg p-2 border border-white/5 hover:bg-black/30 transition-colors">
                                <div className="text-center">
                                  <div className="text-sm font-medium text-red-400">-{strategy.metrics.maxDrawdown.toFixed(1)}%</div>
                                  <div className="text-xs text-gray-500">Drawdown</div>
                                </div>
                              </div>
                              <div className="bg-black/20 rounded-lg p-2 border border-white/5 hover:bg-black/30 transition-colors">
                                <div className="text-center">
                                  <div className="text-sm font-medium text-cyan-400">{strategy.metrics.rrRatio.toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">R/R Ratio</div>
                                </div>
                              </div>
                              <div className="bg-black/20 rounded-lg p-2 border border-white/5 hover:bg-black/30 transition-colors">
                                <div className="text-center">
                                  <div className="text-sm font-medium text-purple-400">{strategy.metrics.calmarRatio.toFixed(2)}</div>
                                  <div className="text-xs text-gray-500">Calmar</div>
                                </div>
                              </div>
                              <div className="bg-black/20 rounded-lg p-2 border border-white/5 hover:bg-black/30 transition-colors">
                                <div className="text-center">
                                  <div className="text-sm font-medium text-gray-300">{strategy.metrics.totalTrades >= 1000 ? `${(strategy.metrics.totalTrades / 1000).toFixed(1)}k` : strategy.metrics.totalTrades.toLocaleString()}</div>
                                  <div className="text-xs text-gray-500">İşlemler</div>
                                </div>
                              </div>
                            </div>

                            {/* ROI and Tags */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl px-3 py-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-emerald-400 font-medium">Total ROI:</span>
                                    <span className="text-sm font-bold text-emerald-400">+{strategy.roi.toFixed(1)}%</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                  Avg Trade: {strategy.metrics.avgTrade > 0 ? '+' : ''}{strategy.metrics.avgTrade.toFixed(1)}%
                                </div>
                              </div>
                              
                              {/* Strategy Tags */}
                              <div className="flex flex-wrap gap-2">
                                {strategy.tags.map((tag, tagIndex) => (
                                  <span key={tagIndex} className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${gradients[index]}/20 border border-white/20 text-white`}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Last Signal */}
                            {strategy.lastSignal && (
                              <div className="mb-4 bg-black/30 rounded-xl p-4 border border-white/10 hover:bg-black/40 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                                      strategy.lastSignal.direction === 'LONG' ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-300">Son Sinyal:</span>
                                        <span className="font-medium text-white">{strategy.lastSignal.asset}</span>
                                      </div>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                                          strategy.lastSignal.direction === 'LONG' 
                                            ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                                            : 'bg-red-500/20 text-red-400 border-red-500/50'
                                        }`}>
                                          {strategy.lastSignal.direction === 'LONG' ? '📈' : '📉'} {strategy.lastSignal.direction}
                                        </span>
                                        <span className="text-xs text-gray-400">@ {strategy.lastSignal.price}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-gray-400">{strategy.lastSignal.time}</div>
                                    <div className={`text-xs font-medium mt-1 ${
                                      strategy.lastSignal.direction === 'LONG' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                      {strategy.lastSignal.direction === 'LONG' ? '↗️ Alış' : '↘️ Satış'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Risk Level */}
                            <div className="mb-4 flex items-center justify-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                strategy.riskLevel === 'Düşük' ? 'bg-green-500/20 text-green-400' :
                                strategy.riskLevel === 'Orta' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                🛡️ {strategy.riskLevel} Risk
                              </span>
                            </div>

                            {/* Action buttons */}
                            <div className="grid grid-cols-3 gap-3">
                              <button 
                                className={`bg-gradient-to-r ${gradients[index]} hover:opacity-90 text-white py-3 px-4 rounded-2xl font-medium transition-all duration-300 ${shadowColors[index]} shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2 group`}
                                onClick={(e) => e.preventDefault()}
                              >
                                <span className="group-hover:rotate-180 transition-transform duration-300">🔄</span>
                                <span className="hidden sm:inline">Kopyala</span>
                              </button>
                              <button 
                                className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-2xl font-medium transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center group"
                                onClick={(e) => e.preventDefault()}
                              >
                                <span className="group-hover:scale-110 transition-transform">📊</span>
                                <span className="hidden sm:inline ml-1">Grafik</span>
                              </button>
                              <button 
                                className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-2xl font-medium transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center group"
                                onClick={(e) => e.preventDefault()}
                              >
                                <span className="group-hover:scale-110 transition-transform">🎯</span>
                                <span className="hidden sm:inline ml-1">Analiz</span>
                              </button>
                            </div>

                            {/* Trend line decoration */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Bottom stats bar */}
                <div className="mt-8 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                    <div className="group hover:scale-105 transition-transform cursor-pointer">
                      <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        {topStrategies.reduce((acc, s) => acc + s.followers, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-emerald-400 transition-colors">Toplam Takipçi</div>
                    </div>
                    <div className="group hover:scale-105 transition-transform cursor-pointer">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {topStrategies.reduce((acc, s) => acc + s.metrics.totalTrades, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors">Toplam İşlem</div>
                    </div>
                    <div className="group hover:scale-105 transition-transform cursor-pointer">
                      <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                        {Math.round(topStrategies.reduce((acc, s) => acc + s.metrics.winRate, 0) / topStrategies.length)}%
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-pink-400 transition-colors">Ort. Başarı</div>
                    </div>
                    <div className="group hover:scale-105 transition-transform cursor-pointer">
                      <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        {(topStrategies.reduce((acc, s) => acc + s.metrics.profitFactor, 0) / topStrategies.length).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-yellow-400 transition-colors">Ort. Profit Factor</div>
                    </div>
                    <div className="group hover:scale-105 transition-transform cursor-pointer">
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        24/7
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors">Canlı Takip</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Articles Section */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Son Makaleler</h2>
                  </div>
                  <Link 
                    href="/articles" 
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium flex items-center space-x-1"
                  >
                    <span>Tümü</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {latestArticles.map((article) => (
                    <Link key={article.id} href={`/articles/${article.id}`}>
                      <div className="group bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600">
                        <div className="aspect-video">
                          <img 
                            src={article.image} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs font-medium rounded">
                            {article.category}
                          </span>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mt-2 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>@{article.author}</span>
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h3>
              <div className="space-y-3">
                <Link href="/forum/new" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Yeni Konu Aç
                </Link>
                <Link href="/strategies/new" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Strateji Paylaş
                </Link>
                <Link href="/articles/new" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Makale Yaz
                </Link>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Topluluk İstatistikleri</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Aktif Kullanıcılar</span>
                  <span className="font-bold text-green-600 dark:text-green-400">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Forum Konuları</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">18,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Trading Stratejileri</span>
                  <span className="font-bold text-green-600 dark:text-green-400">1,547</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Makaleler</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">3,691</span>
                </div>
              </div>
            </div>

            {/* Online Users */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Çevrimiçi Kullanıcılar</h3>
              <div className="space-y-3">
                {['TradeMaster', 'CryptoKing', 'ForexPro', 'AnalystAli'].map((user, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{user[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user}</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Çevrimiçi</span>
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
  );
}