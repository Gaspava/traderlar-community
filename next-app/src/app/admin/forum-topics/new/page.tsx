'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
  Pin,
  Lock,
  FileText,
  Tag
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils/slugify';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export default function NewForumTopicPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    is_pinned: false,
    is_locked: false
  });
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    category_id?: string;
  }>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, color')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
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

    if (!formData.category_id) {
      newErrors.category_id = 'Kategori seçimi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Giriş yapmanız gerekiyor');
        return;
      }

      // Generate slug from title
      const slug = slugify(formData.title);

      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          title: formData.title,
          slug: slug,
          content: formData.content,
          category_id: formData.category_id,
          author_id: user.id,
          is_pinned: formData.is_pinned,
          is_locked: formData.is_locked
        })
        .select()
        .single();

      if (error) throw error;

      alert('Forum konusu başarıyla oluşturuldu!');
      router.push('/admin/forum-topics');
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Konu oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.category_id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/admin/forum-topics"
              className="p-3 hover:bg-muted/50 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Yeni Forum Konusu</h1>
              <p className="text-muted-foreground">
                Yeni bir forum konusu oluşturun
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Title */}
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
              placeholder="Konu başlığını yazın..."
              className={`w-full px-6 py-4 bg-background/50 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[1.02] break-long-words ${
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

          {/* Category */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Tag className="w-5 h-5 text-secondary" />
              </div>
              <label htmlFor="category_id" className="text-lg font-semibold text-foreground">
                Kategori
              </label>
            </div>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className={`w-full px-6 py-4 bg-background/50 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.category_id 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-border/50 focus:border-primary/50 hover:border-primary/30'
              }`}
            >
              <option value="">Kategori seçin...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg mt-4"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.category_id}
              </motion.div>
            )}
            {selectedCategory && (
              <div className="mt-4 flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedCategory.color }}
                ></div>
                <span className="text-sm text-muted-foreground">
                  Seçili kategori: {selectedCategory.name}
                </span>
              </div>
            )}
          </motion.div>

          {/* Content */}
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
                      placeholder="Konu içeriğini yazın... Markdown desteklenir."
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
          </motion.div>

          {/* Options */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Konu Ayarları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_pinned"
                  checked={formData.is_pinned}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary bg-background border-border rounded focus:ring-primary/20 focus:ring-2"
                />
                <div className="flex items-center gap-2">
                  <Pin className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">Konuyu Sabitle</span>
                </div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_locked"
                  checked={formData.is_locked}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary bg-background border-border rounded focus:ring-primary/20 focus:ring-2"
                />
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-yellow-500" />
                  <span className="text-foreground font-medium">Konuyu Kilitle</span>
                </div>
              </label>
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
              href="/admin/forum-topics"
              className="px-6 py-3 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 font-medium"
            >
              ← İptal
            </Link>

            <div className="flex items-center gap-6">
              {formData.title && formData.content && formData.category_id && (
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
                disabled={loading || !formData.title.trim() || !formData.content.trim() || !formData.category_id}
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary disabled:from-muted disabled:to-muted/80 disabled:text-muted-foreground text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Konuyu Oluştur</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}