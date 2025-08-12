'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Percent, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Strategy {
  id: string;
  name: string;
  profit_factor?: number;
  win_rate?: number;
  author_name?: string;
  strategy_type?: 'algoritmic' | 'manuel';
}

interface StrategyMentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (strategyId: string, strategyName: string) => void;
  query?: string;
}

export default function StrategyMentionModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  query = '' 
}: StrategyMentionModalProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [myStrategies, setMyStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [myStrategiesLoading, setMyStrategiesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
  const [activeTab, setActiveTab] = useState<'discover' | 'mine'>('discover');

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'discover') {
        searchStrategies(searchQuery);
      } else {
        searchMyStrategies(searchQuery);
      }
    }
  }, [isOpen, searchQuery, activeTab]);

  const searchStrategies = async (search: string = '') => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('trading_strategies')
        .select('id, name, profit_factor, win_rate')
        .limit(20);

      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const formattedStrategies = data?.map(strategy => ({
        id: strategy.id,
        name: strategy.name,
        profit_factor: strategy.profit_factor,
        win_rate: strategy.win_rate,
        author_name: undefined // Skip author name for now to avoid relationship issues
      })) || [];

      setStrategies(formattedStrategies);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  };

  const searchMyStrategies = async (search: string = '') => {
    setMyStrategiesLoading(true);
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMyStrategies([]);
        return;
      }

      // Search both trading strategies and manual backtests
      let strategyQuery = supabase
        .from('trading_strategies')
        .select('id, name, profit_factor, win_rate')
        .eq('author_id', user.id)
        .limit(10);

      let backtestQuery = supabase
        .from('manual_backtests')
        .select('id, name, profit_factor, win_rate')
        .eq('user_id', user.id)
        .limit(10);

      if (search.trim()) {
        strategyQuery = strategyQuery.ilike('name', `%${search.trim()}%`);
        backtestQuery = backtestQuery.ilike('name', `%${search.trim()}%`);
      }

      const [{ data: tradingStrategies }, { data: manualBacktests }] = await Promise.all([
        strategyQuery,
        backtestQuery
      ]);

      const formattedStrategies: Strategy[] = [
        // Trading strategies (algoritmic)
        ...(tradingStrategies || []).map(strategy => ({
          id: strategy.id,
          name: strategy.name,
          profit_factor: strategy.profit_factor,
          win_rate: strategy.win_rate,
          author_name: undefined,
          strategy_type: 'algoritmic' as const
        })),
        // Manual backtests
        ...(manualBacktests || []).map(backtest => ({
          id: backtest.id,
          name: backtest.name,
          profit_factor: backtest.profit_factor,
          win_rate: backtest.win_rate,
          author_name: undefined,
          strategy_type: 'manuel' as const
        }))
      ];

      setMyStrategies(formattedStrategies);
    } catch (error) {
      console.error('Error fetching my strategies:', error);
      setMyStrategies([]);
    } finally {
      setMyStrategiesLoading(false);
    }
  };

  const handleSelect = (strategy: Strategy) => {
    onSelect(strategy.id, strategy.name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border/50 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Strateji Seç</h3>
              <p className="text-sm text-muted-foreground">Foruma eklemek için bir strateji seçin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/50">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'discover'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Keşfet
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'mine'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Kendi Stratejilerim
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Strateji ara..."
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Strategy List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {(activeTab === 'discover' && loading) || (activeTab === 'mine' && myStrategiesLoading) ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">
                {activeTab === 'discover' ? 'Stratejiler yükleniyor...' : 'Kendi stratejileriniz yükleniyor...'}
              </p>
            </div>
          ) : (activeTab === 'discover' ? strategies : myStrategies).length === 0 ? (
            <div className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Arama kriterinize uygun strateji bulunamadı' 
                  : activeTab === 'discover' 
                    ? 'Henüz strateji yok'
                    : 'Henüz kendi stratejiniz yok'
                }
              </p>
            </div>
          ) : (
            <div className="p-4">
              <div className="space-y-3">
                {(activeTab === 'discover' ? strategies : myStrategies).map((strategy) => (
                  <motion.button
                    key={strategy.id}
                    onClick={() => handleSelect(strategy)}
                    className="w-full p-4 bg-background/50 border border-border/50 rounded-xl hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 text-left"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{strategy.name}</h4>
                          {strategy.strategy_type && (
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              strategy.strategy_type === 'manuel'
                                ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                            }`}>
                              {strategy.strategy_type === 'manuel' ? 'Manuel' : 'Algoritmik'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {strategy.profit_factor && (
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              <span>PF: {strategy.profit_factor.toFixed(2)}</span>
                            </div>
                          )}
                          {strategy.win_rate && (
                            <div className="flex items-center gap-1">
                              <Percent className="w-4 h-4" />
                              <span>WR: {strategy.win_rate.toFixed(1)}%</span>
                            </div>
                          )}
                          {!strategy.profit_factor && !strategy.win_rate && (
                            <span className="text-muted-foreground/70">Bilgi yok</span>
                          )}
                        </div>
                      </div>
                      <div className="text-primary">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            Strateji seçtikten sonra forum postuna otomatik olarak eklenecektir
          </p>
        </div>
      </motion.div>
    </div>
  );
}