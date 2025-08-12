'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, UserStats, UserExperience } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  Settings,
  UserPlus,
  UserMinus,
  MessageCircle,
  Shield,
  CheckCircle2,
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface ProfileHeaderProps {
  user: User;
  stats?: UserStats;
  experience?: UserExperience;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export default function ProfileHeader({ 
  user, 
  stats, 
  experience,
  isFollowing: initialIsFollowing,
  isOwnProfile 
}: ProfileHeaderProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFollow = async () => {
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', user.id);
          
        setIsFollowing(false);
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: user.id
          });
          
        // Create notification
        await supabase.rpc('create_notification', {
          p_user_id: user.id,
          p_type: 'new_follower',
          p_data: {
            follower_name: currentUser.user_metadata.name || currentUser.email,
            follower_id: currentUser.id
          }
        });
          
        setIsFollowing(true);
      }
      
      router.refresh();
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="relative border-b bg-card">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-br from-emerald-600 to-emerald-800 lg:h-64" />
      
      {/* Profile Info */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          {/* Avatar */}
          <div className="flex">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background sm:h-32 sm:w-32">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-3xl font-semibold text-muted-foreground">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.username ? user.username.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              {user.is_online && (
                <div className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
              )}
            </div>
          </div>
          
          {/* Name & Actions */}
          <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-2xl font-bold text-foreground">
                  {user.name || user.username || 'Kullanıcı'}
                </h1>
                {user.is_verified && (
                  <CheckCircle2 className="h-6 w-6 text-blue-500" />
                )}
                {user.is_premium && (
                  <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-amber-600">
                    <Star className="mr-1 h-3 w-3" />
                    Premium
                  </Badge>
                )}
                {user.role === 'admin' && (
                  <Badge variant="destructive">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{user.username || 'kullanici'}</p>
            </div>
            
            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
              {isOwnProfile ? (
                <>
                  <Button variant="outline" asChild>
                    <a href="/settings/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Profili Düzenle
                    </a>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleFollow}
                    disabled={isLoading}
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Takibi Bırak
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Takip Et
                      </>
                    )}
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Mesaj Gönder
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="mt-6 flex flex-wrap gap-6 border-t py-5">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground">
              {stats?.total_followers || 0}
            </span>
            <span className="text-sm text-muted-foreground">Takipçi</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground">
              {stats?.total_following || 0}
            </span>
            <span className="text-sm text-muted-foreground">Takip</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground">
              {stats?.total_posts || 0}
            </span>
            <span className="text-sm text-muted-foreground">Gönderi</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground">
              {stats?.reputation_score || 0}
            </span>
            <span className="text-sm text-muted-foreground">İtibar Puanı</span>
          </div>
          {experience && (
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">
                Seviye {experience.level}
              </span>
              <span className="text-sm text-muted-foreground">
                {experience.experience_points} XP
              </span>
            </div>
          )}
        </div>
        
        {/* Bio & Info */}
        <div className="pb-6">
          {user.bio && (
            <p className="mb-4 text-muted-foreground">{user.bio}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(user.created_at), { 
                  addSuffix: true,
                  locale: tr 
                })} katıldı
              </span>
            </div>
          </div>
          
          {/* Trading Info */}
          {(user.years_trading || user.trading_style || user.favorite_markets) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {user.years_trading && (
                <Badge variant="secondary">
                  {user.years_trading} Yıllık Deneyim
                </Badge>
              )}
              {user.trading_style && (
                <Badge variant="secondary">
                  {user.trading_style}
                </Badge>
              )}
              {user.favorite_markets?.map((market) => (
                <Badge key={market} variant="outline">
                  {market}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}