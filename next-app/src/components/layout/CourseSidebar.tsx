'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CourseSidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      label: 'ANA MENÜ',
      items: [
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
          label: 'Ana Sayfa',
          href: '/',
          active: pathname === '/',
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          label: 'Makaleler',
          href: '/articles',
          active: pathname.startsWith('/articles'),
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          label: 'Stratejiler',
          href: '/trading-stratejileri',
          active: pathname.startsWith('/trading-stratejileri'),
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          ),
          label: 'Forum',
          href: '/forum',
          active: pathname.startsWith('/forum'),
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ),
          label: 'Arama',
          href: '/search',
          active: pathname === '/search',
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          label: 'Bildirimler',
          href: '/notifications',
          active: pathname === '/notifications',
        },
      ],
    },
    {
      label: 'ARKADAŞLAR',
      items: [
        {
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bagas',
          name: 'Ahmet Yılmaz',
          status: 'Çevrimiçi',
          href: '/profile/ahmet',
        },
        {
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dandy',
          name: 'Mehmet Öz',
          status: 'Çevrimdışı',
          href: '/profile/mehmet',
        },
        {
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jhon',
          name: 'Elif Demir',
          status: 'Meşgul',
          href: '/profile/elif',
        },
      ],
    },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-card border-r border-gray-100 dark:border-border h-screen sticky top-0 transition-all duration-300 flex flex-col`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <div className="text-xl font-semibold">
            <span className="text-gray-900 dark:text-white">traderlar</span>
            <span className="text-green-600 dark:text-green-400">.com</span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-6 mb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {section.label}
              </h3>
            )}
            <div className="space-y-1">
              {section.label === 'ANA MENÜ' ? (
                section.items.map((item: any, itemIdx) => (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                      item.active
                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-r-4 border-green-600 dark:border-green-400'
                        : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-50 dark:hover:bg-muted'
                    }`}
                  >
                    <span className={item.active ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </Link>
                ))
              ) : (
                section.items.map((friend: any, friendIdx) => (
                  <Link
                    key={friendIdx}
                    href={friend.href}
                    className="flex items-center px-6 py-2 hover:bg-gray-50 dark:hover:bg-muted transition-colors duration-200"
                  >
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-8 h-8 rounded-full"
                    />
                    {!isCollapsed && (
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{friend.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{friend.status}</p>
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Settings Section */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-4">
        <h3 className="px-2 mb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {!isCollapsed && 'AYARLAR'}
        </h3>
        <Link
          href="/settings"
          className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-50 dark:hover:bg-muted rounded-lg transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {!isCollapsed && <span className="ml-3">Ayarlar</span>}
        </Link>
        <Link
          href="/logout"
          className="flex items-center px-2 py-2 mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="ml-3">Çıkış Yap</span>}
        </Link>
      </div>
    </div>
  );
};

export default CourseSidebar;