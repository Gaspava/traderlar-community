'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  MessageCircle,
  Eye,
  Flame,
  Sparkles,
  Star,
  TrendingUp,
  Share,
  MoreHorizontal,
  Loader2,
  ArrowUp,
  ArrowDown,
  Clock,
  Download,
  Heart,
  BookOpen,
  Menu,
  X
} from 'lucide-react';
import VoteButtons from '@/components/ui/VoteButtons';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { FeedContent, FeedResponse, SortOption, ContentType, CONTENT_TYPE_CONFIG } from '@/types/feedContent';
import { InContentAd, LeaderboardAd, DEFAULT_AD_CONFIG } from '@/components/ads';
import RecentItems from '@/components/RecentItems';
import HomeSidebar from '@/components/home/HomeSidebar';

interface FeedPageState {
  content: (FeedContent | { type: 'ad'; id: string })[];
  loading: boolean;
  page: number;
  hasMore: boolean;
  totalCount: number;
  sortBy: SortOption;
  contentFilter: ContentType | 'all';
  mounted: boolean;
  currentTheme: string;
  isMobileSidebarOpen: boolean;
}

export default function HomePage() {
  const [state, setState] = useState<FeedPageState>({
    content: [],
    loading: true,
    page: 1,
    hasMore: true,
    totalCount: 0,
    sortBy: 'hot',
    contentFilter: 'all',
    mounted: false,
    currentTheme: 'dark',
    isMobileSidebarOpen: false
  });

  const { theme } = useTheme();
  const router = useRouter();

  // Theme detection
  useEffect(() => {
    const detectTheme = () => {
      if (typeof window !== 'undefined') {
        const htmlClassList = document.documentElement.classList;
        const isDark = htmlClassList.contains('dark');
        const computedStyle = getComputedStyle(document.documentElement);
        const bgColor = computedStyle.getPropertyValue('background-color');
        
        const themeFromStorage = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let detectedTheme = 'light';
        
        if (isDark || bgColor === 'rgb(3, 7, 18)' || bgColor === 'rgb(9, 9, 11)') {
          detectedTheme = 'dark';
        } else if (themeFromStorage === 'dark' || (themeFromStorage === 'auto' && systemDark)) {
          detectedTheme = 'dark';
        }
        
        setState(prev => ({ ...prev, currentTheme: detectedTheme }));
      }
    };
    
    detectTheme();
    setState(prev => ({ ...prev, mounted: true }));
    
    const observer = new MutationObserver(detectTheme);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
    }
    
    return () => observer.disconnect();
  }, [theme]);

  const isDarkMode = state.currentTheme === 'dark';

  // Initial load
  useEffect(() => {
    if (state.mounted) {
      fetchContent(1, true);
    }
  }, [state.mounted]);

  // Refetch when sort or filter changes
  useEffect(() => {
    if (state.mounted) {
      setState(prev => ({ ...prev, page: 1, content: [] }));
      fetchContent(1, true);
    }
  }, [state.sortBy, state.contentFilter]);

  const fetchContent = async (pageNum: number = state.page, reset: boolean = false) => {
    if (reset) {
      setState(prev => ({ ...prev, loading: true }));
    }

    try {
      const response = await fetch(
        `/api/feed?page=${pageNum}&limit=10&sort=${state.sortBy}&type=${state.contentFilter}`
      );
      const data: FeedResponse = await response.json();
      
      if (data.content) {
        const contentWithAds = insertAds(data.content, pageNum > 1);
        
        if (reset) {
          setState(prev => ({
            ...prev,
            content: contentWithAds,
            hasMore: data.hasMore,
            totalCount: data.totalCount,
            page: pageNum
          }));
        } else {
          setState(prev => ({
            ...prev,
            content: [...prev.content, ...contentWithAds],
            hasMore: data.hasMore,
            totalCount: data.totalCount,
            page: pageNum
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      
      // Fallback to mock data
      if (reset && state.content.length === 0) {
        const mockContent = getMockContent();
        const contentWithAds = insertAds(mockContent);
        setState(prev => ({
          ...prev,
          content: contentWithAds,
          hasMore: false,
          totalCount: mockContent.length
        }));
      }
      
      setState(prev => ({ ...prev, hasMore: false }));
    } finally {
      if (reset) {
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  };

  const insertAds = (content: FeedContent[], skipFirst: boolean = false): (FeedContent | { type: 'ad'; id: string })[] => {
    const result: (FeedContent | { type: 'ad'; id: string })[] = [];
    
    content.forEach((item, index) => {
      result.push(item);
      // Insert ad after every 5 posts, but not at the very beginning if it's the first page
      if ((index + 1) % 5 === 0 && !(index === 4 && skipFirst === false)) {
        result.push({
          type: 'ad' as const,
          id: `ad-${Date.now()}-${index}`
        });
      }
    });

    return result;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'şimdi';
    if (diffInHours < 24) return `${diffInHours}s`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}g`;
    return date.toLocaleDateString('tr-TR').split('.').slice(0, 2).join('.');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const loadMore = useCallback(async () => {
    if (!state.hasMore) return;
    await fetchContent(state.page + 1, false);
  }, [state.page, state.hasMore, state.sortBy, state.contentFilter]);

  const { setTargetRef, isLoading } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: state.hasMore,
    enabled: !state.loading && state.hasMore
  });

  if (!state.mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* Homepage Sidebar */}
      <HomeSidebar 
        activeSection="home" 
        isMobileOpen={state.isMobileSidebarOpen}
        onMobileClose={() => setState(prev => ({ ...prev, isMobileSidebarOpen: false }))}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setState(prev => ({ ...prev, isMobileSidebarOpen: true }))}
        className={`fixed top-20 left-4 z-30 p-2 rounded-lg md:hidden transition-colors ${
          isDarkMode 
            ? 'bg-card border border-border text-foreground hover:bg-muted' 
            : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Main Content with Left Margin for Fixed Sidebar */}
      <div className="md:ml-60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-8 pt-24 md:pt-8">
        {/* Top Banner Ad */}
        <div className="w-full border-b border-gray-200 dark:border-border bg-white dark:bg-card relative z-40 mb-6">
          <div className="max-w-7xl mx-auto py-4">
            <LeaderboardAd adSlot={DEFAULT_AD_CONFIG.adSlots.homepageTop} />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-8">
          {/* Main Feed */}
          <div className="flex-1 max-w-[800px] space-y-6">
            {/* Filter Tabs */}
            <div className={`flex items-center gap-4 mb-4 ${
              isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                {[
                  { value: 'hot', label: 'Popüler', icon: Flame },
                  { value: 'new', label: 'Yeni', icon: Sparkles },
                  { value: 'top', label: 'En İyi', icon: Star }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setState(prev => ({ ...prev, sortBy: value as SortOption }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      state.sortBy === value
                        ? (isDarkMode ? 'bg-primary text-primary-foreground' : 'bg-primary text-white')
                        : (isDarkMode ? 'text-muted-foreground hover:text-foreground hover:bg-muted' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content Type Filter */}
              <div className="ml-auto flex items-center gap-2">
                {[
                  { value: 'all', label: 'Tümü' },
                  { value: 'forum', label: 'Tartışma' },
                  { value: 'article', label: 'Makale' },
                  { value: 'strategy', label: 'Strateji' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setState(prev => ({ ...prev, contentFilter: value as ContentType | 'all' }))}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      state.contentFilter === value
                        ? (isDarkMode ? 'bg-muted text-foreground' : 'bg-gray-200 text-gray-900')
                        : (isDarkMode ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100')
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed Content */}
            <div className="space-y-2">
              {state.loading ? (
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <FeedItemSkeleton key={i} isDarkMode={isDarkMode} />
                  ))}
                </div>
              ) : (
                <>
                  {state.content.map((item, index) => {
                    if (item.type === 'ad') {
                      return (
                        <div key={item.id} className={`rounded-lg border p-4 ${
                          isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
                        }`}>
                          <InContentAd 
                            adSlot={DEFAULT_AD_CONFIG.adSlots.homepageMiddle} 
                            preferLarge={true}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <FeedItem 
                          key={item.id}
                          content={item as FeedContent}
                          isDarkMode={isDarkMode}
                          formatDate={formatDate}
                          formatNumber={formatNumber}
                        />
                      );
                    }
                  })}

                  {/* Loading more indicator */}
                  {isLoading && !state.loading && (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <FeedItemSkeleton key={`loading-${i}`} isDarkMode={isDarkMode} />
                      ))}
                    </div>
                  )}

                  {/* Infinite Scroll Trigger */}
                  {state.hasMore && (
                    <div 
                      ref={setTargetRef}
                      className="py-4"
                    >
                      {!isLoading && <div className="h-10" />}
                    </div>
                  )}

                  {!state.hasMore && state.content.length > 0 && (
                    <div className="text-center py-8">
                      <p className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-500'}`}>
                        Tüm içerik yüklendi ({state.totalCount} öğe)
                      </p>
                    </div>
                  )}

                  {state.content.length === 0 && !state.loading && (
                    <div className="text-center py-12">
                      <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${
                        isDarkMode ? 'text-muted-foreground' : 'text-gray-400'
                      }`} />
                      <h3 className={`text-lg font-medium mb-2 ${
                        isDarkMode ? 'text-foreground' : 'text-gray-900'
                      }`}>Henüz içerik yok</h3>
                      <p className={`mb-4 ${
                        isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                      }`}>Yakında yeni içerikler eklenecek!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-8 space-y-6">
              {/* Recent Items */}
              <RecentItems />
              
              {/* Sidebar Ad */}
              <div className={`rounded-xl border p-6 ${
                isDarkMode 
                  ? 'bg-card/50 border-border/50' 
                  : 'bg-white/70 border-gray-200/50'
              }`}>
                <InContentAd 
                  adSlot={DEFAULT_AD_CONFIG.adSlots.homepageSidebar}
                  preferLarge={false}
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

// Feed Item Component
function FeedItem({ 
  content, 
  isDarkMode, 
  formatDate, 
  formatNumber 
}: { 
  content: FeedContent; 
  isDarkMode: boolean;
  formatDate: (date: string) => string;
  formatNumber: (num: number) => string;
}) {
  const config = CONTENT_TYPE_CONFIG[content.type];
  
  const getContentUrl = () => {
    switch (content.type) {
      case 'forum':
        return `/forum/${content.category.slug}/${content.slug}`;
      case 'article':
        return `/articles/${content.slug}`;
      case 'strategy':
        return `/trading-stratejileri/${content.slug}`;
      default:
        return '#';
    }
  };

  return (
    <div className={`rounded-lg border transition-colors duration-200 hover:shadow-sm ${
      isDarkMode ? 'bg-card border-border hover:bg-background' : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}>
      <div className="flex p-4">
        {/* Vote section */}
        <div className="flex flex-col items-center w-12 mr-4">
          {content.type === 'forum' ? (
            <VoteButtons
              targetType="topic"
              targetId={content.id}
              initialVoteScore={content.vote_score}
              initialUserVote={content.user_vote || null}
              size="sm"
              orientation="vertical"
            />
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className={`text-sm font-bold ${
                content.vote_score > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {content.type === 'strategy' ? `+${formatNumber(content.vote_score)}%` : formatNumber(content.vote_score)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {content.type === 'strategy' ? 'getiri' : 'puan'}
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Content Type Tag and Meta */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${config.bgColor} ${config.textColor}`}>
              {config.icon} {config.label}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span 
                className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: content.category.color }}
              >
                {content.category.name}
              </span>
              <span>•</span>
              <span>u/{content.author.username}</span>
              <span>•</span>
              <span>{formatDate(content.created_at)} önce</span>
            </div>
          </div>
          
          {/* Title and Content */}
          <Link href={getContentUrl()} className="block group">
            <h3 className={`font-medium text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors ${
              isDarkMode ? 'text-foreground' : 'text-gray-900'
            }`}>
              {content.title}
            </h3>
            
            {content.content && content.content.length > 50 && (
              <p className={`text-sm mb-3 line-clamp-3 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                {content.content}
              </p>
            )}

            {/* Article/Strategy specific content */}
            {content.type === 'article' && (content as any).featured_image && (
              <div className="mb-3">
                <Image
                  src={(content as any).featured_image}
                  alt={content.title}
                  width={200}
                  height={120}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
          </Link>
          
          {/* Actions and Stats */}
          <div className="flex items-center gap-4 text-xs">
            <button className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
            }`}>
              <MessageCircle className="w-3 h-3" />
              {content.type === 'forum' 
                ? `${formatNumber((content as any).reply_count)} Yorum`
                : content.type === 'article'
                ? `${formatNumber((content as any).comment_count)} Yorum`
                : `${formatNumber((content as any).like_count)} Beğeni`
              }
            </button>
            
            <button className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
            }`}>
              <Eye className="w-3 h-3" />
              {formatNumber(content.view_count)}
            </button>

            {content.type === 'strategy' && (
              <button className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
              }`}>
                <Download className="w-3 h-3" />
                {formatNumber((content as any).download_count)}
              </button>
            )}

            {content.type === 'article' && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <BookOpen className="w-3 h-3" />
                {(content as any).read_time} dk
              </div>
            )}
            
            <button className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
            }`}>
              <Share className="w-3 h-3" />
              Paylaş
            </button>
            
            <button className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
            }`}>
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// Feed Item Skeleton
function FeedItemSkeleton({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${
      isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
    }`}>
      <div className="flex">
        <div className="w-12 mr-4">
          <div className={`w-8 h-8 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-16 h-5 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
            <div className={`w-24 h-4 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
          </div>
          <div className={`w-full h-5 mb-2 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`w-3/4 h-4 mb-3 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
          <div className="flex gap-2">
            <div className={`w-16 h-6 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
            <div className={`w-12 h-6 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
            <div className={`w-14 h-6 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data for fallback
function getMockContent(): FeedContent[] {
  return [
    {
      id: 'forum-1',
      type: 'forum',
      title: 'Bitcoin 100.000$ seviyesine çıkabilir mi?',
      content: 'Son zamanlarda Bitcoin\'de gördüğümüz yükseliş trendi devam edecek mi? Teknik analiz açısından değerlendirelim.',
      author: {
        id: '1',
        username: 'CryptoExpert',
        name: 'Crypto Expert',
        avatar_url: null
      },
      category: {
        id: '1',
        name: 'Kripto',
        slug: 'kripto',
        color: '#F59E0B'
      },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      vote_score: 45,
      view_count: 1234,
      reply_count: 23,
      is_pinned: true,
      is_locked: false,
      slug: 'bitcoin-100000-seviyesi'
    } as FeedContent,
    {
      id: 'article-1',
      type: 'article',
      title: 'Forex Piyasasında Risk Yönetimi: Başlangıç Rehberi',
      content: 'Forex piyasasında başarılı olmak için risk yönetimi kritik öneme sahiptir. Bu rehberde temel stratejileri öğreneceksiniz.',
      author: {
        id: '2',
        username: 'ForexPro',
        name: 'Forex Pro',
        avatar_url: null
      },
      category: {
        id: '2',
        name: 'Eğitim',
        slug: 'egitim',
        color: '#3B82F6'
      },
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      vote_score: 0,
      view_count: 856,
      read_time: 8,
      comment_count: 12,
      slug: 'forex-risk-yonetimi-rehberi'
    } as FeedContent,
    {
      id: 'strategy-1',
      type: 'strategy',
      title: 'RSI Divergence Master Strategy',
      content: 'RSI divergence sinyalleri ile güçlü giriş noktalarını tespit eden gelişmiş momentum stratejisi.',
      description: 'RSI divergence sinyalleri ile güçlü giriş noktalarını tespit eden gelişmiş momentum stratejisi.',
      author: {
        id: '3',
        username: 'AlgoTrader',
        name: 'Algo Trader',
        avatar_url: null
      },
      category: {
        id: '3',
        name: 'Forex',
        slug: 'forex',
        color: '#10B981'
      },
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      vote_score: 156,
      view_count: 2341,
      performance: {
        total_return: 156.8,
        win_rate: 68.5,
        total_trades: 245
      },
      timeframe: 'H4',
      tags: ['RSI', 'Momentum', 'Divergence'],
      download_count: 456,
      like_count: 89,
      is_premium: false,
      slug: 'rsi-divergence-master'
    } as FeedContent
  ];
}