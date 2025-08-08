'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Crown, Zap, Star, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface ActiveUser {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  activity_count: number;
  badge?: 'top_contributor' | 'rising_star' | 'expert';
}

export default function ActiveUsersSidebar() {
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  const fetchActiveUsers = async () => {
    try {
      // Mock data for now - replace with actual Supabase query
      const mockUsers: ActiveUser[] = [
        {
          id: '1',
          name: 'Ahmet Yılmaz',
          username: 'ahmetyilmaz',
          avatar_url: undefined,
          role: 'admin',
          activity_count: 234,
          badge: 'top_contributor'
        },
        {
          id: '2',
          name: 'Mehmet Demir',
          username: 'mehmetdemir',
          avatar_url: undefined,
          role: 'user',
          activity_count: 189,
          badge: 'expert'
        },
        {
          id: '3',
          name: 'Ayşe Kaya',
          username: 'aysekaya',
          avatar_url: undefined,
          role: 'user',
          activity_count: 156,
          badge: 'rising_star'
        },
        {
          id: '4',
          name: 'Fatma Öz',
          username: 'fatmaoz',
          avatar_url: undefined,
          role: 'user',
          activity_count: 134,
        },
        {
          id: '5',
          name: 'Ali Çelik',
          username: 'alicelik',
          avatar_url: undefined,
          role: 'user',
          activity_count: 98,
        }
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching active users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case 'top_contributor':
        return <Crown className="h-3.5 w-3.5 text-yellow-500" />;
      case 'expert':
        return <Star className="h-3.5 w-3.5 text-blue-500" />;
      case 'rising_star':
        return <Zap className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Aktif Üyeler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Aktif Üyeler
        </CardTitle>
        <CardDescription>En aktif topluluk üyeleri</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.username}`}
            className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <Avatar className="h-10 w-10 border">
              <AvatarImage 
                src={user.avatar_url || undefined}
                alt={user.name}
              />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-medium transition-colors group-hover:text-accent-foreground">
                  {user.name}
                </h4>
                {user.role === 'admin' && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    Admin
                  </Badge>
                )}
                {getBadgeIcon(user.badge)}
              </div>
              <p className="text-xs text-muted-foreground">
                @{user.username} • {user.activity_count} aktivite
              </p>
            </div>
          </Link>
        ))}
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/members">
            Tüm Üyeler
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}