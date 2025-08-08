'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

interface Post {
  id: string;
  content: string;
  created_at: string;
  user: {
    name: string;
    username: string;
    avatar_url?: string;
  };
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
}

interface ProfilePostsProps {
  userId: string;
}

export default function ProfilePosts({ userId }: ProfilePostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadPosts();
  }, [userId]);
  
  const loadPosts = async () => {
    try {
      const supabase = createClient();
      
      // This would be forum posts or social posts
      // For now, we'll simulate with comments as posts
      const { data } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user:users!user_id(name, username, avatar_url),
          like_count
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (data) {
        setPosts(data.map(post => ({
          ...post,
          user: post.user || { name: '', username: '' },
          comment_count: 0
        })));
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Henüz gönderi yok</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={post.user.avatar_url} />
                <AvatarFallback>
                  {post.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <Link 
                      href={`/profile/${post.user.username}`}
                      className="font-semibold hover:underline"
                    >
                      {post.user.name}
                    </Link>
                    <span className="mx-1 text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { 
                        addSuffix: true,
                        locale: tr 
                      })}
                    </span>
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="mt-2 whitespace-pre-wrap">{post.content}</p>
                
                <div className="mt-4 flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.like_count}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comment_count}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}