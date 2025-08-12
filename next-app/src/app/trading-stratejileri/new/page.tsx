'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';
import { 
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Settings,
  Eye,
  Save,
  ArrowLeft
} from 'lucide-react';
import TradingStrategyParser from '@/lib/trading-strategy-parser';

interface FormData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  timeframe: string;
  isPremium: boolean;
}

interface ParsedMetrics {
  totalNetProfit?: number;
  initialDeposit?: number;
  totalReturnPercentage?: number;
  profitFactor?: number;
  winRate?: number;
  totalTrades?: number;
  maxDrawdownPercent?: number;
  sharpeRatio?: number;
  summary?: string;
}

export default function NewStrategyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: 'Forex',
    tags: [],
    timeframe: 'H1',
    isPremium: false
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedMetrics, setParsedMetrics] = useState<ParsedMetrics | null>(null);
  const [parseError, setParseError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'form' | 'upload' | 'preview' | 'success'>('form');
  
  const setStepWithLog = (newStep: typeof step) => {
    setStep(newStep);
  };
  const [tagInput, setTagInput] = useState('');

  const categories = ['Forex', 'Crypto', 'Hisse', 'Emtia', 'Endeks'];
  const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN1'];

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setParseError('');
    
    try {
      if (!file.name.toLowerCase().endsWith('.html')) {
        throw new Error('Lütfen .html uzantılı bir dosya yükleyin');
      }

      // Try different encodings to handle different file formats
      let fileContent = '';
      try {
        fileContent = await file.text();
        // Check if content starts with BOM or special characters
        if (fileContent.charCodeAt(0) === 65533 || fileContent.startsWith('��')) {
          // For now, continue with the content as-is
          // Future improvement: handle different encodings
        }
      } catch (error) {
        throw new Error('Dosya okunamadı. Lütfen dosyanın bozuk olmadığından emin olun.');
      }
      
      const metrics = TradingStrategyParser.parseMetaTraderHTML(fileContent);
      
      if (!TradingStrategyParser.validateMetrics(metrics)) {
        throw new Error('Bu dosyada geçerli trading metrikleri bulunamadı. Lütfen MetaTrader backtest raporu yüklediğinizden emin olun.');
      }

      const summary = TradingStrategyParser.generateSummary(metrics);
      
      setParsedMetrics({
        ...metrics,
        summary
      });
      
      setUploadedFile(file);
      setStepWithLog('preview');
      
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Dosya işlenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile || !parsedMetrics) {
      return;
    }
    setIsUploading(true);
    setParseError(''); // Clear any previous errors
    
    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('description', formData.description);
      submitFormData.append('category', formData.category);
      submitFormData.append('tags', JSON.stringify(formData.tags));
      submitFormData.append('timeframe', formData.timeframe);
      submitFormData.append('isPremium', formData.isPremium.toString());
      submitFormData.append('file', uploadedFile);
      submitFormData.append('parsedMetrics', JSON.stringify(parsedMetrics));
      
      
      const response = await fetch('/api/strategies', {
        method: 'POST',
        body: submitFormData
      });
      
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Strateji kaydedilirken bir hata oluştu');
      }
      
      const result = await response.json();
      
      setStepWithLog('success');
      
      // Redirect to the specific strategy page after success  
      setTimeout(() => {
        const strategyId = result.strategy?.id;
        if (strategyId) {
          router.push(`/trading-stratejileri/${strategyId}`);
        } else {
          router.push('/trading-stratejileri');
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setParseError(error instanceof Error ? error.message : 'Strateji kaydedilirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
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
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
              </button>
              
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Yeni Strateji Oluştur
              </h1>
              <p className="text-muted-foreground text-lg">
                Trading stratejinizi paylaşın ve topluluktan geri bildirim alın.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            {[
              { key: 'form', label: 'Bilgiler', icon: Settings },
              { key: 'upload', label: 'Dosya Yükleme', icon: Upload },
              { key: 'preview', label: 'Önizleme', icon: Eye },
              { key: 'success', label: 'Tamamlandı', icon: CheckCircle }
            ].map((stepItem, index) => (
              <div key={stepItem.key} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  step === stepItem.key
                    ? 'bg-primary text-primary-foreground'
                    : step === 'success' || (index < ['form', 'upload', 'preview', 'success'].indexOf(step))
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  <stepItem.icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${
                  step === stepItem.key ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {stepItem.label}
                </span>
                {index < 3 && <div className="w-8 h-0.5 bg-border" />}
              </div>
            ))}
          </div>

          {/* Step 1: Form */}
          {step === 'form' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-2xl border border-border/50 p-8"
            >
              <h2 className="text-xl font-semibold text-foreground mb-6">Strateji Bilgileri</h2>
              
              <div className="space-y-6">
                {/* Strategy Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Strateji Adı *
                  </label>
                  <input
                    type="text"
                    id="strategy-name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Örn: RSI Divergence Master"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Açıklama
                  </label>
                  <textarea
                    id="strategy-description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Stratejinizin nasıl çalıştığını açıklayın..."
                    rows={4}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 resize-none"
                  />
                </div>

                {/* Category and Timeframe */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Kategori *
                    </label>
                    <select
                      id="strategy-category"
                      name="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Zaman Dilimi *
                    </label>
                    <select
                      id="strategy-timeframe"
                      name="timeframe"
                      value={formData.timeframe}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                    >
                      {timeframes.map(tf => (
                        <option key={tf} value={tf}>{tf}</option>
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
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium flex items-center gap-1"
                      >
                        {tag}
                        <button
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
                      id="tag-input"
                      name="tag-input"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      placeholder="Etiket ekle..."
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                    />
                    <button
                      onClick={() => addTag(tagInput)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                {/* Premium Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Premium Strateji</h3>
                    <p className="text-xs text-muted-foreground">Bu stratejiyi premium kullanıcılarla sınırla</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="is-premium"
                      name="isPremium"
                      checked={formData.isPremium}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStepWithLog('upload')}
                  disabled={!formData.name.trim()}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors font-medium"
                >
                  Dosya Yükleme
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: File Upload */}
          {step === 'upload' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-2xl border border-border/50 p-8"
            >
              <h2 className="text-xl font-semibold text-foreground mb-6">Backtest Raporu Yükle</h2>
              
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-12 text-center transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                />
                
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="animate-spin mx-auto w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"></div>
                    <p className="text-muted-foreground">Dosya analiz ediliyor...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        MetaTrader Backtest Raporu Yükle
                      </p>
                      <p className="text-muted-foreground">
                        HTML formatındaki backtest raporunuzu sürükleyip bırakın veya seçin
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Sadece .html dosyaları kabul edilir</p>
                      <p>• MetaTrader 4/5 backtest raporu olmalıdır</p>
                      <p>• Maksimum dosya boyutu: 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {parseError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{parseError}</p>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStepWithLog('form')}
                  className="px-6 py-3 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors font-medium"
                >
                  Geri
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && parsedMetrics && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Success Message */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-green-400 font-medium">Dosya başarıyla analiz edildi!</p>
                  <p className="text-green-400/80 text-sm">{parsedMetrics.summary}</p>
                </div>
              </div>

              {/* Strategy Preview */}
              <div className="bg-card rounded-2xl border border-border/50 p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">Strateji Önizlemesi</h2>
                
                {/* Basic Info */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{formData.name}</h3>
                  {formData.description && (
                    <p className="text-muted-foreground mb-4">{formData.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                      {formData.category}
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                      {formData.timeframe}
                    </span>
                    {formData.isPremium && (
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 rounded-full text-sm font-medium">
                        Premium
                      </span>
                    )}
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {formData.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="bg-background/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performans Metrikleri
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {parsedMetrics.initialDeposit && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{parsedMetrics.initialDeposit.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Başlangıç Sermayesi</div>
                      </div>
                    )}
                    
                    {parsedMetrics.totalReturnPercentage && (
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${parsedMetrics.totalReturnPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parsedMetrics.totalReturnPercentage >= 0 ? '+' : ''}{parsedMetrics.totalReturnPercentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Toplam Getiri</div>
                      </div>
                    )}
                    
                    {parsedMetrics.totalTrades && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{parsedMetrics.totalTrades}</div>
                        <div className="text-sm text-muted-foreground">Toplam İşlem</div>
                      </div>
                    )}
                    
                    {parsedMetrics.winRate && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{parsedMetrics.winRate.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Başarı Oranı</div>
                      </div>
                    )}
                    
                    {parsedMetrics.totalNetProfit && (
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${parsedMetrics.totalNetProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parsedMetrics.totalNetProfit >= 0 ? '+' : ''}{parsedMetrics.totalNetProfit.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Net Kar</div>
                      </div>
                    )}
                    
                    {parsedMetrics.maxDrawdownPercent && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{Math.abs(parsedMetrics.maxDrawdownPercent).toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Max Düşüş</div>
                      </div>
                    )}
                    
                    {parsedMetrics.profitFactor && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{parsedMetrics.profitFactor}</div>
                        <div className="text-sm text-muted-foreground">Profit Factor</div>
                      </div>
                    )}
                    
                    {parsedMetrics.sharpeRatio && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{parsedMetrics.sharpeRatio}</div>
                        <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStepWithLog('upload')}
                  className="px-6 py-3 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors font-medium"
                >
                  Geri
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors font-medium flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Stratejiyi Yayınla
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Strateji Başarıyla Oluşturuldu!
              </h2>
              <p className="text-muted-foreground mb-8">
                Stratejiniz "{formData.name}" başarıyla yayınlandı ve artık topluluk tarafından görülebilir.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="animate-pulse">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-muted-foreground">Trading stratejileri sayfasına yönlendiriliyorsunuz...</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    
  );
}