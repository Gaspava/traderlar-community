'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserActivity } from '@/lib/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  MessageCircle, 
  Heart, 
  UserPlus, 
  Award,
  TrendingUp,
  Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ProfileActivityProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function ProfileActivity({ userId, isOwnProfile }: ProfileActivityProps) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadActivities();
  }, [userId]);
  
  const loadActivities = async () => {
    try {
      const supabase = createClient();
      
      const { data } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (data) {
        setActivities(data);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4" />;
      case 'follow':
        return <UserPlus className="h-4 w-4" />;
      case 'achievement':
        return <Award className="h-4 w-4" />;
      case 'trade':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  
  const getActivityMessage = (activity: UserActivity) => {
    const data = activity.activity_data || {};
    
    switch (activity.activity_type) {
      case 'post':
        return `Yeni bir gönderi paylaştı: "${data.title || 'Gönderi'}"`;
      case 'comment':
        return `"${data.article_title || 'Makale'}" başlıklı yazıya yorum yaptı`;
      case 'like':
        return `"${data.item_title || 'İçerik'}" başlıklı içeriği beğendi`;
      case 'follow':
        return `${data.followed_name || 'Kullanıcı'} adlı kullanıcıyı takip etmeye başladı`;
      case 'achievement':
        return `"${data.achievement_name || 'Başarı'}" başarısını kazandı!`;
      case 'trade':
        return `Yeni bir işlem kaydı ekledi: ${data.symbol || 'SEMBOL'}`;
      default:
        return 'Bir aktivite gerçekleştirdi';
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-4 w-3/4" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {isOwnProfile ? 'Henüz aktivite yok' : 'Bu kullanıcının henüz aktivitesi yok'}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                {getActivityIcon(activity.activity_type)}
              </div>
              
              <div className="flex-1">
                <p className="text-sm">
                  {getActivityMessage(activity)}
                </p>
                
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { 
                      addSuffix: true,
                      locale: tr 
                    })}
                  </span>
                  
                  {activity.points_earned > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{activity.points_earned} XP
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}