'use client';

import { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Eye, 
  Shield, 
  Lock, 
  Globe,
  Crown,
  Settings,
  UserPlus,
  UserMinus,
  Star,
  Bell,
  BellOff,
  Share,
  Flag,
  Calendar,
  TrendingUp
} from 'lucide-react';
import type { CommunityWithMembership } from '@/lib/supabase/types';
import { useTheme } from 'next-themes';

interface CommunityHeaderProps {
  community: CommunityWithMembership;
  onJoin?: (communityId: string) => void;
  onLeave?: (communityId: string) => void;
  onToggleNotifications?: (communityId: string, enabled: boolean) => void;
  isLoading?: boolean;
}

export default function CommunityHeader({ 
  community, 
  onJoin, 
  onLeave,
  onToggleNotifications,
  isLoading = false 
}: CommunityHeaderProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isJoining, setIsJoining] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    community.user_membership?.notifications_enabled ?? false
  );

  const handleJoin = async () => {
    if (!onJoin || isJoining) return;
    setIsJoining(true);
    try {
      await onJoin(community.id);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!onLeave || isJoining) return;
    setIsJoining(true);
    try {
      await onLeave(community.id);
    } finally {
      setIsJoining(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (!onToggleNotifications) return;
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    try {
      await onToggleNotifications(community.id, newState);
    } catch (error) {
      setNotificationsEnabled(!newState); // Revert on error
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      trading: '#3B82F6',
      analysis: '#8B5CF6', 
      education: '#10B981',
      news: '#EF4444',
      strategies: '#F59E0B',
      psychology: '#EC4899',
      technology: '#06B6D4',
      regulation: '#6B7280',
      social: '#84CC16',
      general: '#64748B'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getPrivacyIcon = () => {
    switch (community.privacy) {
      case 'private': return Lock;
      case 'invite_only': return Shield;
      default: return Globe;
    }
  };

  const getPrivacyLabel = () => {
    switch (community.privacy) {
      case 'private': return 'Özel Topluluk';
      case 'invite_only': return 'Davetiye ile Giriş';
      default: return 'Herkese Açık';
    }
  };

  const PrivacyIcon = getPrivacyIcon();

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative h-48 md:h-60 lg:h-72 overflow-hidden">
        {community.cover_image_url ? (
          <img
            src={community.cover_image_url}
            alt={`${community.name} cover`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div 
            className="h-full w-full"
            style={{ 
              background: `linear-gradient(135deg, ${getCategoryColor(community.category)}, ${getCategoryColor(community.category)}CC)` 
            }}
          />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        
        {/* Privacy Badge */}
        <div className="absolute top-6 right-6">
          <div className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium backdrop-blur-md ${
            isDarkMode 
              ? 'bg-background/80 text-foreground border border-border' 
              : 'bg-white/90 text-gray-700 border border-gray-200'
          }`}>
            <PrivacyIcon className="h-4 w-4" />
            <span>{getPrivacyLabel()}</span>
          </div>
        </div>
      </div>

      {/* Community Info */}
      <div className={`relative -mt-20 mx-6 rounded-xl border transition-colors duration-200 ${
        isDarkMode ? 'bg-card border-border' : 'bg-white border-gray-200'
      }`}>
        <div className="p-6">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Community Icon */}
            <div className="flex-shrink-0">
              {community.icon_url ? (
                <img
                  src={community.icon_url}
                  alt={`${community.name} icon`}
                  className="h-20 w-20 md:h-24 md:w-24 rounded-2xl border-4 border-background object-cover shadow-lg"
                />
              ) : (
                <div 
                  className="h-20 w-20 md:h-24 md:w-24 rounded-2xl border-4 border-background shadow-lg flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: getCategoryColor(community.category) }}
                >
                  {community.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Community Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
                    isDarkMode ? 'text-foreground' : 'text-gray-900'
                  }`}>
                    {community.name}
                    {community.user_role === 'owner' && (
                      <Crown className="inline ml-2 h-6 w-6 text-yellow-500" />
                    )}
                  </h1>
                  
                  <p className={`text-lg mb-2 ${
                    isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                  }`}>
                    c/{community.slug}
                  </p>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <span 
                      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-white"
                      style={{ backgroundColor: getCategoryColor(community.category) }}
                    >
                      {community.category.charAt(0).toUpperCase() + community.category.slice(1)}
                    </span>
                  </div>

                  {/* Description */}
                  {community.description && (
                    <p className={`text-base mb-4 ${
                      isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
                    }`}>
                      {community.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {community.is_member ? (
                    <>
                      <button
                        onClick={handleToggleNotifications}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          notificationsEnabled
                            ? (isDarkMode ? 'bg-primary text-primary-foreground' : 'bg-primary text-white')
                            : (isDarkMode ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                        }`}
                      >
                        {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                        {notificationsEnabled ? 'Bildirimler Açık' : 'Bildirimler Kapalı'}
                      </button>
                      
                      {(community.user_role === 'owner' || community.user_role === 'admin') && (
                        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isDarkMode ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                          <Settings className="h-4 w-4" />
                          Ayarlar
                        </button>
                      )}
                      
                      <button
                        onClick={handleLeave}
                        disabled={isJoining}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isDarkMode 
                            ? 'bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground' 
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                        } ${isJoining ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <UserMinus className="h-4 w-4" />
                        Ayrıl
                        {isJoining && (
                          <div className="ml-2 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleJoin}
                        disabled={isJoining}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                          community.privacy === 'public'
                            ? (isDarkMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-primary text-white hover:bg-primary/90')
                            : (isDarkMode ? 'bg-muted text-muted-foreground border border-border' : 'bg-gray-100 text-gray-600 border border-gray-200')
                        } ${isJoining ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <UserPlus className="h-4 w-4" />
                        {community.privacy === 'public' ? 'Katıl' : 
                         community.privacy === 'invite_only' ? 'Davet İste' : 'Başvur'}
                        {isJoining && (
                          <div className="ml-2 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                        )}
                      </button>
                      
                      <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                        <Star className="h-4 w-4" />
                        Takip Et
                      </button>
                    </>
                  )}

                  {/* Share Button */}
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDarkMode ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    <Share className="h-4 w-4" />
                    Paylaş
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-foreground' : 'text-gray-900'}`}>
                  {formatNumber(community.member_count)}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}`}>
                  Üye
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-foreground' : 'text-gray-900'}`}>
                  {formatNumber(community.active_member_count)}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}`}>
                  Aktif
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-foreground' : 'text-gray-900'}`}>
                  {formatNumber(community.post_count)}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}`}>
                  Gönderi
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold text-emerald-500`}>
                  #{Math.floor(Math.random() * 100) + 1}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-600'}`}>
                  Sıralama
                </div>
              </div>
            </div>
          </div>

          {/* Creator Info */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className={`flex items-center justify-between text-sm ${
              isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(community.created_at).toLocaleDateString('tr-TR')} tarihinde oluşturuldu
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Oluşturan:</span>
                <span className="font-medium text-primary">
                  {community.creator.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}