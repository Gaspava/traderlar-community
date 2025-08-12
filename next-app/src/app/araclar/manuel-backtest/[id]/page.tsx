'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Percent,
  Clock,
  Target,
  Calendar,
  Award,
  TrendingDown as Loss,
  CheckCircle,
  Trash2,
  Shield,
  AlertTriangle,
  Activity,
  Zap,
  TrendingUp as Growth,
  MinusCircle,
  PlusCircle,
  MoreVertical,
  Edit
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ManualBacktest, ManualBacktestTrade } from '@/lib/supabase/types';
import PerformanceChart from '@/components/charts/PerformanceChart';

export default function ManuelBacktestSonucPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [backtest, setBacktest] = useState<ManualBacktest | null>(null);
  const [trades, setTrades] = useState<ManualBacktestTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { id } = await params;
      const supabase = createClient();
      
      // Fetch backtest details
      const { data: backtestData, error: backtestError } = await supabase
        .from('manual_backtests')
        .select('*')
        .eq('id', id)
        .single();

      if (backtestError) throw backtestError;

      // Fetch trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('manual_backtest_trades')
        .select('*')
        .eq('backtest_id', id)
        .order('created_at', { ascending: false });

      if (tradesError) throw tradesError;

      setBacktest(backtestData);
      setTrades(tradesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      router.push('/araclar/manuel-backtest');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrade = async (tradeId: string) => {
    if (!confirm('Bu işlemi silmek istediğinizden emin misiniz?')) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('manual_backtest_trades')
        .delete()
        .eq('id', tradeId);

      if (error) throw error;

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error deleting trade:', error);
      alert('İşlem silinirken hata oluştu');
    }
  };

  const deleteBacktest = async () => {
    if (!backtest) return;
    
    setIsDeleting(true);
    try {
      const { id } = await params;
      const response = await fetch(`/api/manual-backtests/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Silme işlemi başarısız');
      }

      const result = await response.json();
      
      // Success - redirect to list page
      router.push('/araclar/manuel-backtest');
    } catch (error) {
      console.error('Error deleting backtest:', error);
      alert('Backtest silinirken hata oluştu: ' + (error as Error).message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!backtest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Backtest Bulunamadı</h2>
          <Link href="/araclar/manuel-backtest" className="text-primary hover:underline">
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  const closedTrades = trades.filter(t => t.status === 'closed');
  const totalTrades = closedTrades.length;
  const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
  const losingTrades = closedTrades.filter(t => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalPnLPercent = (totalPnL / backtest.initial_capital) * 100;
  const currentBalance = backtest.initial_capital + totalPnL;
  
  const avgWin = winningTrades > 0 ? closedTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? Math.abs(closedTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0)) / losingTrades : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

  // Advanced Metrics
  const calculateMaxDrawdown = () => {
    let peak = backtest.initial_capital;
    let maxDD = 0;
    let runningBalance = backtest.initial_capital;
    
    for (const trade of closedTrades.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())) {
      runningBalance += trade.pnl;
      if (runningBalance > peak) {
        peak = runningBalance;
      }
      const drawdown = ((peak - runningBalance) / peak) * 100;
      if (drawdown > maxDD) {
        maxDD = drawdown;
      }
    }
    return maxDD;
  };

  const calculateConsecutiveWinsLosses = () => {
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    const sortedTrades = closedTrades.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    for (const trade of sortedTrades) {
      if (trade.pnl > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
      } else if (trade.pnl < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
      }
    }
    
    return { maxConsecutiveWins, maxConsecutiveLosses };
  };

  const calculateExpectancy = () => {
    if (totalTrades === 0) return 0;
    const winRateDecimal = winRate / 100;
    const lossRateDecimal = 1 - winRateDecimal;
    return (winRateDecimal * avgWin) - (lossRateDecimal * avgLoss);
  };

  const calculateSharpeRatio = () => {
    if (closedTrades.length < 2) return 0;
    
    const returns = [];
    let balance = backtest.initial_capital;
    
    for (const trade of closedTrades.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())) {
      const returnPercent = (trade.pnl / balance) * 100;
      returns.push(returnPercent);
      balance += trade.pnl;
    }
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? avgReturn / stdDev : 0;
  };

  const calculateMonthlyReturns = () => {
    const monthlyData = new Map<string, { pnl: number, trades: number }>();
    
    for (const trade of closedTrades) {
      const date = new Date(trade.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { pnl: 0, trades: 0 });
      }
      
      const current = monthlyData.get(monthKey)!;
      current.pnl += trade.pnl;
      current.trades += 1;
    }
    
    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      pnl: data.pnl,
      trades: data.trades,
      returnPercent: (data.pnl / backtest.initial_capital) * 100
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const maxDrawdown = calculateMaxDrawdown();
  const { maxConsecutiveWins, maxConsecutiveLosses } = calculateConsecutiveWinsLosses();
  const expectancy = calculateExpectancy();
  const sharpeRatio = calculateSharpeRatio();
  const monthlyReturns = calculateMonthlyReturns();
  const bestMonth = monthlyReturns.length > 0 ? monthlyReturns.reduce((best, current) => current.pnl > best.pnl ? current : best) : null;
  const worstMonth = monthlyReturns.length > 0 ? monthlyReturns.reduce((worst, current) => current.pnl < worst.pnl ? current : worst) : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

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
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {backtest.name}
                </h1>
                <p className="text-muted-foreground">
                  {backtest.description || 'Manuel backtest sonuçları'}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/araclar/manuel-backtest/${backtest.id}/duzenle`}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Düzenle
                </Link>
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Chart - En üstte */}
        {trades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border/50 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Performans Grafiği</h3>
            <PerformanceChart 
              trades={trades}
              initialCapital={backtest.initial_capital}
              currency="USD"
              height={350}
            />
          </motion.div>
        )}

        {/* Ana Metrikler - Kompakt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card border border-border/50 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Genel Performans</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground mb-1">
                {formatCurrency(currentBalance)}
              </div>
              <div className="text-xs text-muted-foreground">Güncel Bakiye</div>
            </div>

            <div className="text-center p-3 bg-background/50 rounded-lg">
              <Percent className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className={`text-lg font-bold mb-1 ${totalPnLPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">Toplam Getiri</div>
            </div>

            <div className="text-center p-3 bg-background/50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground mb-1">
                {totalTrades}
              </div>
              <div className="text-xs text-muted-foreground">Toplam İşlem</div>
            </div>

            <div className="text-center p-3 bg-background/50 rounded-lg">
              <Target className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-500 mb-1">
                {winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Başarı Oranı</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Kar/Zarar Analizi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-card border border-border/50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Kar/Zarar Analizi</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-foreground">{winningTrades}</div>
                <div className="text-xs text-muted-foreground">Kazanan</div>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <Loss className="w-4 h-4 text-red-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-foreground">{losingTrades}</div>
                <div className="text-xs text-muted-foreground">Kaybeden</div>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <Award className="w-4 h-4 text-primary mx-auto mb-2" />
                <div className={`text-sm font-medium ${profitFactor >= 1.5 ? 'text-green-500' : profitFactor >= 1 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {profitFactor.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Profit Factor</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                <div className="text-sm font-medium text-green-500">{formatCurrency(avgWin)}</div>
                <div className="text-xs text-muted-foreground">Ort. Kazanç</div>
              </div>
              <div className="text-center p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                <div className="text-sm font-medium text-red-500">{formatCurrency(avgLoss)}</div>
                <div className="text-xs text-muted-foreground">Ort. Kayıp</div>
              </div>
            </div>
          </motion.div>

          {/* Risk Metrikleri */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border/50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Risk Metrikleri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-orange-500 mx-auto mb-2" />
                <div className={`text-sm font-medium ${maxDrawdown < 10 ? 'text-green-500' : maxDrawdown < 20 ? 'text-yellow-500' : 'text-red-500'}`}>
                  -{maxDrawdown.toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground">Max Drawdown</div>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <Shield className="w-4 h-4 text-primary mx-auto mb-2" />
                <div className={`text-sm font-medium ${sharpeRatio > 1 ? 'text-green-500' : sharpeRatio > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {sharpeRatio.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <MinusCircle className="w-4 h-4 text-red-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-red-500">{maxConsecutiveLosses}</div>
                <div className="text-xs text-muted-foreground">Max Ard. Kayıp</div>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <PlusCircle className="w-4 h-4 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-green-500">{maxConsecutiveWins}</div>
                <div className="text-xs text-muted-foreground">Max Ard. Kazanç</div>
              </div>
            </div>
            <div className="mt-4 text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
              <Activity className="w-4 h-4 text-primary mx-auto mb-2" />
              <div className={`text-sm font-medium ${expectancy > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {expectancy >= 0 ? '+' : ''}{formatCurrency(expectancy)}
              </div>
              <div className="text-xs text-muted-foreground">Expectancy (Per Trade)</div>
            </div>
          </motion.div>
        </div>

        {/* Monthly Performance Table */}
        {monthlyReturns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          >
            {/* Monthly Table */}
            <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Aylık Performans</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Ay</th>
                      <th className="text-right py-2 px-2 text-sm font-medium text-muted-foreground">İşlem</th>
                      <th className="text-right py-2 px-2 text-sm font-medium text-muted-foreground">P&L</th>
                      <th className="text-right py-2 px-2 text-sm font-medium text-muted-foreground">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyReturns.map((month, index) => (
                      <tr key={month.month} className="border-b border-border/20">
                        <td className="py-2 px-2 text-sm text-foreground">
                          {new Date(month.month + '-01').toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-2 px-2 text-sm text-right text-muted-foreground">{month.trades}</td>
                        <td className={`py-2 px-2 text-sm text-right font-medium ${month.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {month.pnl >= 0 ? '+' : ''}{formatCurrency(month.pnl)}
                        </td>
                        <td className={`py-2 px-2 text-sm text-right font-medium ${month.returnPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {month.returnPercent >= 0 ? '+' : ''}{month.returnPercent.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Best/Worst Month Stats - Kompakt */}
            <div className="space-y-4">
              {bestMonth && (
                <div className="bg-card border border-border/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-foreground">En İyi Ay</h4>
                    <Growth className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {new Date(bestMonth.month + '-01').toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-lg font-bold text-green-500">
                      +{formatCurrency(bestMonth.pnl)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bestMonth.trades} işlem • +{bestMonth.returnPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {worstMonth && worstMonth.pnl < 0 && (
                <div className="bg-card border border-border/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-foreground">En Kötü Ay</h4>
                    <Loss className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {new Date(worstMonth.month + '-01').toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-lg font-bold text-red-500">
                      {formatCurrency(worstMonth.pnl)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {worstMonth.trades} işlem • {worstMonth.returnPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Trades List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card border border-border/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Tüm İşlemler ({totalTrades})
          </h3>
          
          {closedTrades.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Henüz tamamlanmış işlem yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {closedTrades.map((trade, index) => (
                <div key={trade.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${
                        trade.trade_type === 'long' 
                          ? 'bg-green-500/10 text-green-600' 
                          : 'bg-red-500/10 text-red-600'
                      }`}>
                        {trade.trade_type === 'long' ? 
                          <TrendingUp className="w-4 h-4" /> : 
                          <TrendingDown className="w-4 h-4" />
                        }
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-foreground">
                        {trade.symbol} • {trade.trade_type.toUpperCase()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(trade.created_at)} • 
                        {trade.exit_reason === 'tp' ? ' Take Profit' : 
                         trade.exit_reason === 'sl' ? ' Stop Loss' : ' Manuel'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        RR: {trade.risk_reward_ratio || 'N/A'}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteTrade(trade.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                      title="İşlemi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Stratejiyi Sil
              </h3>
              <p className="text-muted-foreground">
                "<strong>{backtest?.name}</strong>" stratejisini ve tüm işlemlerini kalıcı olarak silmek istediğinizden emin misiniz? 
                Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={deleteBacktest}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}