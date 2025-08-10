'use client';

import { useEffect, useRef } from 'react';

export interface AdUnitProps {
  adSlot: string;
  size: 'banner' | 'leaderboard' | 'rectangle' | 'large-rectangle' | 'half-page' | 'mobile-banner' | 'mobile-large' | 'responsive';
  className?: string;
  style?: React.CSSProperties;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
}

// Ad size configurations based on research for highest CPM
const AD_SIZES = {
  'banner': [320, 50], // Mobile banner - good mobile performance
  'mobile-large': [320, 100], // Large mobile banner - top performer for mobile
  'mobile-banner': [320, 50], // Standard mobile banner
  'rectangle': [300, 250], // Medium rectangle - most versatile, high CPM
  'large-rectangle': [336, 280], // Large rectangle - high performance, better CPM than 300x250
  'leaderboard': [728, 90], // Desktop leaderboard - excellent above-the-fold performance
  'half-page': [300, 600], // Half-page - rare format with highest CPM rates
  'responsive': 'responsive' as const, // Auto-responsive ads
} as const;

export default function AdUnit({ 
  adSlot, 
  size, 
  className = '', 
  style,
  format = 'auto' 
}: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    try {
      // Clear any existing content
      adRef.current.innerHTML = '';
      
      // Push ad configuration to AdSense
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [adSlot, size]);

  // Get size configuration
  const sizeConfig = AD_SIZES[size];
  const isResponsive = sizeConfig === 'responsive';
  const [width, height] = isResponsive ? [0, 0] : sizeConfig as [number, number];

  // Base styles for ad container
  const baseStyle: React.CSSProperties = {
    display: 'block',
    textAlign: 'center',
    minHeight: isResponsive ? '280px' : `${height}px`,
    ...style,
  };

  // Ad unit classes for styling
  const adClasses = `
    ad-unit ad-${size} 
    ${className}
  `.trim();

  return (
    <div className={`ad-container ${adClasses}`} style={baseStyle}>
      <div ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{
            display: isResponsive ? 'block' : 'inline-block',
            width: isResponsive ? '100%' : `${width}px`,
            height: `${height}px`,
          }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense publisher ID
          data-ad-slot={adSlot}
          data-ad-format={format}
          data-full-width-responsive={isResponsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}

// Predefined ad components for common use cases
export function LeaderboardAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdUnit
      adSlot={adSlot}
      size="leaderboard"
      className={`leaderboard-ad ${className || ''}`}
      format="horizontal"
    />
  );
}

export function RectangleAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdUnit
      adSlot={adSlot}
      size="rectangle"
      className={`rectangle-ad ${className || ''}`}
      format="rectangle"
    />
  );
}

export function LargeRectangleAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdUnit
      adSlot={adSlot}
      size="large-rectangle"
      className={`large-rectangle-ad ${className || ''}`}
      format="rectangle"
    />
  );
}

export function HalfPageAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdUnit
      adSlot={adSlot}
      size="half-page"
      className={`half-page-ad ${className || ''}`}
      format="vertical"
    />
  );
}

export function MobileBannerAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdUnit
      adSlot={adSlot}
      size="mobile-large"
      className={`mobile-banner-ad ${className || ''}`}
      format="horizontal"
    />
  );
}

export function ResponsiveAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdUnit
      adSlot={adSlot}
      size="responsive"
      className={`responsive-ad ${className || ''}`}
      format="auto"
    />
  );
}