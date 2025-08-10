'use client';

import { RectangleAd, LargeRectangleAd, ResponsiveAd } from './AdUnit';
import { InContentAdContainer } from './AdContainer';
import { useEffect, useState } from 'react';

interface InContentAdProps {
  adSlot: string;
  className?: string;
  preferLarge?: boolean; // Use large rectangle for better CPM
}

export default function InContentAd({ adSlot, className, preferLarge = false }: InContentAdProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <InContentAdContainer className={className}>
      {isMobile ? (
        <ResponsiveAd adSlot={adSlot} />
      ) : preferLarge ? (
        <LargeRectangleAd adSlot={adSlot} />
      ) : (
        <RectangleAd adSlot={adSlot} />
      )}
    </InContentAdContainer>
  );
}

// Component for inserting ads between paragraphs in article content
export function ArticleInContentAd({ adSlot }: { adSlot: string }) {
  return (
    <div className="my-8 flex justify-center">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-50/70 to-gray-100/70 dark:from-gray-800/40 dark:to-gray-900/40 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3 uppercase tracking-wide font-medium">
            Reklam
          </div>
          <div className="flex justify-center">
            <ResponsiveAd adSlot={adSlot} />
          </div>
        </div>
      </div>
    </div>
  );
}