import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MainLayout from '@/components/layout/MainLayout';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileStats from '@/components/profile/ProfileStats';
import { User, UserStats, UserExperience, TradingPerformance } from '@/lib/supabase/types';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

async function getProfile(username: string) {
  const supabase = await createClient();
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
    
  if (!user) return null;
  
  // Get user stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  // Get user experience
  const { data: experience } = await supabase
    .from('user_experience')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  // Get latest trading performance
  const { data: tradingPerformance } = await supabase
    .from('trading_performance')
    .select('*')
    .eq('user_id', user.id)
    .order('month', { ascending: false })
    .limit(6);
    
  // Get achievements
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false });
    
  // Check if current user follows this profile
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  let isFollowing = false;
  let isOwnProfile = false;
  
  if (currentUser) {
    isOwnProfile = currentUser.id === user.id;
    
    if (!isOwnProfile) {
      const { data: follow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', user.id)
        .single();
        
      isFollowing = !!follow;
    }
  }
  
  // Increment profile views if not own profile
  if (!isOwnProfile && currentUser) {
    await supabase
      .from('users')
      .update({ profile_views: (user.profile_views || 0) + 1 })
      .eq('id', user.id);
  }
  
  return {
    user,
    stats,
    experience,
    tradingPerformance,
    achievements,
    isFollowing,
    isOwnProfile
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getProfile(username);
  
  if (!profile) {
    notFound();
  }
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Profile Header */}
        <ProfileHeader 
          user={profile.user}
          stats={profile.stats}
          experience={profile.experience}
          isFollowing={profile.isFollowing}
          isOwnProfile={profile.isOwnProfile}
        />
        
        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Stats & Info */}
            <div className="space-y-6">
              <ProfileStats 
                user={profile.user}
                stats={profile.stats}
                tradingPerformance={profile.tradingPerformance || []}
                achievements={profile.achievements || []}
              />
            </div>
            
            {/* Right Column - Content */}
            <div className="lg:col-span-2">
              <ProfileTabs 
                userId={profile.user.id}
                username={profile.user.username}
                isOwnProfile={profile.isOwnProfile}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}