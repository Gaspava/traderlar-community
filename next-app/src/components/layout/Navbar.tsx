'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ChevronDown,
  Moon,
  Sun
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User } from '@/lib/supabase/types';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useMobileNavigation } from '@/hooks/useMobileInteractions';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import NotificationCenter from '@/components/notifications/NotificationCenter';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { shouldHideNavbar, isScrolled } = useMobileNavigation();

  useEffect(() => {
    setMounted(true);
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
    { href: '/', label: 'Ana Sayfa', icon: Home },
    { href: '/forum', label: 'Forum', icon: MessageCircle },
    { href: '/articles', label: 'Makaleler', icon: BookOpen },
    { href: '/trading-stratejileri', label: 'Trading Stratejileri', icon: TrendingUp },
  ];

  if (!mounted) return null;

  return (
    <>
      <nav className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300 safe-top",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        shouldHideNavbar && "transform -translate-y-full md:translate-y-0",
        isScrolled && "shadow-sm"
      )}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-montserrat font-bold">
                  traderlar<span className="text-emerald-600">.com</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link href={item.href} className={`${navigationMenuTriggerStyle()} nav-text`}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
                {profile?.role === 'admin' && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/admin"
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-emerald-600 hover:text-emerald-700"
                        )}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="relative"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>

              {user ? (
                <>
                  {/* Notifications */}
                  <NotificationCenter />

                  {/* Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={profile?.avatar_url || undefined} 
                            alt={profile?.name || 'User'} 
                          />
                          <AvatarFallback>
                            {profile?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{profile?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            @{profile?.username}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/profile/${profile?.username}`}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profilim</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Çıkış Yap</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" asChild className="btn-text">
                    <Link href="/auth/login">Giriş Yap</Link>
                  </Button>
                  <Button asChild className="btn-text">
                    <Link href="/auth/register">Üye Ol</Link>
                  </Button>
                </div>
              )}
              
              {/* Theme Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="theme-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
                <Label htmlFor="theme-mode" className="sr-only">
                  Toggle theme
                </Label>
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden relative z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced with modern mobile UX */}
        {isMenuOpen && (
          <>
            {/* Mobile Menu Overlay */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" 
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Mobile Menu Content */}
            <div className="fixed top-16 left-0 right-0 bottom-0 bg-background/95 backdrop-blur-lg border-t z-50 md:hidden animate-slideDown">
              <div className="flex flex-col h-full">
                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-1 px-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center rounded-xl px-4 py-3 nav-text text-base hover:bg-accent hover:text-accent-foreground transition-all duration-200 touch-manipulation min-h-[48px]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="mr-4 h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                    {profile?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center rounded-xl px-4 py-3 text-base font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 touch-manipulation min-h-[48px]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="mr-4 h-5 w-5" />
                        Admin
                      </Link>
                    )}
                  </div>
                  
                  {/* Search Button for Mobile */}
                  <div className="px-4 mt-4">
                    <button
                      onClick={() => {
                        setIsSearchOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full rounded-xl px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 touch-manipulation min-h-[48px]"
                    >
                      <Search className="mr-4 h-5 w-5" />
                      Ara
                    </button>
                  </div>
                </div>
                
                {/* Bottom Section */}
                <div className="border-t bg-muted/30 p-4 space-y-3">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-background border">
                    <div className="flex items-center space-x-3">
                      {theme === "dark" ? (
                        <Moon className="h-5 w-5" />
                      ) : (
                        <Sun className="h-5 w-5" />
                      )}
                      <span className="font-medium">Karanlık Tema</span>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                  </div>
                  
                  {user ? (
                    <div className="space-y-2">
                      {/* User Profile Section */}
                      <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-background border">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={profile?.avatar_url || undefined} 
                            alt={profile?.name || 'User'} 
                          />
                          <AvatarFallback className="text-sm">
                            {profile?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{profile?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">@{profile?.username}</p>
                        </div>
                      </div>
                      
                      <Link
                        href={`/profile/${profile?.username}`}
                        className="flex items-center rounded-xl px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 touch-manipulation min-h-[48px] bg-background border"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="mr-4 h-5 w-5" />
                        Profilim
                      </Link>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex w-full items-center rounded-xl px-4 py-3 text-base font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 touch-manipulation min-h-[48px] bg-background border border-destructive/20"
                      >
                        <LogOut className="mr-4 h-5 w-5" />
                        Çıkış Yap
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/auth/login"
                        className="block rounded-xl px-4 py-3 text-base font-medium text-center hover:bg-accent hover:text-accent-foreground transition-all duration-200 touch-manipulation min-h-[48px] bg-background border"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Giriş Yap
                      </Link>
                      <Link
                        href="/auth/register"
                        className="block rounded-xl bg-primary px-4 py-3 text-base font-medium text-primary-foreground text-center hover:bg-primary/90 transition-all duration-200 touch-manipulation min-h-[48px]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Üye Ol
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Ara</DialogTitle>
            <DialogDescription>
              Makale, konu veya kullanıcı arayın
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Arama yapın..."
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit">Ara</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}