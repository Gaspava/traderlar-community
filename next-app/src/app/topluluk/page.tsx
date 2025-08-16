'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  Users, 
  Calendar,
  Star,
  Flame,
  Clock,
  Globe,
  Lock,
  Shield,
  ChevronDown,
  Grid,
  List,
  MapPin,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import CommunityCard from '@/components/communities/CommunityCard';
import { communityService } from '@/lib/services/communityService';
import type { 
  CommunityWithMembership, 
  CommunitySearchFilters,
  CommunityCategory,
  CommunityPrivacy,
  User
} from '@/lib/supabase/types';

export default function CommunityDiscoveryPage() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [communities, setCommunities] = useState<CommunityWithMembership[]>([]);
  const [featuredCommunities, setFeaturedCommunities] = useState<CommunityWithMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CommunitySearchFilters>({
    sort_by: 'most_active'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUser();
    fetchCommunities();
    fetchFeaturedCommunities();
  }, [filters, searchQuery]);

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

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const communities = await communityService.searchCommunities(filters, searchQuery);
      setCommunities(communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCommunities = async () => {
    // For now, just use the first 3 communities as featured
    const featured = communities.slice(0, 3);
    setFeaturedCommunities(featured);
  };

  const handleJoinCommunity = async (communityId: string) => {
    const result = await communityService.joinCommunity(communityId);
    if (result.success) {
      // Refresh communities to show updated membership status
      await fetchCommunities();
    } else {
      alert(result.error || 'Katılma işlemi başarısız oldu');
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    const result = await communityService.leaveCommunity(communityId);
    if (result.success) {
      // Refresh communities to show updated membership status
      await fetchCommunities();
    } else {
      alert(result.error || 'Ayrılma işlemi başarısız oldu');
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const categories: Array<{ value: CommunityCategory; label: string; icon: string }> = [
    { value: 'trading', label: 'Trading', icon: '📈' },
    { value: 'analysis', label: 'Analiz', icon: '📊' },
    { value: 'education', label: 'Eğitim', icon: '📚' },
    { value: 'news', label: 'Haberler', icon: '📰' },
    { value: 'strategies', label: 'Stratejiler', icon: '🎯' },
    { value: 'psychology', label: 'Psikoloji', icon: '🧠' },
    { value: 'technology', label: 'Teknoloji', icon: '⚙️' },
    { value: 'regulation', label: 'Regülasyon', icon: '⚖️' },
    { value: 'social', label: 'Sosyal', icon: '💬' },
    { value: 'general', label: 'Genel', icon: '🌍' }
  ];

  const sortOptions = [
    { value: 'most_active', label: 'En Aktif', icon: Flame },
    { value: 'most_members', label: 'En Çok Üye', icon: Users },
    { value: 'newest', label: 'En Yeni', icon: Clock },
    { value: 'alphabetical', label: 'Alfabetik', icon: List }
  ];

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* Main Content */}
      <div>
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 min-w-0 px-4 py-6">
            <div className="w-full max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>
                    Topluluk Keşfi
                  </h1>
                  <Link
                    href="/topluluk/yeni-topluluk-olustur"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    Topluluk Oluştur
                  </Link>
                </div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                }`}>
                  Trading topluluklarını keşfedin, katılın ve deneyimlerinizi paylaşın
                </p>
              </div>

              {/* Search and Filters */}
              <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Topluluk ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'bg-card border-border text-foreground placeholder-muted-foreground focus:border-primary' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary'
                } focus:outline-none focus:ring-2 focus:ring-primary/20`}
              />
            </div>

            {/* Sort and View Controls */}
            <div className="flex gap-3">
              <select
                value={filters.sort_by}
                onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value as any }))}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'bg-card border-border text-foreground' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className={`flex rounded-xl border ${
                isDarkMode ? 'border-border' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors ${
                    viewMode === 'grid'
                      ? (isDarkMode ? 'bg-primary text-primary-foreground' : 'bg-primary text-white')
                      : (isDarkMode ? 'text-muted-foreground hover:text-foreground' : 'text-gray-500 hover:text-gray-700')
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors ${
                    viewMode === 'list'
                      ? (isDarkMode ? 'bg-primary text-primary-foreground' : 'bg-primary text-white')
                      : (isDarkMode ? 'text-muted-foreground hover:text-foreground' : 'text-gray-500 hover:text-gray-700')
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'bg-card border-border text-foreground hover:bg-muted' 
                    : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-5 w-5" />
                Filtreler
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className={`mt-4 p-6 rounded-xl border ${
              isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>
                    Kategori
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      category: e.target.value as CommunityCategory || undefined 
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border transition-all ${
                      isDarkMode 
                        ? 'bg-background border-border text-foreground' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Privacy Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>
                    Gizlilik
                  </label>
                  <select
                    value={filters.privacy || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      privacy: e.target.value as CommunityPrivacy || undefined 
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border transition-all ${
                      isDarkMode 
                        ? 'bg-background border-border text-foreground' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                  >
                    <option value="">Tümü</option>
                    <option value="public">🌍 Herkese Açık</option>
                    <option value="private">🔒 Özel</option>
                    <option value="invite_only">🛡️ Davetiye</option>
                  </select>
                </div>

                {/* Member Count Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>
                    Üye Sayısı
                  </label>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'small') {
                        setFilters(prev => ({ ...prev, min_members: 0, max_members: 100 }));
                      } else if (value === 'medium') {
                        setFilters(prev => ({ ...prev, min_members: 100, max_members: 1000 }));
                      } else if (value === 'large') {
                        setFilters(prev => ({ ...prev, min_members: 1000, max_members: undefined }));
                      } else {
                        setFilters(prev => ({ ...prev, min_members: undefined, max_members: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg border transition-all ${
                      isDarkMode 
                        ? 'bg-background border-border text-foreground' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                  >
                    <option value="">Farketmez</option>
                    <option value="small">👥 Küçük (0-100)</option>
                    <option value="medium">👨‍👩‍👧‍👦 Orta (100-1000)</option>
                    <option value="large">🏟️ Büyük (1000+)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-4 mb-6">
                {[
                  { value: 'most_active', label: 'En Aktif', icon: Flame },
                  { value: 'most_members', label: 'En Çok Üye', icon: Users },
                  { value: 'newest', label: 'En Yeni', icon: Clock },
                  { value: 'alphabetical', label: 'A-Z', icon: List }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setFilters(prev => ({ ...prev, sort_by: value as any }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.sort_by === value
                        ? (isDarkMode ? 'bg-primary text-primary-foreground' : 'bg-primary text-white')
                        : (isDarkMode ? 'text-muted-foreground hover:text-foreground hover:bg-muted' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Communities List */}
              <div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`animate-pulse rounded-lg border transition-colors duration-200 ${
                        isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex p-4">
                          <div className="w-12 h-12 bg-muted rounded-full mr-4"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/4"></div>
                          </div>
                          <div className="w-16 h-8 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : communities.length > 0 ? (
                  <div className="space-y-4">
                    {communities.map(community => (
                      <div key={community.id} className={`rounded-lg border transition-all duration-200 hover:shadow-sm ${
                        isDarkMode ? 'bg-card border-border hover:bg-background' : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}>
                        <div className="flex items-center p-4">
                          {/* Community Icon */}
                          <div className="flex-shrink-0 mr-4">
                            {community.icon_url ? (
                              <img
                                src={community.icon_url}
                                alt={`${community.name} icon`}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: '#3B82F6' }}
                              >
                                {community.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Community Info */}
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/topluluk/${community.slug}`}
                              className="block hover:text-primary transition-colors"
                            >
                              <h3 className={`font-semibold text-lg leading-tight truncate ${
                                isDarkMode ? 'text-foreground' : 'text-gray-900'
                              }`}>
                                c/{community.name}
                              </h3>
                            </Link>
                            <p className={`text-sm mt-1 line-clamp-2 ${
                              isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                            }`}>
                              {community.description}
                            </p>
                            <div className={`flex items-center gap-4 mt-2 text-sm ${
                              isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                            }`}>
                              <span>{formatNumber(community.member_count)} üye</span>
                              <span>•</span>
                              <span>{formatNumber(community.active_member_count)} aktif</span>
                            </div>
                          </div>

                          {/* Join Button */}
                          <div className="flex-shrink-0">
                            {community.is_member ? (
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                                isDarkMode ? 'bg-muted text-muted-foreground' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <span>✓ Üye</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleJoinCommunity(community.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isDarkMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-primary text-white hover:bg-primary/90'
                                }`}
                              >
                                <Plus className="h-4 w-4" />
                                Katıl
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className={`w-16 h-16 mx-auto mb-4 ${
                      isDarkMode ? 'text-muted-foreground' : 'text-gray-400'
                    }`} />
                    <h3 className={`text-xl font-semibold mb-2 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Topluluk bulunamadı
                    </h3>
                    <p className={`mb-6 ${
                      isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                    }`}>
                      Arama kriterlerinize uygun topluluk bulunamadı.
                    </p>
                    <Link
                      href="/topluluk/yeni-topluluk-olustur"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300"
                    >
                      <Plus className="h-5 w-5" />
                      İlk Topluluğu Sen Oluştur
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-4 p-4">
              {/* Create Community CTA */}
              <div className={`rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white text-center rounded-t-lg">
                  <h3 className="font-bold mb-2">Kendi Topluluğun</h3>
                  <p className="text-sm opacity-90 mb-3">Bir topluluk oluştur ve liderliği al</p>
                  <Link
                    href="/topluluk/yeni-topluluk-olustur"
                    className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded hover:bg-gray-100 transition-colors inline-block"
                  >
                    Topluluk Oluştur
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className={`rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 border-b ${
                  isDarkMode ? 'border-border' : 'border-gray-100'
                }`}>
                  <h3 className={`font-semibold ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>Platform İstatistikleri</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Toplam Topluluk</span>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>1,247</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Aktif Üyeler</span>
                    <span className="font-medium text-emerald-500">25.8K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Bugünkü Gönderiler</span>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>156</span>
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