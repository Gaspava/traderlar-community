'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  DollarSign,
  Target,
  Shield,
  Info,
  X,
  Plus,
  Loader2
} from 'lucide-react';
import type { CreateManualBacktestData } from '@/lib/supabase/types';

const categories = [
  'Forex',
  'Hisse Senetleri',
  'Kripto Para',
  'Emtia',
  'Endeksler',
  'Tahvil',
  'Diğer'
];

const timeframes = [
  { value: 'M1', label: '1 Dakika' },
  { value: 'M5', label: '5 Dakika' },
  { value: 'M15', label: '15 Dakika' },
  { value: 'M30', label: '30 Dakika' },
  { value: 'H1', label: '1 Saat' },
  { value: 'H4', label: '4 Saat' },
  { value: 'D1', label: '1 Gün' },
  { value: 'W1', label: '1 Hafta' },
  { value: 'MN1', label: '1 Ay' }
];

const markets = [
  'Forex',
  'Hisse Senetleri',
  'Kripto Para',
  'Emtia',
  'Endeksler',
  'Tahvil'
];

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'TRY', label: 'TRY (₺)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' }
];

export default function YeniManuelBacktestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState<CreateManualBacktestData>({
    name: '',
    description: '',
    initial_capital: 10000,
    risk_per_trade_percent: 2,
    max_risk_percent: 10,
    commission_per_trade: 0,
    currency: 'USD',
    category: 'Forex',
    timeframe: 'H1',
    market: 'Forex',
    tags: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    
    try {
      const response = await fetch('/api/manual-backtests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Backtest oluşturulurken bir hata oluştu');
      }

      const { backtest } = await response.json();
      
      // Redirect to the new backtest
      router.push(`/araclar/manuel-backtest/${backtest.id}`);
      
    } catch (error) {
      console.error('Error creating backtest:', error);
      // TODO: Show error toast/notification
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-background via-card/30 to-background border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/araclar/manuel-backtest"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Manuel Backtest'e Dön
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Yeni Manuel Backtest
                </h1>
                <p className="text-muted-foreground">
                  Trading stratejinizi test etmek için yeni bir backtest oluşturun
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border/50 rounded-2xl p-8"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Temel Bilgiler
            </h2>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Backtest Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: RSI Divergence Stratejisi"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Bu backtest'in amacını ve stratejinizi kısaca açıklayın..."
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
                />
              </div>

              {/* Category, Timeframe, Market */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Zaman Dilimi
                  </label>
                  <select
                    value={formData.timeframe}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  >
                    {timeframes.map(tf => (
                      <option key={tf.value} value={tf.value}>{tf.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Piyasa
                  </label>
                  <select
                    value={formData.market}
                    onChange={(e) => setFormData(prev => ({ ...prev, market: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  >
                    {markets.map(market => (
                      <option key={market} value={market}>{market}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Etiketler
                </label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {formData.tags?.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary/70 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    placeholder="Etiket ekle..."
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border/50 rounded-2xl p-8"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Finansal Ayarlar
            </h2>

            <div className="space-y-6">
              {/* Initial Capital & Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Başlangıç Sermayesi *
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={formData.initial_capital}
                    onChange={(e) => setFormData(prev => ({ ...prev, initial_capital: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Para Birimi
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  >
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>{currency.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Commission */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  İşlem Başına Komisyon
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.commission_per_trade}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission_per_trade: Number(e.target.value) }))}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Her işlem için ödenecek sabit komisyon miktarı
                </p>
              </div>
            </div>
          </motion.div>

          {/* Risk Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card border border-border/50 rounded-2xl p-8"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Risk Yönetimi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  İşlem Başına Risk (%)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={formData.risk_per_trade_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, risk_per_trade_percent: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Her işlemde riske atacağınız sermaye yüzdesi
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maksimum Risk (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  step="1"
                  value={formData.max_risk_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_risk_percent: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Portföyünüzün riske atacağınız maksimum yüzdesi
                </p>
              </div>
            </div>

            {/* Risk Warning */}
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Risk Yönetimi Önemli
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Belirlediğiniz risk parametrelerine sadık kalın. Başarılı trading'in anahtarı tutarlı risk yönetimidir.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-end gap-4"
          >
            <Link
              href="/araclar/manuel-backtest"
              className="px-6 py-3 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors font-medium"
            >
              İptal
            </Link>
            
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors font-medium flex items-center gap-2 min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                'Backtest Oluştur'
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}