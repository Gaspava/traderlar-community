'use client';

import Navbar from './Navbar';
import SidebarNavigation from './SidebarNavigation';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-1/20 to-background transition-all duration-500 ease-out">
      {/* Sidebar */}
      <SidebarNavigation />
      
      {/* Main Content */}
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: isCollapsed ? '80px' : '280px' }}
      >
        <Navbar />
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MainLayoutContent>
        {children}
      </MainLayoutContent>
    </SidebarProvider>
  );
}