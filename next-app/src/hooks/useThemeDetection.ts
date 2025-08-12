'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';

export function useThemeDetection() {
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('dark');
  const { theme } = useTheme();

  useEffect(() => {
    const detectTheme = () => {
      if (typeof window !== 'undefined') {
        const htmlClassList = document.documentElement.classList;
        const isDark = htmlClassList.contains('dark');
        const computedStyle = getComputedStyle(document.documentElement);
        const bgColor = computedStyle.getPropertyValue('background-color');
        
        // Multiple checks for theme detection
        const themeFromStorage = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let detectedTheme = 'light';
        
        // Primary check: HTML class
        if (isDark) {
          detectedTheme = 'dark';
        }
        // Secondary check: background color
        else if (bgColor === 'rgb(3, 7, 18)' || bgColor === 'rgb(9, 9, 11)' || bgColor === 'rgb(2, 6, 23)') {
          detectedTheme = 'dark';
        }
        // Tertiary check: storage and system preference
        else if (themeFromStorage === 'dark') {
          detectedTheme = 'dark';
        }
        else if (themeFromStorage === 'auto') {
          const now = new Date();
          const hour = now.getHours();
          const isAutoLightTime = hour >= 7 && hour < 19;
          detectedTheme = isAutoLightTime ? 'light' : 'dark';
        }
        
        setCurrentTheme(detectedTheme);
      }
    };
    
    detectTheme();
    setMounted(true);
    
    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
    }
    
    // Watch for storage changes
    const handleStorageChange = () => {
      detectTheme();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [theme]);

  return {
    isDarkMode: currentTheme === 'dark',
    theme: currentTheme,
    mounted
  };
}