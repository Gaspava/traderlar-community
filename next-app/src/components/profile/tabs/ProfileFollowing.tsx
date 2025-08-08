'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, UserMinus, CheckCircle2, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProfileFollowingProps {
  userId: string;
}

export default function ProfileFollowing({ userId }: ProfileFollowingProps) {
  const router = useRouter();
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    loadFollowing();
    getCurrentUser();
  }, [userId]);
  
  const getCurrentUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };
  
  const loadFollowing = async () => {
    try {
      const supabase = createClient();
      
      // Get following
      const { data: followingData } = await supabase
        .from('follows')
        .select(`
          following:users!following_id(*)
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });
        
      if (followingData) {
        const followingList = followingData.map(f => f.following);
        
        // Check if current user follows these users
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser && followingList.length > 0) {
          const { data: currentUserFollowing } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', currentUser.id)
            .in('following_id', followingList.map(f => f.id));
            
          const followingIds = new Set(currentUserFollowing?.map(f => f.following_id) || []);
          const states: Record<string, boolean> = {};
          followingList.forEach(user => {
            states[user.id] = followingIds.has(user.id);
          });
          setFollowingStates(states);
        }
        
        setFollowing(followingList);
      }
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFollow = async (targetUserId: string) => {
    if (!currentUserId) {
      router.push('/auth/login');
      return;
    }
    
    const supabase = createClient();
    const isFollowing = followingStates[targetUserId];
    
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId
          });
          
        // Create notification
        await supabase.rpc('create_notification', {
          p_user_id: targetUserId,
          p_type: 'new_follower',
          p_data: {
            follower_name: currentUserId,
            follower_id: currentUserId
          }
        });
      }
      
      setFollowingStates(prev => ({
        ...prev,
        [targetUserId]: !isFollowing
      }));
    } catch (error) {
      console.error('Follow error:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (following.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Henüz kimse takip edilmiyor</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {following.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Link 
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 flex-1"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate hover:underline">
                      {user.name}
                    </p>
                    {user.is_verified && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                    {user.role === 'admin' && (
                      <Shield className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>
              </Link>
              
              {currentUserId && currentUserId !== user.id && (
                <Button
                  size="sm"
                  variant={followingStates[user.id] ? "outline" : "default"}
                  onClick={() => handleFollow(user.id)}
                >
                  {followingStates[user.id] ? (
                    <>
                      <UserMinus className="mr-1 h-4 w-4" />
                      Takibi Bırak
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1 h-4 w-4" />
                      Takip Et
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}