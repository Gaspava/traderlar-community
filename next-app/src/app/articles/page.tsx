'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  ChevronRight,
  Shuffle,
  Zap
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ArticleSearchResult, Category } from '@/lib/supabase/types';
import ArticleAd from '@/components/ads/ArticleAd';

const ITEMS_PER_PAGE = 9;

function ArticlesPageContent() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<ArticleSearchResult[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRandomizing, setIsRandomizing] = useState(false);

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
      const transformedArticles = data.articles.map((article: any) => ({
        ...article,
        category: article.categories ? {
          name: article.categories.name,
          slug: article.categories.slug,
          color: article.categories.color
        } : null
      }));

      setArticles(transformedArticles);
      setTotalCount(data.total);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
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

  const handleRandomArticle = async () => {
    if (isRandomizing) return;
    
    setIsRandomizing(true);
    try {
      const response = await fetch('/api/articles/random');
      const data = await response.json();
      
      if (data.success && data.article) {
        // Navigate to random article
        window.location.href = `/articles/${data.article.slug}`;
      }
    } catch (error) {
      console.error('Error fetching random article:', error);
    } finally {
      setIsRandomizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Compact Header */}
      <div className="border-b border-gray-200 dark:border-border bg-white dark:bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">
                Makaleler
              </h1>
              <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
                {totalCount} makale • {categories.length} kategori
              </p>
            </div>
            
            {/* Random Article Button - Desktop */}
            <button
              onClick={handleRandomArticle}
              disabled={isRandomizing}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
            >
              {isRandomizing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Shuffle className="w-4 h-4" />
              )}
              Rastgele Makale
            </button>
          </div>
        </div>
      </div>

      {/* Modern Filters and Search */}
      <div className="border-b border-gray-200 dark:border-border bg-white/50 dark:bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Makale ara... (örn: forex analizi, bitcoin)"
                  className="w-full bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-200 dark:border-border rounded-xl pl-12 pr-4 py-3 text-gray-800 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
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
                  className="appearance-none bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-200 dark:border-border rounded-xl px-4 py-3 pr-10 text-gray-800 dark:text-foreground focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 cursor-pointer"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'trending')}
                  className="appearance-none bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-200 dark:border-border rounded-xl px-4 py-3 pr-10 text-gray-800 dark:text-foreground focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 cursor-pointer"
                >
                  <option value="newest">En Yeni</option>
                  <option value="popular">En Popüler</option>
                  <option value="trending">Trend</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-border">
              <span className="text-sm text-gray-500 dark:text-muted-foreground">Aktif filtreler:</span>
              
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                  {categories.find(c => c.slug === selectedCategory)?.name}
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full">
                  &quot;{searchTerm}&quot;
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="ml-1 hover:text-green-600 dark:hover:text-green-200"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          /* Loading State */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden animate-pulse border border-gray-200 dark:border-border">
                <div className="aspect-video bg-gray-200 dark:bg-muted"></div>
                <div className="p-6">
                  <div className="h-5 bg-gray-200 dark:bg-muted rounded-lg w-3/4 mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 dark:bg-muted rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {articles.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-muted rounded-full flex items-center justify-center mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-foreground mb-2">
                  Makale bulunamadı
                </h3>
                <p className="text-gray-600 dark:text-muted-foreground mb-6">
                  Arama kriterlerinizi değiştirmeyi deneyin
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(null);
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Tüm makaleleri göster
                </button>
              </div>
            ) : (
              /* Modern Articles Grid */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.map((article, index) => (
                    <div key={article.id}>
                      <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group bg-white dark:bg-card rounded-2xl overflow-hidden border border-gray-200/50 dark:border-border/50 hover:border-green-300 dark:hover:border-green-500 hover:shadow-2xl hover:shadow-green-500/20 dark:hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                      >
                        <Link href={`/articles/${article.slug}`} className="block h-full">
                          {/* Article Image */}
                          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 via-emerald-400/20 to-teal-500/30"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full blur-xl"></div>
                            <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-teal-400/40 to-green-500/40 rounded-full blur-lg"></div>
                            
                            {/* Category Badge on Image */}
                            {article.category && (
                              <div className="absolute top-4 left-4 z-10">
                                <span 
                                  className="inline-block px-3 py-1.5 text-white text-sm font-medium rounded-full shadow-lg"
                                  style={{ backgroundColor: article.category.color || '#8B5CF6' }}
                                >
                                  {article.category.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            {/* Additional Categories */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {article.category && (
                                <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                                  {article.category.name}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2 leading-tight">
                              {article.title}
                            </h3>

                            {/* Excerpt */}
                            <p className="text-gray-600 dark:text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
                              {article.excerpt}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-muted-foreground mb-4">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  <span>{article.view_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  <span>{article.like_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>0</span>
                                </div>
                              </div>
                            </div>

                            {/* Author */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {article.author_name?.[0]?.toUpperCase() || 'A'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800 dark:text-foreground">
                                    {article.author_name || 'Anonim'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-muted-foreground">
                                    {new Date(article.created_at).toLocaleDateString('tr-TR')}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Read Time */}
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{article.read_time || 5} dk</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                      
                      {/* Show ad every 5 articles */}
                      {(index + 1) % 5 === 0 && (
                        <div className="mt-8">
                          <ArticleAd />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Modern Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-16">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-200 dark:border-border rounded-xl text-gray-600 dark:text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                                : 'bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-200 dark:border-border text-gray-600 dark:text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-600 hover:scale-105'
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
                      className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-200 dark:border-border rounded-xl text-gray-600 dark:text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <span className="text-sm font-medium">Sonraki</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Mobile Floating Random Article Button */}
        <div className="sm:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={handleRandomArticle}
            disabled={isRandomizing}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            {isRandomizing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">Rastgele Makale</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArticlesPageContent />
    </Suspense>
  );
}