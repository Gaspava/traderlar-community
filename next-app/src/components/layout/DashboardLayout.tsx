'use client';

import CourseSidebar from '@/components/layout/CourseSidebar';
import { useTheme } from '@/components/theme/ThemeProvider';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useMobileNavigation } from '@/hooks/useMobileInteractions';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { shouldHideNavbar, isScrolled } = useMobileNavigation();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't show sidebar on auth pages
  if (pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <CourseSidebar />
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full w-80 bg-white dark:bg-card transform transition-transform duration-300 lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground">Menu</h2>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <CourseSidebar />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Responsive Top Header */}
        <div className={`sticky top-0 z-30 bg-white dark:bg-card border-b border-gray-200 dark:border-border transition-all duration-300 ${
          shouldHideNavbar ? 'transform -translate-y-full lg:translate-y-0' : ''
        } ${isScrolled ? 'shadow-sm' : ''}`}>
          <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors touch-manipulation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Search Bar - Responsive */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Makale veya strateji ara..."
                  className="w-full px-4 py-2.5 lg:py-3 pl-10 lg:pl-12 bg-white dark:bg-input rounded-lg lg:rounded-xl border border-gray-200 dark:border-border focus:outline-none focus:border-green-500 dark:focus:border-primary transition-colors text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm lg:text-base touch-manipulation"
                />
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 dark:text-muted-foreground absolute left-3 lg:left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Right Section - Responsive */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Theme Toggle - Prevent hydration issues */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-muted touch-manipulation"
                suppressHydrationWarning
              >
                {!mounted ? (
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : theme === 'dark' ? (
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              {/* Inbox - Hidden on small mobile */}
              <button className="hidden sm:block p-2 text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-muted touch-manipulation">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </button>
              
              {/* Notifications */}
              <Link href="/notifications" className="relative p-2 text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-muted touch-manipulation">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
              
              {/* Profile - Responsive */}
              <div className="flex items-center space-x-2 lg:space-x-3 pl-2 lg:pl-4 border-l border-gray-200 dark:border-border">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
                  alt="Profile"
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
                />
                <div className="hidden sm:block">
                  <p className="text-xs lg:text-sm font-semibold text-gray-900 dark:text-foreground">Kullanıcı</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">Trader</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page Content - Scrollable */}
        <div className="flex-1 overflow-auto mobile-scroll">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}