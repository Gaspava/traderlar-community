'use client';

import { useState, useEffect } from 'react';
import { 
  Trash2,
  CheckSquare,
  Square,
  Search,
  Filter,
  MessageSquare,
  Eye,
  Lock,
  Pin,
  RefreshCw,
  AlertTriangle,
  Calendar,
  User,
  Tag,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';

interface ForumTopic {
  id: string;
  title: string;
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
  };
  created_at: string;
  updated_at: string;
  view_count: number;
  post_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_removed: boolean;
  tags: string[];
  last_post_at?: string;
}

export default function ForumManagementPage() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    fetchForumTopics();
  }, [searchQuery, categoryFilter, statusFilter]);

  const fetchForumTopics = async () => {
    setLoading(true);
    try {
      // Mock forum topics data - gerçek uygulamada Supabase'den gelecek
      const mockTopics: ForumTopic[] = [
        {
          id: '1',
          title: 'EURUSD Analizi - Güçlü Yükseliş Trendi Devam Ediyor',
          content: 'EURUSD paritesi son günlerde güçlü bir yükseliş trendi sergiliyor. Teknik analize göre...',
          author: {
            id: 'user1',
            name: 'Ahmet Trader',
            username: 'ahmet_trader',
            avatar_url: ''
          },
          category: {
            id: 'cat1',
            name: 'Piyasa Analizleri',
            slug: 'piyasa-analizleri'
          },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          view_count: 245,
          post_count: 12,
          is_pinned: false,
          is_locked: false,
          is_removed: false,
          tags: ['forex', 'eurusd', 'analiz'],
          last_post_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Bitcoin 50K Direncini Kırdı! Sıradaki Hedef Ne?',
          content: 'Bitcoin nihayet 50.000 dolar direncini kırmayı başardı. Bu durumda sıradaki hedefler...',
          author: {
            id: 'user2',
            name: 'Zeynep Crypto',
            username: 'zeynep_crypto',
            avatar_url: ''
          },
          category: {
            id: 'cat2',
            name: 'Genel Tartışma',
            slug: 'genel-tartisma'
          },
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          view_count: 389,
          post_count: 28,
          is_pinned: true,
          is_locked: false,
          is_removed: false,
          tags: ['bitcoin', 'kripto', 'analiz'],
          last_post_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Spam İçerik - Bu konu silinmeli',
          content: 'Bu bir spam içeriktir ve hemen silinmelidir. Gereksiz reklam içeriği...',
          author: {
            id: 'user3',
            name: 'Spam User',
            username: 'spammer123',
            avatar_url: ''
          },
          category: {
            id: 'cat2',
            name: 'Genel Tartışma',
            slug: 'genel-tartisma'
          },
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          view_count: 23,
          post_count: 1,
          is_pinned: false,
          is_locked: false,
          is_removed: false,
          tags: ['spam'],
          last_post_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          title: 'Algoritmik Trading Stratejileri',
          content: 'Algoritmik trading ile ilgili deneyimlerinizi paylaşalım...',
          author: {
            id: 'user4',
            name: 'Mehmet Algo',
            username: 'mehmet_algo',
            avatar_url: ''
          },
          category: {
            id: 'cat3',
            name: 'Algoritmik Ticaret',
            slug: 'algoritmik-ticaret'
          },
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          view_count: 156,
          post_count: 18,
          is_pinned: false,
          is_locked: true,
          is_removed: false,
          tags: ['algoritma', 'bot', 'strateji'],
          last_post_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          title: 'Kural İhlali - Uygunsuz İçerik',
          content: 'Bu konu topluluk kurallarını ihlal ediyor...',
          author: {
            id: 'user5',
            name: 'Problem User',
            username: 'problem_user',
            avatar_url: ''
          },
          category: {
            id: 'cat2',
            name: 'Genel Tartışma',
            slug: 'genel-tartisma'
          },
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          view_count: 45,
          post_count: 3,
          is_pinned: false,
          is_locked: false,
          is_removed: false,
          tags: ['kural-ihlali'],
          last_post_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ];

      // Filtreleme işlemleri
      let filteredTopics = mockTopics;

      // Arama filtresi
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredTopics = filteredTopics.filter(topic => 
          topic.title.toLowerCase().includes(query) || 
          topic.content.toLowerCase().includes(query) ||
          topic.author.name.toLowerCase().includes(query) ||
          topic.author.username.toLowerCase().includes(query) ||
          topic.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Kategori filtresi
      if (categoryFilter) {
        filteredTopics = filteredTopics.filter(topic => 
          topic.category.slug === categoryFilter
        );
      }

      // Durum filtresi
      if (statusFilter === 'pinned') {
        filteredTopics = filteredTopics.filter(topic => topic.is_pinned);
      } else if (statusFilter === 'locked') {
        filteredTopics = filteredTopics.filter(topic => topic.is_locked);
      } else if (statusFilter === 'removed') {
        filteredTopics = filteredTopics.filter(topic => topic.is_removed);
      }

      setTopics(filteredTopics);
    } catch (error) {
      console.error('Error fetching forum topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedTopics.length === topics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(topics.map(topic => topic.id));
    }
  };

  const handleSelectTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter(id => id !== topicId));
    } else {
      setSelectedTopics([...selectedTopics, topicId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTopics.length === 0) {
      alert('Lütfen silmek istediğiniz konuları seçin.');
      return;
    }

    const confirmed = window.confirm(
      `${selectedTopics.length} forum konusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm yorumlar da silinecektir.`
    );

    if (confirmed) {
      try {
        setLoading(true);
        
        // TODO: Gerçek uygulamada Supabase ile silme işlemi yapılacak
        console.log('Deleting topics:', selectedTopics);
        
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // State'ten silinen konuları kaldır
        setTopics(topics.filter(topic => !selectedTopics.includes(topic.id)));
        setSelectedTopics([]);
        
        alert(`${selectedTopics.length} forum konusu başarıyla silindi.`);
      } catch (error) {
        console.error('Error deleting topics:', error);
        alert('Silme işlemi sırasında bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSingleDelete = async (topicId: string, topicTitle: string) => {
    const confirmed = window.confirm(
      `"${topicTitle}" konusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );

    if (confirmed) {
      try {
        // TODO: Gerçek uygulamada Supabase ile silme işlemi yapılacak
        console.log('Deleting single topic:', topicId);
        
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // State'ten silinen konuyu kaldır
        setTopics(topics.filter(topic => topic.id !== topicId));
        
        alert('Konu başarıyla silindi.');
      } catch (error) {
        console.error('Error deleting topic:', error);
        alert('Silme işlemi sırasında bir hata oluştu.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'şimdi';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const categories = [
    { slug: '', name: 'Tüm Kategoriler' },
    { slug: 'genel-tartisma', name: 'Genel Tartışma' },
    { slug: 'piyasa-analizleri', name: 'Piyasa Analizleri' },
    { slug: 'algoritmik-ticaret', name: 'Algoritmik Ticaret' },
    { slug: 'strateji-paylasimi', name: 'Strateji Paylaşımı' },
    { slug: 'egitim-kaynaklari', name: 'Eğitim Kaynakları' }
  ];

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'pinned', label: 'Sabitlenmiş' },
    { value: 'locked', label: 'Kilitlenmiş' },
    { value: 'removed', label: 'Silinmiş' }
  ];

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-background' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-muted' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className={`text-3xl font-bold ${
              isDarkMode ? 'text-foreground' : 'text-gray-900'
            }`}>
              Forum Yönetimi
            </h1>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              Forum konularını yönetin ve toplu işlemler yapın
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className={`rounded-xl border p-6 mb-6 ${
          isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Forum konularında ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-background border-border text-foreground placeholder-muted-foreground' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-background border-border text-foreground' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
            >
              {categories.map(category => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-background border-border text-foreground' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchForumTopics}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isDarkMode ? 'hover:bg-muted' : 'hover:bg-gray-100'
                }`}
              >
                {selectedTopics.length === topics.length ? 
                  <CheckSquare className="w-4 h-4" /> : 
                  <Square className="w-4 h-4" />
                }
                Tümünü Seç ({topics.length})
              </button>

              {selectedTopics.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedTopics.length} konu seçili
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Toplu Sil
                  </button>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Toplam {topics.length} konu
            </div>
          </div>
        </div>

        {/* Topics List */}
        <div className={`rounded-xl border ${
          isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
        }`}>
          {loading && topics.length === 0 ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3 p-4 rounded-lg border">
                      <div className="w-4 h-4 bg-muted rounded" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : topics.length > 0 ? (
            <div className="divide-y divide-border">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    selectedTopics.includes(topic.id)
                      ? (isDarkMode ? 'bg-primary/10' : 'bg-blue-50')
                      : (isDarkMode ? 'hover:bg-muted/50' : 'hover:bg-gray-50')
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleSelectTopic(topic.id)}
                    className="flex-shrink-0"
                  >
                    {selectedTopics.includes(topic.id) ? 
                      <CheckSquare className="w-4 h-4 text-primary" /> : 
                      <Square className="w-4 h-4 text-muted-foreground" />
                    }
                  </button>

                  {/* Topic Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Status Icons */}
                      {topic.is_pinned && <Pin className="w-4 h-4 text-green-500" />}
                      {topic.is_locked && <Lock className="w-4 h-4 text-yellow-500" />}
                      {topic.is_removed && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      
                      {/* Title */}
                      <h3 className={`font-medium text-sm truncate ${
                        isDarkMode ? 'text-foreground' : 'text-gray-900'
                      }`}>
                        {topic.title}
                      </h3>
                    </div>

                    {/* Meta Information */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        @{topic.author.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {topic.category.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(topic.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {topic.view_count} görüntülenme
                      </span>
                      <span>{topic.post_count} yanıt</span>
                    </div>

                    {/* Tags */}
                    {topic.tags.length > 0 && (
                      <div className="flex gap-1">
                        {topic.tags.map(tag => (
                          <span
                            key={tag}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                              isDarkMode ? 'bg-muted text-muted-foreground' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className={`p-2 rounded transition-colors ${
                        isDarkMode ? 'hover:bg-muted' : 'hover:bg-gray-100'
                      }`}
                      title="Görüntüle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSingleDelete(topic.id, topic.title)}
                      className="p-2 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-foreground' : 'text-gray-900'
              }`}>
                Forum konusu bulunamadı
              </h3>
              <p className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>
                {searchQuery || categoryFilter || statusFilter 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'Henüz forum konusu eklenmemiş'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}