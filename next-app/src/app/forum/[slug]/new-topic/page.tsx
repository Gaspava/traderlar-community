'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Send,
  Eye,
  AlertCircle,
  CheckCircle,
  FileText,
  Menu,
  Settings,
  Home,
  TrendingUp,
  ChevronDown,
  MessageCircle,
  Shield,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/supabase/types';
import ForumSidebar from '@/components/forum/ForumSidebar';
import { slugify, isValidSlug } from '@/lib/utils/slugify';
import { useThemeDetection } from '@/hooks/useThemeDetection';

export default function NewTopicPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.slug as string;
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const { isDarkMode, mounted } = useThemeDetection();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
  }>({});
  const [showPreview, setShowPreview] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  useEffect(() => {
    setMounted(true);
    fetchCategory();
  }, [categorySlug]);

  const fetchCategory = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (error) {
        throw error;
      }
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
      // Mock category fallback
      setCategory({
        id: '1',
        name: 'Algoritmik Ticaret',
        slug: categorySlug,
        description: 'Otomatik trading sistemleri ve algoritmalar',
        color: '#3B82F6',
        icon: '🤖',
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Konu başlığı gereklidir';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Konu başlığı en az 5 karakter olmalıdır';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Konu başlığı en fazla 200 karakter olabilir';
    } else {
      // Check if title can generate a valid slug
      const generatedSlug = slugify(formData.title);
      if (!generatedSlug || !isValidSlug(generatedSlug)) {
        newErrors.title = 'Başlık URL için uygun değil. Lütfen en az bir harf veya rakam kullanın.';
      }
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Konu içeriği gereklidir';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Konu içeriği en az 10 karakter olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !category) {
      return;
    }
    setSubmitting(true);
    
    try {
      // Create a safe URL slug from title
      const slug = slugify(formData.title);
      
      // Validate the generated slug
      if (!isValidSlug(slug)) {
        alert('Başlık URL için uygun bir format oluşturamadı. Lütfen başlığı düzenleyin.');
        return;
      }

      const requestBody = {
        title: formData.title,
        content: formData.content,
        category_id: category.id,
        slug: slug
      };

      const response = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Konu oluşturulamadı');
      }

      setFormData({ title: '', content: '' });
      
      if (data.topic && data.topic.slug) {
        router.push(`/forum/${category.slug}/${data.topic.slug}`);
      } else {
        router.push(`/forum/${category.slug}`);
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      alert(error instanceof Error ? error.message : 'Konu oluşturulurken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (loading || !category) {
    return (
      <div className={`min-h-screen transition-colors duration-200 pt-4 ${
        isDarkMode ? 'bg-background' : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${
              isDarkMode ? 'border-emerald-400' : 'border-emerald-500'
            }`}></div>
            <p className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* Simple Header - Full Width */}
      <div className={`relative overflow-hidden border-b ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-border' 
          : 'bg-gradient-to-r from-gray-50 via-white to-gray-50 border-gray-200'
      }`}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? 'rgb(34 197 94)' : 'rgb(16 185 129)'} 1px, transparent 0)`
          }}></div>
        </div>
        
        {/* Clean geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-24 -right-24 w-48 h-48 ${
            isDarkMode ? 'bg-emerald-500/5' : 'bg-emerald-500/8'
          } rounded-full blur-3xl`}></div>
          <div className={`absolute top-1/2 -left-32 w-64 h-64 ${
            isDarkMode ? 'bg-green-500/3' : 'bg-green-500/5'
          } rounded-full blur-3xl`}></div>
        </div>
        
        {/* Content overlay with subtle backdrop */}
        <div className={`relative backdrop-blur-[1px] ${
          isDarkMode 
            ? 'bg-background/95' 
            : 'bg-white/60'
        }`}>
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-6">
              <Link 
                href={`/forum/${category.slug}`}
                className={`p-2 rounded-lg border transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300 hover:text-emerald-300' 
                    : 'bg-white/80 hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-emerald-600'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name.charAt(0)}
                </div>
                <div>
                  <h1 className={`text-2xl font-bold mb-1 ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>Yeni Konu Oluştur</h1>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                  }`}>r/{category.name} topluluğunda yeni bir tartışma başlatın</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forum Sidebar Component */}
      <ForumSidebar activeCategory={categorySlug} />

      {/* Main Content with Left Margin for Fixed Sidebar */}
      <div className="md:ml-60">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-0">
          {/* Main Content - Yeni Konu Oluşturma */}
          <div className="flex-1 min-w-0 pl-6 pr-0 py-6">
            <div className="w-full">
              <div className={`rounded-lg border transition-colors duration-200 max-w-[800px] ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Title Input */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className={`w-4 h-4 ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                      }`} />
                      <label htmlFor="title" className={`text-sm font-medium ${
                        isDarkMode ? 'text-foreground' : 'text-gray-900'
                      }`}>
                        Konu Başlığı
                      </label>
                    </div>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Konunuzun başlığını yazın..."
                      className={`w-full px-4 py-3 rounded-lg text-sm border transition-all ${
                        isDarkMode 
                          ? 'bg-muted border-border text-foreground placeholder-muted-foreground focus:bg-background focus:border-emerald-500' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-emerald-500'
                      } focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        errors.title ? 'border-red-500' : ''
                      }`}
                      maxLength={200}
                    />
                    <div className="mt-2 space-y-2">
                      {/* URL Preview */}
                      {formData.title.trim() && (
                        <div className={`text-xs p-2 rounded-md ${
                          isDarkMode ? 'bg-muted/50 text-muted-foreground' : 'bg-gray-50 text-gray-600'
                        }`}>
                          <span className="font-medium">URL: </span>
                          <span className="font-mono">
                            /forum/{category?.slug}/{slugify(formData.title) || 'gecersiz-baslik'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {errors.title && (
                          <div className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="w-4 h-4" />
                            {errors.title}
                          </div>
                        )}
                        <div className={`text-xs ml-auto ${
                          formData.title.length > 180 ? 'text-red-500' : 
                          formData.title.length > 150 ? 'text-yellow-500' :
                          isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                        }`}>
                          {formData.title.length}/200
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Input */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className={`w-4 h-4 ${
                          isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                        }`} />
                        <label htmlFor="content" className={`text-sm font-medium ${
                          isDarkMode ? 'text-foreground' : 'text-gray-900'
                        }`}>
                          Konu İçeriği
                        </label>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowPreview(false)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            !showPreview
                              ? (isDarkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white')
                              : (isDarkMode ? 'text-muted-foreground hover:text-foreground' : 'text-gray-500 hover:text-gray-700')
                          }`}
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPreview(true)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            showPreview
                              ? (isDarkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white')
                              : (isDarkMode ? 'text-muted-foreground hover:text-foreground' : 'text-gray-500 hover:text-gray-700')
                          }`}
                        >
                          <Eye className="w-3 h-3 inline mr-1" />
                          Önizleme
                        </button>
                      </div>
                    </div>

                    {!showPreview ? (
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Konunuzun detaylarını yazın..."
                        rows={10}
                        className={`w-full px-4 py-3 rounded-lg text-sm border transition-all ${
                          isDarkMode 
                            ? 'bg-muted border-border text-foreground placeholder-muted-foreground focus:bg-background focus:border-emerald-500' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-emerald-500'
                        } focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none ${
                          errors.content ? 'border-red-500' : ''
                        }`}
                      />
                    ) : (
                      <div className={`min-h-[240px] px-4 py-3 rounded-lg border ${
                        isDarkMode ? 'bg-muted border-border' : 'bg-gray-50 border-gray-300'
                      }`}>
                        {formData.content ? (
                          <div className={`text-sm ${isDarkMode ? 'text-foreground' : 'text-gray-900'}`}>
                            {formData.content.split('\n').map((paragraph, index) => (
                              <p key={index} className="mb-3 last:mb-0">
                                {paragraph || '\u00A0'}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className={`text-sm italic ${
                              isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                            }`}>
                              Önizleme için içerik yazın...
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {errors.content && (
                      <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.content}
                      </div>
                    )}
                  </div>

                  {/* Guidelines */}
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-muted/50 border-border' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h4 className={`text-sm font-medium mb-3 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>Topluluk Kuralları</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>
                        • Saygılı ve yapıcı bir dil kullanın
                      </div>
                      <div className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>
                        • Konuyu net ve anlaşılır şekilde açıklayın
                      </div>
                      <div className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>
                        • Spam ve alakasız içerik paylaşmayın
                      </div>
                      <div className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>
                        • Başkalarının fikirlerine saygı gösterin
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/forum/${category.slug}`}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        isDarkMode ? 'text-muted-foreground hover:text-foreground' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      ← İptal
                    </Link>

                    <div className="flex items-center gap-3">
                      {formData.title && formData.content && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          <span>Hazır</span>
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={submitting || !formData.title.trim() || !formData.content.trim()}
                        className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                          submitting || !formData.title.trim() || !formData.content.trim()
                            ? (isDarkMode ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                            : (isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white')
                        }`}
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Konuyu Paylaş
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Yardım ve Bilgi */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-4 pl-0 pr-6 py-6">
              {/* Category Info - Modern */}
              <div className={`rounded-2xl border transition-all duration-200 overflow-hidden hover:shadow-lg ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className={`px-6 py-4 border-b transition-colors duration-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 ${
                  isDarkMode ? 'border-border' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name.charAt(0)}
                    </div>
                    <h3 className={`font-bold text-lg ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>r/{category.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className={`text-sm leading-relaxed mb-6 ${
                    isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                  }`}>{category.description}</p>
                  <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                    isDarkMode ? 'bg-muted/30 text-muted-foreground' : 'bg-blue-50 text-blue-700'
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5 text-sm">📝</span>
                      <div>
                        <p className={`font-medium mb-1 text-xs ${
                          isDarkMode ? 'text-foreground' : 'text-blue-800'
                        }`}>Yeni Konu Oluşturuyorsunuz</p>
                        <p className="text-xs">Bu toplulukta yeni bir tartışma başlatmak üzeresiniz.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}