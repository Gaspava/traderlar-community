'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Square,
  Settings,
  Save,
  Trash2,
  BarChart3,
  DollarSign,
  Percent,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import KeyboardShortcutsPanel from '@/components/KeyboardShortcutsPanel';
import PerformanceChart from '@/components/charts/PerformanceChart';

interface QuickTrade {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  entry_price: number;
  position_size: number;
  rr_ratio: number;
  risk_amount: number;
  entry_time: Date;
  exit_time?: Date;
  exit_reason?: 'tp' | 'sl' | 'manual';
  pnl: number;
  status: 'open' | 'closed';
  take_profit?: number;
  stop_loss?: number;
}

interface QuickBacktestSettings {
  symbol: string;
  position_size: number;
  rr_ratio: number;
  risk_amount: number;
  initial_capital: number;
  use_custom_date: boolean;
  custom_date: string;
}

export default function HizliBacktestPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<QuickTrade[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [settings, setSettings] = useState<QuickBacktestSettings>({
    symbol: 'EURUSD',
    position_size: 0.10,
    rr_ratio: 2,
    risk_amount: 100,
    initial_capital: 10000,
    use_custom_date: true,
    custom_date: new Date().toISOString().split('T')[0]
  });

  const [backtestName, setBacktestName] = useState('');

  // Date navigation functions
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    setSettings(prev => ({
      ...prev,
      custom_date: newDate.toISOString().split('T')[0]
    }));
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    setSettings(prev => ({
      ...prev,
      custom_date: newDate.toISOString().split('T')[0]
    }));
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setSettings(prev => ({
      ...prev,
      custom_date: today.toISOString().split('T')[0]
    }));
  };

  const formatDateForDisplay = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  // Get days in current month for balloon display
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  // Month navigation
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // Select a specific date
  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setSettings(prev => ({
      ...prev,
      custom_date: date.toISOString().split('T')[0]
    }));
  };

  // Calculate current balance
  const currentBalance = settings.initial_capital + trades.filter(t => t.status === 'closed').reduce((sum, t) => sum + t.pnl, 0);
  
  // Calculate performance metrics
  const closedTrades = trades.filter(t => t.status === 'closed');
  const totalTrades = closedTrades.length;
  const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalPnLPercent = (totalPnL / settings.initial_capital) * 100;

  const addTrade = (type: 'long' | 'short') => {
    // Bu fonksiyon artık kullanılmıyor ama kalsın
  };

  const addCompletedTrade = (type: 'long' | 'short', exitType: 'tp' | 'sl') => {
    const pnl = exitType === 'tp' 
      ? settings.risk_amount * settings.rr_ratio  // Win: Risk × RR
      : -settings.risk_amount;  // Loss: -Risk

    // Use selected date with current time
    const entryDateTime = new Date(selectedDate);
    entryDateTime.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());
    
    const exitDateTime = new Date(entryDateTime);
    exitDateTime.setMinutes(exitDateTime.getMinutes() + Math.floor(Math.random() * 30) + 1); // 1-30 min trade duration

    const newTrade: QuickTrade = {
      id: Date.now().toString(),
      symbol: settings.symbol,
      type,
      entry_price: 1.0,
      position_size: settings.position_size,
      rr_ratio: settings.rr_ratio,
      risk_amount: settings.risk_amount,
      entry_time: entryDateTime,
      exit_time: exitDateTime,
      exit_reason: exitType,
      pnl,
      status: 'closed'
    };

    setTrades(prev => [...prev, newTrade]);
  };

  const closeTrade = (tradeId: string, reason: 'tp' | 'sl') => {
    setTrades(prev => prev.map(trade => {
      if (trade.id !== tradeId || trade.status === 'closed') return trade;

      let pnl: number;

      if (reason === 'tp') {
        pnl = trade.risk_amount * trade.rr_ratio; // Win: Risk × RR
      } else { // 'sl'
        pnl = -trade.risk_amount; // Loss: -Risk
      }

      return {
        ...trade,
        exit_time: new Date(),
        exit_reason: reason,
        pnl,
        status: 'closed' as const
      };
    }));
  };

  const deleteTrade = (tradeId: string) => {
    setTrades(prev => prev.filter(trade => trade.id !== tradeId));
  };

  const saveBacktest = async () => {
    if (!backtestName.trim()) {
      alert('Lütfen backtest adı girin');
      return;
    }

    if (closedTrades.length === 0) {
      alert('En az bir tamamlanmış işlem olmalı');
      return;
    }

    try {
      // Create backtest
      const backtestData = {
        name: backtestName.trim(),
        description: `Hızlı backtest - ${settings.symbol} - RR:${settings.rr_ratio}`,
        initial_capital: settings.initial_capital,
        risk_per_trade_percent: (settings.risk_amount / settings.initial_capital) * 100,
        currency: 'USD',
        category: 'Manual',
        timeframe: 'Mixed',
        market: 'Forex'
      };

      const backtestResponse = await fetch('/api/manual-backtests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backtestData)
      });

      if (!backtestResponse.ok) throw new Error('Backtest oluşturulamadı');
      
      const { backtest } = await backtestResponse.json();

      // Add trades
      for (const trade of closedTrades) {
        const tradeData = {
          symbol: trade.symbol,
          trade_type: trade.type,
          position_size: trade.position_size,
          entry_date: trade.entry_time.toISOString().split('T')[0],
          entry_time: trade.entry_time.toTimeString().split(' ')[0],
          entry_price: 1.0, // Dummy price for RR-based trades
          risk_amount: trade.risk_amount,
          entry_notes: `Hızlı Backtest - RR: ${trade.rr_ratio}`
        };

        const tradeResponse = await fetch(`/api/manual-backtests/${backtest.id}/trades`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tradeData)
        });

        if (tradeResponse.ok) {
          const { trade: createdTrade } = await tradeResponse.json();
          
          // Close the trade immediately if it's closed in our local state
          if (trade.exit_time) {
            await fetch(`/api/manual-backtests/${backtest.id}/trades/${createdTrade.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                exit_date: trade.exit_time.toISOString().split('T')[0],
                exit_time: trade.exit_time.toTimeString().split(' ')[0],
                exit_price: trade.exit_reason === 'tp' ? 1.1 : 0.9, // Dummy exit prices
                exit_reason: trade.exit_reason,
                exit_notes: `Hızlı backtest - RR:${trade.rr_ratio} - ${trade.exit_reason?.toUpperCase()}`
              })
            });
          }
        }
      }

      // Redirect to detailed view
      router.push(`/araclar/manuel-backtest/${backtest.id}`);
      
    } catch (error) {
      console.error('Error saving backtest:', error);
      alert('Backtest kaydedilirken hata oluştu');
    }
  };

  // Keyboard shortcuts with date navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when user is typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    // Arrow key navigation for dates
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToPreviousDay();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToNextDay();
    } else if (event.key === 'Home') {
      event.preventDefault();
      goToToday();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onQuickLong: () => addCompletedTrade('long', 'tp'),
    onQuickShort: () => addCompletedTrade('short', 'tp'),
    onTakeProfit: () => addCompletedTrade('long', 'tp'),
    onStopLoss: () => addCompletedTrade('long', 'sl'),
    onSave: saveBacktest,
  });

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
                  Hızlı Backtest
                </h1>
                <p className="text-muted-foreground">
                  RR bazlı hızlı trading testi ve grafik oluşturma
                </p>
              </div>
              
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Settings */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Hızlı Ayarlar</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Sembol</label>
                    <input
                      type="text"
                      value={settings.symbol}
                      onChange={(e) => setSettings(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Başlangıç Sermayesi</label>
                    <input
                      type="number"
                      value={settings.initial_capital}
                      onChange={(e) => setSettings(prev => ({ ...prev, initial_capital: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
                    />
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">RR Oranı</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.rr_ratio}
                      onChange={(e) => setSettings(prev => ({ ...prev, rr_ratio: parseFloat(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Risk ($)</label>
                    <input
                      type="number"
                      value={settings.risk_amount}
                      onChange={(e) => setSettings(prev => ({ ...prev, risk_amount: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
                    />
                  </div>
                </div>


              </div>
            </div>


            {/* Performance Summary */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Performans</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <div className="text-lg font-bold text-foreground">
                    ${currentBalance.toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Bakiye</div>
                </div>
                
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <div className={`text-lg font-bold ${totalPnLPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Getiri</div>
                </div>
                
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <div className="text-lg font-bold text-foreground">{totalTrades}</div>
                  <div className="text-xs text-muted-foreground">İşlem</div>
                </div>
                
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <div className="text-lg font-bold text-green-500">{winRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Başarı</div>
                </div>
              </div>
            </div>

            {/* Save Section */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Kaydet</h3>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={backtestName}
                  onChange={(e) => setBacktestName(e.target.value)}
                  placeholder="Backtest adı girin..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
                
                <button
                  onClick={saveBacktest}
                  disabled={!backtestName.trim() || closedTrades.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Kaydet ve Detaylı Analiz
                </button>
                
                <p className="text-xs text-muted-foreground text-center">
                  {closedTrades.length} tamamlanmış işlem
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Trades & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            {trades.length > 0 && (
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Performans Grafiği
                  </h3>
                  <div className="text-sm text-primary font-medium">
                    Seçili Tarih: {selectedDate.toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                
                <PerformanceChart 
                  trades={trades.map(t => ({
                    ...t,
                    backtest_id: 'temp',
                    entry_date: t.entry_time.toISOString().split('T')[0],
                    entry_time: t.entry_time.toTimeString().split(' ')[0],
                    exit_date: t.exit_time?.toISOString().split('T')[0],
                    exit_time: t.exit_time?.toTimeString().split(' ')[0],
                    trade_type: t.type,
                    pnl_percent: (t.pnl / settings.risk_amount) * 100,
                    commission: 0,
                    created_at: t.entry_time.toISOString(),
                    updated_at: t.exit_time?.toISOString() || t.entry_time.toISOString()
                  }))}
                  initialCapital={settings.initial_capital}
                  currency="USD"
                  height={300}
                />
              </div>
            )}

            {/* Quick Trading Buttons */}
            <div className="bg-card border border-border/50 rounded-2xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Long Section */}
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600 font-medium text-sm">
                      <TrendingUp className="w-4 h-4" />
                      LONG
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addCompletedTrade('long', 'tp')}
                      className="px-3 py-2 bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium"
                    >
                      TP +${(settings.risk_amount * settings.rr_ratio).toFixed(0)}
                    </button>
                    <button
                      onClick={() => addCompletedTrade('long', 'sl')}
                      className="px-3 py-2 bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                    >
                      SL -${settings.risk_amount.toFixed(0)}
                    </button>
                  </div>
                </div>

                {/* Short Section */}
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-red-600 font-medium text-sm">
                      <TrendingDown className="w-4 h-4" />
                      SHORT
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addCompletedTrade('short', 'tp')}
                      className="px-3 py-2 bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium"
                    >
                      TP +${(settings.risk_amount * settings.rr_ratio).toFixed(0)}
                    </button>
                    <button
                      onClick={() => addCompletedTrade('short', 'sl')}
                      className="px-3 py-2 bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                    >
                      SL -${settings.risk_amount.toFixed(0)}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-2">
                <p className="text-xs text-muted-foreground">
                  RR {settings.rr_ratio}: Win ${(settings.risk_amount * settings.rr_ratio).toFixed(0)} | Loss ${settings.risk_amount.toFixed(0)}
                </p>
              </div>
            </div>

            {/* Date Balloons */}
            <div className="bg-card border border-border/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-sm">
                  {/* Day Navigation */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() - 1);
                        setSelectedDate(newDate);
                        setSettings(prev => ({
                          ...prev,
                          custom_date: newDate.toISOString().split('T')[0]
                        }));
                        setCurrentMonth(newDate);
                      }}
                      className="p-1 hover:bg-muted rounded-full transition-colors"
                      title="Önceki gün"
                    >
                      <ChevronLeft className="w-3 h-3 text-muted-foreground" />
                    </button>
                    
                    <span className="px-2 py-1 font-medium text-primary min-w-[24px] text-center">
                      {selectedDate.getDate()}
                    </span>
                    
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() + 1);
                        setSelectedDate(newDate);
                        setSettings(prev => ({
                          ...prev,
                          custom_date: newDate.toISOString().split('T')[0]
                        }));
                        setCurrentMonth(newDate);
                      }}
                      className="p-1 hover:bg-muted rounded-full transition-colors"
                      title="Sonraki gün"
                    >
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                  
                  {/* Month Navigation */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-1 hover:bg-muted rounded-full transition-colors"
                      title="Önceki ay"
                    >
                      <ChevronLeft className="w-3 h-3 text-muted-foreground" />
                    </button>
                    
                    <span className="px-2 py-1 font-medium text-foreground min-w-[80px] text-center">
                      {currentMonth.toLocaleDateString('tr-TR', { month: 'long' })}
                    </span>
                    
                    <button
                      onClick={goToNextMonth}
                      className="p-1 hover:bg-muted rounded-full transition-colors"
                      title="Sonraki ay"
                    >
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                  
                  {/* Year Navigation */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const newYear = new Date(currentMonth);
                        newYear.setFullYear(newYear.getFullYear() - 1);
                        setCurrentMonth(newYear);
                      }}
                      className="p-1 hover:bg-muted rounded-full transition-colors"
                      title="Önceki yıl"
                    >
                      <ChevronLeft className="w-3 h-3 text-muted-foreground" />
                    </button>
                    
                    <span className="px-2 py-1 font-medium text-foreground min-w-[48px] text-center">
                      {currentMonth.getFullYear()}
                    </span>
                    
                    <button
                      onClick={() => {
                        const newYear = new Date(currentMonth);
                        newYear.setFullYear(newYear.getFullYear() + 1);
                        setCurrentMonth(newYear);
                      }}
                      className="p-1 hover:bg-muted rounded-full transition-colors"
                      title="Sonraki yıl"
                    >
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      const today = new Date();
                      setSelectedDate(today);
                      setCurrentMonth(today);
                      setSettings(prev => ({
                        ...prev,
                        custom_date: today.toISOString().split('T')[0]
                      }));
                    }}
                    className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                    title="Bugüne git"
                  >
                    Bugün
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 min-h-[120px]">
                {getDaysInMonth(currentMonth).map((date) => {
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  const isToday = new Date().toDateString() === date.toDateString();
                  
                  // Calculate daily P&L for this date
                  const dailyTrades = trades.filter(trade => 
                    trade.entry_time.toDateString() === date.toDateString() && trade.status === 'closed'
                  );
                  const dailyPnL = dailyTrades.reduce((sum, trade) => sum + trade.pnl, 0);
                  const hasTradesOnDate = dailyTrades.length > 0;
                  
                  // Determine color based on P&L
                  let colorClass = '';
                  if (isSelected) {
                    colorClass = 'bg-primary text-primary-foreground scale-110 shadow-lg';
                  } else if (hasTradesOnDate) {
                    if (dailyPnL > 0) {
                      colorClass = 'bg-green-500/20 text-green-600 border border-green-500/30';
                    } else if (dailyPnL < 0) {
                      colorClass = 'bg-red-500/20 text-red-600 border border-red-500/30';
                    } else {
                      colorClass = 'bg-gray-500/20 text-gray-600 border border-gray-500/30';
                    }
                  } else {
                    colorClass = 'bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105';
                  }
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => selectDate(date)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${colorClass}`}
                      title={`${date.getDate()} ${date.toLocaleDateString('tr-TR', { month: 'long' })}${
                        hasTradesOnDate 
                          ? ` - ${dailyTrades.length} işlem, P&L: ${dailyPnL >= 0 ? '+' : ''}$${dailyPnL.toFixed(0)}` 
                          : ''
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>


            {/* Closed Trades */}
            {closedTrades.length > 0 && (
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Tamamlanan İşlemler ({closedTrades.length})
                </h3>
                
                <div className="space-y-2">
                  {closedTrades.slice(-10).reverse().map(trade => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded ${
                          trade.type === 'long' 
                            ? 'bg-green-500/10 text-green-600' 
                            : 'bg-red-500/10 text-red-600'
                        }`}>
                          {trade.type === 'long' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{trade.symbol}</span>
                          <span className="text-muted-foreground ml-2">RR:{trade.rr_ratio}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`text-sm font-medium ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(0)}
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          trade.exit_reason === 'tp' 
                            ? 'bg-green-500/10 text-green-600'
                            : trade.exit_reason === 'sl'
                            ? 'bg-red-500/10 text-red-600'
                            : 'bg-blue-500/10 text-blue-600'
                        }`}>
                          {trade.exit_reason?.toUpperCase()}
                        </div>
                        <button
                          onClick={() => deleteTrade(trade.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {trades.length === 0 && (
              <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Hızlı RR Backtest</h3>
                <p className="text-muted-foreground mb-4">
                  RR oranını ayarlayın ve Long/Short altındaki TP/SL butonlarına tıklayın.
                  Her tıklama otomatik olarak tamamlanmış işlem olarak eklenir.
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• RR 2 = TP butonuna basınca +$200, SL butonuna basınca -$100</p>
                  <p>• Long altında TP/SL var, Short altında da TP/SL var</p>
                  <p>• Tek tıklama ile işlem tamamlanır ve grafiğe eklenir</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <KeyboardShortcutsPanel shortcuts={shortcuts} />
    </div>
  );
}