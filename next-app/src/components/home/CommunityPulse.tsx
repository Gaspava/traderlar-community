'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMobileInteractions } from '@/hooks/useMobileInteractions';

interface ForumTopic {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  categoryColor: string;
  replies: number;
  views: number;
  lastActivity: string;
  isHot?: boolean;
  isPinned?: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: {
    text: string;
    votes: number;
    percentage: number;
    color: string;
  }[];
  totalVotes: number;
  endsAt: string;
}

interface QA {
  id: string;
  question: string;
  answer: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
  };
  likes: number;
  replies: number;
  isAnswered: boolean;
}

const CommunityPulse = () => {
  const { isMobile } = useMobileInteractions();
  const [hotTopics, setHotTopics] = useState<ForumTopic[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [topQAs, setTopQAs] = useState<QA[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Mock data - gerçek API'dan gelecek
    const mockHotTopics: ForumTopic[] = [
      {
        id: '1',
        title: 'Bitcoin ETF onayı ne zaman gelecek?',
        description: 'SEC\'nin Bitcoin ETF başvurularını değerlendirme süreci hakkında güncel bilgiler paylaşalım...',
        author: {
          name: 'CryptoExpert',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoExpert'
        },
        category: 'KRİPTO',
        categoryColor: 'bg-purple-500',
        replies: 89,
        views: 1247,
        lastActivity: '2 dk önce',
        isHot: true
      },
      {
        id: '2',
        title: 'Fed faiz kararı sonrası EUR/USD analizi',
        description: 'FOMC toplantısı sonrası EUR/USD paritesinde beklenen hareketleri tartışalım...',
        author: {
          name: 'ForexPro',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ForexPro'
        },
        category: 'FOREX',
        categoryColor: 'bg-blue-500',
        replies: 156,
        views: 2341,
        lastActivity: '5 dk önce',
        isHot: true,
        isPinned: true
      },
      {
        id: '3',
        title: 'Altcoin season yaklaşıyor mu?',
        description: 'Bitcoin dominansındaki düşüş altcoin rally\'si için işaret mi?',
        author: {
          name: 'AltcoinHunter',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AltcoinHunter'
        },
        category: 'ALTCOIN',
        categoryColor: 'bg-pink-500',
        replies: 67,
        views: 934,
        lastActivity: '12 dk önce',
        isHot: true
      }
    ];

    const mockPoll: Poll = {
      id: '1',
      question: 'Bu hafta hangi coin en çok yükselecek?',
      options: [
        { text: 'Bitcoin (BTC)', votes: 234, percentage: 45, color: 'bg-orange-500' },
        { text: 'Ethereum (ETH)', votes: 167, percentage: 32, color: 'bg-blue-500' },
        { text: 'Solana (SOL)', votes: 120, percentage: 23, color: 'bg-purple-500' }
      ],
      totalVotes: 521,
      endsAt: '2 gün kaldı'
    };

    const mockQAs: QA[] = [
      {
        id: '1',
        question: 'Stop-loss seviyesi nasıl belirlenir?',
        answer: 'Stop-loss belirleme için üç ana yöntem var: 1) ATR (Average True Range) kullanarak volatiliteye göre, 2) Destek/direnç seviyelerine göre, 3) Sermayenin belirli bir yüzdesine göre...',
        author: {
          name: 'Mehmet Öz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet',
          badge: '⭐ Uzman'
        },
        likes: 78,
        replies: 23,
        isAnswered: true
      },
      {
        id: '2',
        question: 'DCA stratejisi nasıl uygulanır?',
        answer: 'Dollar Cost Averaging (DCA) stratejisi, düzenli aralıklarla sabit miktarda yatırım yapma yöntemidir. Bu strateji piyasa volatilitesini minimize eder ve ortalama maliyeti düşürür...',
        author: {
          name: 'Elif Demir',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elif',
          badge: '💎 Mentor'
        },
        likes: 92,
        replies: 34,
        isAnswered: true
      },
      {
        id: '3',
        question: 'Leverage kullanırken dikkat edilecek noktalar neler?',
        answer: 'Leverage kullanımında en önemli faktörler: Risk yönetimi, position sizing, emotional control ve market analysis. Kesinlikle kaybedebileceğinizden fazlasını riske atmayın...',
        author: {
          name: 'Ahmet Yılmaz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet',
          badge: '🚀 Pro'
        },
        likes: 156,
        replies: 67,
        isAnswered: true
      }
    ];

    setHotTopics(mockHotTopics);
    setActivePoll(mockPoll);
    setTopQAs(mockQAs);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-6 mb-4 w-48"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24"></div>
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
          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Topluluktan Canlı
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              En aktif konular ve sorular
            </p>
          </div>
        </div>
        
        <Link 
          href="/forum" 
          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center touch-manipulation"
        >
          <span>Forum</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Left Column - Hot Topics & Poll */}
        <div className="space-y-6">
          
          {/* Hot Topics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                🔥 Hot Topics
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{hotTopics.length} konu</span>
            </div>

            <div className="space-y-4">
              {hotTopics.map((topic) => (
                <Link key={topic.id} href={`/forum/topic/${topic.id}`}>
                  <div className="group hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {topic.isPinned && <span className="text-green-500">📌</span>}
                          {topic.isHot && <span className="text-red-500">🔥</span>}
                          <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${topic.categoryColor}`}>
                            {topic.category}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-1">
                          {topic.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                          {topic.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {topic.replies}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {topic.views}
                        </span>
                      </div>
                      <span>{topic.lastActivity}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Link 
                href="/forum" 
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium"
              >
                Tüm konuları gör →
              </Link>
            </div>
          </div>

          {/* Active Poll */}
          {activePoll && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  📊 Aktif Anket
                </h3>
                <span className="text-sm text-red-500 font-medium">{activePoll.endsAt}</span>
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {activePoll.question}
              </h4>

              <div className="space-y-3">
                {activePoll.options.map((option, index) => (
                  <div key={index} className="group cursor-pointer" onClick={() => {
                    // Voting logic would go here
                  }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {option.text}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {option.percentage}%
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full ${option.color} rounded-full transition-all duration-500 group-hover:brightness-110`}
                          style={{ width: `${option.percentage}%` }}
                        />
                      </div>
                      <div className="absolute right-2 top-0 text-xs text-white font-medium leading-3">
                        {option.votes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Toplam {activePoll.totalVotes} oy
                </span>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation">
                  Oy Ver
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Q&A */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
              💡 Soru-Cevap
            </h3>
            <Link 
              href="/forum/ask"
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium"
            >
              Soru Sor
            </Link>
          </div>

          <div className="space-y-6">
            {topQAs.map((qa) => (
              <div key={qa.id} className="group">
                <div className="flex items-start space-x-3">
                  <img 
                    src={qa.author.avatar} 
                    alt={qa.author.name}
                    className="w-10 h-10 rounded-full flex-shrink-0 mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{qa.author.name}</span>
                      {qa.author.badge && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          {qa.author.badge}
                        </span>
                      )}
                      {qa.isAnswered && (
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                          ✓ Cevaplandı
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">
                        {qa.question}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {qa.answer}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <button className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {qa.likes}
                      </button>
                      <button className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {qa.replies}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex space-x-3">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors touch-manipulation">
              Soru Sor
            </button>
            <button className="flex-1 border border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-lg font-medium transition-colors touch-manipulation">
              Tüm S-C
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPulse;