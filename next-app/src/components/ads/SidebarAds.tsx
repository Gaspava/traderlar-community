'use client';

import { HalfPageAd, RectangleAd, LargeRectangleAd } from './AdUnit';
import { SidebarAdContainer, StickyAdContainer } from './AdContainer';

interface SidebarAdsProps {
  adSlots: {
    topSidebar: string;
    bottomSidebar: string;
    stickySidebar?: string;
  };
  className?: string;
}

export default function SidebarAds({ adSlots, className = '' }: SidebarAdsProps) {
  return (
    <div className={`sidebar-ads space-y-6 ${className}`}>
      {/* Top Sidebar Ad - Half Page for maximum CPM */}
      <SidebarAdContainer>
        <HalfPageAd adSlot={adSlots.topSidebar} />
      </SidebarAdContainer>
      
      {/* Middle Sidebar Ad - Large Rectangle */}
      <SidebarAdContainer>
        <LargeRectangleAd adSlot={adSlots.bottomSidebar} />
      </SidebarAdContainer>
      
      {/* Sticky Sidebar Ad - if provided */}
      {adSlots.stickySidebar && (
        <StickyAdContainer>
          <RectangleAd adSlot={adSlots.stickySidebar} />
        </StickyAdContainer>
      )}
    </div>
  );
}

// Individual sidebar ad components
export function TopSidebarAd({ adSlot }: { adSlot: string }) {
  return (
    <SidebarAdContainer>
      <HalfPageAd adSlot={adSlot} />
    </SidebarAdContainer>
  );
}

export function BottomSidebarAd({ adSlot }: { adSlot: string }) {
  return (
    <SidebarAdContainer>
      <LargeRectangleAd adSlot={adSlot} />
    </SidebarAdContainer>
  );
}

export function StickySidebarAd({ adSlot }: { adSlot: string }) {
  return (
    <StickyAdContainer>
      <RectangleAd adSlot={adSlot} />
    </StickyAdContainer>
  );
}