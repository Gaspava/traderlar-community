'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Image,
  Globe,
  Lock,
  Shield,
  Users,
  MessageSquare,
  Settings,
  Info,
  AlertCircle,
  Check,
  Upload,
  X,
  Plus,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import { communityService } from '@/lib/services/communityService';
import type { 
  CommunityCategory,
  CommunityPrivacy,
  User
} from '@/lib/supabase/types';

export default function CreateCommunityPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general' as CommunityCategory,
    privacy: 'public' as CommunityPrivacy,
    is_nsfw: false,
    allow_images: true,
    allow_videos: true,
    allow_polls: true,
    require_post_approval: false,
    require_member_approval: false,
    welcome_message: '',
    rules: [] as Array<{ title: string; description: string }>
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [slugPreview, setSlugPreview] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, []);

  useEffect(() => {
    // Generate slug from name
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlugPreview(slug);
    } else {
      setSlugPreview('');
    }
  }, [formData.name]);

  const fetchUser = async () => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (data) setUser(data);
    }
  };

  const categories = [
    { value: 'trading', label: 'Trading', icon: '📈', description: 'Günlük trading deneyimleri ve stratejiler' },
    { value: 'analysis', label: 'Analiz', icon: '📊', description: 'Teknik ve fundamental analiz tartışmaları' },
    { value: 'education', label: 'Eğitim', icon: '📚', description: 'Öğrenme kaynakları ve eğitim materyalleri' },
    { value: 'news', label: 'Haberler', icon: '📰', description: 'Piyasa haberleri ve güncel gelişmeler' },
    { value: 'strategies', label: 'Stratejiler', icon: '🎯', description: 'Trading stratejileri ve yaklaşımları' },
    { value: 'psychology', label: 'Psikoloji', icon: '🧠', description: 'Trading psikolojisi ve zihinsel yaklaşımlar' },
    { value: 'technology', label: 'Teknoloji', icon: '⚙️', description: 'Yazılım, bot ve otomasyon araçları' },
    { value: 'regulation', label: 'Regülasyon', icon: '⚖️', description: 'Yasal düzenlemeler ve vergilendirme' },
    { value: 'social', label: 'Sosyal', icon: '💬', description: 'Genel sohbet ve topluluk etkileşimi' },
    { value: 'general', label: 'Genel', icon: '🌍', description: 'Diğer konular ve genel tartışmalar' }
  ];

  const privacyOptions = [
    {
      value: 'public',
      label: 'Herkese Açık',
      icon: Globe,
      description: 'Herkes görebilir ve katılabilir'
    },
    {
      value: 'private',
      label: 'Özel',
      icon: Lock,
      description: 'Sadece davet edilenler görebilir'
    },
    {
      value: 'invite_only',
      label: 'Davetiye ile Giriş',
      icon: Shield,
      description: 'Herkes görebilir, sadece davet edilenler katılabilir'
    }
  ];

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Topluluk adı zorunludur';
      } else if (formData.name.length < 3) {
        newErrors.name = 'Topluluk adı en az 3 karakter olmalıdır';
      } else if (formData.name.length > 50) {
        newErrors.name = 'Topluluk adı en fazla 50 karakter olabilir';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Açıklama zorunludur';
      } else if (formData.description.length < 20) {
        newErrors.description = 'Açıklama en az 20 karakter olmalıdır';
      } else if (formData.description.length > 500) {
        newErrors.description = 'Açıklama en fazla 500 karakter olabilir';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const addRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, { title: '', description: '' }]
    });
  };

  const updateRule = (index: number, field: 'title' | 'description', value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setFormData({ ...formData, rules: newRules });
  };

  const removeRule = (index: number) => {
    const newRules = formData.rules.filter((_, i) => i !== index);
    setFormData({ ...formData, rules: newRules });
  };

  const handleSubmit = async () => {
    if (!user || !slugPreview) return;

    setLoading(true);
    try {
      const communityData = {
        ...formData,
        slug: slugPreview,
        rules: formData.rules.map((rule, index) => ({
          ...rule,
          id: `rule_${index + 1}`,
          order: index + 1
        }))
      };

      const result = await communityService.createCommunity(communityData);
      
      if (result.success) {
        // Redirect to created community
        router.push(`/topluluk/${slugPreview}`);
      } else {
        alert(result.error || 'Topluluk oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating community:', error);
      alert('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* Main Content */}
      <div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/topluluk"
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-muted' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-foreground' : 'text-gray-900'
              }`}>
                Yeni Topluluk Oluştur
              </h1>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                Kendi topluluğunu oluştur ve liderliği al
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  step === currentStep
                    ? (isDarkMode ? 'bg-primary text-primary-foreground' : 'bg-primary text-white')
                    : step < currentStep
                    ? 'bg-emerald-500 text-white'
                    : (isDarkMode ? 'bg-muted text-muted-foreground' : 'bg-gray-200 text-gray-500')
                }`}>
                  {step < currentStep ? <Check className="h-5 w-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded-full ${
                    step < currentStep
                      ? 'bg-emerald-500'
                      : (isDarkMode ? 'bg-muted' : 'bg-gray-200')
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className={`rounded-xl border ${
            isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
          }`}>
            <div className="p-8">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className={`text-2xl font-bold mb-2 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Temel Bilgiler
                    </h2>
                    <p className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>
                      Topluluğunuzun adı ve açıklamasını belirleyin
                    </p>
                  </div>

                  {/* Community Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Topluluk Adı *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        errors.name
                          ? 'border-red-500 focus:border-red-500'
                          : (isDarkMode 
                            ? 'bg-background border-border text-foreground focus:border-primary' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-primary')
                      } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                      placeholder="Topluluk adını girin..."
                      maxLength={50}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </p>
                    )}
                    {slugPreview && (
                      <p className={`text-sm mt-2 flex items-center gap-2 ${
                        isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                      }`}>
                        <Eye className="h-4 w-4" />
                        URL önizleme: c/{slugPreview}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Açıklama *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                        errors.description
                          ? 'border-red-500 focus:border-red-500'
                          : (isDarkMode 
                            ? 'bg-background border-border text-foreground focus:border-primary' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-primary')
                      } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                      placeholder="Topluluğunuz hakkında kısa bir açıklama yazın..."
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.description ? (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.description}
                        </p>
                      ) : (
                        <div />
                      )}
                      <span className={`text-sm ${
                        formData.description.length > 450 ? 'text-red-500' : 
                        isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                      }`}>
                        {formData.description.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Kategori Seçin *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: category.value as CommunityCategory })}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            formData.category === category.value
                              ? (isDarkMode ? 'border-primary bg-primary/10 text-foreground' : 'border-primary bg-primary/10 text-gray-900')
                              : (isDarkMode ? 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900')
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{category.icon}</span>
                            <div>
                              <div className="font-medium">{category.label}</div>
                              <div className="text-xs mt-1 opacity-75">{category.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Privacy & Settings */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className={`text-2xl font-bold mb-2 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Gizlilik ve Ayarlar
                    </h2>
                    <p className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>
                      Topluluğunuzun gizlilik seviyesini ve kurallarını belirleyin
                    </p>
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Gizlilik Seviyesi *
                    </label>
                    <div className="space-y-3">
                      {privacyOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, privacy: option.value as CommunityPrivacy })}
                            className={`w-full p-4 rounded-lg border text-left transition-all ${
                              formData.privacy === option.value
                                ? (isDarkMode ? 'border-primary bg-primary/10 text-foreground' : 'border-primary bg-primary/10 text-gray-900')
                                : (isDarkMode ? 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900')
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-6 w-6" />
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm mt-1 opacity-75">{option.description}</div>
                              </div>
                              {formData.privacy === option.value && (
                                <Check className="h-5 w-5 ml-auto text-primary" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content Settings */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      İçerik Ayarları
                    </label>
                    <div className="space-y-4">
                      {[
                        { key: 'allow_images', label: 'Resim paylaşımına izin ver', icon: Image },
                        { key: 'allow_videos', label: 'Video paylaşımına izin ver', icon: MessageSquare },
                        { key: 'allow_polls', label: 'Anket oluşturmaya izin ver', icon: Users }
                      ].map((setting) => {
                        const Icon = setting.icon;
                        return (
                          <label key={setting.key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData[setting.key as keyof typeof formData] as boolean}
                              onChange={(e) => setFormData({ ...formData, [setting.key]: e.target.checked })}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <Icon className="h-5 w-5" />
                            <span>{setting.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Moderation Settings */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Moderasyon Ayarları
                    </label>
                    <div className="space-y-4">
                      {[
                        { key: 'require_post_approval', label: 'Gönderilerin onay almasını gerektir', icon: Shield },
                        { key: 'require_member_approval', label: 'Üyelik başvurularının onay almasını gerektir', icon: Users },
                        { key: 'is_nsfw', label: 'Bu topluluk yetişkin içeriği (NSFW) içerir', icon: AlertCircle }
                      ].map((setting) => {
                        const Icon = setting.icon;
                        return (
                          <label key={setting.key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData[setting.key as keyof typeof formData] as boolean}
                              onChange={(e) => setFormData({ ...formData, [setting.key]: e.target.checked })}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <Icon className="h-5 w-5" />
                            <span>{setting.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Rules & Welcome Message */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className={`text-2xl font-bold mb-2 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Kurallar ve Hoş Geldin Mesajı
                    </h2>
                    <p className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>
                      Topluluğunuzun kurallarını ve yeni üyelere gösterilecek mesajı belirleyin
                    </p>
                  </div>

                  {/* Welcome Message */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Hoş Geldin Mesajı
                    </label>
                    <textarea
                      value={formData.welcome_message}
                      onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                        isDarkMode 
                          ? 'bg-background border-border text-foreground focus:border-primary' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-primary'
                      } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                      placeholder="Yeni üyelere gösterilecek hoş geldin mesajını yazın..."
                      maxLength={300}
                    />
                    <div className="flex justify-end mt-1">
                      <span className={`text-sm ${
                        formData.welcome_message.length > 250 ? 'text-red-500' : 
                        isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                      }`}>
                        {formData.welcome_message.length}/300
                      </span>
                    </div>
                  </div>

                  {/* Rules */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className={`text-sm font-medium ${
                        isDarkMode ? 'text-foreground' : 'text-gray-900'
                      }`}>
                        Topluluk Kuralları
                      </label>
                      <button
                        type="button"
                        onClick={addRule}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          isDarkMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        Kural Ekle
                      </button>
                    </div>

                    {formData.rules.length === 0 ? (
                      <div className={`text-center py-8 rounded-lg border-2 border-dashed ${
                        isDarkMode ? 'border-border text-muted-foreground' : 'border-gray-300 text-gray-500'
                      }`}>
                        <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Henüz kural eklenmemiş</p>
                        <p className="text-sm">Topluluğunuz için kurallar ekleyin</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.rules.map((rule, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-card border-border' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center mt-1">
                                {index + 1}
                              </div>
                              <div className="flex-1 space-y-3">
                                <input
                                  type="text"
                                  value={rule.title}
                                  onChange={(e) => updateRule(index, 'title', e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                                    isDarkMode 
                                      ? 'bg-background border-border text-foreground focus:border-primary' 
                                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary'
                                  } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                  placeholder="Kural başlığı..."
                                  maxLength={100}
                                />
                                <textarea
                                  value={rule.description}
                                  onChange={(e) => updateRule(index, 'description', e.target.value)}
                                  rows={2}
                                  className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
                                    isDarkMode 
                                      ? 'bg-background border-border text-foreground focus:border-primary' 
                                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary'
                                  } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                  placeholder="Kural açıklaması..."
                                  maxLength={200}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeRule(index)}
                                className={`p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 mt-8 border-t border-border">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Geri
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    İleri
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`flex items-center gap-2 px-8 py-2 rounded-lg font-medium transition-colors ${
                      loading 
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : (isDarkMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-primary text-white hover:bg-primary/90')
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Topluluğu Oluştur
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className={`mt-8 p-4 rounded-lg border ${
            isDarkMode ? 'bg-card border-border' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className={`font-medium mb-1 ${isDarkMode ? 'text-foreground' : 'text-blue-900'}`}>
                  Topluluk oluştururken dikkat edilmesi gerekenler:
                </p>
                <ul className={`space-y-1 ${isDarkMode ? 'text-muted-foreground' : 'text-blue-800'}`}>
                  <li>• Topluluk adı oluşturulduktan sonra değiştirilemez</li>
                  <li>• Kurallar daha sonra düzenlenebilir ve yeni kurallar eklenebilir</li>
                  <li>• Gizlilik ayarları istediğiniz zaman değiştirilebilir</li>
                  <li>• Topluluk silindikten sonra geri alınamaz</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}