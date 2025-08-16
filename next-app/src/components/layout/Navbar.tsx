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
import { useSidebar } from '@/contexts/SidebarContext';


export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
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

  // Close dropdowns when clicking outside or ESC key
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        }
        if (isProfileDropdownOpen) {
          setIsProfileDropdownOpen(false);
        }
      }
    };

    // Only add listeners if dropdowns are open
    if (isProfileDropdownOpen || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
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
    { href: '/makaleler', label: 'Makaleler', icon: BookOpen, external: false },
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
        "fixed top-0 w-full z-50 border-b transition-all duration-300 safe-top",
        isDarkMode ? "bg-background/95 backdrop-blur-md border-border" : "bg-white/95 backdrop-blur-md border-gray-200",
        "transform translate-y-0",
        isScrolled && "shadow-sm"
      )}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between w-full">
            {/* Left side - Mobile menu + Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className={cn(
                  "flex md:hidden items-center justify-center w-10 h-10 rounded-lg transition-colors",
                  isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 group touch-manipulation">
                <div className="text-lg sm:text-xl lg:text-2xl font-montserrat font-bold transition-colors">
                  <span className={cn(
                    "group-hover:text-primary transition-colors",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>traderlar</span>
                  <span className="text-primary">.com</span>
                </div>
              </Link>
            </div>

            {/* Search Bar - Desktop Only */}
            <div className="hidden md:flex flex-1 max-w-md mx-4 md:mx-8 lg:max-w-lg">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "w-full flex items-center px-4 py-2 rounded-lg text-sm border transition-colors text-left",
                  isDarkMode
                    ? "bg-gray-900/80 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-900"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-100"
                )}
              >
                <Search className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>Makale, konu veya kullanıcı arayın...</span>
              </button>
            </div>

            {/* Right side actions - Right Column */}
            <div className="flex items-center justify-end space-x-1 sm:space-x-2 lg:space-x-3">

              {/* Search Button - Mobile Only */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                  isDarkMode
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
                title="Ara"
              >
                <Search className="h-5 w-5" />
              </button>


              {user ? (
                <>
                  {/* Notifications */}
                  <div className="hidden lg:block">
                    <NotificationCenter />
                  </div>

                  {/* Profile Dropdown - Clean Desktop */}
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
                            "flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors group",
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
                      "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                      isDarkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg"
                  >
                    Üye Ol
                  </Link>
                </div>
              )}

              {/* Mobile Profile Dropdown - Touch Optimized */}
              {user ? (
                <div className="lg:hidden" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {profile?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-all duration-200 text-muted-foreground",
                      isProfileDropdownOpen && "rotate-180"
                    )} />
                  </button>

                  {/* Mobile Profile Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
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
              ) : (
                <div className="lg:hidden flex items-center space-x-2">
                  <Link 
                    href="/auth/login" 
                    className={cn(
                      "px-3 py-2 text-sm font-medium transition-colors rounded-lg",
                      isDarkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    Giriş
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg"
                  >
                    Üye Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

      </nav>

      {/* Enhanced Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
          >
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              className={cn(
                "absolute inset-0",
                isDarkMode ? "bg-black/60" : "bg-black/30"
              )}
              onClick={() => setIsSearchOpen(false)}
            />
            
            {/* Search Modal */}
            <motion.div
              ref={searchModalRef}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={cn(
                "relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden",
                isDarkMode 
                  ? "bg-gray-950/95 border-gray-800/60 backdrop-blur-xl"
                  : "bg-white/95 border-gray-200/50 backdrop-blur-xl"
              )}
            >
              {/* Header */}
              <div className={cn(
                "flex items-center justify-between p-6 border-b",
                isDarkMode 
                  ? "border-gray-800/40" 
                  : "border-gray-200/20"
              )}>
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isDarkMode ? "bg-primary/20" : "bg-primary/10"
                  )}>
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Arama</h2>
                    <p className="text-sm text-muted-foreground">İstediğiniz içeriği bulun</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isDarkMode 
                      ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Search Form */}
              <div className="p-6">
                <form onSubmit={handleSearch} className="space-y-6">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Makale, konu veya kullanıcı arayın..."
                      className={cn(
                        "w-full pl-12 pr-4 py-4 rounded-xl border-2 text-base transition-all duration-200",
                        "focus:outline-none focus:ring-0",
                        isDarkMode
                          ? "bg-gray-900/60 border-gray-800 text-white placeholder-gray-500 focus:border-primary focus:bg-gray-900/80"
                          : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary focus:bg-white"
                      )}
                      autoFocus
                    />
                  </div>

                  {/* Search Suggestions */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Popüler Aramalar</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Bitcoin analizi',
                        'Forex stratejileri', 
                        'RSI stratejisi',
                        'Trading psikolojisi',
                        'Teknik analiz'
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                            setIsSearchOpen(false);
                          }}
                          className={cn(
                            "px-3 py-2 rounded-full text-sm font-medium transition-colors",
                            isDarkMode
                              ? "bg-gray-800/60 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-700/50"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                          )}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Categories */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Kategoriler</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { name: 'Makaleler', icon: '📄', filter: 'articles' },
                        { name: 'Forum', icon: '💬', filter: 'forum' },
                        { name: 'Stratejiler', icon: '📈', filter: 'strategies' },
                        { name: 'Kullanıcılar', icon: '👥', filter: 'users' },
                        { name: 'Eğitim', icon: '🎓', filter: 'education' },
                        { name: 'Analiz', icon: '📊', filter: 'analysis' }
                      ].map((category) => (
                        <button
                          key={category.name}
                          type="button"
                          onClick={() => {
                            router.push(`/search?category=${category.filter}`);
                            setIsSearchOpen(false);
                          }}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-colors",
                            isDarkMode
                              ? "border-gray-800/60 hover:border-gray-700 hover:bg-gray-900/40 bg-gray-900/20"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{category.icon}</span>
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={cn(
                    "flex items-center justify-between pt-4 border-t",
                    isDarkMode 
                      ? "border-gray-800/40" 
                      : "border-gray-200/20"
                  )}>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">ESC</kbd>
                      <span>iptal için</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        disabled={!searchQuery.trim()}
                        className={cn(
                          "px-6 py-2 text-sm font-medium rounded-lg transition-all shadow-lg hover:shadow-xl",
                          "bg-primary text-primary-foreground hover:bg-primary/90",
                          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                        )}
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