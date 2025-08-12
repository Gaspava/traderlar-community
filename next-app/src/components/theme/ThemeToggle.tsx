'use client';

import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-xl bg-muted/50 animate-pulse" />
    );
  }

  // Sistem auto modda kalacak ama UI'da sadece light/dark toggle gösterilecek
  const currentTheme = theme || 'auto';
  const isDark = currentTheme === 'dark' || (currentTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/50 flex items-center justify-center group transition-all duration-300 hover:scale-105 hover:bg-muted/70 hover:border-border overflow-hidden"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon container with smooth transition */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
          transition={{ 
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="absolute"
        >
          {isDark ? (
            <Moon className="w-5 h-5 text-foreground/80 group-hover:text-foreground transition-colors" />
          ) : (
            <Sun className="w-5 h-5 text-foreground/80 group-hover:text-foreground transition-colors" />
          )}
        </motion.div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
    </motion.button>
  );
}