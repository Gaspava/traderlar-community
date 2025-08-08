'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NotificationManager } from '@/lib/supabase/notifications';
import { Notification } from '@/lib/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  UserPlus,
  MessageCircle,
  Heart,
  AtSign,
  Mail,
  Award,
  MessageSquare,
  TrendingUp,
  Star,
  Calendar,
  AlertCircle,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NotificationsListProps {
  userId: string;
}

export default function NotificationsList({ userId }: NotificationsListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notificationManager, setNotificationManager] = useState<NotificationManager | null>(null);
  
  useEffect(() => {
    initializeNotifications();
    
    return () => {
      notificationManager?.cleanup();
    };
  }, [userId]);
  
  useEffect(() => {
    filterNotifications();
  }, [notifications, filter]);
  
  const initializeNotifications = async () => {
    const manager = await new NotificationManager().initialize(userId);
    setNotificationManager(manager);
    
    loadNotifications(manager);
  };
  
  const loadNotifications = async (manager: NotificationManager) => {
    setIsLoading(true);
    const { data, error } = await manager.getNotifications(50);
    
    if (data) {
      setNotifications(data);
    }
    setIsLoading(false);
  };
  
  const filterNotifications = () => {
    if (filter === 'all') {
      setFilteredNotifications(notifications);
    } else if (filter === 'unread') {
      setFilteredNotifications(notifications.filter(n => !n.is_read));
    } else {
      setFilteredNotifications(notifications.filter(n => n.type?.name === filter));
    }
  };
  
  const markAsRead = async (notificationId?: string) => {
    if (!notificationManager) return;
    
    const ids = notificationId ? [notificationId] : undefined;
    const { error } = await notificationManager.markAsRead(ids);
    
    if (!error) {
      if (notificationId) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    }
  };
  
  const deleteNotification = async (notificationId: string) => {
    if (!notificationManager) return;
    
    const { error } = await notificationManager.deleteNotification(notificationId);
    
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };
  
  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'new_follower':
        return <UserPlus className="h-5 w-5" />;
      case 'new_comment':
        return <MessageCircle className="h-5 w-5" />;
      case 'new_like':
        return <Heart className="h-5 w-5" />;
      case 'mention':
        return <AtSign className="h-5 w-5" />;
      case 'new_message':
        return <Mail className="h-5 w-5" />;
      case 'achievement_earned':
        return <Award className="h-5 w-5" />;
      case 'best_answer':
        return <CheckCheck className="h-5 w-5" />;
      case 'forum_reply':
        return <MessageSquare className="h-5 w-5" />;
      case 'strategy_feedback':
        return <TrendingUp className="h-5 w-5" />;
      case 'level_up':
        return <Star className="h-5 w-5" />;
      case 'weekly_summary':
        return <Calendar className="h-5 w-5" />;
      case 'trade_alert':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    const data = notification.data || {};
    if (data.url) {
      router.push(data.url);
    }
  };
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Tüm Bildirimler</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="unread">Okunmamış</SelectItem>
                  <SelectItem value="new_follower">Takipçiler</SelectItem>
                  <SelectItem value="new_comment">Yorumlar</SelectItem>
                  <SelectItem value="new_like">Beğeniler</SelectItem>
                  <SelectItem value="achievement_earned">Başarılar</SelectItem>
                </SelectContent>
              </Select>
              
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAsRead()}
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Tümünü okundu işaretle
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Bildirim bulunamadı'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                !notification.is_read ? 'border-primary/50 bg-muted/30' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div 
                    className={`rounded-full p-2 ${
                      notification.data?.color 
                        ? `bg-${notification.data.color}-100 text-${notification.data.color}-600` 
                        : 'bg-muted'
                    }`}
                  >
                    {getNotificationIcon(notification.type?.name)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: tr
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            Yeni
                          </Badge>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}