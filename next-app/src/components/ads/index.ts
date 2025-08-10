// Main ad components
export { default as AdUnit } from './AdUnit';
export * from './AdUnit';

// AdSense Script
export { default as AdSenseScript } from './AdSenseScript';

// Container components
export { default as AdContainer } from './AdContainer';
export * from './AdContainer';

// Specialized ad components
export { default as HeaderAds } from './HeaderAds';
export * from './HeaderAds';

export { default as SidebarAds } from './SidebarAds';
export * from './SidebarAds';

export { default as InContentAd } from './InContentAd';
export * from './InContentAd';

// Ad configuration types
export interface AdConfig {
  publisherId: string; // Your AdSense publisher ID
  adSlots: {
    // Header ads
    headerDesktop: string;
    headerMobile: string;
    
    // Homepage ads
    homepageTop: string;
    homepageMiddle: string;
    homepageBottom: string;
    homepageSidebar: string;
    
    // Article ads
    articleTop: string;
    articleInContent: string;
    articleBottom: string;
    articleSidebar: string;
    
    // Forum ads
    forumTop: string;
    forumInContent: string;
    forumSidebar: string;
    
    // Trading strategies ads
    strategyTop: string;
    strategyInContent: string;
    strategySidebar: string;
    
    // Sidebar ads
    sidebarTop: string;
    sidebarMiddle: string;
    sidebarBottom: string;
    sidebarSticky: string;
  };
}

// Default ad slot configuration (replace with your actual AdSense ad slots)
export const DEFAULT_AD_CONFIG: AdConfig = {
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // Replace with your AdSense publisher ID
  adSlots: {
    // Header ads
    headerDesktop: '1234567890', // 728x90 leaderboard
    headerMobile: '1234567891', // 320x100 mobile banner
    
    // Homepage ads
    homepageTop: '1234567892', // Responsive
    homepageMiddle: '1234567893', // 336x280 large rectangle
    homepageBottom: '1234567894', // 728x90 leaderboard
    homepageSidebar: '1234567895', // 300x600 half-page
    
    // Article ads
    articleTop: '1234567896', // 728x90 leaderboard
    articleInContent: '1234567897', // 336x280 large rectangle
    articleBottom: '1234567898', // 300x250 rectangle
    articleSidebar: '1234567899', // 300x600 half-page
    
    // Forum ads
    forumTop: '1234567900', // 728x90 leaderboard
    forumInContent: '1234567901', // 300x250 rectangle
    forumSidebar: '1234567902', // 300x600 half-page
    
    // Trading strategies ads
    strategyTop: '1234567903', // 728x90 leaderboard
    strategyInContent: '1234567904', // 336x280 large rectangle
    strategySidebar: '1234567905', // 300x600 half-page
    
    // Sidebar ads
    sidebarTop: '1234567906', // 300x600 half-page
    sidebarMiddle: '1234567907', // 336x280 large rectangle
    sidebarBottom: '1234567908', // 300x250 rectangle
    sidebarSticky: '1234567909', // 300x250 rectangle
  }
};