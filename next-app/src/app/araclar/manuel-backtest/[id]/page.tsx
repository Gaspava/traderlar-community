'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Pause,
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  Square,
  Edit,
  Save,
  X,
  BarChart3,
  DollarSign,
  Percent,
  Clock,
  Hash,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ManualBacktest, ManualBacktestTrade, CreateTradeData } from '@/lib/supabase/types';
import PerformanceChart from '@/components/charts/PerformanceChart';
import TradeDistributionChart from '@/components/charts/TradeDistributionChart';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import KeyboardShortcutsPanel from '@/components/KeyboardShortcutsPanel';

interface TradeFormData {
  symbol: string;
  trade_type: 'long' | 'short';
  entry_price: string;
  position_size: string;
  stop_loss: string;
  take_profit: string;
  risk_amount: string;
  entry_notes: string;
}

export default function BacktestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [backtest, setBacktest] = useState<ManualBacktest | null>(null);
  const [trades, setTrades] = useState<ManualBacktestTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [submittingTrade, setSubmittingTrade] = useState(false);
  const [editingTrade, setEditingTrade] = useState<ManualBacktestTrade | null>(null);

  const [tradeForm, setTradeForm] = useState<TradeFormData>({
    symbol: '',
    trade_type: 'long',
    entry_price: '',
    position_size: '',
    stop_loss: '',
    take_profit: '',
    risk_amount: '',
    entry_notes: ''
  });

  const [exitForm, setExitForm] = useState({
    exit_price: '',
    exit_reason: 'manual' as 'tp' | 'sl' | 'manual' | 'time',
    exit_notes: ''
  });

  // Quick trade templates
  const [quickTradeSettings, setQuickTradeSettings] = useState({
    defaultSymbol: 'EURUSD',
    defaultPositionSize: '0.10',
    defaultRiskPercent: 2,
  });

  useEffect(() => {
    fetchBacktest();
    fetchTrades();
  }, [params.id]);

  const fetchBacktest = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('manual_backtests')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setBacktest(data);
    } catch (error) {
      console.error('Error fetching backtest:', error);
      router.push('/araclar/manuel-backtest');
    }
  };

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/manual-backtests/${params.id}/trades`);
      const { trades } = await response.json();
      setTrades(trades || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backtest || submittingTrade) return;

    setSubmittingTrade(true);
    try {
      const now = new Date();
      const tradeData: CreateTradeData = {
        symbol: tradeForm.symbol.trim().toUpperCase(),
        trade_type: tradeForm.trade_type,
        position_size: parseFloat(tradeForm.position_size),
        entry_date: now.toISOString().split('T')[0],
        entry_time: now.toTimeString().split(' ')[0],
        entry_price: parseFloat(tradeForm.entry_price),
        stop_loss: tradeForm.stop_loss ? parseFloat(tradeForm.stop_loss) : undefined,
        take_profit: tradeForm.take_profit ? parseFloat(tradeForm.take_profit) : undefined,
        risk_amount: parseFloat(tradeForm.risk_amount),
        entry_notes: tradeForm.entry_notes.trim() || undefined
      };

      const response = await fetch(`/api/manual-backtests/${params.id}/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'İşlem eklenirken hata oluştu');
      }

      // Reset form and refresh data
      setTradeForm({
        symbol: '',
        trade_type: 'long',
        entry_price: '',
        position_size: '',
        stop_loss: '',
        take_profit: '',
        risk_amount: '',
        entry_notes: ''
      });
      setShowTradeForm(false);
      await Promise.all([fetchBacktest(), fetchTrades()]);
    } catch (error) {
      console.error('Error adding trade:', error);
      // TODO: Show error toast
    } finally {
      setSubmittingTrade(false);
    }
  };

  const handleCloseTrade = async (trade: ManualBacktestTrade, reason: 'tp' | 'sl' | 'manual') => {
    try {
      const now = new Date();
      let exitPrice: number;

      // Auto-set exit price based on reason
      if (reason === 'tp' && trade.take_profit) {
        exitPrice = trade.take_profit;
      } else if (reason === 'sl' && trade.stop_loss) {
        exitPrice = trade.stop_loss;
      } else {
        exitPrice = parseFloat(exitForm.exit_price);
        if (!exitPrice) {
          alert('Lütfen çıkış fiyatını girin');
          return;
        }
      }

      const response = await fetch(`/api/manual-backtests/${params.id}/trades/${trade.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exit_date: now.toISOString().split('T')[0],
          exit_time: now.toTimeString().split(' ')[0],
          exit_price: exitPrice,
          exit_reason: reason,
          exit_notes: exitForm.exit_notes.trim() || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'İşlem kapatılırken hata oluştu');
      }

      // Reset exit form and refresh data
      setExitForm({ exit_price: '', exit_reason: 'manual', exit_notes: '' });
      setEditingTrade(null);
      await Promise.all([fetchBacktest(), fetchTrades()]);
    } catch (error) {
      console.error('Error closing trade:', error);
      // TODO: Show error toast
    }
  };

  const calculateRiskAmount = useCallback(() => {
    if (backtest && tradeForm.entry_price && tradeForm.stop_loss) {
      const entryPrice = parseFloat(tradeForm.entry_price);
      const stopLoss = parseFloat(tradeForm.stop_loss);
      const positionSize = parseFloat(tradeForm.position_size);
      
      if (entryPrice && stopLoss && positionSize) {
        const priceDiff = Math.abs(entryPrice - stopLoss);
        const riskAmount = priceDiff * positionSize;
        setTradeForm(prev => ({ ...prev, risk_amount: riskAmount.toFixed(2) }));
      }
    }
  }, [backtest, tradeForm.entry_price, tradeForm.stop_loss, tradeForm.position_size]);

  useEffect(() => {
    calculateRiskAmount();
  }, [calculateRiskAmount]);

  // Quick trade functions
  const openQuickLong = () => {
    setTradeForm({
      symbol: quickTradeSettings.defaultSymbol,
      trade_type: 'long',
      position_size: quickTradeSettings.defaultPositionSize,
      entry_price: '',
      stop_loss: '',
      take_profit: '',
      risk_amount: '',
      entry_notes: ''
    });
    setShowTradeForm(true);
  };

  const openQuickShort = () => {
    setTradeForm({
      symbol: quickTradeSettings.defaultSymbol,
      trade_type: 'short',
      position_size: quickTradeSettings.defaultPositionSize,
      entry_price: '',
      stop_loss: '',
      take_profit: '',
      risk_amount: '',
      entry_notes: ''
    });
    setShowTradeForm(true);
  };

  const handleTakeProfitAll = () => {
    openTrades.forEach(trade => {
      if (trade.take_profit) {
        handleCloseTrade(trade, 'tp');
      }
    });
  };

  const handleStopLossAll = () => {
    openTrades.forEach(trade => {
      if (trade.stop_loss) {
        handleCloseTrade(trade, 'sl');
      }
    });
  };

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onNewTrade: () => setShowTradeForm(true),
    onQuickLong: openQuickLong,
    onQuickShort: openQuickShort,
    onTakeProfit: handleTakeProfitAll,
    onStopLoss: handleStopLossAll,
    onCancel: () => {
      setShowTradeForm(false);
      setEditingTrade(null);
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: backtest?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (!backtest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const openTrades = trades.filter(t => t.status === 'open');
  const closedTrades = trades.filter(t => t.status === 'closed');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-background via-card/30 to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/araclar/manuel-backtest"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Manuel Backtest'e Dön
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {backtest.name}
                </h1>
                <p className="text-muted-foreground">
                  {backtest.description || 'Açıklama yok'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  backtest.status === 'active' 
                    ? 'bg-green-500/10 text-green-600 border-green-500/20'
                    : backtest.status === 'paused'
                    ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                    : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                }`}>
                  {backtest.status === 'active' ? 'Aktif' : 
                   backtest.status === 'paused' ? 'Duraklatılmış' : 'Tamamlanmış'}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={openQuickLong}
                    disabled={backtest.status !== 'active'}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg hover:bg-green-500/20 disabled:bg-muted disabled:text-muted-foreground disabled:border-border/50 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Long
                  </button>
                  
                  <button
                    onClick={openQuickShort}
                    disabled={backtest.status !== 'active'}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg hover:bg-red-500/20 disabled:bg-muted disabled:text-muted-foreground disabled:border-border/50 transition-colors"
                  >
                    <TrendingDown className="w-4 h-4" />
                    Short
                  </button>
                  
                  <button
                    onClick={() => setShowTradeForm(true)}
                    disabled={backtest.status !== 'active'}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Detaylı İşlem
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8"
        >
          <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
            <DollarSign className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(backtest.current_balance)}
            </div>
            <div className="text-sm text-muted-foreground">Güncel Bakiye</div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className={`text-xl font-bold ${backtest.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(backtest.total_pnl)}
            </div>
            <div className="text-sm text-muted-foreground">Net P&L</div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
            <Percent className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className={`text-xl font-bold ${backtest.total_pnl_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(backtest.total_pnl_percent)}
            </div>
            <div className="text-sm text-muted-foreground">Toplam Getiri</div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
            <Hash className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-foreground">
              {backtest.total_trades}
            </div>
            <div className="text-sm text-muted-foreground">Toplam İşlem</div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-500">
              {backtest.win_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Başarı Oranı</div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
            <BarChart3 className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-foreground">
              {backtest.profit_factor.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Profit Factor</div>
          </div>
        </motion.div>

        {/* Open Trades */}
        {openTrades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Açık İşlemler ({openTrades.length})
            </h2>
            <div className="grid gap-4">
              {openTrades.map((trade) => (
                <div key={trade.id} className="bg-card border border-border/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        trade.trade_type === 'long' 
                          ? 'bg-green-500/10 text-green-600' 
                          : 'bg-red-500/10 text-red-600'
                      }`}>
                        {trade.trade_type === 'long' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{trade.symbol}</h3>
                        <p className="text-sm text-muted-foreground">
                          {trade.trade_type === 'long' ? 'Long' : 'Short'} • {trade.position_size} lot
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {trade.take_profit && (
                        <button
                          onClick={() => handleCloseTrade(trade, 'tp')}
                          className="px-3 py-1 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
                        >
                          TP
                        </button>
                      )}
                      {trade.stop_loss && (
                        <button
                          onClick={() => handleCloseTrade(trade, 'sl')}
                          className="px-3 py-1 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                        >
                          SL
                        </button>
                      )}
                      <button
                        onClick={() => setEditingTrade(trade)}
                        className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Giriş: </span>
                      <span className="font-medium">{trade.entry_price}</span>
                    </div>
                    {trade.stop_loss && (
                      <div>
                        <span className="text-muted-foreground">SL: </span>
                        <span className="font-medium text-red-500">{trade.stop_loss}</span>
                      </div>
                    )}
                    {trade.take_profit && (
                      <div>
                        <span className="text-muted-foreground">TP: </span>
                        <span className="font-medium text-green-500">{trade.take_profit}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Risk: </span>
                      <span className="font-medium">{formatCurrency(trade.risk_amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Performance Charts */}
        {closedTrades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            <PerformanceChart 
              trades={trades}
              initialCapital={backtest.initial_capital}
              currency={backtest.currency}
              height={350}
            />
            <TradeDistributionChart 
              trades={trades}
              currency={backtest.currency}
              height={350}
            />
          </motion.div>
        )}

        {/* Trade History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            İşlem Geçmişi ({closedTrades.length})
          </h2>
          
          {closedTrades.length === 0 ? (
            <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Henüz Tamamlanmış İşlem Yok</h3>
              <p className="text-muted-foreground">İlk işleminizi ekleyerek backteste başlayın.</p>
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Sembol</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Tip</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Giriş</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Çıkış</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">P&L</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Süre</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {closedTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{trade.symbol}</div>
                          <div className="text-sm text-muted-foreground">{trade.position_size} lot</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            trade.trade_type === 'long' 
                              ? 'bg-green-500/10 text-green-600' 
                              : 'bg-red-500/10 text-red-600'
                          }`}>
                            {trade.trade_type === 'long' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trade.trade_type === 'long' ? 'Long' : 'Short'}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">{trade.entry_price}</td>
                        <td className="px-6 py-4 font-mono text-sm">{trade.exit_price}</td>
                        <td className="px-6 py-4">
                          <div className={`font-medium ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(trade.pnl)}
                          </div>
                          <div className={`text-sm ${trade.pnl_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatPercentage(trade.pnl_percent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {trade.duration_minutes ? `${Math.floor(trade.duration_minutes / 60)}h ${trade.duration_minutes % 60}m` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Trade Form Modal */}
      <AnimatePresence>
        {showTradeForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Yeni İşlem Ekle</h3>
                <button
                  onClick={() => setShowTradeForm(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTrade} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Sembol</label>
                    <input
                      type="text"
                      value={tradeForm.symbol}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, symbol: e.target.value }))}
                      placeholder="EURUSD"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">İşlem Tipi</label>
                    <select
                      value={tradeForm.trade_type}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, trade_type: e.target.value as 'long' | 'short' }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    >
                      <option value="long">Long (Al)</option>
                      <option value="short">Short (Sat)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Giriş Fiyatı</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={tradeForm.entry_price}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, entry_price: e.target.value }))}
                      placeholder="1.08500"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Pozisyon Boyutu</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tradeForm.position_size}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, position_size: e.target.value }))}
                      placeholder="0.10"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Stop Loss</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={tradeForm.stop_loss}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, stop_loss: e.target.value }))}
                      placeholder="1.08000"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Take Profit</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={tradeForm.take_profit}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, take_profit: e.target.value }))}
                      placeholder="1.09000"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Risk Miktarı</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tradeForm.risk_amount}
                    onChange={(e) => setTradeForm(prev => ({ ...prev, risk_amount: e.target.value }))}
                    placeholder="100.00"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Notlar</label>
                  <textarea
                    value={tradeForm.entry_notes}
                    onChange={(e) => setTradeForm(prev => ({ ...prev, entry_notes: e.target.value }))}
                    placeholder="Bu işlemle ilgili notlar..."
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTradeForm(false)}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTrade}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors flex items-center gap-2"
                  >
                    {submittingTrade && <Loader2 className="w-4 h-4 animate-spin" />}
                    İşlem Ekle
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Trade Modal */}
      <AnimatePresence>
        {editingTrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">İşlemi Kapat</h3>
                <button
                  onClick={() => setEditingTrade(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">{editingTrade.symbol}</h4>
                  <p className="text-sm text-muted-foreground">
                    {editingTrade.trade_type === 'long' ? 'Long' : 'Short'} • {editingTrade.position_size} lot • Giriş: {editingTrade.entry_price}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Çıkış Fiyatı</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={exitForm.exit_price}
                    onChange={(e) => setExitForm(prev => ({ ...prev, exit_price: e.target.value }))}
                    placeholder="Çıkış fiyatını girin"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Çıkış Sebebi</label>
                  <select
                    value={exitForm.exit_reason}
                    onChange={(e) => setExitForm(prev => ({ ...prev, exit_reason: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  >
                    <option value="manual">Manuel</option>
                    <option value="tp">Take Profit</option>
                    <option value="sl">Stop Loss</option>
                    <option value="time">Zaman</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Çıkış Notu</label>
                  <textarea
                    value={exitForm.exit_notes}
                    onChange={(e) => setExitForm(prev => ({ ...prev, exit_notes: e.target.value }))}
                    placeholder="Çıkış sebebini açıklayın..."
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingTrade(null)}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => handleCloseTrade(editingTrade, exitForm.exit_reason)}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    İşlemi Kapat
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel shortcuts={shortcuts} />
    </div>
  );
}