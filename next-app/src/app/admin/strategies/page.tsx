'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trash2, Eye, Calendar, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  category: string;
  timeframe: string;
  is_premium: boolean;
  total_trades: number;
  win_rate: number;
  total_net_profit: number;
  profit_factor: number;
  created_at: string;
  author_id: string;
}

export default function AdminStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('trading_strategies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching strategies:', error);
        return;
      }

      setStrategies(data || []);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStrategy = (strategyId: string) => {
    setSelectedStrategies(prev => 
      prev.includes(strategyId) 
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStrategies([]);
    } else {
      setSelectedStrategies(strategies.map(s => s.id));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    if (selectedStrategies.length === 0) return;
    
    const confirmDelete = confirm(`${selectedStrategies.length} stratejiyi silmek istediğinizden emin misiniz?`);
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      const supabase = createClient();
      
      // First delete associated trades
      const { error: tradesError } = await supabase
        .from('strategy_trades')
        .delete()
        .in('strategy_id', selectedStrategies);

      if (tradesError) {
        console.error('Error deleting trades:', tradesError);
      }

      // Then delete strategies
      const { error } = await supabase
        .from('trading_strategies')
        .delete()
        .in('id', selectedStrategies);

      if (error) {
        console.error('Error deleting strategies:', error);
        alert('Stratejiler silinirken bir hata oluştu');
        return;
      }

      // Update local state
      setStrategies(prev => prev.filter(s => !selectedStrategies.includes(s.id)));
      setSelectedStrategies([]);
      setSelectAll(false);
      
      alert(`${selectedStrategies.length} strateji başarıyla silindi`);
    } catch (error) {
      console.error('Error deleting strategies:', error);
      alert('Stratejiler silinirken bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSingle = async (strategyId: string, strategyName: string) => {
    const confirmDelete = confirm(`"${strategyName}" stratejisini silmek istediğinizden emin misiniz?`);
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      const supabase = createClient();
      
      // First delete associated trades
      const { error: tradesError } = await supabase
        .from('strategy_trades')
        .delete()
        .eq('strategy_id', strategyId);

      if (tradesError) {
        console.error('Error deleting trades:', tradesError);
      }

      // Then delete strategy
      const { error } = await supabase
        .from('trading_strategies')
        .delete()
        .eq('id', strategyId);

      if (error) {
        console.error('Error deleting strategy:', error);
        alert('Strateji silinirken bir hata oluştu');
        return;
      }

      // Update local state
      setStrategies(prev => prev.filter(s => s.id !== strategyId));
      setSelectedStrategies(prev => prev.filter(id => id !== strategyId));
      
      alert('Strateji başarıyla silindi');
    } catch (error) {
      console.error('Error deleting strategy:', error);
      alert('Strateji silinirken bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-700 border-t-purple-400"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Strateji Yönetimi</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-black rounded-xl p-6 border border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-400">Toplam Strateji</h3>
          <p className="text-2xl font-bold text-white mt-2">{strategies.length}</p>
        </div>
        <div className="bg-black rounded-xl p-6 border border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-400">Seçili Strateji</h3>
          <p className="text-2xl font-bold text-purple-400 mt-2">{selectedStrategies.length}</p>
        </div>
        <div className="bg-black rounded-xl p-6 border border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-400">Premium Strateji</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {strategies.filter(s => s.is_premium).length}
          </p>
        </div>
        <div className="bg-black rounded-xl p-6 border border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-400">Ücretsiz Strateji</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {strategies.filter(s => !s.is_premium).length}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-black rounded-xl border border-neutral-800 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="rounded border-neutral-600 text-purple-400 focus:ring-purple-400 bg-neutral-800"
              />
              <span className="text-sm font-medium text-white">Tümünü Seç</span>
            </label>
            <span className="text-sm text-neutral-400">
              {selectedStrategies.length} / {strategies.length} seçili
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleDeleteSelected}
              disabled={selectedStrategies.length === 0 || deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Siliniyor...' : `Seçilileri Sil (${selectedStrategies.length})`}
            </button>
            <button
              onClick={fetchStrategies}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {/* Strategies Table */}
      <div className="bg-black rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Seç
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Strateji
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Zaman Dilimi
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  İşlem Sayısı
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Net Kar
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Tür
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {strategies.map((strategy) => (
                <tr key={strategy.id} className="hover:bg-neutral-900/50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStrategies.includes(strategy.id)}
                      onChange={() => handleSelectStrategy(strategy.id)}
                      className="rounded border-neutral-600 text-purple-400 focus:ring-purple-400 bg-neutral-800"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {strategy.name}
                      </div>
                      <div className="text-sm text-neutral-400 max-w-xs truncate">
                        {strategy.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {strategy.category}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-card dark:text-foreground">
                      {strategy.timeframe}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {strategy.total_trades || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      {strategy.win_rate ? (
                        <>
                          {strategy.win_rate >= 50 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className={strategy.win_rate >= 50 ? 'text-green-400' : 'text-red-400'}>
                            {strategy.win_rate.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-medium ${
                      (strategy.total_net_profit || 0) >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {strategy.total_net_profit 
                        ? `${strategy.total_net_profit >= 0 ? '+' : ''}${strategy.total_net_profit.toLocaleString()}`
                        : '-'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      strategy.is_premium 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-card dark:text-foreground'
                        : 'bg-green-100 text-green-800 dark:bg-card dark:text-foreground'
                    }`}>
                      {strategy.is_premium ? 'Premium' : 'Ücretsiz'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(strategy.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`/trading-stratejileri/${strategy.id}`, '_blank')}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(strategy.id, strategy.name)}
                        disabled={deleting}
                        className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {strategies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-400">Henüz strateji bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
}