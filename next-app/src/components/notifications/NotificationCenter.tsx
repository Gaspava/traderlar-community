'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NotificationManager } from '@/lib/supabase/notifications';
import { Notification } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  Check,
  CheckCheck,
  Settings,
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
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default function NotificationCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const notificationManager = useRef<NotificationManager | null>(null);
  
  useEffect(() => {
    initializeNotifications();
    
    return () => {
      notificationManager.current?.cleanup();
    };
  }, []);
  
  useEffect(() => {
    // Listen for new notifications
    const handleNewNotification = (event: CustomEvent) => {
      const newNotification = event.detail;
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };
    
    window.addEventListener('new-notification', handleNewNotification as any);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification as any);
    };
  }, []);
  
  const initializeNotifications = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    // Initialize notification manager
    notificationManager.current = await new NotificationManager().initialize(user.id);
    
    // Request notification permission
    await notificationManager.current.requestPermission();
    
    // Load notifications
    loadNotifications();
    loadUnreadCount();
  };
  
  const loadNotifications = async () => {
    if (!notificationManager.current) return;
    
    setIsLoading(true);
    const { data, error } = await notificationManager.current.getNotifications();
    
    if (data) {
      setNotifications(data);
    }
    setIsLoading(false);
  };
  
  const loadUnreadCount = async () => {
    if (!notificationManager.current) return;
    
    const { count } = await notificationManager.current.getUnreadCount();
    setUnreadCount(count);
  };
  
  const markAsRead = async (notificationId?: string) => {
    if (!notificationManager.current) return;
    
    const ids = notificationId ? [notificationId] : undefined;
    const { error } = await notificationManager.current.markAsRead(ids);
    
    if (!error) {
      if (notificationId) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    }
  };
  
  const deleteNotification = async (notificationId: string) => {
    if (!notificationManager.current) return;
    
    const { error } = await notificationManager.current.deleteNotification(notificationId);
    
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };
  
  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'new_follower':
        return <UserPlus className="h-4 w-4" />;
      case 'new_comment':
        return <MessageCircle className="h-4 w-4" />;
      case 'new_like':
        return <Heart className="h-4 w-4" />;
      case 'mention':
        return <AtSign className="h-4 w-4" />;
      case 'new_message':
        return <Mail className="h-4 w-4" />;
      case 'achievement_earned':
        return <Award className="h-4 w-4" />;
      case 'best_answer':
        return <CheckCheck className="h-4 w-4" />;
      case 'forum_reply':
        return <MessageSquare className="h-4 w-4" />;
      case 'strategy_feedback':
        return <TrendingUp className="h-4 w-4" />;
      case 'level_up':
        return <Star className="h-4 w-4" />;
      case 'weekly_summary':
        return <Calendar className="h-4 w-4" />;
      case 'trade_alert':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification data
    const data = notification.data || {};
    if (data.url) {
      router.push(data.url);
      setIsOpen(false);
    }
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Bildirimler</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Bildirimler</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead()}
                className="text-xs"
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Tümünü okundu işaretle
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/settings/notifications')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 p-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="mx-auto mb-2 h-8 w-8" />
              <p>Bildirim yok</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer ${
                    !notification.is_read ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div 
                    className={`mt-0.5 rounded-full p-2 ${
                      notification.data?.color ? `bg-${notification.data.color}-100` : 'bg-muted'
                    }`}
                  >
                    {getNotificationIcon(notification.type?.name)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium line-clamp-1">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: tr
                      })}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center" asChild>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  router.push('/notifications');
                  setIsOpen(false);
                }}
              >
                Tüm bildirimleri görüntüle
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}