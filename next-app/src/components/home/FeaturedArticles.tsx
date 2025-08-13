'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMobileInteractions } from '@/hooks/useMobileInteractions';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  categoryColor: string;
  publishedAt: string;
  readTime: string;
  likes: number;
  comments: number;
  performance?: string;
  trending?: boolean;
}

const FeaturedArticles = () => {
  const { isMobile } = useMobileInteractions();
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Mock data - gercek API'dan gelecek
    const mockArticles: Article[] = [
      {
        id: '1',
        title: 'Bitcoin 50.000$ Hedefine Kosuyor: Teknik Analiz',
        excerpt: 'Son gunlerin en cok konusulan analizi. Bitcoin\'in yukselis trendindeki hedef seviyeleri ve kritik destek direncler...',
        image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=400&fit=crop',
        author: {
          name: 'Ahmet Yilmaz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet'
        },
        category: 'FOREX',
        categoryColor: 'bg-blue-500',
        publishedAt: '2 saat once',
        readTime: '5 dk',
        likes: 234,
        comments: 47,
        performance: '+%12 kazandi',
        trending: true
      },
      {
        id: '2',
        title: 'EUR/USD Paritesi: Haftalik Analiz',
        excerpt: 'Avrupa Merkez Bankasi kararlari sonrasi EUR/USD paritesinde beklenen hareketler...',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&h=300&fit=crop',
        author: {
          name: 'Mehmet Oz',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet'
        },
        category: 'TEKNIK ANALIZ',
        categoryColor: 'bg-green-500',
        publishedAt: '4 saat once',
        readTime: '3 dk',
        likes: 156,
        comments: 23,
        performance: '+%8 kazandi'
      },
      {
        id: '3',
        title: 'Altin Fiyatlari: Fed Kararlari Oncesi',
        excerpt: 'Fed faiz karari oncesi altin yatirimcilarinin bilmesi gerekenler ve firsat alanlari...',
        image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=500&h=300&fit=crop',
        author: {
          name: 'Elif Demir',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elif'
        },
        category: 'EMTIA',
        categoryColor: 'bg-yellow-500',
        publishedAt: '6 saat once',
        readTime: '4 dk',
        likes: 89,
        comments: 15,
        performance: '+%5 kazandi'
      }
    ];

    setArticles(mockArticles);
    setFeaturedArticle(mockArticles[0]);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-80 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48"></div>
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
          <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gunun One Cikan Makaleleri
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Topluluktan en cok begenilen analizler
            </p>
          </div>
        </div>
        
        <Link 
          href="/makaleler" 
          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center touch-manipulation"
        >
          <span>Tumu</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Featured Article - Large Card */}
      {featuredArticle && (
        <div className="mb-6 sm:mb-8">
          <Link href={`/makaleler/${featuredArticle.id}`}>
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-gray-900/50 transition-all duration-300 border border-gray-100 dark:border-gray-700">
              
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={featuredArticle.image} 
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Mobile badges */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${featuredArticle.categoryColor}`}>
                      {featuredArticle.category}
                    </span>
                    {featuredArticle.trending && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500 text-white animate-pulse">
                        🔥 TREND
                      </span>
                    )}
                  </div>

                  {/* Mobile performance */}
                  {featuredArticle.performance && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                      {featuredArticle.performance}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {featuredArticle.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {featuredArticle.excerpt}
                  </p>

                  {/* Author info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={featuredArticle.author.avatar} 
                        alt={featuredArticle.author.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{featuredArticle.author.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{featuredArticle.publishedAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {featuredArticle.likes}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {featuredArticle.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex">
                <div className="flex-1 p-6 lg:p-8">
                  {/* Desktop badges */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${featuredArticle.categoryColor}`}>
                      {featuredArticle.category}
                    </span>
                    {featuredArticle.trending && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white animate-pulse">
                        🔥 TRENDING
                      </span>
                    )}
                    {featuredArticle.performance && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                        {featuredArticle.performance}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {featuredArticle.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 text-base lg:text-lg">
                    {featuredArticle.excerpt}
                  </p>

                  {/* Author info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={featuredArticle.author.avatar} 
                        alt={featuredArticle.author.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{featuredArticle.author.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{featuredArticle.publishedAt} • {featuredArticle.readTime} okuma</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {featuredArticle.likes}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {featuredArticle.comments}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-3 mt-6">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors touch-manipulation">
                      Hemen Oku
                    </button>
                    <button className="border border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg font-medium transition-colors touch-manipulation">
                      Portfoye Ekle
                    </button>
                  </div>
                </div>

                <div className="w-80 lg:w-96 relative overflow-hidden">
                  <img 
                    src={featuredArticle.image} 
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10 dark:to-gray-800/10" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Other Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {articles.slice(1).map((article) => (
          <Link key={article.id} href={`/makaleler/${article.id}`}>
            <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg dark:shadow-gray-900/50 transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${article.categoryColor}`}>
                    {article.category}
                  </span>
                </div>

                {article.performance && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                    {article.performance}
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-sm sm:text-base group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                {/* Author info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <img 
                      src={article.author.avatar} 
                      alt={article.author.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mr-2.5 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{article.author.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{article.publishedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {article.likes}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {article.comments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturedArticles;