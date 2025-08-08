'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Tag,
  FileText,
  Palette,
  Hash,
  Eye,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const iconOptions = [
  'MessageCircle',
  'Bot',
  'TrendingUp',
  'LineChart',
  'GraduationCap',
  'Code',
  'PieChart',
  'Bitcoin',
  'Building',
  'Brain',
  'Scale',
  'Tag'
];

const colorOptions = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f43f5e', // rose
];

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'MessageCircle',
    color: '#10b981'
  });
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) throw error;
      
      setCategory(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        icon: data.icon || 'MessageCircle',
        color: data.color || '#10b981'
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('Ana konu yüklenirken hata oluştu');
      router.push('/admin/categories');
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ana konu adı gereklidir';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Ana konu adı en az 2 karakter olmalıdır';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Ana konu adı en fazla 50 karakter olabilir';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Ana konu açıklaması gereklidir';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Ana konu açıklaması en az 10 karakter olmalıdır';
    } else if (formData.description.length > 200) {
      newErrors.description = 'Ana konu açıklaması en fazla 200 karakter olabilir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !category) return;

    setLoading(true);
    
    try {
      const supabase = createClient();

      // Generate new slug if name changed
      let slug = category.slug;
      if (formData.name !== category.name) {
        slug = generateSlug(formData.name);

        // Check if new slug already exists (excluding current category)
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', slug)
          .neq('id', categoryId)
          .single();

        if (existingCategory) {
          setErrors({ name: 'Bu isimde bir ana konu zaten mevcut' });
          return;
        }
      }

      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          slug: slug,
          description: formData.description,
          icon: formData.icon,
          color: formData.color
        })
        .eq('id', categoryId);

      if (error) throw error;

      alert('Ana konu başarıyla güncellendi!');
      router.push('/admin/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Ana konu güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const previewSlug = generateSlug(formData.name);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Ana konu yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Ana konu bulunamadı</h1>
          <Link 
            href="/admin/categories"
            className="text-primary hover:underline"
          >
            Ana konulara dön
          </Link>
        </div>
      </div>
    );
  }

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
              href="/admin/categories"
              className="p-3 hover:bg-muted/50 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Ana Konu Düzenle</h1>
              <p className="text-muted-foreground">
                Ana konuyu düzenleyin
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
          {/* Name */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <label htmlFor="name" className="text-lg font-semibold text-foreground">
                Ana Konu Adı
              </label>
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ana konu adını yazın..."
              className={`w-full px-6 py-4 bg-background/50 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[1.02] break-long-words ${
                errors.name 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-border/50 focus:border-primary/50 hover:border-primary/30'
              }`}
              maxLength={50}
            />
            <div className="flex items-center justify-between mt-4">
              {errors.name && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </motion.div>
              )}
              <div className={`text-sm font-medium ml-auto px-3 py-1 rounded-full ${
                formData.name.length > 45 
                  ? 'text-red-500 bg-red-500/10' 
                  : formData.name.length > 35 
                    ? 'text-yellow-500 bg-yellow-500/10'
                    : 'text-muted-foreground bg-muted/20'
              }`}>
                {formData.name.length}/50
              </div>
            </div>
            {previewSlug && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="w-4 h-4" />
                <span>URL: /forum/{previewSlug}</span>
                {previewSlug !== category.slug && (
                  <span className="text-yellow-600 bg-yellow-600/10 px-2 py-1 rounded text-xs">
                    Değiştirilecek
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {/* Description */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <FileText className="w-5 h-5 text-secondary" />
              </div>
              <label htmlFor="description" className="text-lg font-semibold text-foreground">
                Ana Konu Açıklaması
              </label>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ana konu açıklamasını yazın..."
              rows={4}
              className={`w-full px-6 py-4 bg-background/50 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[1.01] resize-none break-long-words ${
                errors.description 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-border/50 focus:border-primary/50 hover:border-primary/30'
              }`}
              maxLength={200}
            />
            <div className="flex items-center justify-between mt-4">
              {errors.description && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </motion.div>
              )}
              <div className={`text-sm font-medium ml-auto px-3 py-1 rounded-full ${
                formData.description.length > 180 
                  ? 'text-red-500 bg-red-500/10' 
                  : formData.description.length > 150 
                    ? 'text-yellow-500 bg-yellow-500/10'
                    : 'text-muted-foreground bg-muted/20'
              }`}>
                {formData.description.length}/200
              </div>
            </div>
          </motion.div>

          {/* Icon Selection */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Eye className="w-5 h-5 text-secondary" />
              </div>
              <label className="text-lg font-semibold text-foreground">
                İkon Seçimi
              </label>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    formData.icon === icon
                      ? 'border-primary bg-primary/10 scale-105'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <Tag className="w-6 h-6 mx-auto" style={{ color: formData.icon === icon ? formData.color : 'currentColor' }} />
                  <span className="text-xs mt-2 block truncate">{icon}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Color Selection */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Palette className="w-5 h-5 text-secondary" />
              </div>
              <label className="text-lg font-semibold text-foreground">
                Renk Seçimi
              </label>
            </div>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-12 h-12 rounded-xl border-4 transition-all duration-300 hover:scale-110 ${
                    formData.color === color
                      ? 'border-white shadow-lg scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Seçili renk:</span>
              <div 
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: formData.color }}
              />
              <span className="font-mono text-foreground">{formData.color}</span>
            </div>
          </motion.div>

          {/* Preview */}
          {formData.name && formData.description && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl p-8 border border-border/50 shadow-lg backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Önizleme</h3>
              <div className="bg-background/50 rounded-xl p-6 border border-border/30">
                <div className="flex items-start gap-6">
                  <div 
                    className="p-4 rounded-xl flex-shrink-0 shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${formData.color}15, ${formData.color}25)`,
                      borderColor: `${formData.color}30`
                    }}
                  >
                    <Tag className="w-8 h-8" style={{ color: formData.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-foreground mb-2">
                      {formData.name}
                    </h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      {formData.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>/forum/{previewSlug}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-between bg-gradient-to-r from-card/50 via-card/30 to-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg"
          >
            <Link
              href="/admin/categories"
              className="px-6 py-3 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 font-medium"
            >
              ← İptal
            </Link>

            <div className="flex items-center gap-6">
              {formData.name && formData.description && (
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
                disabled={loading || !formData.name.trim() || !formData.description.trim()}
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary disabled:from-muted disabled:to-muted/80 disabled:text-muted-foreground text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Güncelleniyor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Değişiklikleri Kaydet</span>
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