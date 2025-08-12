export interface RecentItem {
  id: string;
  title: string;
  url: string;
  type: 'forum-topic' | 'strategy' | 'article' | 'community';
  category?: string;
  author?: string;
  timestamp: number;
  icon?: string;
}

const RECENT_ITEMS_KEY = 'recent_items';
const MAX_RECENT_ITEMS = 5;

export const addRecentItem = (item: Omit<RecentItem, 'timestamp'>) => {
  if (typeof window === 'undefined') return;

  try {
    const existingItems = getRecentItems();
    const newItem: RecentItem = {
      ...item,
      timestamp: Date.now()
    };

    // Remove existing item with same id if exists
    const filteredItems = existingItems.filter(existing => existing.id !== item.id);
    
    // Add new item to the beginning
    const updatedItems = [newItem, ...filteredItems].slice(0, MAX_RECENT_ITEMS);
    
    localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error adding recent item:', error);
  }
};

export const getRecentItems = (): RecentItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const items = localStorage.getItem(RECENT_ITEMS_KEY);
    if (!items) return [];
    
    const parsedItems: RecentItem[] = JSON.parse(items);
    
    // Sort by timestamp descending (newest first)
    return parsedItems
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENT_ITEMS);
  } catch (error) {
    console.error('Error getting recent items:', error);
    return [];
  }
};

export const clearRecentItems = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RECENT_ITEMS_KEY);
  } catch (error) {
    console.error('Error clearing recent items:', error);
  }
};

export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Şimdi';
  if (minutes < 60) return `${minutes}dk önce`;
  if (hours < 24) return `${hours}sa önce`;
  if (days < 7) return `${days}g önce`;
  
  return new Date(timestamp).toLocaleDateString('tr-TR');
};

export const getTypeIcon = (type: RecentItem['type']): string => {
  switch (type) {
    case 'forum-topic':
      return '💬';
    case 'strategy':
      return '📈';
    case 'article':
      return '📖';
    case 'community':
      return '👥';
    default:
      return '📄';
  }
};

export const getTypeLabel = (type: RecentItem['type']): string => {
  switch (type) {
    case 'forum-topic':
      return 'Forum Konusu';
    case 'strategy':
      return 'Strateji';
    case 'article':
      return 'Makale';
    case 'community':
      return 'Topluluk';
    default:
      return 'İçerik';
  }
};