'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Type,
  Image,
  Video,
  BarChart3,
  Link2,
  Eye,
  EyeOff,
  Hash,
  AlertCircle,
  Check,
  Upload,
  X,
  Plus,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import ForumSidebar from '@/components/forum/ForumSidebar';
import { communityService } from '@/lib/services/communityService';
import type { 
  CommunityWithMembership, 
  CommunityPostType,
  User
} from '@/lib/supabase/types';

export default function CreatePostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [user, setUser] = useState<User | null>(null);
  const [community, setCommunity] = useState<CommunityWithMembership | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [postType, setPostType] = useState<CommunityPostType>('text');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    media_urls: [] as string[],
    poll_options: [] as string[],
    is_nsfw: false,
    is_spoiler: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTag, setCurrentTag] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUser();
    fetchCommunity();
  }, [slug]);

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

  const fetchCommunity = async () => {
    try {
      const community = await communityService.getCommunityWithMembership(slug);
      
      if (!community) {
        router.push('/topluluk');
        return;
      }
      
      if (!community.is_member) {
        router.push(`/topluluk/${slug}`);
        return;
      }
      
      setCommunity(community);
    } catch (error) {
      console.error('Error fetching community:', error);
      router.push('/topluluk');
    }
  };

  const postTypes = [
    {
      type: 'text' as CommunityPostType,
      label: 'Metin',
      icon: Type,
      description: 'Metin tabanlı gönderi oluştur'
    },
    {
      type: 'image' as CommunityPostType,
      label: 'Resim',
      icon: Image,
      description: 'Resim paylaş',
      disabled: !community?.allow_images
    },
    {
      type: 'video' as CommunityPostType,
      label: 'Video',
      icon: Video,
      description: 'Video paylaş',
      disabled: !community?.allow_videos
    },
    {
      type: 'link' as CommunityPostType,
      label: 'Link',
      icon: Link2,
      description: 'Dış bağlantı paylaş'
    },
    {
      type: 'poll' as CommunityPostType,
      label: 'Anket',
      icon: BarChart3,
      description: 'Anket oluştur',
      disabled: !community?.allow_polls
    }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Başlık zorunludur';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Başlık en az 5 karakter olmalıdır';
    } else if (formData.title.length > 300) {
      newErrors.title = 'Başlık en fazla 300 karakter olabilir';
    }

    if (postType === 'text' && !formData.content.trim()) {
      newErrors.content = 'İçerik zorunludur';
    }

    if (postType === 'poll') {
      const validOptions = formData.poll_options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        newErrors.poll_options = 'En az 2 anket seçeneği gereklidir';
      }
    }

    if (postType === 'link' && !formData.content.trim()) {
      newErrors.content = 'Link URL\'si gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addPollOption = () => {
    if (formData.poll_options.length < 6) {
      setFormData({
        ...formData,
        poll_options: [...formData.poll_options, '']
      });
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...formData.poll_options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      poll_options: newOptions
    });
  };

  const removePollOption = (index: number) => {
    const newOptions = formData.poll_options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      poll_options: newOptions
    });
  };

  const handleSubmit = async () => {
    if (!user || !community || !validateForm()) return;

    setLoading(true);
    try {
      const postData = {
        ...formData,
        community_id: community.id,
        author_id: user.id,
        post_type: postType,
        // Generate slug from title
        slug: formData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, ''),
        is_approved: !community.require_post_approval
      };

      // TODO: Implement actual post creation with Supabase
      console.log('Creating post:', postData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to community
      router.push(`/topluluk/${slug}`);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Gönderi oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (!community || !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-background' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* Forum Sidebar Component - Community Mode */}
      <ForumSidebar showCommunities={true} activeCommunity={slug} />

      {/* Main Content with Left Margin for Fixed Sidebar */}
      <div className="md:ml-60">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href={`/topluluk/${slug}`}
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
                Yeni Gönderi Oluştur
              </h1>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                c/{community.name} topluluğunda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post Type Selection */}
              <div className={`rounded-xl border ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6">
                  <h2 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>
                    Gönderi Türü Seçin
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {postTypes.map(({ type, label, icon: Icon, description, disabled }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => !disabled && setPostType(type)}
                        disabled={disabled}
                        className={`p-4 rounded-lg border text-center transition-all ${
                          disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : postType === type
                            ? (isDarkMode ? 'border-primary bg-primary/10 text-foreground' : 'border-primary bg-primary/10 text-gray-900')
                            : (isDarkMode ? 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900')
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium text-sm">{label}</div>
                        <div className="text-xs mt-1 opacity-75">{description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Post Form */}
              <div className={`rounded-xl border ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Başlık *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        errors.title
                          ? 'border-red-500 focus:border-red-500'
                          : (isDarkMode 
                            ? 'bg-background border-border text-foreground focus:border-primary' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-primary')
                      } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                      placeholder="Gönderinizin başlığını yazın..."
                      maxLength={300}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.title}
                      </p>
                    )}
                    <div className="flex justify-end mt-1">
                      <span className={`text-sm ${
                        formData.title.length > 280 ? 'text-red-500' : 
                        isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                      }`}>
                        {formData.title.length}/300
                      </span>
                    </div>
                  </div>

                  {/* Content based on post type */}
                  {postType === 'text' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? 'text-foreground' : 'text-gray-900'
                        }`}>
                          İçerik *
                        </label>
                        <button
                          type="button"
                          onClick={() => setPreviewMode(!previewMode)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                            previewMode
                              ? (isDarkMode ? 'bg-primary text-primary-foreground' : 'bg-primary text-white')
                              : (isDarkMode ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                          }`}
                        >
                          {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {previewMode ? 'Düzenle' : 'Önizleme'}
                        </button>
                      </div>
                      {previewMode ? (
                        <div className={`p-4 rounded-lg border min-h-[200px] ${
                          isDarkMode ? 'bg-background border-border' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className={`whitespace-pre-wrap ${
                            isDarkMode ? 'text-foreground' : 'text-gray-900'
                          }`}>
                            {formData.content || 'İçerik önizlemesi burada görüntülenecek...'}
                          </div>
                        </div>
                      ) : (
                        <textarea
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          rows={8}
                          className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                            errors.content
                              ? 'border-red-500 focus:border-red-500'
                              : (isDarkMode 
                                ? 'bg-background border-border text-foreground focus:border-primary' 
                                : 'bg-white border-gray-300 text-gray-900 focus:border-primary')
                          } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                          placeholder="Gönderinizin içeriğini yazın..."
                        />
                      )}
                      {errors.content && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.content}
                        </p>
                      )}
                    </div>
                  )}

                  {postType === 'link' && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-foreground' : 'text-gray-900'
                      }`}>
                        URL *
                      </label>
                      <input
                        type="url"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          errors.content
                            ? 'border-red-500 focus:border-red-500'
                            : (isDarkMode 
                              ? 'bg-background border-border text-foreground focus:border-primary' 
                              : 'bg-white border-gray-300 text-gray-900 focus:border-primary')
                        } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                        placeholder="https://..."
                      />
                      {errors.content && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.content}
                        </p>
                      )}
                    </div>
                  )}

                  {postType === 'poll' && (
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${
                        isDarkMode ? 'text-foreground' : 'text-gray-900'
                      }`}>
                        Anket Seçenekleri *
                      </label>
                      <div className="space-y-3">
                        {formData.poll_options.map((option, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                              {index + 1}
                            </div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                              className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                                isDarkMode 
                                  ? 'bg-background border-border text-foreground focus:border-primary' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-primary'
                              } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                              placeholder={`Seçenek ${index + 1}...`}
                              maxLength={100}
                            />
                            {formData.poll_options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removePollOption(index)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {formData.poll_options.length < 6 && (
                          <button
                            type="button"
                            onClick={addPollOption}
                            className={`flex items-center gap-2 w-full p-3 border-2 border-dashed rounded-lg transition-colors ${
                              isDarkMode ? 'border-border hover:border-primary text-muted-foreground hover:text-foreground' : 'border-gray-300 hover:border-primary text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <Plus className="h-4 w-4" />
                            Seçenek Ekle
                          </button>
                        )}
                      </div>
                      {errors.poll_options && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.poll_options}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Etiketler
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            isDarkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                          }`}
                        >
                          <Hash className="h-3 w-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                          isDarkMode 
                            ? 'bg-background border-border text-foreground focus:border-primary' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-primary'
                        } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                        placeholder="Etiket ekle..."
                        maxLength={20}
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isDarkMode ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Ekle
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <h3 className={`text-sm font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Seçenekler
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_nsfw}
                          onChange={(e) => setFormData({ ...formData, is_nsfw: e.target.checked })}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>
                          Bu gönderi yetişkin içeriği (NSFW) içeriyor
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_spoiler}
                          onChange={(e) => setFormData({ ...formData, is_spoiler: e.target.checked })}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>
                          Bu gönderi spoiler içeriyor
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3">
                <Link
                  href={`/topluluk/${slug}`}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  İptal
                </Link>
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
                      Paylaşılıyor...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Paylaş
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Community Info */}
              <div className={`rounded-lg border ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: '#3B82F6' }}
                    >
                      {community.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-foreground' : 'text-gray-900'
                      }`}>
                        c/{community.name}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                      }`}>
                        {community.member_count} üye
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                  }`}>
                    {community.description}
                  </p>
                </div>
              </div>

              {/* Rules */}
              {community.rules.length > 0 && (
                <div className={`rounded-lg border ${
                  isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
                }`}>
                  <div className={`p-3 border-b ${
                    isDarkMode ? 'border-border' : 'border-gray-100'
                  }`}>
                    <h3 className={`font-semibold text-sm ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Topluluk Kuralları
                    </h3>
                  </div>
                  <div className="p-3 space-y-2">
                    {community.rules.slice(0, 3).map((rule, index) => (
                      <div key={rule.id} className="text-xs">
                        <div className={`font-medium ${
                          isDarkMode ? 'text-foreground' : 'text-gray-900'
                        }`}>
                          {index + 1}. {rule.title}
                        </div>
                        <div className={`${
                          isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                        } mt-1`}>
                          {rule.description}
                        </div>
                      </div>
                    ))}
                    {community.rules.length > 3 && (
                      <p className={`text-xs ${
                        isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                      }`}>
                        +{community.rules.length - 3} daha fazla kural
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}