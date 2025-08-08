'use client';

import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative h-10 w-10 rounded-full bg-muted/50" />
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-full bg-gradient-to-b from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 flex items-center justify-center group transition-all duration-300 hover:from-primary/20 hover:to-primary/10 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative w-full h-full flex items-center justify-center">
        {theme === 'light' ? (
          // Moon icon for light mode
          <svg
            className="h-5 w-5 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        ) : (
          // Sun icon for dark mode
          <div className="relative">
            <svg
              className="h-5 w-5 text-primary transition-all duration-300 group-hover:rotate-45 group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414"
              />
            </svg>
            <div className="absolute inset-0 animate-pulse">
              <svg
                className="h-5 w-5 text-primary/30"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Glow effect */}
      <div className="absolute -inset-1 rounded-full bg-primary/20 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
    </button>
  );
}