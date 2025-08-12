'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  Pin,
  Lock,
  Unlock,
  Users,
  Calendar,
  User,
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  vote_score: number;
  created_at: string;
  updated_at: string;
}

export default function AdminForumTopicsPage() {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pinned' | 'locked'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchTopics();
  }, [currentPage, filter, searchTerm]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      let query = supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          slug,
          content,
          is_pinned,
          is_locked,
          view_count,
          reply_count,
          vote_score,
          created_at,
          updated_at,
          author:users!forum_topics_author_id_fkey(
            id,
            name,
            username,
            avatar_url
          ),
          category:categories!forum_topics_category_id_fkey(
            id,
            name,
            slug,
            color
          )
        `, { count: 'exact' });

      // Apply filters
      if (filter === 'pinned') {
        query = query.eq('is_pinned', true);
      } else if (filter === 'locked') {
        query = query.eq('is_locked', true);
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setTopics(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (topicId: string, isPinned: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_pinned: !isPinned })
        .eq('id', topicId);

      if (error) throw error;

      // Update local state
      setTopics(topics.map(topic => 
        topic.id === topicId 
          ? { ...topic, is_pinned: !isPinned }
          : topic
      ));
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleToggleLock = async (topicId: string, isLocked: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_locked: !isLocked })
        .eq('id', topicId);

      if (error) throw error;

      // Update local state
      setTopics(topics.map(topic => 
        topic.id === topicId 
          ? { ...topic, is_locked: !isLocked }
          : topic
      ));
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Bu konuyu silmek istediğinizden emin misiniz?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('forum_topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;

      // Remove from local state
      setTopics(topics.filter(topic => topic.id !== topicId));
      setTotalCount(prev => prev - 1);
      setSelectedTopics(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(topicId);
        return newSelected;
      });
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const handleToggleSelect = (topicId: string) => {
    setSelectedTopics(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(topicId)) {
        newSelected.delete(topicId);
      } else {
        newSelected.add(topicId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedTopics.size === topics.length) {
      setSelectedTopics(new Set());
    } else {
      setSelectedTopics(new Set(topics.map(topic => topic.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTopics.size === 0) return;
    
    setIsDeleteModalOpen(false);
    
    try {
      const supabase = createClient();
      const topicIds = Array.from(selectedTopics);
      
      const { error } = await supabase
        .from('forum_topics')
        .delete()
        .in('id', topicIds);

      if (error) throw error;

      // Remove from local state
      setTopics(topics.filter(topic => !selectedTopics.has(topic.id)));
      setTotalCount(prev => prev - selectedTopics.size);
      setSelectedTopics(new Set());
    } catch (error) {
      console.error('Error deleting topics:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Forum Konuları</h1>
              <p className="text-muted-foreground">
                Forum konularını yönetin - toplam {totalCount} konu
              </p>
            </div>
            <Link 
              href="/admin/forum-topics/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Yeni Konu
            </Link>
          </div>

          {/* Bulk Actions */}
          {selectedTopics.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  <span className="font-medium text-primary">
                    {selectedTopics.size} konu seçildi
                  </span>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Seçilileri Sil
                </button>
              </div>
            </motion.div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Konu ara..."
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Tümü
                </span>
              </button>
              <button
                onClick={() => setFilter('pinned')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filter === 'pinned'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Pin className="w-4 h-4" />
                  Sabitlenmiş
                </span>
              </button>
              <button
                onClick={() => setFilter('locked')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filter === 'locked'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Kilitli
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Topics List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card rounded-xl p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-card rounded-xl"
          >
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Konu bulunamadı
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Arama kriterlerinize uygun konu bulunamadı.' : 'Henüz hiç konu oluşturulmamış.'}
            </p>
            <Link 
              href="/admin/forum-topics/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              İlk Konuyu Oluştur
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Select All */}
            {topics.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {selectedTopics.size === topics.length ? (
                    <CheckSquare className="w-5 h-5 text-primary" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {selectedTopics.size === topics.length ? 'Tümünün seçimini kaldır' : 'Tümünü seç'}
                  </span>
                </button>
                <div className="text-sm text-muted-foreground">
                  ({topics.length} konu)
                </div>
              </div>
            )}
            
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <button
                      onClick={() => handleToggleSelect(topic.id)}
                      className="p-1 hover:bg-muted/50 rounded transition-colors"
                    >
                      {selectedTopics.has(topic.id) ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  
                  {/* Category Color */}
                  <div 
                    className="w-1 h-16 rounded-full flex-shrink-0"
                    style={{ backgroundColor: topic.category.color }}
                  ></div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {topic.is_pinned && (
                            <Pin className="w-4 h-4 text-primary" />
                          )}
                          {topic.is_locked && (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                          <h3 className="text-lg font-semibold text-foreground line-clamp-1 break-long-words">
                            {topic.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{topic.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(topic.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                            <span className="text-xs font-medium" style={{ color: topic.category.color }}>
                              {topic.category.name}
                            </span>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 break-long-words">
                          {topic.content}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{topic.view_count} görüntüleme</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{topic.reply_count} yanıt</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{topic.vote_score} oy</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          href={`/forum/${topic.category.slug}/${topic.slug}`}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                          title="Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        <Link
                          href={`/admin/forum-topics/${topic.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleTogglePin(topic.id, topic.is_pinned)}
                          className={`p-2 rounded-lg transition-colors ${
                            topic.is_pinned
                              ? 'text-primary bg-primary/10 hover:bg-primary/20'
                              : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                          }`}
                          title={topic.is_pinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleLock(topic.id, topic.is_locked)}
                          className={`p-2 rounded-lg transition-colors ${
                            topic.is_locked
                              ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
                              : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10'
                          }`}
                          title={topic.is_locked ? 'Kilidi Aç' : 'Kilitle'}
                        >
                          {topic.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && <span className="text-muted-foreground">...</span>}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl p-6 max-w-md w-full border border-border shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Konuları Sil
                </h3>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Seçili {selectedTopics.size} konuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}