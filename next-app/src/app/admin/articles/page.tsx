'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  MoreVertical,
  Filter,
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  author_name: string;
  author_username: string;
  author_avatar?: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  published_at: string | null;
  like_count: number;
  comment_count: number;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles?limit=100');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch articles');
      }

      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu makaleyi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/articles/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete article');
        }

        setArticles(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Makale silinirken hata oluştu');
      }
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const article = articles.find(a => a.id === id);
      if (!article) return;

      const response = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: article.title,
          slug: article.slug,
          excerpt: '',
          content: '',
          is_published: !currentStatus,
          selected_categories: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update article');
      }

      await fetchArticles();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Yayın durumu değiştirilirken hata oluştu');
    }
  };

  const handleBulkDelete = () => {
    if (selectedArticles.size === 0) return;
    
    if (confirm(`${selectedArticles.size} makaleyi silmek istediğinizden emin misiniz?`)) {
      // TODO: Implement bulk delete
      setArticles(prev => prev.filter(a => !selectedArticles.has(a.id)));
      setSelectedArticles(new Set());
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'published' && article.is_published) ||
      (filter === 'draft' && !article.is_published);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-700 border-t-purple-400"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Makaleler</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Makale
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-black rounded-xl p-6 border border-neutral-800 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Makale ara..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-neutral-400" />
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Tümü ({articles.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'published'
                  ? 'bg-purple-500 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Yayında ({articles.filter(a => a.is_published).length})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'draft'
                  ? 'bg-purple-500 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Taslak ({articles.filter(a => !a.is_published).length})
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedArticles.size > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-neutral-400">
              {selectedArticles.size} makale seçildi
            </span>
            <button
              onClick={handleBulkDelete}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Seçilenleri Sil
            </button>
          </div>
        )}
      </div>

      {/* Articles Table */}
      <div className="bg-black rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedArticles.size === filteredArticles.length && filteredArticles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedArticles(new Set(filteredArticles.map(a => a.id)));
                      } else {
                        setSelectedArticles(new Set());
                      }
                    }}
                    className="rounded border-neutral-600 text-purple-500 focus:ring-purple-500"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Başlık</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Yazar</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Görüntülenme</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Tarih</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredArticles.map((article) => (
                  <motion.tr
                    key={article.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-neutral-800 hover:bg-neutral-900/50 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedArticles.has(article.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedArticles);
                          if (e.target.checked) {
                            newSelected.add(article.id);
                          } else {
                            newSelected.delete(article.id);
                          }
                          setSelectedArticles(newSelected);
                        }}
                        className="rounded border-neutral-600 text-purple-500 focus:ring-purple-500"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <h4 className="text-white font-medium line-clamp-1">{article.title}</h4>
                        <p className="text-sm text-neutral-400">{article.slug}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{article.author_name}</p>
                        <p className="text-sm text-neutral-400">@{article.author_username}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {article.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-sm">
                          <Eye className="w-3 h-3" />
                          Yayında
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-800 text-neutral-400 rounded-md text-sm">
                          <EyeOff className="w-3 h-3" />
                          Taslak
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-white">
                      {article.view_count.toLocaleString('tr-TR')}
                    </td>
                    <td className="p-4 text-neutral-400 text-sm">
                      {new Date(article.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-2 text-neutral-400 hover:text-white transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(article.id, article.is_published)}
                          className="p-2 text-neutral-400 hover:text-white transition-colors"
                        >
                          {article.is_published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-neutral-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">Makale bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}