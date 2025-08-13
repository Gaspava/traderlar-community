'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  MessageCircle, 
  TrendingUp, 
  BookOpen, 
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Moon,
  Sun,
  Settings,
  ChevronDown,
  Code
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { useMobileNavigation } from '@/hooks/useMobileInteractions';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useThemeDetection } from '@/hooks/useThemeDetection';
import { ThemeToggle } from '@/components/theme/ThemeToggle';


export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode, mounted } = useThemeDetection();
  const { shouldHideNavbar, isScrolled } = useMobileNavigation();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchProfile(user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdowns when clicking outside  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside profile dropdown
      if (isProfileDropdownOpen && profileDropdownRef.current) {
        if (!profileDropdownRef.current.contains(target)) {
          setIsProfileDropdownOpen(false);
        }
      }
      
      // Check if click is outside search modal
      if (isSearchOpen && searchModalRef.current) {
        if (!searchModalRef.current.contains(target)) {
          setIsSearchOpen(false);
        }
      }
    };

    // Only add listener if dropdowns are open
    if (isProfileDropdownOpen || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileDropdownOpen, isSearchOpen]);

  const fetchProfile = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };


  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const navItems = [
    { href: '/', label: 'Ana Sayfa', icon: Home, external: false },
    { href: '/forum', label: 'Forum', icon: MessageCircle, external: false },
    { href: '/articles', label: 'Makaleler', icon: BookOpen, external: false },
    { href: '/trading-stratejileri', label: 'Stratejiler', icon: TrendingUp, external: false },
    { href: '/egitim', label: 'Eğitim', icon: BookOpen, external: false },
    { href: '/araclar', label: 'Araçlar', icon: Code, external: false },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  if (!mounted) return null;

  return (
    <>
      <nav className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300 safe-top",
        isDarkMode ? "bg-background border-border" : "bg-white border-gray-200",
        shouldHideNavbar ? "transform -translate-y-full lg:translate-y-0" : "transform translate-y-0",
        isScrolled && "shadow-lg"
      )}>
        <div className="mx-2 lg:mx-4 px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 lg:h-14 items-center justify-between w-full">
            {/* Logo - positioned to left edge */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="text-xl lg:text-2xl font-montserrat font-bold transition-colors">
                  <span className={cn(
                    "group-hover:text-primary transition-colors",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>traderlar</span>
                  <span className="text-primary">.com</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - centered */}
            <div className="hidden lg:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : isDarkMode
                          ? "text-gray-300 hover:text-white hover:bg-gray-800"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105",
                    pathname.startsWith('/admin') 
                      ? "bg-orange-100 text-orange-600" 
                      : "text-orange-600 hover:bg-orange-50"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>

            {/* Right side actions - positioned to right edge */}
            <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0 ml-auto">

              {/* Search - Desktop only */}
              <button
                data-button="search"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={cn(
                  "hidden lg:flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105",
                  isDarkMode 
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <div className="hidden lg:block">
                    <NotificationCenter />
                  </div>

                  {/* Profile Dropdown - Desktop */}
                  <div className="hidden lg:block">
                    <div className={cn(
                      "flex items-center space-x-3 pl-3 border-l",
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    )}>
                      {/* Theme Toggle */}
                      <ThemeToggle />
                      
                      {/* Profile Dropdown */}
                      <div className="relative" ref={profileDropdownRef}>
                        <button
                          data-button="profile"
                          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                          className={cn(
                            "flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-colors group",
                            isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                          )}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                            {profile?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="hidden xl:block">
                            <p className={cn(
                              "text-sm font-medium group-hover:text-primary transition-colors",
                              isDarkMode ? "text-white" : "text-gray-900"
                            )}>
                              {profile?.name || 'Kullanıcı'}
                            </p>
                            <p className={cn(
                              "text-xs",
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            )}>@{profile?.username || 'user'}</p>
                          </div>
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-all duration-200",
                            isDarkMode 
                              ? "text-gray-400 group-hover:text-white"
                              : "text-gray-500 group-hover:text-gray-900",
                            isProfileDropdownOpen && "rotate-180"
                          )} />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {isProfileDropdownOpen && (
                            <motion.div
                              data-dropdown="profile"
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className={cn(
                                "absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl border z-[100]",
                                isDarkMode 
                                  ? "bg-gray-800 border-gray-700"
                                  : "bg-white border-gray-200"
                              )}
                            >
                              <div className="py-2">
                                {/* Profile Info */}
                                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {profile?.name || 'Kullanıcı'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    @{profile?.username || 'user'}
                                  </p>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1">
                                  <Link
                                    href={`/profile/${profile?.username}`}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                  >
                                    <User className="mr-3 h-4 w-4" />
                                    Profil
                                  </Link>
                                  
                                  <Link
                                    href="/settings/profile"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                  >
                                    <Settings className="mr-3 h-4 w-4" />
                                    Ayarlar
                                  </Link>

                                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                                  <button
                                    onClick={() => {
                                      handleLogout();
                                      setIsProfileDropdownOpen(false);
                                    }}
                                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Çıkış Yap
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="hidden lg:flex items-center space-x-3">
                  {/* Theme Toggle */}
                  <ThemeToggle />
                  
                  <Link 
                    href="/auth/login" 
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors rounded-xl",
                      isDarkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl shadow-md hover:shadow-lg hover:scale-105"
                  >
                    Üye Ol
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 relative z-50 mobile-button"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Modern Mobile Menu with Smooth Animations */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Mobile Menu Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" 
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Mobile Menu Content */}
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  opacity: { duration: 0.2 }
                }}
                className="fixed top-16 right-0 bottom-0 w-80 max-w-[85vw] bg-background/98 backdrop-blur-xl border-l border-border z-50 lg:hidden shadow-2xl"
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">Menu</h2>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-1 overflow-y-auto mobile-scroll py-2">
                    <div className="space-y-1 px-3">
                      {navItems.map((item, index) => {
                        const isActive = isActiveRoute(item.href);
                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Link
                              href={item.href}
                              className={cn(
                                "flex items-center space-x-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 touch-manipulation min-h-[52px]",
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-md"
                                  : "text-foreground hover:bg-muted/50 hover:text-foreground"
                              )}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                              <span>{item.label}</span>
                            </Link>
                          </motion.div>
                        );
                      })}
                      {profile?.role === 'admin' && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: navItems.length * 0.1 }}
                        >
                          <Link
                            href="/admin"
                            className="flex items-center space-x-3 rounded-xl px-4 py-3 text-base font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 touch-manipulation min-h-[52px]"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Shield className="h-5 w-5 flex-shrink-0" />
                            <span>Admin</span>
                          </Link>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Search Button for Mobile */}
                    <div className="px-3 mt-4 pt-4 border-t border-border">
                      <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => {
                          setIsSearchOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full rounded-xl px-4 py-3 text-base font-medium text-foreground hover:bg-muted/50 transition-all duration-200 touch-manipulation min-h-[52px]"
                      >
                        <Search className="h-5 w-5 flex-shrink-0" />
                        <span>Ara</span>
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Bottom Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="border-t border-border bg-muted/30 p-4 space-y-3 safe-bottom"
                  >
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-center rounded-xl px-4 py-3 bg-background/50 border">
                      <ThemeToggle />
                    </div>
                    
                    {user ? (
                      <div className="space-y-3">
                        {/* User Profile Section */}
                        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-background/50 border">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-semibold">
                            {profile?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{profile?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">@{profile?.username}</p>
                          </div>
                        </div>
                        
                        <Link
                          href={`/profile/${profile?.username}`}
                          className="flex items-center space-x-3 rounded-xl px-4 py-3 text-base font-medium hover:bg-muted/50 transition-all duration-200 touch-manipulation min-h-[52px] bg-background/50 border"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="h-5 w-5 flex-shrink-0" />
                          <span>Profilim</span>
                        </Link>
                        
                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 rounded-xl px-4 py-3 text-base font-medium hover:bg-muted/50 transition-all duration-200 touch-manipulation min-h-[52px] bg-background/50 border"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="h-5 w-5 flex-shrink-0" />
                          <span>Ayarlar</span>
                        </Link>
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-base font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 touch-manipulation min-h-[52px] bg-background/50 border border-destructive/20"
                        >
                          <LogOut className="h-5 w-5 flex-shrink-0" />
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          href="/auth/login"
                          className="block rounded-xl px-4 py-3 text-base font-medium text-center hover:bg-muted/50 transition-all duration-200 touch-manipulation min-h-[52px] bg-background/50 border"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Giriş Yap
                        </Link>
                        <Link
                          href="/auth/register"
                          className="block rounded-xl bg-primary px-4 py-3 text-base font-medium text-primary-foreground text-center hover:bg-primary/90 transition-all duration-200 touch-manipulation min-h-[52px] shadow-md hover:shadow-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Üye Ol
                        </Link>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Modern Search Dialog */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsSearchOpen(false)}
            />
            
            {/* Search Modal */}
            <motion.div
              ref={searchModalRef}
              data-modal="search"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative bg-background rounded-xl shadow-2xl border border-border w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Ara</h2>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Makale, konu veya kullanıcı arayın..."
                      className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Makale, konu veya kullanıcı arayın
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
                      >
                        Ara
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}