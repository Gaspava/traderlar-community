'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMobileInteractions } from '@/hooks/useMobileInteractions';

interface SocialActivity {
  id: string;
  type: 'trade_share' | 'article_share' | 'live_analysis' | 'achievement' | 'strategy_update';
  user: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
    badge?: string;
  };
  content: {
    text: string;
    asset?: string;
    direction?: 'LONG' | 'SHORT';
    price?: string;
    profit?: string;
    link?: string;
    image?: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
  timestamp: string;
  isLive?: boolean;
}

const SocialActivityFeed = () => {
  const { isMobile } = useMobileInteractions();
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Mock data - gerçek API'dan gelecek
    const mockActivities: SocialActivity[] = [
      {
        id: '1',
        type: 'trade_share',
        user: {
          name: 'TraderAli',
          username: '@traderali',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TraderAli',
          verified: true,
          badge: '🏆 Pro'
        },
        content: {
          text: 'EURUSD long pozisyonumdan çıktım',
          asset: 'EUR/USD',
          direction: 'LONG',
          price: '1.0895',
          profit: '+%5.2'
        },
        engagement: {
          likes: 23,
          comments: 8,
          shares: 12,
          views: 147
        },
        timestamp: '2 dk önce'
      },
      {
        id: '2',
        type: 'article_share',
        user: {
          name: 'Elif Crypto',
          username: '@elifcrypto',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ElifCrypto',
          verified: true,
          badge: '💎 Mentor'
        },
        content: {
          text: 'Yeni DeFi makalem yayında! "2024\'te DeFi Trendleri ve Fırsatlar" 👇',
          link: '/articles/defi-trends-2024',
          image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop'
        },
        engagement: {
          likes: 45,
          comments: 15,
          shares: 8,
          views: 234
        },
        timestamp: '5 dk önce'
      },
      {
        id: '3',
        type: 'live_analysis',
        user: {
          name: 'Mehmet Öz',
          username: '@mehmetoz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MehmetOz',
          verified: true,
          badge: '⚡ Expert'
        },
        content: {
          text: 'Canlı analiz: 15:30\'da YouTube\'da Bitcoin teknik analizi yapacağım. Önemli seviyeler ve hedefler hakkında konuşacağız 📺',
          asset: 'BTC/USD',
          link: 'https://youtube.com/watch?v=example'
        },
        engagement: {
          likes: 67,
          comments: 23,
          shares: 34,
          views: 412
        },
        timestamp: '8 dk önce',
        isLive: true
      },
      {
        id: '4',
        type: 'achievement',
        user: {
          name: 'YeniTrader',
          username: '@yenitrader',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YeniTrader'
        },
        content: {
          text: 'İlk 100$ karımı elde ettim! 🎉 3 haftalık çalışmanın meyvesi. Teşekkürler @mentorlar',
          profit: '+$127.50'
        },
        engagement: {
          likes: 89,
          comments: 34,
          shares: 12,
          views: 203
        },
        timestamp: '12 dk önce'
      },
      {
        id: '5',
        type: 'strategy_update',
        user: {
          name: 'Ahmet Yılmaz',
          username: '@ahmetyilmaz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet',
          verified: true,
          badge: '🚀 Master'
        },
        content: {
          text: 'Scalping stratejimde güncelleme yaptım. Yeni AI destekli sinyaller eklendi. Bu hafta +%18 performans 📈',
          link: '/trading-stratejileri/scalping-pro'
        },
        engagement: {
          likes: 156,
          comments: 45,
          shares: 28,
          views: 567
        },
        timestamp: '15 dk önce'
      },
      {
        id: '6',
        type: 'trade_share',
        user: {
          name: 'CryptoQueen',
          username: '@cryptoqueen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoQueen',
          badge: '👑 VIP'
        },
        content: {
          text: 'SOL short pozisyonu kapatıldı',
          asset: 'SOL/USDT',
          direction: 'SHORT',
          price: '$98.45',
          profit: '+%3.8'
        },
        engagement: {
          likes: 34,
          comments: 12,
          shares: 6,
          views: 98
        },
        timestamp: '18 dk önce'
      }
    ];

    setActivities(mockActivities);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade_share': return '💰';
      case 'article_share': return '📝';
      case 'live_analysis': return '📺';
      case 'achievement': return '🏆';
      case 'strategy_update': return '📊';
      default: return '💬';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'trade_share': return 'border-l-green-500';
      case 'article_share': return 'border-l-blue-500';
      case 'live_analysis': return 'border-l-red-500';
      case 'achievement': return 'border-l-yellow-500';
      case 'strategy_update': return 'border-l-purple-500';
      default: return 'border-l-gray-500';
    }
  };

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

  return (
    <div className="mb-8 sm:mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Günün Aktiviteleri
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Topluluktan son paylaşımlar
            </p>
          </div>
        </div>
        
        <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center touch-manipulation">
          <span>Tümü</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {activities.map((activity) => (
            <div key={activity.id} className={`p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4 ${getActivityColor(activity.type)}`}>
              
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={activity.user.avatar} 
                      alt={activity.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="absolute -top-1 -right-1 text-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    {activity.isLive && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {activity.user.name}
                      </span>
                      {activity.user.verified && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {activity.user.badge && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          {activity.user.badge}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp}
                      </span>
                    </div>

                    <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                      {activity.content.text}
                    </p>

                    {/* Trade Info */}
                    {activity.content.asset && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {activity.content.asset}
                            </span>
                            {activity.content.direction && (
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                activity.content.direction === 'LONG' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {activity.content.direction}
                              </span>
                            )}
                          </div>
                          {activity.content.profit && (
                            <span className={`font-bold text-sm ${
                              activity.content.profit.startsWith('+') 
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {activity.content.profit}
                            </span>
                          )}
                        </div>
                        {activity.content.price && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            @ {activity.content.price}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Article Preview */}
                    {activity.content.image && (
                      <div className="mb-2">
                        <img 
                          src={activity.content.image}
                          alt="Article preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Engagement */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <button className="flex items-center hover:text-red-500 transition-colors">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {activity.engagement.likes}
                        </button>
                        <button className="flex items-center hover:text-blue-500 transition-colors">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {activity.engagement.comments}
                        </button>
                        <button className="flex items-center hover:text-green-500 transition-colors">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          {activity.engagement.shares}
                        </button>
                      </div>
                      {activity.engagement.views && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {activity.engagement.views} görüntüleme
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={activity.user.avatar} 
                      alt={activity.user.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="absolute -top-1 -right-1 text-xl">
                      {getActivityIcon(activity.type)}
                    </div>
                    {activity.isLive && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {activity.user.name}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {activity.user.username}
                      </span>
                      {activity.user.verified && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {activity.user.badge && (
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {activity.user.badge}
                        </span>
                      )}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        • {activity.timestamp}
                      </span>
                    </div>

                    <p className="text-gray-900 dark:text-gray-100 mb-3">
                      {activity.content.text}
                    </p>

                    {/* Trade Info */}
                    {activity.content.asset && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3 max-w-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {activity.content.asset}
                            </span>
                            {activity.content.direction && (
                              <span className={`px-2.5 py-1 rounded text-sm font-semibold ${
                                activity.content.direction === 'LONG' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {activity.content.direction}
                              </span>
                            )}
                          </div>
                          {activity.content.profit && (
                            <span className={`font-bold ${
                              activity.content.profit.startsWith('+') 
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {activity.content.profit}
                            </span>
                          )}
                        </div>
                        {activity.content.price && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            @ {activity.content.price}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Article Preview */}
                    {activity.content.image && (
                      <div className="mb-3 max-w-lg">
                        <img 
                          src={activity.content.image}
                          alt="Article preview"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Engagement */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {activity.engagement.likes}
                        </button>
                        <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {activity.engagement.comments}
                        </button>
                        <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          {activity.engagement.shares}
                        </button>
                      </div>
                      {activity.engagement.views && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.engagement.views} görüntüleme
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 text-center">
          <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors">
            Daha Fazla Yükle
          </button>
        </div>
      </div>

      {/* Share Your Own */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-xl p-4 sm:p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          Sen de Paylaş!
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
          Trading başarılarını, analizlerini ve deneyimlerini toplulukla paylaş
        </p>
        <button className="bg-green-600 hover:bg-green-700 text-white py-2.5 px-6 rounded-lg font-medium transition-colors touch-manipulation">
          Kendi Paylaşımını Yap
        </button>
      </div>
    </div>
  );
};

export default SocialActivityFeed;