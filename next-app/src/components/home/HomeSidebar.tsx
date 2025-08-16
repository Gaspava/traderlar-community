'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useThemeDetection } from '@/hooks/useThemeDetection';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User } from '@/lib/supabase/types';
import { useSidebar } from '@/contexts/SidebarContext';
import { 
  Home,
  MessageCircle,
  BookOpen,
  TrendingUp,
  Users,
  PlusCircle,
  Search,
  Star,
  Flame,
  Calendar,
  Award,
  Code,
  Shield,
  Building2,
  BarChart3,
  PieChart,
  GraduationCap,
  Brain,
  Scale,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface HomeSidebarProps {
  activeSection?: string;
  className?: string;
}

interface SidebarSection {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  count?: number;
  isExternal?: boolean;
}

interface ForumStats {
  totalTopics: number;
  totalArticles: number;
  totalStrategies: number;
  activeUsers: number;
  totalUsers: number;
}

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  topic_count: number;
}

export default function HomeSidebar({ activeSection, className = '' }: HomeSidebarProps) {
  const pathname = usePathname();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState<ForumStats>({
    totalTopics: 0,
    totalArticles: 0,
    totalStrategies: 0,
    activeUsers: 0,
    totalUsers: 0
  });
  const { isDarkMode, mounted } = useThemeDetection();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  useEffect(() => {
    fetchStats();
    fetchForumCategories();
    
    const supabase = createClient();
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchProfile(user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const fetchForumCategories = async () => {
    try {
      const supabase = createClient();
      
      // First get all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug, color')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Then get topic counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count, error: countError } = await supabase
            .from('forum_topics')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          if (countError) {
            console.error('Error counting topics for category:', category.name, countError);
            return { ...category, topic_count: 0 };
          }

          return { ...category, topic_count: count || 0 };
        })
      );

      setForumCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Mock categories fallback
      const mockCategories = [
        { id: '1', name: 'Genel Tartışma', slug: 'genel-tartisma', color: '#10B981', topic_count: 45 },
        { id: '2', name: 'Algoritmik Ticaret', slug: 'algoritmik-ticaret', color: '#3B82F6', topic_count: 23 },
        { id: '3', name: 'Strateji Paylaşımı', slug: 'strateji-paylasimi', color: '#EF4444', topic_count: 67 },
        { id: '4', name: 'Prop Firm ve Fon Yönetimi', slug: 'prop-firm-fon-yonetimi', color: '#8B5CF6', topic_count: 12 },
        { id: '5', name: 'Yazılım ve Otomasyon', slug: 'yazilim-otomasyon', color: '#F59E0B', topic_count: 89 }
      ];
      setForumCategories(mockCategories);
    }
  };

  const fetchStats = async () => {
    try {
      const supabase = createClient();
      
      // Get forum topics count
      const { count: topicsCount } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true });

      // Get articles count
      const { count: articlesCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      // Get strategies count
      const { count: strategiesCount } = await supabase
        .from('trading_strategies')
        .select('*', { count: 'exact', head: true });

      // Get total users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalTopics: topicsCount || 0,
        totalArticles: articlesCount || 0,
        totalStrategies: strategiesCount || 0,
        activeUsers: Math.floor((usersCount || 0) * 0.15), // Estimate 15% active
        totalUsers: usersCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Mock stats for fallback
      setStats({
        totalTopics: 156,
        totalArticles: 89,
        totalStrategies: 234,
        activeUsers: 45,
        totalUsers: 1250
      });
    }
  };

  const mainSections: SidebarSection[] = [
    {
      id: 'home',
      label: 'Ana Sayfa',
      href: '/',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'forum',
      label: 'Forum',
      href: '/forum',
      icon: <MessageCircle className="w-5 h-5" />,
      count: stats.totalTopics
    },
    {
      id: 'articles',
      label: 'Makaleler',
      href: '/makaleler',
      icon: <BookOpen className="w-5 h-5" />,
      count: stats.totalArticles
    },
    {
      id: 'strategies',
      label: 'Stratejiler',
      href: '/trading-stratejileri',
      icon: <TrendingUp className="w-5 h-5" />,
      count: stats.totalStrategies
    },
    {
      id: 'education',
      label: 'Eğitim',
      href: '/egitim',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: 'tools',
      label: 'Araçlar',
      href: '/araclar',
      icon: <Code className="w-5 h-5" />
    }
  ];

  const quickActions: SidebarSection[] = [
    {
      id: 'new-topic',
      label: 'Yeni Konu Aç',
      href: '/forum/yeni-konu',
      icon: <PlusCircle className="w-5 h-5" />
    },
    {
      id: 'search',
      label: 'Gelişmiş Arama',
      href: '/search',
      icon: <Search className="w-5 h-5" />
    }
  ];

  const trendingSections: SidebarSection[] = [
    {
      id: 'trending',
      label: 'Trend Konular',
      href: '/?sort=hot',
      icon: <Flame className="w-5 h-5" />
    },
    {
      id: 'top',
      label: 'En Çok Beğenilenler',
      href: '/?sort=top',
      icon: <Star className="w-5 h-5" />
    },
    {
      id: 'recent',
      label: 'Son Eklenenler',
      href: '/?sort=new',
      icon: <Calendar className="w-5 h-5" />
    }
  ];

  const handleMobileClose = () => {
    setIsMobileOpen(false);
  };

  if (!mounted) return null;

  // CSS değişkeni güncelle
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '64px' : '240px');
  }

  return (
    <>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={handleMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      } ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 ${
        isDarkMode 
          ? 'bg-background border-r border-border' 
          : 'bg-white border-r border-gray-200'
      } ${className}`}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden absolute right-4 top-4 z-50">
          <button
            onClick={handleMobileClose}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-muted text-foreground' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Collapse Toggle Button - Desktop Only */}
        <div className="absolute -right-3 top-20 z-50">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-200 hover:scale-110 ${
              isDarkMode
                ? 'bg-background border-border text-foreground hover:bg-muted'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </button>
        </div>

        <div className="h-full overflow-y-auto">
          <div className={`${isCollapsed && !isMobileOpen ? 'p-2' : 'p-4'} space-y-4 pt-16 md:pt-20`}>
          
          {/* Ana Navigasyon */}
          <div>
            <div className="space-y-1">
              {mainSections.map((section) => {
                const isActive = section.id === activeSection;
                
                return (
                  <Link
                    key={section.id}
                    href={section.href}
                    onClick={handleMobileClose}
                    className={`flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 group touch-manipulation min-h-[44px] ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isDarkMode 
                          ? 'text-foreground hover:bg-muted/80 active:bg-muted hover:text-foreground' 
                          : 'text-gray-900 hover:bg-gray-100 active:bg-gray-200 hover:text-gray-900'
                    }`}
                    title={isCollapsed ? section.label : undefined}
                  >
                    <div className={`transition-transform group-hover:scale-110 ${
                      isActive ? 'text-primary-foreground' : ''
                    }`}>
                      {section.icon}
                    </div>
                    {(!isCollapsed || isMobileOpen) && (
                      <>
                        <span className="flex-1 font-medium">{section.label}</span>
                        {section.count !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isActive 
                              ? 'bg-primary-foreground/20 text-primary-foreground' 
                              : isDarkMode 
                                ? 'bg-muted text-muted-foreground' 
                                : 'bg-gray-200 text-gray-600'
                          }`}>
                            {formatNumber(section.count)}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Admin Link - Only for admin users */}
          {profile?.role === 'admin' && (
            <div>
              <div className="space-y-1">
                <Link
                  href="/admin"
                  onClick={handleMobileClose}
                  className={`flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 group touch-manipulation min-h-[44px] ${
                    pathname.startsWith('/admin')
                      ? 'bg-orange-100 text-orange-600'
                      : isDarkMode 
                        ? 'text-orange-600 hover:bg-orange-900/20 active:bg-orange-900/30' 
                        : 'text-orange-600 hover:bg-orange-50 active:bg-orange-100'
                  }`}
                  title={isCollapsed ? 'Admin Paneli' : undefined}
                >
                  <div className="transition-transform group-hover:scale-110">
                    <Shield className="w-5 h-5" />
                  </div>
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="flex-1 font-medium">Admin Paneli</span>
                  )}
                </Link>
              </div>
            </div>
          )}

          {/* Hızlı İşlemler */}
          {!isCollapsed && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                }`}>
                  Hızlı İşlemler
                </h3>
              </div>
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <Link
                    key={action.id}
                    href={action.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                      isDarkMode 
                        ? 'text-muted-foreground hover:bg-muted/50 hover:text-foreground' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="transition-transform group-hover:scale-110">
                      {action.icon}
                    </div>
                    <span className="flex-1 font-medium">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Forum Kategorileri (sadece forum sayfasında) veya Keşfet */}
          {pathname.startsWith('/forum') ? (
            <div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    Forum Kategorileri
                  </h3>
                </div>
              )}
              <div className="space-y-1 forum-scroll max-h-64 overflow-y-auto">
                {forumCategories.map((category) => {
                  const isActive = pathname.includes(`/forum/${category.slug}`);
                  return (
                    <Link
                      key={category.id}
                      href={`/forum/${category.slug}`}
                      onClick={handleMobileClose}
                      className={`flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2'} rounded-lg text-sm transition-all duration-200 group ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : isDarkMode 
                            ? 'text-muted-foreground hover:bg-muted/50 hover:text-foreground' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={isCollapsed ? category.name : undefined}
                    >
                      <div className="transition-transform group-hover:scale-110">
                        {(() => {
                          const categoryIcons: { [key: string]: JSX.Element } = {
                            'Genel Tartışma': <MessageCircle className="w-4 h-4" />,
                            'Algoritmik Ticaret': <TrendingUp className="w-4 h-4" />,
                            'Strateji Paylaşımı': <PieChart className="w-4 h-4" />,
                            'Prop Firm ve Fon Yönetimi': <Building2 className="w-4 h-4" />,
                            'Yazılım ve Otomasyon': <Code className="w-4 h-4" />,
                            'Portföy ve Performans': <BarChart3 className="w-4 h-4" />,
                            'Piyasa Analizleri': <PieChart className="w-4 h-4" />,
                            'Eğitim Kaynakları': <BookOpen className="w-4 h-4" />,
                            'Trade Psikolojisi': <Brain className="w-4 h-4" />,
                            'Hukuk ve Vergilendirme': <Scale className="w-4 h-4" />
                          };
                          return categoryIcons[category.name] || <MessageCircle className="w-4 h-4" />;
                        })()}
                      </div>
                      {(!isCollapsed || isMobileOpen) && (
                        <>
                          <span className="flex-1 font-medium">{category.name}</span>
                          {category.topic_count > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isActive 
                                ? 'bg-primary-foreground/20 text-primary-foreground' 
                                : isDarkMode 
                                  ? 'bg-muted text-muted-foreground' 
                                  : 'bg-gray-200 text-gray-600'
                            }`}>
                              {formatNumber(category.topic_count)}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            (!isCollapsed || isMobileOpen) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    Keşfet
                  </h3>
                </div>
                <div className="space-y-1">
                  {trendingSections.map((section) => (
                    <Link
                      key={section.id}
                      href={section.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                        isDarkMode 
                          ? 'text-muted-foreground hover:bg-muted/50 hover:text-foreground' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="transition-transform group-hover:scale-110">
                        {section.icon}
                      </div>
                      <span className="flex-1 font-medium">{section.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Spacer for bottom */}
          <div className="h-20"></div>
        </div>
      </div>
      </div>
    </>
  );
}