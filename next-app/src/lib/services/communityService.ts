import { createClient } from '@/lib/supabase/client';
import type { 
  CommunityWithMembership,
  CommunityMembership,
  CommunityRole,
  CommunitySearchFilters
} from '@/lib/supabase/types';

export class CommunityService {
  private supabase = createClient();

  /**
   * Join a community
   */
  async joinCommunity(communityId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // For development, simulate join functionality
      console.log('Joining community (mock):', communityId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return { success: true };
    } catch (error) {
      console.error('Error joining community:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * Leave a community
   */
  async leaveCommunity(communityId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // For development, simulate leave functionality
      console.log('Leaving community (mock):', communityId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return { success: true };
    } catch (error) {
      console.error('Error leaving community:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * Toggle community notifications
   */
  async toggleNotifications(communityId: string, enabled: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Giriş yapmanız gerekiyor' };
      }

      const { error } = await this.supabase
        .from('community_memberships')
        .update({ notifications_enabled: enabled })
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error toggling notifications:', error);
        return { success: false, error: 'Bildirim ayarları güncellenemedi' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error toggling notifications:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * Get community with user membership info
   */
  async getCommunityWithMembership(slug: string): Promise<CommunityWithMembership | null> {
    try {
      // Return mock community data based on slug for development
      const mockCommunities = {
        'trading-tartismalari': {
          id: '1',
          name: 'Trading Tartışmaları',
          slug: 'trading-tartismalari',
          description: 'Günlük trading deneyimlerinizi paylaşın ve diğer traderlardan öğrenin. Piyasa analizleri, stratejiler ve deneyimler için topluluk.',
          cover_image_url: '',
          icon_url: '',
          privacy: 'public' as const,
          category: 'trading' as const,
          is_nsfw: false,
          allow_images: true,
          allow_videos: true,
          allow_polls: true,
          require_post_approval: false,
          require_member_approval: false,
          rules: [
            { id: '1', title: 'Saygılı olun', description: 'Diğer üyelere karşı her zaman saygılı davranın', order: 1 },
            { id: '2', title: 'Spam yapmayın', description: 'Gereksiz veya tekrarlı gönderiler paylaşmayın', order: 2 },
            { id: '3', title: 'Konuyla ilgili paylaşım yapın', description: 'Sadece trading ile ilgili içerik paylaşın', order: 3 }
          ],
          welcome_message: 'Trading topluluğuna hoş geldiniz! Lütfen kuralları okuyun ve deneyimlerinizi paylaşmaktan çekinmeyin.',
          member_count: 1247,
          post_count: 89,
          active_member_count: 234,
          created_by: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_member: true,
          user_role: 'member' as const,
          creator: {
            id: 'user1',
            name: 'Ahmet Trader',
            username: 'ahmet_trader',
            avatar_url: ''
          }
        },
        'teknik-analiz-uzmanlari': {
          id: '2',
          name: 'Teknik Analiz Uzmanları',
          slug: 'teknik-analiz-uzmanlari',
          description: 'Teknik analiz yöntemleri, indikatörler ve chart pattern\'ları hakkında derinlemesine tartışmalar yapın.',
          cover_image_url: '',
          icon_url: '',
          privacy: 'public' as const,
          category: 'analysis' as const,
          is_nsfw: false,
          allow_images: true,
          allow_videos: true,
          allow_polls: true,
          require_post_approval: false,
          require_member_approval: false,
          rules: [
            { id: '1', title: 'Sadece teknik analiz konuları', description: 'Fundamental analiz için ayrı topluluk kullanın', order: 1 },
            { id: '2', title: 'Chart paylaşımı teşvik edilir', description: 'Analizlerinizi görsellerle destekleyin', order: 2 }
          ],
          welcome_message: 'Teknik analiz uzmanları topluluğuna hoş geldiniz!',
          member_count: 892,
          post_count: 156,
          active_member_count: 178,
          created_by: 'user2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_member: false,
          creator: {
            id: 'user2',
            name: 'Zeynep Analiz',
            username: 'zeynep_analiz',
            avatar_url: ''
          }
        }
      };

      // Return the matching community or null if not found
      const community = mockCommunities[slug as keyof typeof mockCommunities];
      return community || null;
    } catch (error) {
      console.error('Error fetching community:', error);
      return null;
    }
  }

  /**
   * Search communities with filters
   */
  async searchCommunities(
    filters: CommunitySearchFilters,
    searchQuery?: string
  ): Promise<CommunityWithMembership[]> {
    try {
      // Return mock data for development when database is not connected
      const mockCommunities: CommunityWithMembership[] = [
        {
          id: '1',
          name: 'Trading Tartışmaları',
          slug: 'trading-tartismalari',
          description: 'Günlük trading deneyimlerinizi paylaşın ve diğer traderlardan öğrenin. Piyasa analizleri, stratejiler ve deneyimler için topluluk.',
          cover_image_url: '',
          icon_url: '',
          privacy: 'public',
          category: 'trading',
          is_nsfw: false,
          allow_images: true,
          allow_videos: true,
          allow_polls: true,
          require_post_approval: false,
          require_member_approval: false,
          rules: [],
          welcome_message: 'Trading topluluğuna hoş geldiniz!',
          member_count: 1247,
          post_count: 89,
          active_member_count: 234,
          created_by: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_member: false,
          creator: {
            id: 'user1',
            name: 'Ahmet Trader',
            username: 'ahmet_trader',
            avatar_url: ''
          }
        },
        {
          id: '2',
          name: 'Teknik Analiz Uzmanları',
          slug: 'teknik-analiz-uzmanlari',
          description: 'Teknik analiz yöntemleri, indikatörler ve chart pattern\'ları hakkında derinlemesine tartışmalar yapın.',
          cover_image_url: '',
          icon_url: '',
          privacy: 'public',
          category: 'analysis',
          is_nsfw: false,
          allow_images: true,
          allow_videos: true,
          allow_polls: true,
          require_post_approval: false,
          require_member_approval: false,
          rules: [],
          member_count: 892,
          post_count: 156,
          active_member_count: 178,
          created_by: 'user2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_member: true,
          user_role: 'member',
          creator: {
            id: 'user2',
            name: 'Zeynep Analiz',
            username: 'zeynep_analiz',
            avatar_url: ''
          }
        },
        {
          id: '3',
          name: 'Kripto Para Trading',
          slug: 'kripto-para-trading',
          description: 'Bitcoin, Ethereum ve altcoin trading stratejileri. DeFi, NFT ve blockchain teknolojileri üzerine tartışmalar.',
          cover_image_url: '',
          icon_url: '',
          privacy: 'public',
          category: 'trading',
          is_nsfw: false,
          allow_images: true,
          allow_videos: true,
          allow_polls: true,
          require_post_approval: false,
          require_member_approval: false,
          rules: [],
          member_count: 2156,
          post_count: 301,
          active_member_count: 445,
          created_by: 'user3',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_member: false,
          creator: {
            id: 'user3',
            name: 'Mehmet Crypto',
            username: 'mehmet_crypto',
            avatar_url: ''
          }
        },
        {
          id: '4',
          name: 'Forex Eğitimi',
          slug: 'forex-egitimi',
          description: 'Forex piyasası hakkında temel ve ileri seviye eğitimler. Yeni başlayanlardan deneyimli traderlara kadar herkes için.',
          cover_image_url: '',
          icon_url: '',
          privacy: 'public',
          category: 'education',
          is_nsfw: false,
          allow_images: true,
          allow_videos: true,
          allow_polls: true,
          require_post_approval: true,
          require_member_approval: false,
          rules: [],
          member_count: 654,
          post_count: 78,
          active_member_count: 123,
          created_by: 'user4',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_member: true,
          user_role: 'moderator',
          creator: {
            id: 'user4',
            name: 'Ali Eğitmen',
            username: 'ali_egitmen',
            avatar_url: ''
          }
        }
      ];

      // Apply basic filtering to mock data
      let filteredCommunities = mockCommunities;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredCommunities = filteredCommunities.filter(community => 
          community.name.toLowerCase().includes(query) || 
          community.description.toLowerCase().includes(query)
        );
      }

      if (filters.category && filters.category !== 'general') {
        filteredCommunities = filteredCommunities.filter(community => 
          community.category === filters.category
        );
      }

      if (filters.privacy) {
        filteredCommunities = filteredCommunities.filter(community => 
          community.privacy === filters.privacy
        );
      }

      // Apply sorting
      switch (filters.sort_by) {
        case 'most_active':
          filteredCommunities.sort((a, b) => b.active_member_count - a.active_member_count);
          break;
        case 'most_members':
          filteredCommunities.sort((a, b) => b.member_count - a.member_count);
          break;
        case 'newest':
          filteredCommunities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'alphabetical':
          filteredCommunities.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          filteredCommunities.sort((a, b) => b.member_count - a.member_count);
      }

      return filteredCommunities;
    } catch (error) {
      console.error('Error searching communities:', error);
      return [];
    }
  }

  /**
   * Create a new community
   */
  async createCommunity(communityData: any): Promise<{ success: boolean; community?: any; error?: string }> {
    try {
      // For development, simulate community creation
      console.log('Creating community (mock):', communityData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock community object
      const mockCommunity = {
        id: `community_${Date.now()}`,
        ...communityData,
        member_count: 1,
        post_count: 0,
        active_member_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'mock_user_id'
      };

      return { success: true, community: mockCommunity };
    } catch (error) {
      console.error('Error creating community:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * Update community member count
   */
  private async updateMemberCount(communityId: string): Promise<void> {
    try {
      const { count } = await this.supabase
        .from('community_memberships')
        .select('id', { count: 'exact' })
        .eq('community_id', communityId)
        .eq('is_approved', true);

      await this.supabase
        .from('communities')
        .update({ member_count: count || 0 })
        .eq('id', communityId);
    } catch (error) {
      console.error('Error updating member count:', error);
    }
  }

  /**
   * Get user's joined communities
   */
  async getUserCommunities(): Promise<CommunityWithMembership[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return [];

      const { data: memberships, error } = await this.supabase
        .from('community_memberships')
        .select(`
          role,
          notifications_enabled,
          joined_at,
          is_approved,
          community:communities(
            *,
            creator:users!communities_created_by_fkey(
              id,
              name,
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_approved', true);

      if (error) {
        console.error('Error fetching user communities:', error);
        return [];
      }

      return (memberships || []).map(membership => ({
        ...membership.community,
        is_member: true,
        user_role: membership.role,
        user_membership: {
          role: membership.role,
          notifications_enabled: membership.notifications_enabled,
          joined_at: membership.joined_at,
          is_approved: membership.is_approved
        }
      }));
    } catch (error) {
      console.error('Error fetching user communities:', error);
      return [];
    }
  }
}

// Export singleton instance
export const communityService = new CommunityService();