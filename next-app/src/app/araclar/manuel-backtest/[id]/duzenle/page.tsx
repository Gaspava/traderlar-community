'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  BarChart3,
  Target,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ManualBacktest, ManualBacktestTrade } from '@/lib/supabase/types';

interface TradeFormData {
  symbol: string;
  trade_type: 'long' | 'short';
  position_size: number;
  entry_date: string;
  entry_time: string;
  entry_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  risk_amount: number;
  entry_notes: string;
  exit_date: string | null;
  exit_time: string | null;
  exit_price: number | null;
  exit_reason: 'tp' | 'sl' | 'manual' | 'time' | null;
  exit_notes: string;
  manual_pnl: number | null;
}

export default function ManuelBacktestDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [backtest, setBacktest] = useState<ManualBacktest | null>(null);
  const [trades, setTrades] = useState<ManualBacktestTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState<ManualBacktestTrade | null>(null);
  const [showDeleteTradeModal, setShowDeleteTradeModal] = useState<string | null>(null);
  
  // Backtest form data
  const [backtestForm, setBacktestForm] = useState({
    name: '',
    description: '',
    initial_capital: 10000,
    risk_per_trade_percent: 2,
    commission_per_trade: 0,
    category: 'Forex',
    timeframe: '1D',
    market: 'EURUSD'
  });

  // Trade form data
  const [tradeForm, setTradeForm] = useState<TradeFormData>({
    symbol: '',
    trade_type: 'long',
    position_size: 1,
    entry_date: '',
    entry_time: '09:00',
    entry_price: 0,
    stop_loss: null,
    take_profit: null,
    risk_amount: 0,
    entry_notes: '',
    exit_date: null,
    exit_time: null,
    exit_price: null,
    exit_reason: null,
    exit_notes: '',
    manual_pnl: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { id } = await params;
      const supabase = createClient();

      // Fetch backtest
      const { data: backtestData, error: backtestError } = await supabase
        .from('manual_backtests')
        .select('*')
        .eq('id', id)
        .single();

      if (backtestError) throw backtestError;
      setBacktest(backtestData);
      
      // Set form with current backtest data
      setBacktestForm({
        name: backtestData.name,
        description: backtestData.description || '',
        initial_capital: backtestData.initial_capital,
        risk_per_trade_percent: backtestData.risk_per_trade_percent,
        commission_per_trade: backtestData.commission_per_trade,
        category: backtestData.category,
        timeframe: backtestData.timeframe,
        market: backtestData.market
      });

      // Fetch trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('manual_backtest_trades')
        .select('*')
        .eq('backtest_id', id)
        .order('created_at', { ascending: false });

      if (tradesError) throw tradesError;
      setTrades(tradesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBacktestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backtest) return;

    setSaving(true);
    try {
      const { id } = await params;
      const supabase = createClient();

      const { error } = await supabase
        .from('manual_backtests')
        .update({
          name: backtestForm.name,
          description: backtestForm.description,
          initial_capital: backtestForm.initial_capital,
          risk_per_trade_percent: backtestForm.risk_per_trade_percent,
          commission_per_trade: backtestForm.commission_per_trade,
          category: backtestForm.category,
          timeframe: backtestForm.timeframe,
          market: backtestForm.market
        })
        .eq('id', id);

      if (error) throw error;

      alert('Backtest başarıyla güncellendi!');
      router.push(`/araclar/manuel-backtest/${id}`);
      
    } catch (error) {
      console.error('Error updating backtest:', error);
      alert('Güncelleme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const openTradeModal = (trade?: ManualBacktestTrade) => {
    if (trade) {
      setEditingTrade(trade);
      setTradeForm({
        symbol: trade.symbol,
        trade_type: trade.trade_type,
        position_size: trade.position_size,
        entry_date: trade.entry_date,
        entry_time: trade.entry_time,
        entry_price: trade.entry_price,
        stop_loss: trade.stop_loss,
        take_profit: trade.take_profit,
        risk_amount: trade.risk_amount,
        entry_notes: trade.entry_notes || '',
        exit_date: trade.exit_date,
        exit_time: trade.exit_time,
        exit_price: trade.exit_price,
        exit_reason: trade.exit_reason,
        exit_notes: trade.exit_notes || '',
        manual_pnl: trade.pnl
      });
    } else {
      setEditingTrade(null);
      setTradeForm({
        symbol: '',
        trade_type: 'long',
        position_size: 1,
        entry_date: '',
        entry_time: '09:00',
        entry_price: 0,
        stop_loss: null,
        take_profit: null,
        risk_amount: backtestForm.initial_capital * (backtestForm.risk_per_trade_percent / 100),
        entry_notes: '',
        exit_date: null,
        exit_time: null,
        exit_price: null,
        exit_reason: null,
        exit_notes: '',
        manual_pnl: null
      });
    }
    setShowTradeModal(true);
  };

  const handleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backtest) return;

    try {
      const { id } = await params;
      const supabase = createClient();

      const tradeData = {
        ...tradeForm,
        backtest_id: id,
        status: tradeForm.exit_date ? 'closed' : 'open',
        pnl: tradeForm.manual_pnl || 0,
        commission: backtestForm.commission_per_trade
      };

      if (editingTrade) {
        // Update existing trade
        const { error } = await supabase
          .from('manual_backtest_trades')
          .update(tradeData)
          .eq('id', editingTrade.id);

        if (error) throw error;
      } else {
        // Create new trade
        const { error } = await supabase
          .from('manual_backtest_trades')
          .insert([tradeData]);

        if (error) throw error;
      }

      // Refresh trades
      await fetchData();
      setShowTradeModal(false);
      setEditingTrade(null);
      
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('İşlem kaydedilirken hata oluştu');
    }
  };

  const deleteTrade = async (tradeId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('manual_backtest_trades')
        .delete()
        .eq('id', tradeId);

      if (error) throw error;

      // Refresh trades
      await fetchData();
      setShowDeleteTradeModal(null);
      
    } catch (error) {
      console.error('Error deleting trade:', error);
      alert('İşlem silinirken hata oluştu');
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
              href={`/araclar/manuel-backtest/${backtest.id}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Manuel Strateji Düzenle
                </h1>
                <p className="text-muted-foreground">
                  {backtest.name} stratejisini düzenleyin
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Backtest Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border/50 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Strateji Ayarları
            </h2>

            <form onSubmit={handleBacktestSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Strateji Adı
                </label>
                <input
                  type="text"
                  value={backtestForm.name}
                  onChange={(e) => setBacktestForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Açıklama
                </label>
                <textarea
                  value={backtestForm.description}
                  onChange={(e) => setBacktestForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Başlangıç Sermayesi ($)
                  </label>
                  <input
                    type="number"
                    value={backtestForm.initial_capital}
                    onChange={(e) => setBacktestForm(prev => ({ ...prev, initial_capital: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Risk Yüzdesi (%)
                  </label>
                  <input
                    type="number"
                    value={backtestForm.risk_per_trade_percent}
                    onChange={(e) => setBacktestForm(prev => ({ ...prev, risk_per_trade_percent: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    min="0.1"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Kategori
                  </label>
                  <select
                    value={backtestForm.category}
                    onChange={(e) => setBacktestForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Forex">Forex</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Stocks">Stocks</option>
                    <option value="Indices">Indices</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Zaman Dilimi
                  </label>
                  <select
                    value={backtestForm.timeframe}
                    onChange={(e) => setBacktestForm(prev => ({ ...prev, timeframe: e.target.value }))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="5M">5 Dakika</option>
                    <option value="15M">15 Dakika</option>
                    <option value="30M">30 Dakika</option>
                    <option value="1H">1 Saat</option>
                    <option value="4H">4 Saat</option>
                    <option value="1D">1 Gün</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Piyasa
                  </label>
                  <input
                    type="text"
                    value={backtestForm.market}
                    onChange={(e) => setBacktestForm(prev => ({ ...prev, market: e.target.value }))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="EURUSD"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Ayarları Kaydet
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Trades Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                İşlemler ({trades.length})
              </h2>
              <button
                onClick={() => openTradeModal()}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni İşlem
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className="p-4 bg-background border border-border rounded-lg hover:border-border/80 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{trade.symbol}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        trade.trade_type === 'long' 
                          ? 'bg-green-500/20 text-green-600' 
                          : 'bg-red-500/20 text-red-600'
                      }`}>
                        {trade.trade_type === 'long' ? 'LONG' : 'SHORT'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        trade.status === 'closed' 
                          ? 'bg-gray-500/20 text-gray-600' 
                          : 'bg-blue-500/20 text-blue-600'
                      }`}>
                        {trade.status === 'closed' ? 'Kapalı' : 'Açık'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openTradeModal(trade)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteTradeModal(trade.id)}
                        className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Giriş:</span>
                      <span className="ml-2 text-foreground">${trade.entry_price}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Çıkış:</span>
                      <span className="ml-2 text-foreground">
                        {trade.exit_price ? `$${trade.exit_price}` : 'Açık'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tarih:</span>
                      <span className="ml-2 text-foreground">{new Date(trade.entry_date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">P&L:</span>
                      <span className={`ml-2 font-medium ${
                        trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {trades.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz işlem eklenmemiş</p>
                  <p className="text-sm">Yeni işlem eklemek için yukarıdaki butonu kullanın</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                {editingTrade ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}
              </h3>

              <form onSubmit={handleTradeSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sembol
                    </label>
                    <input
                      type="text"
                      value={tradeForm.symbol}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, symbol: e.target.value }))}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="EURUSD"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      İşlem Türü
                    </label>
                    <select
                      value={tradeForm.trade_type}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, trade_type: e.target.value as 'long' | 'short' }))}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Giriş Tarihi
                    </label>
                    <input
                      type="date"
                      value={tradeForm.entry_date}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, entry_date: e.target.value }))}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Giriş Saati
                    </label>
                    <input
                      type="time"
                      value={tradeForm.entry_time}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, entry_time: e.target.value }))}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Giriş Fiyatı
                    </label>
                    <input
                      type="number"
                      value={tradeForm.entry_price}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, entry_price: Number(e.target.value) }))}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      step="0.00001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Stop Loss
                    </label>
                    <input
                      type="number"
                      value={tradeForm.stop_loss || ''}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, stop_loss: e.target.value ? Number(e.target.value) : null }))}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      step="0.00001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Take Profit
                    </label>
                    <input
                      type="number"
                      value={tradeForm.take_profit || ''}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, take_profit: e.target.value ? Number(e.target.value) : null }))}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      step="0.00001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Manuel P&L ($)
                  </label>
                  <input
                    type="number"
                    value={tradeForm.manual_pnl || ''}
                    onChange={(e) => setTradeForm(prev => ({ ...prev, manual_pnl: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Risk-Reward hesaplaması için P&L değeri"
                  />
                </div>

                {/* Exit Fields */}
                <div className="border-t border-border pt-6">
                  <h4 className="text-lg font-medium text-foreground mb-4">Çıkış Bilgileri (Opsiyonel)</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Çıkış Tarihi
                      </label>
                      <input
                        type="date"
                        value={tradeForm.exit_date || ''}
                        onChange={(e) => setTradeForm(prev => ({ ...prev, exit_date: e.target.value || null }))}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Çıkış Saati
                      </label>
                      <input
                        type="time"
                        value={tradeForm.exit_time || ''}
                        onChange={(e) => setTradeForm(prev => ({ ...prev, exit_time: e.target.value || null }))}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Çıkış Fiyatı
                      </label>
                      <input
                        type="number"
                        value={tradeForm.exit_price || ''}
                        onChange={(e) => setTradeForm(prev => ({ ...prev, exit_price: e.target.value ? Number(e.target.value) : null }))}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        step="0.00001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Çıkış Sebebi
                      </label>
                      <select
                        value={tradeForm.exit_reason || ''}
                        onChange={(e) => setTradeForm(prev => ({ ...prev, exit_reason: e.target.value as any }))}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Seçiniz</option>
                        <option value="tp">Take Profit</option>
                        <option value="sl">Stop Loss</option>
                        <option value="manual">Manuel</option>
                        <option value="time">Zaman</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowTradeModal(false)}
                    className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingTrade ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Trade Confirmation Modal */}
      {showDeleteTradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                İşlemi Sil
              </h3>
              <p className="text-muted-foreground">
                Bu işlemi kalıcı olarak silmek istediğinizden emin misiniz?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteTradeModal(null)}
                className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => showDeleteTradeModal && deleteTrade(showDeleteTradeModal)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Sil
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}