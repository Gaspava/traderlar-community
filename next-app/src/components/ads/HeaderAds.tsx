'use client';

import { LeaderboardAd, MobileBannerAd, ResponsiveAd } from './AdUnit';
import { TopAdContainer } from './AdContainer';
import { useEffect, useState } from 'react';

interface HeaderAdsProps {
  adSlots: {
    desktop: string;
    mobile: string;
  };
  className?: string;
  showOnMobile?: boolean;
}

export default function HeaderAds({ 
  adSlots, 
  className = '', 
  showOnMobile = true 
}: HeaderAdsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't show mobile ads if disabled
  if (isMobile && !showOnMobile) {
    return null;
  }

  return (
    <TopAdContainer className={className}>
      {isMobile ? (
        <MobileBannerAd adSlot={adSlots.mobile} />
      ) : (
        <LeaderboardAd adSlot={adSlots.desktop} />
      )}
    </TopAdContainer>
  );
}

// Above-the-fold leaderboard for desktop
export function AboveFoldLeaderboard({ adSlot }: { adSlot: string }) {
  return (
    <div className="hidden md:block mb-6">
      <div className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/40 dark:border-gray-700/40 p-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3 uppercase tracking-wide font-medium">
          Reklam
        </div>
        <div className="flex justify-center">
          <LeaderboardAd adSlot={adSlot} />
        </div>
      </div>
    </div>
  );
}

// Mobile banner for above-the-fold
export function AboveFoldMobile({ adSlot }: { adSlot: string }) {
  return (
    <div className="block md:hidden mb-4">
      <div className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/40 dark:border-gray-700/40 p-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3 uppercase tracking-wide font-medium">
          Reklam
        </div>
        <div className="flex justify-center">
          <MobileBannerAd adSlot={adSlot} />
        </div>
      </div>
    </div>
  );
}

// Responsive header ad that adapts to screen size
export function ResponsiveHeaderAd({ adSlot }: { adSlot: string }) {
  return (
    <TopAdContainer>
      <ResponsiveAd adSlot={adSlot} />
    </TopAdContainer>
  );
}