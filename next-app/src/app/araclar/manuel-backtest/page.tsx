'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter,
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ManualBacktest } from '@/lib/supabase/types';

export default function ManuelBacktestListPage() {
  const [backtests, setBacktests] = useState<ManualBacktest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'total_pnl'>('created_at');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBacktests();
  }, [statusFilter, sortBy]);

  const fetchBacktests = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('manual_backtests')
        .select('*')
        .order(sortBy, { ascending: sortBy === 'name' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setBacktests(data || []);
    } catch (error) {
      console.error('Error fetching backtests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBacktests = backtests.filter(backtest =>
    backtest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    backtest.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const deleteBacktest = async (backtestId: string, backtestName: string) => {
    if (!confirm(`"${backtestName}" stratejisini ve tüm işlemlerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setDeletingId(backtestId);
    try {
      const response = await fetch(`/api/manual-backtests/${backtestId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Silme işlemi başarısız');
      }

      // Refresh the list
      fetchBacktests();
    } catch (error) {
      console.error('Error deleting backtest:', error);
      alert('Backtest silinirken hata oluştu: ' + (error as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-background via-card/30 to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/araclar"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Araçlara Dön
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Manuel Backtest
                </h1>
                <p className="text-muted-foreground">
                  Trading stratejilerinizi manuel olarak test edin ve performanslarını analiz edin
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link
                  href="/araclar/manuel-backtest/yeni"
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Manuel Backtest Oluştur
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card border border-border/50 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Backtest ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="paused">Duraklatılmış</option>
                <option value="completed">Tamamlanmış</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            >
              <option value="created_at">Tarihe Göre</option>
              <option value="name">İsme Göre</option>
              <option value="total_pnl">Performansa Göre</option>
            </select>
          </div>
        </motion.div>

        {/* Backtests Grid */}
        <AnimatePresence>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBacktests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {searchQuery ? 'Sonuç Bulunamadı' : 'Henüz Backtest Yok'}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {searchQuery 
                  ? 'Arama kriterlerinize uygun backtest bulunamadı.'
                  : 'İlk manuel backtest\'inizi oluşturarak trading stratejilerinizi test etmeye başlayın.'
                }
              </p>
              {!searchQuery && (
                <Link
                  href="/araclar/manuel-backtest/yeni"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  İlk Manuel Backtest'inizi Oluşturun
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredBacktests.map((backtest, index) => (
                <motion.div
                  key={backtest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-border/50 rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(backtest.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(backtest.status)}`}>
                          {backtest.status === 'active' ? 'Aktif' : 
                           backtest.status === 'paused' ? 'Duraklatılmış' : 'Tamamlanmış'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {backtest.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {backtest.description || 'Açıklama yok'}
                      </p>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteBacktest(backtest.id, backtest.name);
                      }}
                      disabled={deletingId === backtest.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 text-red-500 rounded-lg disabled:opacity-50"
                      title="Stratejiyi Sil"
                    >
                      {deletingId === backtest.id ? (
                        <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <div className="text-lg font-bold text-foreground">
                        {formatCurrency(backtest.current_balance)}
                      </div>
                      <div className="text-xs text-muted-foreground">Güncel Bakiye</div>
                    </div>
                    
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <div className={`text-lg font-bold ${backtest.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercentage(backtest.total_pnl_percent)}
                      </div>
                      <div className="text-xs text-muted-foreground">Toplam Getiri</div>
                    </div>
                    
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <div className="text-lg font-bold text-foreground">
                        {backtest.total_trades}
                      </div>
                      <div className="text-xs text-muted-foreground">Toplam İşlem</div>
                    </div>
                    
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <div className="text-lg font-bold text-green-500">
                        {backtest.win_rate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Başarı Oranı</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(backtest.created_at).toLocaleDateString('tr-TR')}
                    </div>
                    
                    <Link
                      href={`/araclar/manuel-backtest/${backtest.id}`}
                      className="text-primary hover:text-primary/80 transition-colors font-medium text-sm"
                    >
                      Detaylar →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}