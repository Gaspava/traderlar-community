'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useThemeDetection } from '@/hooks/useThemeDetection';
import { 
  Home
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


export default function ForumSidebar({ activeCategory, className = '' }: ForumSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const { isDarkMode, mounted } = useThemeDetection();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  useEffect(() => {
    fetchCategories();
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
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: item.color }}
                    >
                      {(() => {
                        const categoryIcons: { [key: string]: JSX.Element } = {
                          'Genel Tartışma': (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                            </svg>
                          ),
                          'Algoritmik Ticaret': (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ),
                          'Strateji Paylaşımı': (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                            </svg>
                          ),
                          'Prop Firm ve Fon Yönetimi': (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
                              <path d="M2 8h16v2H2zM6 12h8v2H6z"/>
                            </svg>
                          ),
                          'Yazılım ve Otomasyon': (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                          ),
                          'Portföy ve Performans': (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                          ),
                          'Piyasa Analizleri': (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd"/>
                            </svg>
                          ),
                          'Eğitim Kaynakları': (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                            </svg>
                          ),
                          'Trade Psikolojisi': (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd"/>
                            </svg>
                          ),
                          'Hukuk ve Vergilendirme': (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/>
                            </svg>
                          )
                        };
                        return categoryIcons[item.name] || <span>{item.name.charAt(0)}</span>;
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
        </div>
      </div>
    </div>
  );
}