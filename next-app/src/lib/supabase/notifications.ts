import { createClient } from './client';
import { RealtimeChannel } from '@supabase/supabase-js';

export class NotificationManager {
  private channel: RealtimeChannel | null = null;
  private userId: string | null = null;
  
  async initialize(userId: string) {
    this.userId = userId;
    const supabase = createClient();
    
    // Subscribe to notifications for this user
    this.channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.handleNewNotification(payload.new);
        }
      )
      .subscribe();
      
    return this;
  }
  
  private handleNewNotification(notification: any) {
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        data: notification
      });
    }
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('new-notification', { 
      detail: notification 
    }));
  }
  
  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
  
  async getNotifications(limit = 20, offset = 0) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        type:notification_types(*)
      `)
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    return { data, error };
  }
  
  async getUnreadCount() {
    const supabase = createClient();
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .eq('is_read', false);
      
    return { count: count || 0, error };
  }
  
  async markAsRead(notificationIds?: string[]) {
    const supabase = createClient();
    
    if (notificationIds) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', this.userId)
        .in('id', notificationIds);
        
      return { error };
    } else {
      // Mark all as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', this.userId)
        .eq('is_read', false);
        
      return { error };
    }
  }
  
  async deleteNotification(notificationId: string) {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', this.userId);
      
    return { error };
  }
  
  async updatePreferences(typeId: string, preferences: {
    in_app?: boolean;
    email?: boolean;
    push?: boolean;
    frequency?: string;
  }) {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('notification_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', this.userId)
      .eq('type_id', typeId);
      
    return { error };
  }
  
  async getPreferences() {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('notification_preferences')
      .select(`
        *,
        type:notification_types(*)
      `)
      .eq('user_id', this.userId);
      
    return { data, error };
  }
  
  cleanup() {
    if (this.channel) {
      const supabase = createClient();
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}