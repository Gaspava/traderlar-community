'use client';

import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative h-10 w-10 rounded-full bg-muted/50" />
    );
  }

  const currentTheme = theme || 'auto';

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '🕐' }
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme !== 'auto') {
      localStorage.setItem('theme', newTheme);
    } else {
      localStorage.setItem('theme', 'auto');
    }
    setIsDropdownOpen(false);
  };

  const getCurrentIcon = () => {
    switch (currentTheme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
      default:
        return '🕐';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative h-10 w-10 rounded-full bg-gradient-to-b from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 flex items-center justify-center group transition-all duration-300 hover:from-primary/20 hover:to-primary/10 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
        aria-label={`Current theme: ${currentTheme}`}
        title={`Current theme: ${currentTheme} (Click to change)`}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative w-full h-full flex items-center justify-center">
          <span className="text-lg transition-transform duration-300 group-hover:scale-110">
            {getCurrentIcon()}
          </span>
        </div>
        
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-full bg-primary/20 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-12 z-20 w-32 bg-card border border-border rounded-lg shadow-lg py-1 backdrop-blur-sm">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted flex items-center gap-2 ${
                  currentTheme === themeOption.value 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-foreground hover:text-foreground'
                }`}
              >
                <span>{themeOption.icon}</span>
                <span>{themeOption.label}</span>
                {themeOption.value === 'auto' && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    7AM-7PM
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}