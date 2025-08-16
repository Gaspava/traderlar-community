'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Plus,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Share,
  Bookmark,
  MoreHorizontal,
  Flame,
  Sparkles,
  Star,
  TrendingUp,
  Clock,
  Pin,
  Lock,
  Eye,
  Users,
  Calendar,
  Award,
  Filter,
  Sort,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import { communityService } from '@/lib/services/communityService';
import type { 
  CommunityWithMembership, 
  CommunityPostWithDetails,
  CommunityPostFilters,
  User
} from '@/lib/supabase/types';

export default function CommunityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [community, setCommunity] = useState<CommunityWithMembership | null>(null);
  const [posts, setPosts] = useState<CommunityPostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const [filters, setFilters] = useState<CommunityPostFilters>({
    sort_by: 'hot'
  });

  useEffect(() => {
    setMounted(true);
    fetchUser();
    fetchCommunity();
  }, [slug]);

  useEffect(() => {
    if (community) {
      fetchPosts();
    }
  }, [community, filters]);

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
      setLoading(true);
      const community = await communityService.getCommunityWithMembership(slug);
      setCommunity(community);
    } catch (error) {
      console.error('Error fetching community:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      // Mock posts data
      const mockPosts: CommunityPostWithDetails[] = [
        {
          id: '1',
          community_id: '1',
          author_id: 'user2',
          title: 'EURUSD Analizi - Güçlü Direnç Seviyesinde',
          content: 'EURUSD paritesi 1.0850 seviyesinde güçlü bir direnç ile karşılaştı. Teknik analize göre bu seviyenin üzerine çıkış için güçlü bir momentum gerekiyor. RSI 70 seviyesinde, potansiel geri çekilme olabilir.',
          post_type: 'text',
          media_urls: [],
          poll_options: [],
          poll_votes: {},
          slug: 'eurusd-analizi-guclu-direnc-seviyesinde',
          tags: ['forex', 'eurusd', 'analiz'],
          is_pinned: true,
          is_locked: false,
          is_removed: false,
          is_approved: true,
          upvotes: 24,
          downvotes: 2,
          comment_count: 8,
          view_count: 156,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user2',
            name: 'Mehmet Analiz',
            username: 'mehmet_analiz',
            avatar_url: '',
            role: 'user'
          },
          community: {
            id: '1',
            name: 'Trading Tartışmaları',
            slug: 'trading-tartismalari',
            icon_url: '',
            privacy: 'public'
          },
          user_vote: 1,
          is_saved: false,
          vote_score: 22
        },
        {
          id: '2',
          community_id: '1',
          author_id: 'user3',
          title: 'Bitcoin 50K Seviyesini Test Ediyor',
          content: 'Bitcoin son 24 saatte yüzde 3.2 artış göstererek 49.800 seviyesine ulaştı. 50.000 dolar psikolojik direnci kırılırsa 52.000 seviyesi hedeflenebilir.',
          post_type: 'text',
          media_urls: [],
          poll_options: [],
          poll_votes: {},
          slug: 'bitcoin-50k-seviyesini-test-ediyor',
          tags: ['bitcoin', 'kripto', 'analiz'],
          is_pinned: false,
          is_locked: false,
          is_removed: false,
          is_approved: true,
          upvotes: 18,
          downvotes: 1,
          comment_count: 12,
          view_count: 203,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user3',
            name: 'Zeynep Crypto',
            username: 'zeynep_crypto',
            avatar_url: '',
            role: 'user'
          },
          community: {
            id: '1',
            name: 'Trading Tartışmaları',
            slug: 'trading-tartismalari',
            icon_url: '',
            privacy: 'public'
          },
          user_vote: 0,
          is_saved: true,
          vote_score: 17
        }
      ];

      setPosts(mockPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    const result = await communityService.joinCommunity(communityId);
    if (result.success) {
      // Refresh community data to show updated membership status
      await fetchCommunity();
    } else {
      alert(result.error || 'Katılma işlemi başarısız oldu');
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    const result = await communityService.leaveCommunity(communityId);
    if (result.success) {
      // Refresh community data to show updated membership status
      await fetchCommunity();
    } else {
      alert(result.error || 'Ayrılma işlemi başarısız oldu');
    }
  };

  const handleVote = async (postId: string, voteType: number) => {
    // TODO: Implement voting logic
    console.log('Voting on post:', postId, 'Type:', voteType);
  };

  const handleSave = async (postId: string) => {
    // TODO: Implement save/unsave logic
    console.log('Saving post:', postId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'şimdi';
    if (diffInHours < 24) return `${diffInHours}s`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}g`;
    return date.toLocaleDateString('tr-TR').split('.').slice(0, 2).join('.');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const sortOptions = [
    { value: 'hot', label: 'Popüler', icon: Flame },
    { value: 'new', label: 'Yeni', icon: Sparkles },
    { value: 'top', label: 'En İyi', icon: Star },
    { value: 'controversial', label: 'Tartışmalı', icon: TrendingUp }
  ];

  if (!mounted || loading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-background' : 'bg-gray-50'
      }`}>
        <div className="animate-pulse">
          <div className="h-72 bg-muted"></div>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-card rounded-xl p-6 mb-8">
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-background' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Topluluk bulunamadı</h1>
          <Link href="/topluluk" className="text-primary hover:underline">
            Topluluklara geri dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* Main Content */}
      <div>
        {/* Community Header Banner */}
        <div className={`relative h-32 overflow-hidden ${
          isDarkMode ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex items-center h-full px-6">
            <div className="flex items-center gap-4">
              {/* Community Icon */}
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white/20"
                style={{ backgroundColor: '#3B82F6' }}
              >
                {community.name.charAt(0).toUpperCase()}
              </div>
              
              {/* Community Info */}
              <div className="text-white">
                <h1 className="text-2xl font-bold mb-1">c/{community.name}</h1>
                <p className="text-blue-100/80 text-sm">
                  {formatNumber(community.member_count)} üye • {formatNumber(community.active_member_count)} çevrimiçi
                </p>
              </div>
            </div>

            {/* Join Button */}
            <div className="ml-auto">
              {community.is_member ? (
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors">
                    Ayrıl
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleJoinCommunity(community.id)}
                  className="px-6 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-medium transition-colors shadow-md"
                >
                  Katıl
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 min-w-0 px-4 py-6">
            <div className="w-full max-w-3xl mx-auto">
              {/* Post Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Create Post Button */}
                {community.is_member && (
                  <Link
                    href={`/topluluk/${slug}/yeni-gonderi`}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-md"
                  >
                    <Plus className="h-5 w-5" />
                    Gönderi Oluştur
                  </Link>
                )}

                {/* Sort Options */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sortOptions.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setFilters(prev => ({ ...prev, sort_by: value as any }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
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
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {postsLoading ? (
                  // Loading skeleton
                  [...Array(3)].map((_, i) => (
                    <div key={i} className={`animate-pulse rounded-xl border ${
                      isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex p-4">
                        <div className="w-10 h-16 bg-muted rounded mr-4"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                          <div className="h-3 bg-muted rounded w-full mb-2"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : posts.length > 0 ? (
                  posts.map(post => (
                    <div key={post.id} className={`rounded-xl border transition-all duration-200 hover:shadow-sm ${
                      isDarkMode ? 'bg-card border-border hover:bg-background' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}>
                      <div className="flex p-4">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center w-10 mr-4">
                          <button 
                            onClick={() => handleVote(post.id, 1)}
                            className={`p-1 rounded transition-colors ${
                              post.user_vote === 1
                                ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20'
                                : (isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-emerald-500' : 'text-gray-400 hover:bg-gray-100 hover:text-emerald-500')
                            }`}
                          >
                            <ArrowUp className="w-5 h-5" />
                          </button>
                          <span className={`text-sm font-bold py-1 ${
                            post.vote_score > 10 ? 'text-emerald-500' : 
                            post.vote_score < -10 ? 'text-red-500' :
                            (isDarkMode ? 'text-foreground' : 'text-gray-600')
                          }`}>
                            {post.vote_score > 1000 ? `${(post.vote_score/1000).toFixed(1)}k` : post.vote_score}
                          </span>
                          <button 
                            onClick={() => handleVote(post.id, -1)}
                            className={`p-1 rounded transition-colors ${
                              post.user_vote === -1
                                ? 'text-red-500 bg-red-100 dark:bg-red-900/20'
                                : (isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-red-500' : 'text-gray-400 hover:bg-gray-100 hover:text-red-500')
                            }`}
                          >
                            <ArrowDown className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Post Meta */}
                          <div className="flex items-center gap-2 mb-2 text-sm">
                            {post.is_pinned && (
                              <Pin className="w-4 h-4 text-green-500" />
                            )}
                            <Link 
                              href={`/profile/${post.author.username}`}
                              className={`font-medium hover:underline ${
                                isDarkMode ? 'text-foreground' : 'text-gray-900'
                              }`}
                            >
                              u/{post.author.username}
                            </Link>
                            <span className={`${isDarkMode ? 'text-muted-foreground' : 'text-gray-500'}`}>
                              • {formatDate(post.created_at)} önce
                            </span>
                            {post.is_locked && (
                              <Lock className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          
                          {/* Title and Content */}
                          <Link href={`/topluluk/${slug}/gonderi/${post.slug || post.id}`} className="block group">
                            <h3 className={`font-medium text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors ${
                              isDarkMode ? 'text-foreground' : 'text-gray-900'
                            }`}>
                              {post.title}
                              {post.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {post.tags.map(tag => (
                                    <span key={tag} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                      isDarkMode ? 'bg-muted text-muted-foreground' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </h3>
                            
                            {post.content && (
                              <p className={`text-sm mb-3 line-clamp-3 ${
                                isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                              }`}>
                                {post.content}
                              </p>
                            )}
                          </Link>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-4 text-sm">
                            <Link
                              href={`/topluluk/${slug}/gonderi/${post.slug || post.id}`}
                              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                                isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <MessageSquare className="w-4 h-4" />
                              {formatNumber(post.comment_count)} yorum
                            </Link>
                            <button className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                              isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100'
                            }`}>
                              <Share className="w-4 h-4" />
                              Paylaş
                            </button>
                            <button 
                              onClick={() => handleSave(post.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                                post.is_saved
                                  ? 'text-blue-500 bg-blue-100 dark:bg-blue-900/20'
                                  : (isDarkMode ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-gray-500 hover:bg-gray-100')
                              }`}
                            >
                              <Bookmark className="w-4 h-4" />
                              Kaydet
                            </button>
                            <div className={`flex items-center gap-1 text-xs ${
                              isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                            }`}>
                              <Eye className="w-3 h-3" />
                              {formatNumber(post.view_count)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${
                      isDarkMode ? 'text-muted-foreground' : 'text-gray-400'
                    }`} />
                    <h3 className={`text-xl font-semibold mb-2 ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Henüz gönderi yok
                    </h3>
                    <p className={`mb-6 ${
                      isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                    }`}>
                      Bu toplulukta ilk gönderiyi sen paylaş!
                    </p>
                    {community.is_member && (
                      <Link
                        href={`/topluluk/${slug}/yeni-gonderi`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                      >
                        <Plus className="h-5 w-5" />
                        İlk Gönderiyi Oluştur
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-4 p-4">
              {/* Community Info */}
              <div className={`rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 border-b ${
                  isDarkMode ? 'border-border' : 'border-gray-100'
                }`}>
                  <h3 className={`font-semibold ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>Topluluk Hakkında</h3>
                </div>
                <div className="p-4">
                  <p className={`text-sm mb-4 ${
                    isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                  }`}>
                    {community.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Üye</span>
                      <span className={isDarkMode ? 'text-foreground' : 'text-gray-900'}>{formatNumber(community.member_count)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Çevrimiçi</span>
                      <span className="text-emerald-500">{formatNumber(community.active_member_count)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>Oluşturuldu</span>
                      <span className={isDarkMode ? 'text-foreground' : 'text-gray-900'}>
                        {new Date(community.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Rules */}
              {community.rules.length > 0 && (
                <div className={`rounded-lg border transition-colors duration-200 ${
                  isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
                }`}>
                  <div className={`p-4 border-b ${
                    isDarkMode ? 'border-border' : 'border-gray-100'
                  }`}>
                    <h3 className={`font-semibold ${
                      isDarkMode ? 'text-foreground' : 'text-gray-900'
                    }`}>Kurallar</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {community.rules.map((rule, index) => (
                      <div key={rule.id} className="text-sm">
                        <div className={`font-medium mb-1 ${
                          isDarkMode ? 'text-foreground' : 'text-gray-900'
                        }`}>
                          {index + 1}. {rule.title}
                        </div>
                        <div className={isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}>
                          {rule.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderators */}
              <div className={`rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 border-b ${
                  isDarkMode ? 'border-border' : 'border-gray-100'
                }`}>
                  <h3 className={`font-semibold ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>Moderatörler</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      {community.creator.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        isDarkMode ? 'text-foreground' : 'text-gray-900'
                      }`}>
                        u/{community.creator.username}
                      </div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
                      }`}>
                        Kurucu
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