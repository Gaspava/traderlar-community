'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useThemeDetection } from '@/hooks/useThemeDetection';
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
  Award
} from 'lucide-react';

interface HomeSidebarProps {
  activeSection?: string;
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
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

export default function HomeSidebar({ activeSection, className = '', isMobileOpen = false, onMobileClose }: HomeSidebarProps) {
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
  }, []);

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

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 w-60 h-full z-40 transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:block ${
        isDarkMode 
          ? 'bg-background border-r border-border' 
          : 'bg-white border-r border-gray-200'
      } ${className}`}>
      <div className="h-full overflow-y-auto">
        <div className="p-4 space-y-6 pt-24">
          
          {/* Ana Navigasyon */}
          <div>
            <div className="space-y-1">
              {mainSections.map((section) => {
                const isActive = section.id === activeSection;
                
                return (
                  <Link
                    key={section.id}
                    href={section.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isDarkMode 
                          ? 'text-foreground hover:bg-muted/80 hover:text-foreground' 
                          : 'text-gray-900 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className={`transition-transform group-hover:scale-110 ${
                      isActive ? 'text-primary-foreground' : ''
                    }`}>
                      {section.icon}
                    </div>
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
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Hızlı İşlemler */}
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

          {/* Trend ve Popüler */}
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


          {/* Spacer for bottom */}
          <div className="h-20"></div>
        </div>
      </div>
      </div>
    </>
  );
}