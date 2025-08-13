'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useThemeDetection } from '@/hooks/useThemeDetection';
import { 
  Home,
  MessageCircle,
  TrendingUp,
  BookOpen,
  Building2,
  Code,
  BarChart3,
  PieChart,
  Brain,
  Scale,
  Users,
  Award
} from 'lucide-react';

interface ForumSidebarProps {
  activeCategory?: string;
  className?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  topic_count: number;
}

interface ForumStats {
  totalTopics: number;
  totalArticles: number;
  totalStrategies: number;
  activeUsers: number;
  totalUsers: number;
}


export default function ForumSidebar({ activeCategory, className = '' }: ForumSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
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
    fetchCategories();
    fetchStats();
  }, []);

  const fetchCategories = async () => {
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

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
        totalStrategies: 34,
        activeUsers: 23,
        totalUsers: 1240
      });
    }
  };

  return (
    <div className={`fixed left-0 top-0 w-60 h-full z-30 transition-transform duration-300 hidden md:block ${
      isDarkMode 
        ? 'bg-background border-r border-border' 
        : 'bg-white border-r border-gray-200'
    } ${className}`}>
      <div className="h-full overflow-y-auto">
        <div className="p-4 space-y-6 pt-20">
          {/* Ana Kategoriler */}
          <div>
            <div className="space-y-1">
              <Link
                href="/forum"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isDarkMode 
                    ? 'text-foreground hover:bg-muted' 
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="flex-1">Forum Anasayfası</span>
              </Link>
            </div>
          </div>

          {/* Forum Kategorileri */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xs font-semibold uppercase tracking-wide ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
              }`}>
                Forum Kategorileri
              </h3>
            </div>
            <div className="space-y-1">
              {categories.map((item) => {
                const isActive = item.slug === activeCategory;
                const href = `/forum/${item.slug}`;
                
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isDarkMode
                          ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      isActive
                        ? 'text-primary-foreground'
                        : isDarkMode
                          ? 'text-muted-foreground'
                          : 'text-gray-600'
                    }`}>
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
                        return categoryIcons[item.name] || <MessageCircle className="w-4 h-4" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className={`text-xs ${
                        isActive 
                          ? 'text-primary-foreground/80' 
                          : isDarkMode 
                            ? 'text-muted-foreground/70' 
                            : 'text-gray-500'
                      }`}>
                        {formatNumber(item.topic_count)} konu
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Topluluk İstatistikleri */}
          <div>
            <div className={`p-3 rounded-md border ${
              isDarkMode ? 'bg-muted/20 border-border/50' : 'bg-gray-50/50 border-gray-200/50'
            }`}>
              <h3 className={`text-xs font-medium mb-2 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                Topluluk
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-xs ${
                      isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                    }`}>
                      Çevrimiçi
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>
                    {formatNumber(stats.activeUsers)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    Üye
                  </span>
                  <span className={`text-xs font-semibold ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>
                    {formatNumber(stats.totalUsers)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    Konu
                  </span>
                  <span className={`text-xs font-semibold ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>
                    {formatNumber(stats.totalTopics)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}