'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, X } from 'lucide-react';
import { getRecentItems, clearRecentItems, formatTimeAgo, getTypeIcon, getTypeLabel, RecentItem } from '@/lib/utils/recent-items';

interface RecentItemsProps {
  className?: string;
}

export default function RecentItems({ className = '' }: RecentItemsProps) {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadRecentItems();
  }, []);

  const loadRecentItems = () => {
    const items = getRecentItems();
    setRecentItems(items);
  };

  const handleClearAll = () => {
    clearRecentItems();
    setRecentItems([]);
  };

  if (!mounted) {
    return (
      <div className={`bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg ${className}`}>
        <div className="px-4 py-3 border-b border-gray-100 dark:border-border bg-gray-50 dark:bg-card/50">
          <div className="h-4 bg-gray-200 dark:bg-muted rounded animate-pulse"></div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-muted rounded mb-2"></div>
              <div className="h-2 bg-gray-200 dark:bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentItems.length === 0) {
    return (
      <div className={`bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg ${className}`}>
        <div className="px-4 py-3 border-b border-gray-100 dark:border-border bg-gray-50 dark:bg-card/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              En Son Bakılanlar
            </h3>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center py-6">
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Henüz bakılan içerik yok</p>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Ziyaret ettiğiniz sayfalar burada görünecek
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-border bg-gray-50 dark:bg-card/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            En Son Bakılanlar
          </h3>
          {recentItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Tümünü temizle"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Recent Items List */}
      <div className="divide-y divide-gray-100 dark:divide-border">
        {recentItems.map((item, index) => (
          <Link key={`${item.id}-${item.timestamp}`} href={item.url} className="block">
            <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-card/50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Type Icon */}
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-sm">
                  {item.icon || getTypeIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-1">
                    {item.title}
                  </h4>

                  {/* Meta Information */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 leading-tight">
                    <span className="flex-shrink-0">{getTypeLabel(item.type)}</span>
                    {item.category && (
                      <>
                        <span>•</span>
                        <span className="truncate">{item.category}</span>
                      </>
                    )}
                    {item.author && (
                      <>
                        <span>•</span>
                        <span className="truncate">u/{item.author}</span>
                      </>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatTimeAgo(item.timestamp)}
                  </div>
                </div>

                {/* Recent Indicator */}
                {index === 0 && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      {recentItems.length >= 5 && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-border bg-gray-50 dark:bg-card/50">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Son 5 içerik gösteriliyor
          </p>
        </div>
      )}
    </div>
  );
}