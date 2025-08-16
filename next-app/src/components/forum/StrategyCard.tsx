'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Percent, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Strategy {
  id: string;
  name: string;
  profit_factor?: number;
  win_rate?: number;
  strategy_type?: 'algoritmic' | 'manuel';
}

interface StrategyCardProps {
  strategyId: string;
  className?: string;
}

export default function StrategyCard({ strategyId, className = '' }: StrategyCardProps) {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStrategy();
  }, [strategyId]);

  const fetchStrategy = async () => {
    try {
      const supabase = createClient();
      
      // First try trading_strategies table
      const { data: tradingStrategy, error: tradingError } = await supabase
        .from('trading_strategies')
        .select('id, name, profit_factor, win_rate')
        .eq('id', strategyId)
        .single();

      if (tradingStrategy && !tradingError) {
        setStrategy({
          ...tradingStrategy,
          strategy_type: 'algoritmic'
        });
        return;
      }

      // If not found, try manual_backtests table
      const { data: manualBacktest, error: manualError } = await supabase
        .from('manual_backtests')
        .select('id, name, profit_factor, win_rate')
        .eq('id', strategyId)
        .single();

      if (manualBacktest && !manualError) {
        setStrategy({
          ...manualBacktest,
          strategy_type: 'manuel'
        });
        return;
      }

      // If not found in either table
      throw new Error('Strategy not found in any table');
      
    } catch (error) {
      console.error('Error fetching strategy:', error);
      // Fallback strategy data
      setStrategy({
        id: strategyId,
        name: 'Strateji Bulunamadı',
        profit_factor: undefined,
        win_rate: undefined
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`inline-block bg-muted/50 rounded-lg p-3 animate-pulse ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-muted rounded" />
          <div className="w-32 h-4 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!strategy) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`inline-block ${className}`}
    >
      <Link
        href={`/trading-stratejileri/${strategy.id}`}
        className="block bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-2 sm:p-3 hover:from-primary/10 hover:to-primary/15 hover:border-primary/30 transition-all duration-200 group w-full"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 p-1.5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                {strategy.name}
              </h4>
              {strategy.strategy_type && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${
                  strategy.strategy_type === 'manuel'
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                }`}>
                  {strategy.strategy_type === 'manuel' ? 'Manuel' : 'Algoritmik'}
                </span>
              )}
              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {strategy.profit_factor && (
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span className="font-medium">PF: {strategy.profit_factor.toFixed(2)}</span>
                </div>
              )}
              {strategy.win_rate && (
                <div className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span className="font-medium">WR: {strategy.win_rate.toFixed(1)}%</span>
                </div>
              )}
              {!strategy.profit_factor && !strategy.win_rate && (
                <span className="text-muted-foreground/70">Bilgi yok</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}