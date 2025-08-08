'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Send,
  Eye,
  AlertCircle,
  CheckCircle,
  FileText,
  Sparkles,
  Users,
  Shield
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/supabase/types';

export default function NewTopicPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.slug as string;
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
  }>({});
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
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
        console.error('Category fetch error:', error);
        throw error;
      }
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
      // Set mock category for testing
      setCategory({
        id: '6f83cac3-7370-431c-a9a2-611b5e790b0d',
        name: 'Test Kategori',
        slug: categorySlug,
        description: 'Test kategorisi',
        color: '#10b981',
        icon: 'MessageCircle',
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
      // Generate slug from title - same as articles
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9ğüşıöç\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

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

      
      // Show success message
      alert('Konu başarıyla oluşturuldu!');
      
      // Reset form
      setFormData({ title: '', content: '' });
      
      // Redirect to the new topic if possible
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
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };


  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">Yükleniyor...</p>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b border-border/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-6 mb-8">
                <Link 
                  href={`/forum/${category.slug}`}
                  className="p-3 hover:bg-muted/50 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-4 rounded-xl shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${category.color}15, ${category.color}25)`,
                    borderColor: `${category.color}30`
                  }}
                >
                  <div className="w-8 h-8" style={{ backgroundColor: category.color }}></div>
                </motion.div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Yeni Konu Aç
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    {category.name} kategorisinde yeni bir konu oluştur ve tartışmayı başlat
                  </p>
                </div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full shadow-lg"
                >
                  <FileText className="w-8 h-8 text-primary" />
                </motion.div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-lg"
                >
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground font-medium">Aktif Topluluk</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-lg"
                >
                  <Shield className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground font-medium">Güvenli Ortam</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-lg"
                >
                  <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground font-medium">Kaliteli İçerik</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Title Input */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <label htmlFor="title" className="text-lg font-semibold text-foreground">
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
                className={`w-full px-6 py-4 bg-background/50 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[1.02] ${
                  errors.title 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-border/50 focus:border-primary/50 hover:border-primary/30'
                }`}
                maxLength={200}
              />
              <div className="flex items-center justify-between mt-4">
                {errors.title && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </motion.div>
                )}
                <div className={`text-sm font-medium ml-auto px-3 py-1 rounded-full ${
                  formData.title.length > 180 
                    ? 'text-red-500 bg-red-500/10' 
                    : formData.title.length > 150 
                      ? 'text-yellow-500 bg-yellow-500/10'
                      : 'text-muted-foreground bg-muted/20'
                }`}>
                  {formData.title.length}/200
                </div>
              </div>
            </motion.div>

            {/* Content Input */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl border border-border/50 shadow-lg hover:shadow-xl backdrop-blur-sm overflow-hidden"
            >
              <div className="p-8 border-b border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <FileText className="w-5 h-5 text-secondary" />
                    </div>
                    <label htmlFor="content" className="text-lg font-semibold text-foreground">
                      Konu İçeriği
                    </label>
                  </div>
                  <div className="bg-muted/30 backdrop-blur-sm rounded-full p-1 border border-border/50">
                    <div className="flex items-center gap-1">
                      <motion.button
                        type="button"
                        onClick={() => setShowPreview(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-300 ${
                          !showPreview
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        Düzenle
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-300 ${
                          showPreview
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Eye className="w-4 h-4 inline mr-2" />
                        Önizleme
                      </motion.button>
                    </div>
                  </div>
                </div>

                <motion.div
                  key={showPreview ? 'preview' : 'edit'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {!showPreview ? (
                    <>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Konunuzun detaylarını yazın... Markdown desteklenir."
                        rows={14}
                        className={`w-full px-6 py-4 bg-background/50 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[1.01] resize-none break-long-words ${
                          errors.content 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-border/50 focus:border-primary/50 hover:border-primary/30'
                        }`}
                      />
                      {errors.content && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg mt-4"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.content}
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="min-h-[350px] px-6 py-4 bg-background/30 backdrop-blur-sm border-2 border-border/30 rounded-xl">
                      {formData.content ? (
                        <div className="prose prose-sm max-w-none text-foreground break-long-words">
                          {formData.content.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4 last:mb-0 leading-relaxed">
                              {paragraph || '\u00A0'}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <motion.div
                              animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                              }}
                              transition={{ 
                                duration: 3,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                              className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                              <Eye className="w-8 h-8 text-primary" />
                            </motion.div>
                            <p className="text-muted-foreground italic">
                              Önizleme için içerik yazın...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Guidelines */}
              <div className="p-8 bg-gradient-to-br from-muted/20 via-muted/10 to-transparent backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground">Topluluk Kuralları</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Saygılı İletişim</p>
                      <p className="text-xs text-muted-foreground">Saygılı ve yapıcı bir dil kullanın</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-3 p-4 bg-secondary/5 rounded-xl border border-secondary/10"
                  >
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Net Açıklama</p>
                      <p className="text-xs text-muted-foreground">Konuyu net ve anlaşılır şekilde açıklayın</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Alakalı İçerik</p>
                      <p className="text-xs text-muted-foreground">Spam ve alakasız içerik paylaşmayın</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-3 p-4 bg-secondary/5 rounded-xl border border-secondary/10"
                  >
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Karşılıklı Saygı</p>
                      <p className="text-xs text-muted-foreground">Başkalarının fikirlerine saygı gösterin</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-between bg-gradient-to-r from-card/50 via-card/30 to-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg"
            >
              <Link
                href={`/forum/${category.slug}`}
                className="px-6 py-3 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 font-medium"
              >
                ← İptal
              </Link>

              <div className="flex items-center gap-6">
                {formData.title && formData.content && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-sm text-green-600 bg-green-600/10 px-4 py-2 rounded-full border border-green-600/20"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Hazır</span>
                  </motion.div>
                )}
                <motion.button
                  type="submit"
                  disabled={submitting || !formData.title.trim() || !formData.content.trim()}
                  whileHover={{ scale: submitting ? 1 : 1.05 }}
                  whileTap={{ scale: submitting ? 1 : 0.95 }}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary disabled:from-muted disabled:to-muted/80 disabled:text-muted-foreground text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Konuyu Paylaş</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </MainLayout>
  );
}