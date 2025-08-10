'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMobileInteractions } from '@/hooks/useMobileInteractions';

interface Strategy {
  id: string;
  name: string;
  description: string;
  author: {
    name: string;
    avatar: string;
  };
  performance: {
    weekly: string;
    monthly: string;
    winRate: number;
  };
  followers: number;
  category: string;
  categoryColor: string;
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
  minInvestment: string;
  lastSignal?: {
    asset: string;
    direction: 'LONG' | 'SHORT';
    price: string;
    time: string;
  };
  isLive?: boolean;
}

const StrategyFeed = () => {
  const { isMobile } = useMobileInteractions();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Mock data - gerçek API'dan gelecek
    const mockStrategies: Strategy[] = [
      {
        id: '1',
        name: 'Scalping Pro Stratejisi',
        description: 'Kısa vadeli işlemler için optimize edilmiş yüksek frekanslı trading stratejisi. M1 ve M5 zaman dilimlerinde çalışır.',
        author: {
          name: 'Ahmet Yılmaz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet'
        },
        performance: {
          weekly: '+18%',
          monthly: '+67%',
          winRate: 74
        },
        followers: 1247,
        category: 'SCALPING',
        categoryColor: 'bg-green-500',
        riskLevel: 'Yüksek',
        minInvestment: '500$',
        lastSignal: {
          asset: 'EUR/USD',
          direction: 'LONG',
          price: '1.0895',
          time: '2 dk önce'
        },
        isLive: true
      },
      {
        id: '2',
        name: 'Swing Trading Stratejisi',
        description: 'Orta vadeli trend takip stratejisi. H4 ve D1 zaman dilimlerinde güçlü trend sinyalleri verir.',
        author: {
          name: 'Mehmet Öz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet'
        },
        performance: {
          weekly: '+8%',
          monthly: '+34%',
          winRate: 68
        },
        followers: 834,
        category: 'SWING',
        categoryColor: 'bg-blue-500',
        riskLevel: 'Orta',
        minInvestment: '1000$',
        lastSignal: {
          asset: 'BTC/USDT',
          direction: 'SHORT',
          price: '43,250',
          time: '15 dk önce'
        },
        isLive: true
      },
      {
        id: '3',
        name: 'DCA Bot Stratejisi',
        description: 'Otomatik dollar cost averaging stratejisi. Kripto portföyü için düzenli alım yapar.',
        author: {
          name: 'Elif Demir',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elif'
        },
        performance: {
          weekly: '-3%',
          monthly: '+12%',
          winRate: 82
        },
        followers: 567,
        category: 'DCA',
        categoryColor: 'bg-purple-500',
        riskLevel: 'Düşük',
        minInvestment: '250$',
        isLive: false
      },
      {
        id: '4',
        name: 'Momentum Breakout',
        description: 'Kırılım noktalarında momentum yakalayan strateji. Volatilite artışlarından yararlanır.',
        author: {
          name: 'Ahmet Yılmaz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet'
        },
        performance: {
          weekly: '+12%',
          monthly: '+45%',
          winRate: 71
        },
        followers: 923,
        category: 'MOMENTUM',
        categoryColor: 'bg-orange-500',
        riskLevel: 'Yüksek',
        minInvestment: '750$',
        lastSignal: {
          asset: 'GOLD',
          direction: 'LONG',
          price: '2,078',
          time: '1 saat önce'
        },
        isLive: true
      }
    ];

    setStrategies(mockStrategies);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-6 mb-4 w-48"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Düşük': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Orta': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'Yüksek': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="mb-8 sm:mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Canlı Strateji Performansları
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {strategies.filter(s => s.isLive).length} strateji şu anda aktif
            </p>
          </div>
        </div>
        
        <Link 
          href="/trading-stratejileri" 
          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center touch-manipulation"
        >
          <span>Tümü</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Strategies Grid */}
      <div className="space-y-4 sm:space-y-6">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="group">
            <Link href={`/trading-stratejileri/${strategy.id}`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 hover:shadow-lg dark:shadow-gray-900/50">
                
                {/* Mobile Layout */}
                <div className="block sm:hidden space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${strategy.categoryColor}`}>
                          {strategy.category}
                        </span>
                        {strategy.isLive && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500 text-white animate-pulse">
                            🔴 CANLI
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {strategy.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {strategy.description}
                      </p>
                    </div>
                    
                    {/* Performance badge */}
                    <div className="flex-shrink-0 ml-3">
                      <div className={`px-3 py-2 rounded-lg text-center ${
                        strategy.performance.weekly.startsWith('+') 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <div className={`text-lg font-bold ${
                          strategy.performance.weekly.startsWith('+') 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {strategy.performance.weekly}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">haftalık</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">%{strategy.performance.winRate}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">başarı</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{strategy.followers}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">takipçi</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{strategy.minInvestment}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">min</div>
                    </div>
                  </div>

                  {/* Author and last signal */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={strategy.author.avatar} 
                        alt={strategy.author.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{strategy.author.name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(strategy.riskLevel)}`}>
                          {strategy.riskLevel} Risk
                        </span>
                      </div>
                    </div>

                    {strategy.lastSignal && (
                      <div className="text-right">
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {strategy.lastSignal.asset} {strategy.lastSignal.direction}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {strategy.lastSignal.time}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    <button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors touch-manipulation"
                      onClick={(e) => e.preventDefault()}
                    >
                      Kopyala
                    </button>
                    <button 
                      className="flex-1 border border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors touch-manipulation"
                      onClick={(e) => e.preventDefault()}
                    >
                      Detaylar
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block">
                  <div className="flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex-1 min-w-0 mr-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${strategy.categoryColor}`}>
                          {strategy.category}
                        </span>
                        {strategy.isLive && (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white animate-pulse">
                            🔴 CANLI
                          </span>
                        )}
                        <span className={`text-sm px-2.5 py-1 rounded-full ${getRiskColor(strategy.riskLevel)}`}>
                          {strategy.riskLevel} Risk
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {strategy.name}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {strategy.description}
                      </p>

                      {/* Author */}
                      <div className="flex items-center">
                        <img 
                          src={strategy.author.avatar} 
                          alt={strategy.author.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{strategy.author.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{strategy.followers} takipçi</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Section */}
                    <div className="flex items-center space-x-6">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            strategy.performance.weekly.startsWith('+') 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {strategy.performance.weekly}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Bu hafta</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            %{strategy.performance.winRate}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Başarı oranı</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {strategy.minInvestment}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Min. yatırım</div>
                        </div>
                      </div>

                      {/* Last Signal */}
                      {strategy.lastSignal && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-[120px]">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Son Sinyal</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {strategy.lastSignal.asset}
                          </div>
                          <div className={`text-sm font-semibold ${
                            strategy.lastSignal.direction === 'LONG' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {strategy.lastSignal.direction} @ {strategy.lastSignal.price}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{strategy.lastSignal.time}</div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-col space-y-2 min-w-[120px]">
                        <button 
                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors touch-manipulation"
                          onClick={(e) => e.preventDefault()}
                        >
                          🔄 Kopyala
                        </button>
                        <button 
                          className="border border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors touch-manipulation"
                          onClick={(e) => e.preventDefault()}
                        >
                          📊 Detaylar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Bottom stats */}
      <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-xl p-4 sm:p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            Topluluk İstatistikleri
          </h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {strategies.reduce((acc, s) => acc + s.followers, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Toplam takipçi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {strategies.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Aktif strateji</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(strategies.reduce((acc, s) => acc + s.performance.winRate, 0) / strategies.length)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ort. başarı</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {strategies.filter(s => s.isLive).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Canlı sinyal</div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link 
            href="/trading-stratejileri/new"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white py-2.5 px-6 rounded-lg font-medium transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Kendi Stratejini Paylaş
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StrategyFeed;