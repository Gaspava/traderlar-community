'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ArticleSearchResult, Category } from '@/lib/supabase/types';
import ArticleAd from '@/components/ads/ArticleAd';

const ITEMS_PER_PAGE = 9;

export default function ArticlesPage() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<ArticleSearchResult[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [searchTerm, selectedCategory, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/articles?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch articles');
      }

      // Transform the data to match our type
      const transformedArticles: ArticleSearchResult[] = data.articles.map((article: any) => ({
        ...article,
        total_count: data.total
      }));

      setArticles(transformedArticles);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };


  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Modern Header */}
        <div className="relative overflow-hidden">
          {/* Background with Theme Support */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-blue-50/30 to-purple-50/50 dark:from-slate-900/80 dark:via-emerald-900/20 dark:to-blue-900/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-white/5"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              {/* Main Title */}
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-emerald-800 to-blue-800 dark:from-white dark:via-emerald-200 dark:to-blue-200 bg-clip-text text-transparent">
                Makaleler
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Trading dünyasından en güncel analizler, stratejiler ve eğitici içerikler
              </p>

              {/* Stats */}
              <div className="flex justify-center items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {totalCount}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Toplam Makale</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {categories.length}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Kategori</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    12K+
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Toplam Okuma</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Modern Filters and Search */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Makale ara... (örn: forex analizi, bitcoin)"
                    className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                  />
                </div>
              </form>

              {/* Filters */}
              <div className="flex items-center gap-3">
                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value || null);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 cursor-pointer"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 cursor-pointer"
                  >
                    <option value="newest">📅 En Yeni</option>
                    <option value="popular">🔥 En Popüler</option>
                    <option value="trending">📈 Trend Olanlar</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory || searchTerm) && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Aktif filtreler:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm">
                    <Search className="w-3 h-3" />
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="hover:text-emerald-800 dark:hover:text-emerald-300">
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                    <Filter className="w-3 h-3" />
                    {categories.find(c => c.slug === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory(null)} className="hover:text-blue-800 dark:hover:text-blue-300">
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Modern Articles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden animate-pulse border border-slate-200 dark:border-slate-700">
                  <div className="h-56 bg-slate-200 dark:bg-slate-700"></div>
                  <div className="p-6">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 mb-4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Henüz makale bulunmuyor
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {searchTerm || selectedCategory 
                  ? 'Arama kriterlerinizi değiştirerek tekrar deneyin'
                  : 'Yakında harika içeriklerle burada olacağız'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, index) => {
                  const shouldShowAd = (index + 1) % 5 === 0 && index < articles.length - 1;
                  
                  return (
                    <div key={article.id} className="contents">
                      <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1"
                      >
                    <Link href={`/articles/${article.slug}`} className="block h-full">
                      {article.cover_image && (
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={article.cover_image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          
                          {/* Category Badge on Image */}
                          {article.categories.slice(0, 1).map((category) => (
                            <div
                              key={category.id}
                              className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm"
                              style={{
                                backgroundColor: `${category.color}CC`
                              }}
                            >
                              {category.name}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="p-6 flex flex-col flex-1">
                        {/* Additional Categories */}
                        {article.categories.length > 1 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {article.categories.slice(1, 3).map((category) => (
                              <span
                                key={category.id}
                                className="text-xs px-2 py-1 rounded-full border"
                                style={{
                                  borderColor: `${category.color}40`,
                                  color: category.color
                                }}
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
                          {article.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                          {article.excerpt}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {article.view_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {article.like_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {article.comment_count}
                          </span>
                        </div>

                        {/* Author */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                              {article.author_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{article.author_name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(article.published_at).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                          </div>
                          
                          {/* Read Time */}
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3" />
                            {Math.ceil((article.excerpt?.length || 100) / 200)}dk
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                  
                  {/* Show ad every 5 articles */}
                  {shouldShowAd && (
                    <ArticleAd index={index + 1} />
                  )}
                </div>
                );
                })}
              </div>

              {/* Modern Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-16">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Önceki</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg shadow-emerald-500/30'
                              : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-600 hover:scale-105'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && (
                      <span className="px-2 text-slate-400 dark:text-slate-500">...</span>
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <span className="text-sm font-medium">Sonraki</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}