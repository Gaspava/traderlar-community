'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useEffect, useState } from 'react';

// Otomatik tema değiştirici hook
function useAutoTheme() {
  const [autoTheme, setAutoTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateTheme = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Akşam 19:00 - Sabah 07:00 arası dark tema
      // Sabah 07:00 - Akşam 19:00 arası light tema
      const isDarkTime = hour >= 19 || hour < 7;
      setAutoTheme(isDarkTime ? 'dark' : 'light');
    };

    // İlk yükleme
    updateTheme();
    
    // Her dakika kontrol et
    const interval = setInterval(updateTheme, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return autoTheme;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const autoTheme = useAutoTheme();
  
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="auto"
      themes={['light', 'dark', 'auto']}
      enableSystem={false}
      forcedTheme={undefined}
      {...props}
    >
      <AutoThemeUpdater autoTheme={autoTheme} />
      {children}
    </NextThemesProvider>
  );
}

// Otomatik tema güncelleyicisi
function AutoThemeUpdater({ autoTheme }: { autoTheme: 'light' | 'dark' }) {
  useEffect(() => {
    // Local storage'dan kullanıcının manuel tercihi var mı kontrol et
    const userTheme = localStorage.getItem('theme');
    
    // Eğer kullanıcı manuel olarak bir tema seçmemişse otomatik temayı uygula
    if (!userTheme || userTheme === 'auto') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(autoTheme);
      localStorage.setItem('theme', 'auto');
    }
  }, [autoTheme]);

  return null;
}

// Re-export useTheme from next-themes for convenience with enhanced functionality
export { useTheme } from 'next-themes';