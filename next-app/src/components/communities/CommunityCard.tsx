'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  MoreHorizontal
} from 'lucide-react';
import type { CommunityWithMembership } from '@/lib/supabase/types';
import { useTheme } from 'next-themes';

interface CommunityCardProps {
  community: CommunityWithMembership;
  onJoin?: (communityId: string) => void;
  onLeave?: (communityId: string) => void;
  showJoinButton?: boolean;
  isLoading?: boolean;
}

export default function CommunityCard({ 
  community, 
  onJoin, 
  onLeave,
  showJoinButton = true,
  isLoading = false 
}: CommunityCardProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isJoining, setIsJoining] = useState(false);

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
      case 'private': return 'Özel';
      case 'invite_only': return 'Davetiye';
      default: return 'Herkese Açık';
    }
  };

  const PrivacyIcon = getPrivacyIcon();

  return (
    <div className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${ 
      isDarkMode 
        ? 'bg-card border-border hover:border-primary/20 hover:shadow-primary/5' 
        : 'bg-white border-gray-200 hover:border-primary/30 hover:shadow-primary/10'
    }`}>
      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden">
        {community.cover_image_url ? (
          <img
            src={community.cover_image_url}
            alt={`${community.name} cover`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div 
            className="h-full w-full transition-all duration-300 group-hover:brightness-110"
            style={{ 
              background: `linear-gradient(135deg, ${getCategoryColor(community.category)}20, ${getCategoryColor(community.category)}40)` 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10" />
          </div>
        )}
        
        {/* Privacy Badge */}
        <div className="absolute top-3 right-3">
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium backdrop-blur-md ${
            isDarkMode 
              ? 'bg-background/80 text-foreground border border-border' 
              : 'bg-white/90 text-gray-700 border border-gray-200'
          }`}>
            <PrivacyIcon className="h-3 w-3" />
            <span>{getPrivacyLabel()}</span>
          </div>
        </div>

        {/* Community Icon */}
        <div className="absolute -bottom-8 left-6">
          <div className="relative">
            {community.icon_url ? (
              <img
                src={community.icon_url}
                alt={`${community.name} icon`}
                className="h-16 w-16 rounded-xl border-4 border-background object-cover shadow-lg"
              />
            ) : (
              <div 
                className="h-16 w-16 rounded-xl border-4 border-background shadow-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: getCategoryColor(community.category) }}
              >
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Owner badge */}
            {community.user_role === 'owner' && (
              <div className="absolute -top-1 -right-1 rounded-full bg-yellow-500 p-1">
                <Crown className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 pt-10">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link 
                href={`/topluluk/${community.slug}`}
                className="block group-hover:text-primary transition-colors"
              >
                <h3 className={`font-bold text-lg leading-tight truncate ${
                  isDarkMode ? 'text-foreground' : 'text-gray-900'
                }`}>
                  {community.name}
                </h3>
              </Link>
              <p className={`text-sm ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                c/{community.slug}
              </p>
            </div>

            {/* Actions Menu */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-muted text-muted-foreground hover:text-foreground' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}>
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Category Badge */}
          <div className="mt-2">
            <span 
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: getCategoryColor(community.category) }}
            >
              {community.category.charAt(0).toUpperCase() + community.category.slice(1)}
            </span>
          </div>
        </div>

        {/* Description */}
        {community.description && (
          <p className={`text-sm mb-4 line-clamp-2 ${
            isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
          }`}>
            {community.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className={`flex items-center gap-1 ${
            isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
          }`}>
            <Users className="h-4 w-4" />
            <span>{formatNumber(community.member_count)} üye</span>
          </div>
          <div className={`flex items-center gap-1 ${
            isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
          }`}>
            <MessageSquare className="h-4 w-4" />
            <span>{formatNumber(community.post_count)} gönderi</span>
          </div>
          <div className={`flex items-center gap-1 ${
            isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
          }`}>
            <Eye className="h-4 w-4" />
            <span>{formatNumber(community.active_member_count)} aktif</span>
          </div>
        </div>

        {/* Creator Info */}
        <div className={`flex items-center gap-2 mb-4 text-xs ${
          isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
        }`}>
          <span>Oluşturan:</span>
          <Link 
            href={`/profile/${community.creator.username}`}
            className="font-medium hover:text-primary transition-colors"
          >
            {community.creator.name}
          </Link>
        </div>

        {/* Join/Leave Button */}
        {showJoinButton && (
          <div className="flex gap-2">
            {community.is_member ? (
              <div className="flex gap-2 w-full">
                <Link
                  href={`/topluluk/${community.slug}`}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Görüntüle
                </Link>
                <button
                  onClick={handleLeave}
                  disabled={isJoining}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground' 
                      : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                  } ${isJoining ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  community.privacy === 'public'
                    ? (isDarkMode 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'bg-primary text-white hover:bg-primary/90')
                    : (isDarkMode 
                        ? 'bg-muted text-muted-foreground border border-border' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200')
                } ${isJoining ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <UserPlus className="h-4 w-4" />
                {community.privacy === 'public' ? 'Katıl' : 
                 community.privacy === 'invite_only' ? 'Davet İste' : 'Başvur'}
                {isJoining && (
                  <div className="ml-2 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}