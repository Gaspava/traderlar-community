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
  BookOpen
} from 'lucide-react';
import VoteButtons from '@/components/ui/VoteButtons';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { FeedContent, FeedResponse, SortOption, ContentType, CONTENT_TYPE_CONFIG } from '@/types/feedContent';
import { InContentAd, LeaderboardAd, DEFAULT_AD_CONFIG } from '@/components/ads';
import RecentItems from '@/components/RecentItems';

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
    currentTheme: 'dark'
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
      setState(prev => ({ ...prev, loading: true }));
      fetchContent(1, true);
    }
  }, [state.mounted]);

  // Refetch when sort or filter changes
  useEffect(() => {
    if (state.mounted) {
      setState(prev => ({ ...prev, page: 1, content: [], loading: true }));
      fetchContent(1, true);
    }
  }, [state.sortBy, state.contentFilter]);

  const fetchContent = async (pageNum: number = state.page, reset: boolean = false) => {
    try {
      console.log('Fetching content from API:', { pageNum, sortBy: state.sortBy, contentFilter: state.contentFilter });
      const response = await fetch(
        `/api/feed?page=${pageNum}&limit=20&sort=${state.sortBy}&type=${state.contentFilter}`
      );
      const data: FeedResponse = await response.json();
      console.log('API Response:', data);
      
      if (response.ok && data && data.content && data.content.length > 0) {
        console.log('API data received, using:', data.content.length, 'items');
        const contentWithAds = insertAds(data.content, pageNum > 1);
        
        if (reset) {
          setState(prev => ({
            ...prev,
            content: contentWithAds,
            hasMore: data.hasMore,
            totalCount: data.totalCount,
            page: pageNum,
            loading: false
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
        return;
      }
    } catch (error) {
      console.log('API error, falling back to mock data:', error);
    }
    
    // Fallback to mock data
    console.log('Using mock data as fallback');
    let mockContent = getMockContent();
      
      // Apply content type filter
      if (state.contentFilter !== 'all') {
        mockContent = mockContent.filter(item => item.type === state.contentFilter);
      }
      
      // Apply sorting
      mockContent = mockContent.sort((a, b) => {
        switch (state.sortBy) {
          case 'new':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'top':
            return b.vote_score - a.vote_score;
          case 'hot':
          default:
            // Hot algorithm - combine vote score, views, and recency
            const scoreA = a.vote_score * 2 + a.view_count * 0.1;
            const scoreB = b.vote_score * 2 + b.view_count * 0.1;
            return scoreB - scoreA;
        }
      });
      
      // Paginate mock data
      const startIndex = (pageNum - 1) * 20;
      const endIndex = startIndex + 20;
      const paginatedMockContent = mockContent.slice(startIndex, endIndex);
      
      const contentWithAds = insertAds(paginatedMockContent, pageNum > 1);
      
      if (reset) {
        setState(prev => ({
          ...prev,
          content: contentWithAds,
          hasMore: endIndex < mockContent.length,
          totalCount: mockContent.length,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          content: [...prev.content, ...contentWithAds],
          hasMore: endIndex < mockContent.length,
          totalCount: mockContent.length,
          loading: false
        }));
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
    if (!state.hasMore || state.loading) return;
    
    setState(prev => ({ ...prev, loading: true }));
    try {
      await fetchContent(state.page + 1, false);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.page, state.hasMore, state.sortBy, state.contentFilter, state.loading]);

  const { setTargetRef, isLoading } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: state.hasMore,
    enabled: !state.loading && state.hasMore && state.mounted
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
      {/* Main Content - Mobile Optimized */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">

        {/* Main Content Layout - Mobile Responsive */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Main Feed - Full Width on Mobile */}
          <div className="w-full lg:flex-1 lg:max-w-[800px] space-y-4 sm:space-y-6">
            {/* Filter Tabs - Mobile Optimized */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 ${
              isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              {/* Sort Options - Scrollable on Mobile */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full sm:w-auto pb-2 sm:pb-0">
                {[
                  { value: 'hot', label: 'Popüler', icon: Flame },
                  { value: 'new', label: 'Yeni', icon: Sparkles },
                  { value: 'top', label: 'En İyi', icon: Star }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setState(prev => ({ ...prev, sortBy: value as SortOption }))}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation active:scale-95 ${
                      state.sortBy === value
                        ? (isDarkMode ? 'bg-primary text-primary-foreground' : 'bg-primary text-white')
                        : (isDarkMode ? 'text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/70' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200')
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Content Type Filter - Mobile Scrollable */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full sm:w-auto sm:ml-auto pb-2 sm:pb-0">
                {[
                  { value: 'all', label: 'Tümü' },
                  { value: 'forum', label: 'Tartışma' },
                  { value: 'article', label: 'Makale' },
                  { value: 'strategy', label: 'Strateji' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setState(prev => ({ ...prev, contentFilter: value as ContentType | 'all' }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap touch-manipulation active:scale-95 ${
                      state.contentFilter === value
                        ? (isDarkMode ? 'bg-muted text-foreground' : 'bg-gray-200 text-gray-900')
                        : (isDarkMode ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-150')
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed Content - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4">
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
                  {(isLoading && !state.loading) && (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={`loading-${i}`} 
                          className="animate-fadeIn"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <FeedItemSkeleton isDarkMode={isDarkMode} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Infinite Scroll Trigger */}
                  {state.hasMore && !state.loading && (
                    <div 
                      ref={setTargetRef}
                      className="py-8 flex justify-center"
                    >
                      {isLoading ? (
                        <div className="relative">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center">Yeni içerikler yükleniyor...</p>
                        </div>
                      ) : (
                        <div className="h-4" />
                      )}
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

          {/* Right Sidebar - Desktop Only */}
          <div className="w-full lg:w-80 flex-shrink-0 hidden lg:block">
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
        return `/makaleler/${content.slug}`;
      case 'strategy':
        return `/trading-stratejileri/${content.slug}`;
      default:
        return '#';
    }
  };

  return (
    <div className={`rounded-lg border transition-all duration-200 hover:shadow-sm active:scale-[0.99] ${
      isDarkMode ? 'bg-card border-border hover:bg-background' : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}>
      <div className="flex flex-col sm:flex-row p-3 sm:p-4 gap-3 sm:gap-0">
        {/* Vote section - Mobile Responsive */}
        <div className="hidden sm:flex flex-col items-center w-10 mr-3">
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
          {/* Meta - Mobile Optimized */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
              {config.label}
            </span>
            <span 
              className="px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium text-white"
              style={{ backgroundColor: content.category.color }}
            >
              {content.category.name}
            </span>
            <span className={`text-[10px] sm:text-xs ${
              isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
            }`}>
              <span className="hidden sm:inline">•</span> {content.author.username} <span className="hidden sm:inline">•</span> <span className="sm:hidden">•</span> {formatDate(content.created_at)}
            </span>
          </div>
          
          {/* Title and Content - Mobile Optimized */}
          <Link href={getContentUrl()} className="block group touch-manipulation">
            <h3 className={`font-medium text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors ${
              isDarkMode ? 'text-foreground' : 'text-gray-900'
            }`}>
              {content.title}
            </h3>
            
            {content.content && content.content.length > 50 && (
              <p className={`text-xs sm:text-sm mb-3 line-clamp-2 sm:line-clamp-3 ${
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
          
          {/* Actions and Stats - Mobile Optimized */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
            <button className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded transition-colors touch-manipulation active:scale-95 ${
              isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/70' : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'
            }`}>
              <MessageCircle className="w-3 h-3" />
              <span className="hidden xs:inline">
                {content.type === 'forum' 
                  ? `${formatNumber((content as any).reply_count)} Yorum`
                  : content.type === 'article'
                  ? `${formatNumber((content as any).comment_count)} Yorum`
                  : `${formatNumber((content as any).like_count)} Beğeni`
                }
              </span>
              <span className="xs:hidden">
                {content.type === 'forum' 
                  ? formatNumber((content as any).reply_count)
                  : content.type === 'article'
                  ? formatNumber((content as any).comment_count)
                  : formatNumber((content as any).like_count)
                }
              </span>
            </button>
            
            <button className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded transition-colors touch-manipulation active:scale-95 ${
              isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/70' : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'
            }`}>
              <Eye className="w-3 h-3" />
              <span>{formatNumber(content.view_count)}</span>
            </button>

            {content.type === 'strategy' && (
              <button className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded transition-colors touch-manipulation active:scale-95 ${
                isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/70' : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'
              }`}>
                <Download className="w-3 h-3" />
                <span className="hidden xs:inline">{formatNumber((content as any).download_count)}</span>
              </button>
            )}

            {content.type === 'article' && (
              <div className="flex items-center gap-0.5 sm:gap-1 text-gray-500 dark:text-gray-400">
                <BookOpen className="w-3 h-3" />
                <span className="hidden xs:inline">{(content as any).read_time} dk</span>
                <span className="xs:hidden">{(content as any).read_time}</span>
              </div>
            )}
            
            <button className={`hidden sm:flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded transition-colors touch-manipulation active:scale-95 ${
              isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/70' : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'
            }`}>
              <Share className="w-3 h-3" />
              <span className="hidden lg:inline">Paylaş</span>
            </button>
            
            <button className={`flex sm:hidden items-center gap-0.5 px-1.5 py-1 rounded transition-colors touch-manipulation active:scale-95 ml-auto ${
              isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/70' : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'
            }`}>
              <MoreHorizontal className="w-4 h-4" />
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
    <div className={`rounded-lg border p-3 sm:p-4 ${
      isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
    }`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="hidden sm:block w-10 mr-3">
          <div className={`w-8 h-16 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-16 h-5 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
            <div className={`w-24 h-4 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
          </div>
          <div className={`w-full h-5 mb-2 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`w-3/4 h-4 mb-3 rounded ${isDarkMode ? 'bg-muted' : 'bg-gray-200'} animate-pulse`}></div>
          <div className="flex flex-wrap gap-2">
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
    // MAKALELER - En üstte gösterilecek
    {
      id: 'article-forex-risk',
      type: 'article',
      title: 'Forex Piyasasında Risk Yönetimi: Kapsamlı Rehber',
      content: 'Forex piyasasında başarılı olmanın anahtarı doğru risk yönetimi stratejileridir. Bu rehberde pozisyon boyutlandırma, stop loss kullanımı ve risk/ödül oranı gibi kritik konuları detaylıca inceliyoruz.',
      author: {
        id: '1',
        username: 'ForexMaster',
        name: 'Forex Master',
        avatar_url: null
      },
      category: {
        id: '1',
        name: 'Forex',
        slug: 'forex',
        color: '#10B981'
      },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      vote_score: 0,
      view_count: 3456,
      read_time: 12,
      comment_count: 45,
      featured_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
      slug: 'forex-risk-yonetimi-rehber'
    } as FeedContent,
    
    {
      id: 'article-bitcoin-halving',
      type: 'article',
      title: 'Bitcoin Halving 2024: Piyasa Üzerindeki Etkileri',
      content: 'Bitcoin halving olayları kripto piyasasını nasıl etkiliyor? 2024 halving sonrası beklentiler ve geçmiş veriler ışığında detaylı analiz.',
      author: {
        id: '2',
        username: 'CryptoAnalyst',
        name: 'Crypto Analyst',
        avatar_url: null
      },
      category: {
        id: '2',
        name: 'Kripto',
        slug: 'kripto',
        color: '#F59E0B'
      },
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      vote_score: 0,
      view_count: 5678,
      read_time: 10,
      comment_count: 67,
      featured_image: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800',
      slug: 'bitcoin-halving-2024'
    } as FeedContent,

    {
      id: 'article-fibonacci',
      type: 'article',
      title: 'Fibonacci Retracement: Teknik Analizde Altın Oran',
      content: 'Fibonacci seviyeleri nasıl hesaplanır ve trading stratejilerinizde nasıl kullanabilirsiniz? %61.8 altın oran seviyesinin önemi.',
      author: {
        id: '3',
        username: 'TechAnalyst',
        name: 'Technical Analyst',
        avatar_url: null
      },
      category: {
        id: '3',
        name: 'Analiz',
        slug: 'analiz',
        color: '#3B82F6'
      },
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      vote_score: 0,
      view_count: 2134,
      read_time: 8,
      comment_count: 23,
      featured_image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800',
      slug: 'fibonacci-retracement-analiz'
    } as FeedContent,

    {
      id: 'article-python-bot',
      type: 'article',
      title: 'Python ile Algoritmik Trading Bot Geliştirme',
      content: 'Python kullanarak kendi trading botunuzu nasıl geliştirebilirsiniz? CCXT, Pandas ve TA-Lib kütüphaneleri ile adım adım rehber.',
      author: {
        id: '4',
        username: 'AlgoTrader',
        name: 'Algo Trader',
        avatar_url: null
      },
      category: {
        id: '4',
        name: 'Eğitim',
        slug: 'egitim',
        color: '#8B5CF6'
      },
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      vote_score: 0,
      view_count: 4567,
      read_time: 15,
      comment_count: 89,
      featured_image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
      slug: 'python-trading-bot'
    } as FeedContent,

    {
      id: 'article-psychology',
      type: 'article',
      title: 'Trading Psikolojisi: FOMO ve Açgözlülükle Başa Çıkma',
      content: 'Başarılı trading için psikolojik faktörleri nasıl yönetmelisiniz? Duygusal kontrol teknikleri ve trader mindset geliştirme.',
      author: {
        id: '5',
        username: 'TradingCoach',
        name: 'Trading Coach',
        avatar_url: null
      },
      category: {
        id: '5',
        name: 'Psikoloji',
        slug: 'psikoloji',
        color: '#EC4899'
      },
      created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      vote_score: 0,
      view_count: 3210,
      read_time: 7,
      comment_count: 56,
      slug: 'trading-psikolojisi-fomo'
    } as FeedContent,

    // STRATEJİLER
    {
      id: 'strategy-rsi-divergence',
      type: 'strategy',
      title: 'RSI Divergence Master Strategy v2.0',
      content: 'RSI divergence sinyalleri ile güçlü dönüş noktalarını %72 başarı oranıyla yakalayan momentum stratejisi.',
      description: 'RSI divergence sinyalleri ile güçlü dönüş noktalarını yakalayan gelişmiş momentum stratejisi.',
      author: {
        id: '6',
        username: 'StrategyMaster',
        name: 'Strategy Master',
        avatar_url: null
      },
      category: {
        id: '6',
        name: 'Strateji',
        slug: 'strateji',
        color: '#10B981'
      },
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      vote_score: 186,
      view_count: 5432,
      performance: {
        total_return: 186.5,
        win_rate: 72.3,
        total_trades: 342
      },
      timeframe: 'H4',
      tags: ['RSI', 'Divergence', 'Momentum'],
      download_count: 567,
      like_count: 234,
      is_premium: false,
      slug: 'rsi-divergence-master-v2'
    } as FeedContent,

    {
      id: 'strategy-bollinger-scalp',
      type: 'strategy',
      title: 'Bollinger Bands Scalping System Pro',
      content: 'M5 timeframe için optimize edilmiş, Bollinger Bands ve RSI kombinasyonu ile yüksek frekanslı scalping stratejisi.',
      description: 'Bollinger Bands ve RSI kombinasyonu ile 5 dakikalık grafikte scalping.',
      author: {
        id: '7',
        username: 'ScalpKing',
        name: 'Scalp King',
        avatar_url: null
      },
      category: {
        id: '7',
        name: 'Scalping',
        slug: 'scalping',
        color: '#EF4444'
      },
      created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      vote_score: 95,
      view_count: 3876,
      performance: {
        total_return: 95.2,
        win_rate: 68.9,
        total_trades: 1876
      },
      timeframe: 'M5',
      tags: ['Bollinger', 'Scalping', 'High-Frequency'],
      download_count: 892,
      like_count: 412,
      is_premium: true,
      slug: 'bollinger-scalping-pro'
    } as FeedContent,

    {
      id: 'strategy-ma-cross',
      type: 'strategy',
      title: 'Golden Cross Trading System',
      content: 'MA 50/200 golden cross stratejisi trend filtresi ve volume konfirmasyonu ile güçlendirilmiş versiyon.',
      description: 'Klasik MA crossover stratejisinin gelişmiş versiyonu.',
      author: {
        id: '8',
        username: 'TrendMaster',
        name: 'Trend Master',
        avatar_url: null
      },
      category: {
        id: '8',
        name: 'Trend',
        slug: 'trend',
        color: '#06B6D4'
      },
      created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      vote_score: 234,
      view_count: 7890,
      performance: {
        total_return: 234.5,
        win_rate: 58.7,
        total_trades: 156
      },
      timeframe: 'H1',
      tags: ['Moving Average', 'Trend', 'Golden Cross'],
      download_count: 1234,
      like_count: 567,
      is_premium: false,
      slug: 'golden-cross-system'
    } as FeedContent,

    {
      id: 'strategy-ichimoku',
      type: 'strategy',
      title: 'Ichimoku Cloud Complete System',
      content: 'Ichimoku göstergesinin tüm bileşenlerini kullanan kapsamlı trend takip stratejisi. Japon teknik analizi.',
      description: 'Ichimoku Cloud ile profesyonel trend takibi.',
      author: {
        id: '9',
        username: 'IchimokuPro',
        name: 'Ichimoku Pro',
        avatar_url: null
      },
      category: {
        id: '9',
        name: 'Japonca',
        slug: 'japonca',
        color: '#A855F7'
      },
      created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      vote_score: 312,
      view_count: 4321,
      performance: {
        total_return: 312.8,
        win_rate: 65.4,
        total_trades: 89
      },
      timeframe: 'D1',
      tags: ['Ichimoku', 'Trend', 'Japanese'],
      download_count: 456,
      like_count: 189,
      is_premium: true,
      slug: 'ichimoku-cloud-complete'
    } as FeedContent,

    {
      id: 'strategy-grid-bot',
      type: 'strategy',
      title: 'Crypto Grid Trading Bot v3.0',
      content: 'Kripto piyasaları için özel tasarlanmış, yatay piyasalarda kar eden otomatik grid trading sistemi.',
      description: 'Otomatik grid trading botu - kripto için optimize.',
      author: {
        id: '10',
        username: 'GridMaster',
        name: 'Grid Master',
        avatar_url: null
      },
      category: {
        id: '10',
        name: 'Bot',
        slug: 'bot',
        color: '#F97316'
      },
      created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      vote_score: 89,
      view_count: 9876,
      performance: {
        total_return: 89.4,
        win_rate: 78.9,
        total_trades: 2341
      },
      timeframe: 'M15',
      tags: ['Grid', 'Bot', 'Crypto', 'Automated'],
      download_count: 1567,
      like_count: 789,
      is_premium: true,
      slug: 'crypto-grid-bot-v3'
    } as FeedContent,

    // Forum Posts - Daha az sayıda
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
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      vote_score: 45,
      view_count: 1234,
      reply_count: 23,
      is_pinned: true,
      is_locked: false,
      slug: 'bitcoin-100000-seviyesi'
    } as FeedContent,
    {
      id: 'forum-2',
      type: 'forum',
      title: 'EUR/USD Paritesinde Kritik Seviyeler',
      content: 'EUR/USD paritesi 1.0800 desteğini test ediyor. Bu seviyenin kırılması durumunda hangi hedefler söz konusu?',
      author: {
        id: '11',
        username: 'FxAnalyst',
        name: 'FX Analyst',
        avatar_url: null
      },
      category: {
        id: '11',
        name: 'Forex',
        slug: 'forex',
        color: '#10B981'
      },
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      vote_score: 67,
      view_count: 2345,
      reply_count: 34,
      is_pinned: false,
      is_locked: false,
      slug: 'eurusd-kritik-seviyeler'
    } as FeedContent
  ];
}