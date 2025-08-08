'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NotificationManager } from '@/lib/supabase/notifications';
import { NotificationPreference, NotificationType } from '@/lib/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Mail,
  Smartphone,
  Save,
  UserPlus,
  MessageCircle,
  Heart,
  AtSign,
  Award,
  MessageSquare,
  TrendingUp,
  Star,
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NotificationSettingsProps {
  userId: string;
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [notificationManager, setNotificationManager] = useState<NotificationManager | null>(null);
  
  useEffect(() => {
    initializeSettings();
  }, [userId]);
  
  const initializeSettings = async () => {
    const manager = await new NotificationManager().initialize(userId);
    setNotificationManager(manager);
    
    loadPreferences(manager);
  };
  
  const loadPreferences = async (manager: NotificationManager) => {
    setIsLoading(true);
    const { data, error } = await manager.getPreferences();
    
    if (data) {
      setPreferences(data);
    }
    setIsLoading(false);
  };
  
  const updatePreference = (typeId: string, field: string, value: boolean | string) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.type_id === typeId 
          ? { ...pref, [field]: value }
          : pref
      )
    );
    setHasChanges(true);
  };
  
  const savePreferences = async () => {
    if (!notificationManager) return;
    
    setIsSaving(true);
    
    try {
      for (const pref of preferences) {
        await notificationManager.updatePreferences(pref.type_id, {
          in_app: pref.in_app,
          email: pref.email,
          push: pref.push,
          frequency: pref.frequency
        });
      }
      
      toast({
        title: "Ayarlar kaydedildi",
        description: "Bildirim tercihleriniz güncellendi.",
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getNotificationIcon = (typeName?: string) => {
    switch (typeName) {
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
        return <CheckCircle2 className="h-5 w-5" />;
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
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
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
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Genel Ayarlar</CardTitle>
          <CardDescription>
            Bildirimlerinizi nasıl almak istediğinizi belirleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="browser-notifications">Tarayıcı Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">
                Tarayıcı üzerinden anlık bildirimler alın
              </p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                if (notificationManager) {
                  const granted = await notificationManager.requestPermission();
                  toast({
                    title: granted ? "İzin verildi" : "İzin reddedildi",
                    description: granted 
                      ? "Tarayıcı bildirimleri aktif" 
                      : "Tarayıcı bildirimlerine izin verilmedi",
                  });
                }
              }}
            >
              İzin Ver
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Notification Types */}
      <div className="space-y-4">
        {preferences.map((pref) => (
          <Card key={pref.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  {getNotificationIcon(pref.type?.name)}
                </div>
                <div>
                  <CardTitle className="text-base">
                    {pref.type?.description}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* In-App */}
                <div className="flex items-center justify-between sm:flex-col sm:items-start">
                  <Label htmlFor={`${pref.type_id}-in-app`} className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Uygulama İçi
                  </Label>
                  <Switch
                    id={`${pref.type_id}-in-app`}
                    checked={pref.in_app}
                    onCheckedChange={(checked) => 
                      updatePreference(pref.type_id, 'in_app', checked)
                    }
                  />
                </div>
                
                {/* Email */}
                <div className="flex items-center justify-between sm:flex-col sm:items-start">
                  <Label htmlFor={`${pref.type_id}-email`} className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-posta
                  </Label>
                  <Switch
                    id={`${pref.type_id}-email`}
                    checked={pref.email}
                    onCheckedChange={(checked) => 
                      updatePreference(pref.type_id, 'email', checked)
                    }
                  />
                </div>
                
                {/* Frequency */}
                <div className="space-y-2">
                  <Label className="text-sm">Sıklık</Label>
                  <Select
                    value={pref.frequency}
                    onValueChange={(value) => 
                      updatePreference(pref.type_id, 'frequency', value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Anında</SelectItem>
                      <SelectItem value="daily">Günlük Özet</SelectItem>
                      <SelectItem value="weekly">Haftalık Özet</SelectItem>
                      <SelectItem value="never">Hiçbir Zaman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button 
            onClick={savePreferences} 
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
      )}
    </div>
  );
}