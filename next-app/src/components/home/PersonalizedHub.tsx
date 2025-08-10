'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMobileInteractions } from '@/hooks/useMobileInteractions';

interface Recommendation {
  id: string;
  type: 'article' | 'strategy' | 'mentor' | 'course';
  title: string;
  description: string;
  image?: string;
  author?: {
    name: string;
    avatar: string;
  };
  category: string;
  categoryColor: string;
  reason: string;
  link: string;
  metadata?: {
    readTime?: string;
    followers?: number;
    performance?: string;
    progress?: number;
  };
}

interface UserInterest {
  name: string;
  level: number;
  color: string;
}

const PersonalizedHub = () => {
  const { isMobile } = useMobileInteractions();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [readingList, setReadingList] = useState<Recommendation[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Mock data - gerçek AI/ML önerileri gelecek
    const mockRecommendations: Recommendation[] = [
      {
        id: '1',
        type: 'article',
        title: 'Bitcoin Fibonacci Analizi: Kritik Seviyeler',
        description: 'BTC/USD paritesinde Fibonacci düzeltme seviyeleri ve hedef fiyatlar',
        image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=300&h=200&fit=crop',
        author: {
          name: 'Ahmet Yılmaz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet'
        },
        category: 'TEKNİK ANALİZ',
        categoryColor: 'bg-blue-500',
        reason: 'Takip ettiğin Bitcoin analizlerinden',
        link: '/articles/bitcoin-fibonacci',
        metadata: {
          readTime: '8 dk'
        }
      },
      {
        id: '2',
        type: 'strategy',
        title: 'Advanced Scalping Pro',
        description: 'AI destekli kısa vadeli işlem stratejisi',
        author: {
          name: 'Mehmet Öz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet'
        },
        category: 'SCALPING',
        categoryColor: 'bg-green-500',
        reason: 'Risk profilin ve ilgi alanlarına uygun',
        link: '/trading-stratejileri/advanced-scalping',
        metadata: {
          followers: 847,
          performance: '+24% bu ay'
        }
      },
      {
        id: '3',
        type: 'article',
        title: 'DeFi Yield Farming Rehberi 2024',
        description: 'Merkeziyetsiz finansta likidite sağlama ve yield farming stratejileri',
        image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=300&h=200&fit=crop',
        author: {
          name: 'Elif Demir',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elif'
        },
        category: 'KRİPTO',
        categoryColor: 'bg-purple-500',
        reason: 'Kripto makalelerini sık okuyorsun',
        link: '/articles/defi-yield-farming',
        metadata: {
          readTime: '12 dk'
        }
      },
      {
        id: '4',
        type: 'mentor',
        title: 'TradingGuru ile 1:1 Mentoring',
        description: 'Kişiselleştirilmiş trading eğitimi ve portföy analizi',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TradingGuru',
        category: 'MENTORİNG',
        categoryColor: 'bg-orange-500',
        reason: 'Forex alanında gelişmek istiyorsun',
        link: '/mentors/trading-guru',
        metadata: {
          followers: 2341
        }
      }
    ];

    const mockInterests: UserInterest[] = [
      { name: 'Bitcoin', level: 85, color: 'bg-orange-500' },
      { name: 'Forex', level: 72, color: 'bg-blue-500' },
      { name: 'Teknik Analiz', level: 68, color: 'bg-green-500' },
      { name: 'DeFi', level: 45, color: 'bg-purple-500' },
      { name: 'Scalping', level: 38, color: 'bg-red-500' }
    ];

    const mockReadingList: Recommendation[] = [
      {
        id: 'r1',
        type: 'article',
        title: 'EUR/USD Trend Analizi',
        description: 'Haftalık EUR/USD parite analizi...',
        category: 'FOREX',
        categoryColor: 'bg-blue-500',
        reason: 'Kaydettiğin makale',
        link: '/articles/eur-usd-trend',
        metadata: {
          readTime: '5 dk',
          progress: 60
        }
      },
      {
        id: 'r2',
        type: 'article',
        title: 'Altcoin Season Göstergeleri',
        description: 'Alt coin sezonunu önceden tahmin etme yöntemleri...',
        category: 'ALTCOIN',
        categoryColor: 'bg-pink-500',
        reason: 'Daha sonra oku listende',
        link: '/articles/altcoin-season',
        metadata: {
          readTime: '7 dk',
          progress: 0
        }
      }
    ];

    setRecommendations(mockRecommendations);
    setUserInterests(mockInterests);
    setReadingList(mockReadingList);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-6 mb-4 w-48"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
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
          <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-pink-600 rounded-full"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Senin İçin Öneriler
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              İlgi alanlarına ve okuma geçmişine göre
            </p>
          </div>
        </div>
        
        <Link 
          href="/recommendations" 
          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center touch-manipulation"
        >
          <span>Tümü</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* User Interests */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          🎯 İlgi Alanların
        </h3>
        
        <div className="space-y-3">
          {userInterests.map((interest, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {interest.name}
              </span>
              <div className="flex items-center space-x-3 flex-1 max-w-xs ml-4">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${interest.color} transition-all duration-500`}
                    style={{ width: `${interest.level}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 min-w-[35px]">
                  {interest.level}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium">
            İlgi alanlarını güncelle →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Recommendations */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            🤖 AI Önerileri
          </h3>
          
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Link key={rec.id} href={rec.link}>
                <div className="group bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 hover:shadow-lg dark:shadow-gray-900/50">
                  
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div className="flex items-start space-x-3">
                      {rec.image && (
                        <img 
                          src={rec.image}
                          alt={rec.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      {rec.author && !rec.image && (
                        <img 
                          src={rec.author.avatar}
                          alt={rec.author.name}
                          className="w-16 h-16 rounded-lg flex-shrink-0"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${rec.categoryColor}`}>
                            {rec.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {rec.type.toUpperCase()}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {rec.title}
                        </h4>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                          {rec.description}
                        </p>

                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {rec.reason}
                        </div>
                      </div>
                    </div>

                    {/* Mobile metadata */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      {rec.author && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {rec.author.name}
                        </span>
                      )}
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                        {rec.metadata?.readTime && (
                          <span>{rec.metadata.readTime}</span>
                        )}
                        {rec.metadata?.followers && (
                          <span>{rec.metadata.followers} takipçi</span>
                        )}
                        {rec.metadata?.performance && (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {rec.metadata.performance}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:block">
                    <div className="flex items-start space-x-4">
                      {rec.image && (
                        <img 
                          src={rec.image}
                          alt={rec.title}
                          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      {rec.author && !rec.image && (
                        <img 
                          src={rec.author.avatar}
                          alt={rec.author.name}
                          className="w-24 h-24 rounded-lg flex-shrink-0"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 rounded text-sm font-semibold text-white ${rec.categoryColor}`}>
                            {rec.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {rec.type.toUpperCase()}
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {rec.title}
                        </h4>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {rec.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                            💡 {rec.reason}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            {rec.author && (
                              <span>{rec.author.name}</span>
                            )}
                            {rec.metadata?.readTime && (
                              <span>{rec.metadata.readTime}</span>
                            )}
                            {rec.metadata?.followers && (
                              <span>{rec.metadata.followers} takipçi</span>
                            )}
                            {rec.metadata?.performance && (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                {rec.metadata.performance}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Reading List Sidebar */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            📚 Okuma Listem
          </h3>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {readingList.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  📖
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Henüz kaydettiğin makale yok
                </p>
                <button className="mt-3 text-green-600 dark:text-green-400 text-sm font-medium">
                  Makale keşfet
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {readingList.map((item) => (
                  <Link key={item.id} href={item.link}>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${item.categoryColor}`}>
                          {item.category}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2">
                        {item.title}
                      </h4>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                        {item.description}
                      </p>

                      {/* Progress bar */}
                      {item.metadata?.progress !== undefined && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              İlerleme
                            </span>
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {item.metadata.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <div 
                              className="bg-green-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${item.metadata.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{item.reason}</span>
                        {item.metadata?.readTime && (
                          <span>{item.metadata.readTime}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <Link 
                href="/reading-list" 
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium"
              >
                Tüm listeyi gör →
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl p-4">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-sm">
              Hızlı Keşif
            </h4>
            <div className="space-y-2">
              <Link 
                href="/search?q=bitcoin"
                className="block text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                🔍 Bitcoin haberleri
              </Link>
              <Link 
                href="/search?q=forex"
                className="block text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                📈 Forex analizleri
              </Link>
              <Link 
                href="/search?q=altcoin"
                className="block text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                ⚡ Altcoin fırsatları
              </Link>
              <Link 
                href="/forum"
                className="block text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                💬 Aktif konular
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedHub;