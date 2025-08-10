'use client';

import { ReactNode } from 'react';

interface AdContainerProps {
  children: ReactNode;
  position: 'top' | 'bottom' | 'sidebar' | 'in-content' | 'sticky';
  className?: string;
  label?: string;
}

export default function AdContainer({ children, position, className = '', label }: AdContainerProps) {
  const getContainerClasses = () => {
    const baseClasses = 'ad-container-wrapper';
    
    switch (position) {
      case 'top':
        return `${baseClasses} mb-6 ${className}`;
      case 'bottom':
        return `${baseClasses} mt-6 ${className}`;
      case 'sidebar':
        return `${baseClasses} sticky top-4 ${className}`;
      case 'in-content':
        return `${baseClasses} my-8 ${className}`;
      case 'sticky':
        return `${baseClasses} sticky top-20 z-10 ${className}`;
      default:
        return `${baseClasses} ${className}`;
    }
  };

  return (
    <div className={getContainerClasses()}>
      {label && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3 uppercase tracking-wide font-medium">
          {label}
        </div>
      )}
      <div className="flex justify-center items-center p-4 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/40 dark:border-gray-700/40 min-h-[100px]">
        {children}
      </div>
    </div>
  );
}

// Specialized containers for different ad positions
export function TopAdContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AdContainer position="top" className={className} label="Reklam">
      {children}
    </AdContainer>
  );
}

export function BottomAdContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AdContainer position="bottom" className={className}>
      {children}
    </AdContainer>
  );
}

export function SidebarAdContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AdContainer position="sidebar" className={className}>
      {children}
    </AdContainer>
  );
}

export function InContentAdContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AdContainer position="in-content" className={className}>
      {children}
    </AdContainer>
  );
}

export function StickyAdContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AdContainer position="sticky" className={className}>
      {children}
    </AdContainer>
  );
}