'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfilePosts from './tabs/ProfilePosts';
import ProfileArticles from './tabs/ProfileArticles';
import ProfileStrategies from './tabs/ProfileStrategies';
import ProfileFollowers from './tabs/ProfileFollowers';
import ProfileFollowing from './tabs/ProfileFollowing';
import ProfileActivity from './tabs/ProfileActivity';
import { FileText, TrendingUp, Users, Activity, MessageSquare, BookOpen } from 'lucide-react';

interface ProfileTabsProps {
  userId: string;
  username: string;
  isOwnProfile: boolean;
}

export default function ProfileTabs({ userId, username, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('posts');
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="posts" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Gönderiler</span>
        </TabsTrigger>
        <TabsTrigger value="articles" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Makaleler</span>
        </TabsTrigger>
        <TabsTrigger value="strategies" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Stratejiler</span>
        </TabsTrigger>
        <TabsTrigger value="followers" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Takipçiler</span>
        </TabsTrigger>
        <TabsTrigger value="following" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Takip</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">Aktivite</span>
        </TabsTrigger>
      </TabsList>
      
      <div className="mt-6">
        <TabsContent value="posts">
          <ProfilePosts userId={userId} />
        </TabsContent>
        
        <TabsContent value="articles">
          <ProfileArticles userId={userId} />
        </TabsContent>
        
        <TabsContent value="strategies">
          <ProfileStrategies userId={userId} />
        </TabsContent>
        
        <TabsContent value="followers">
          <ProfileFollowers userId={userId} />
        </TabsContent>
        
        <TabsContent value="following">
          <ProfileFollowing userId={userId} />
        </TabsContent>
        
        <TabsContent value="activity">
          <ProfileActivity userId={userId} isOwnProfile={isOwnProfile} />
        </TabsContent>
      </div>
    </Tabs>
  );
}