'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function NewStrategyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    timeframe: '',
    ea_link: '', // EA linki alanı
    is_premium: false,
    // Performance metrics (opsiyonel)
    total_net_profit: 0,
    profit_factor: 0,
    total_trades: 0,
    win_rate: 0,
    sharpe_ratio: 0,
    max_drawdown_percent: 0
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const strategyData = {
        ...formData,
        tags,
        author_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('strategies')
        .insert([strategyData])
        .select()
        .single();

      if (error) throw error;

      
      // Use replace instead of push to avoid back button issues
      window.location.href = `/trading-stratejileri/${data.id}`;
    } catch (error) {
      console.error('Error creating strategy:', error);
      alert('Strateji oluşturulurken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/admin/strategies"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Stratejilere Dön</span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Yeni Strateji Oluştur</h1>
            <p className="text-muted-foreground mt-2">
              Trading stratejinizi oluşturun ve topluluğa paylaşın
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Strateji Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Temel Bilgiler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Strateji Adı *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="RSI Divergence Master"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="Forex, Crypto, Stocks"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Açıklama *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Stratejinizin kısa tanımını yazın..."
                    required
                    rows={4}
                  />
                </div>

                {/* EA Link */}
                <div>
                  <Label htmlFor="ea_link">EA Download Linki (Opsiyonel)</Label>
                  <Input
                    id="ea_link"
                    type="url"
                    value={formData.ea_link}
                    onChange={(e) => setFormData({...formData, ea_link: e.target.value})}
                    placeholder="https://example.com/ea-file.ex4"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Expert Advisor dosyanızın indirme linkini girin (MT4/MT5 .ex4 veya .ex5 dosyası)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="timeframe">Zaman Dilimi</Label>
                    <Input
                      id="timeframe"
                      value={formData.timeframe}
                      onChange={(e) => setFormData({...formData, timeframe: e.target.value})}
                      placeholder="H1, H4, D1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_premium"
                      checked={formData.is_premium}
                      onChange={(e) => setFormData({...formData, is_premium: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_premium">Premium Strateji</Label>
                  </div>
                </div>

                {/* Etiketler */}
                <div>
                  <Label>Etiketler</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Etiket ekle..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Performans Metrikleri (Opsiyonel) */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Performans Metrikleri (Opsiyonel)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="total_net_profit">Net Kar (%)</Label>
                      <Input
                        id="total_net_profit"
                        type="number"
                        step="0.01"
                        value={formData.total_net_profit}
                        onChange={(e) => setFormData({...formData, total_net_profit: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="win_rate">Kazanma Oranı (%)</Label>
                      <Input
                        id="win_rate"
                        type="number"
                        step="0.01"
                        value={formData.win_rate}
                        onChange={(e) => setFormData({...formData, win_rate: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profit_factor">Profit Factor</Label>
                      <Input
                        id="profit_factor"
                        type="number"
                        step="0.01"
                        value={formData.profit_factor}
                        onChange={(e) => setFormData({...formData, profit_factor: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="total_trades">Toplam İşlem</Label>
                      <Input
                        id="total_trades"
                        type="number"
                        value={formData.total_trades}
                        onChange={(e) => setFormData({...formData, total_trades: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sharpe_ratio">Sharpe Ratio</Label>
                      <Input
                        id="sharpe_ratio"
                        type="number"
                        step="0.01"
                        value={formData.sharpe_ratio}
                        onChange={(e) => setFormData({...formData, sharpe_ratio: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_drawdown_percent">Max Drawdown (%)</Label>
                      <Input
                        id="max_drawdown_percent"
                        type="number"
                        step="0.01"
                        value={formData.max_drawdown_percent}
                        onChange={(e) => setFormData({...formData, max_drawdown_percent: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Oluşturuluyor...' : 'Strateji Oluştur'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    İptal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}