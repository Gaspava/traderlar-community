import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NotificationsList from '@/components/notifications/NotificationsList';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings } from 'lucide-react';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bildirimler</h1>
        <p className="mt-2 text-muted-foreground">
          Tüm bildirimlerinizi ve ayarlarınızı yönetin
        </p>
      </div>
      
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ayarlar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="mt-6">
          <NotificationsList userId={user.id} />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <NotificationSettings userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}