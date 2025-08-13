export type ContentType = 'forum' | 'article' | 'strategy';

export interface BaseContent {
  id: string;
  type: ContentType;
  title: string;
  content?: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at?: string;
  vote_score: number;
  user_vote?: number | null;
  view_count: number;
}

export interface ForumContent extends BaseContent {
  type: 'forum';
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  reply_count: number;
  last_reply_at?: string;
  last_reply_user?: {
    name: string;
    username: string;
  };
  is_pinned: boolean;
  is_locked: boolean;
  slug: string;
}

export interface ArticleContent extends BaseContent {
  type: 'article';
  excerpt?: string;
  featured_image?: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  read_time: number; // in minutes
  slug: string;
  tags?: string[];
  comment_count: number;
}

export interface StrategyContent extends BaseContent {
  type: 'strategy';
  description: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  performance: {
    total_return: number;
    win_rate: number;
    total_trades: number;
  };
  timeframe: string;
  tags: string[];
  download_count: number;
  like_count: number;
  is_premium: boolean;
  slug: string;
}

export type FeedContent = ForumContent | ArticleContent | StrategyContent;

export interface FeedResponse {
  content: FeedContent[];
  hasMore: boolean;
  totalCount: number;
  page: number;
}

export type SortOption = 'hot' | 'new' | 'top';

export interface FeedFilters {
  type?: ContentType | 'all';
  sort: SortOption;
  category?: string;
  timeRange?: '24h' | '7d' | '30d' | 'all';
}

// Content type colors and labels
export const CONTENT_TYPE_CONFIG = {
  forum: {
    label: 'TARTIŞMA',
    color: 'orange',
    icon: '🔥',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  article: {
    label: 'MAKALE',
    color: 'blue',
    icon: '📰',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  strategy: {
    label: 'STRATEJİ',
    color: 'green',
    icon: '📊',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800'
  }
} as const;

// Category colors
export const CATEGORY_COLORS = {
  'Kripto': '#F59E0B',
  'Forex': '#3B82F6',
  'Hisse': '#10B981',
  'Emtia': '#8B5CF6',
  'Teknik Analiz': '#EF4444',
  'Eğitim': '#06B6D4',
  'Genel Tartışma': '#6B7280',
  'Algoritmik Ticaret': '#F97316',
  'Strateji Paylaşımı': '#84CC16',
  'Prop Firm ve Fon Yönetimi': '#A855F7',
  'Yazılım ve Otomasyon': '#F59E0B',
  'Portföy ve Performans': '#06B6D4',
  'Piyasa Analizleri': '#84CC16',
  'Eğitim Kaynakları': '#A855F7',
  'Trade Psikolojisi': '#EC4899',
  'Hukuk ve Vergilendirme': '#6B7280'
} as const;