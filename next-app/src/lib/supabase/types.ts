export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  years_trading?: number;
  trading_style?: string;
  favorite_markets?: string[];
  is_verified?: boolean;
  is_premium?: boolean;
  premium_until?: string;
  profile_views?: number;
  last_seen?: string;
  is_online?: boolean;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_posts: number;
  total_comments: number;
  total_likes_received: number;
  total_likes_given: number;
  total_followers: number;
  total_following: number;
  reputation_score: number;
  helpful_votes: number;
  best_answers: number;
  strategies_shared: number;
  win_rate?: number;
  average_return?: number;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
  achievement?: Achievement;
}

export interface UserExperience {
  id: string;
  user_id: string;
  experience_points: number;
  level: number;
  next_level_xp: number;
  weekly_xp: number;
  monthly_xp: number;
  last_xp_earned: string;
  created_at: string;
  updated_at: string;
}

export interface TradingPerformance {
  id: string;
  user_id: string;
  month: string;
  trades_count: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: number;
  best_trade?: number;
  worst_trade?: number;
  average_win?: number;
  average_loss?: number;
  win_rate?: number;
  profit_factor?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'post' | 'comment' | 'like' | 'follow' | 'achievement' | 'trade';
  activity_data: Record<string, any>;
  points_earned: number;
  created_at: string;
}

export interface NotificationType {
  id: string;
  name: string;
  description: string;
  template: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type_id?: string;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  is_email_sent: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
  type?: NotificationType;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  type_id: string;
  in_app: boolean;
  email: boolean;
  push: boolean;
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  usage_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  id: string;
  type: 'article' | 'user' | 'topic' | 'strategy';
  title: string;
  description?: string;
  url: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
  tags: string[];
  created_at: string;
  relevance: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image?: string;
  author_id: string;
  view_count: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithAuthor extends Article {
  author_name: string;
  author_username: string;
  author_avatar?: string;
  author_role: UserRole;
  categories: Category[];
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  mentioned_user_id?: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentWithUser extends Comment {
  user_name: string;
  user_username: string;
  user_avatar?: string;
  mentioned_username?: string;
  like_count: number;
  is_liked?: boolean;
  reply_count: number;
  replies?: CommentWithUser[];
}

export interface TrendingArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string;
  view_count: number;
  published_at: string;
  author_name: string;
  author_username: string;
  author_avatar?: string;
  categories: Category[];
  like_count: number;
  comment_count: number;
  trend_score: number;
}

export interface ArticleSearchResult extends TrendingArticle {
  total_count: number;
}

// Trading Strategies Types
export interface TradingStrategy {
  id: string;
  name: string;
  description?: string;
  author_id: string;
  category: string;
  tags: string[];
  timeframe?: string;
  is_premium: boolean;
  
  // Performance Metrics
  total_net_profit?: number;
  gross_profit?: number;
  gross_loss?: number;
  profit_factor?: number;
  expected_payoff?: number;
  
  // Risk Metrics
  max_drawdown_absolute?: number;
  max_drawdown_percent?: number;
  balance_drawdown_absolute?: number;
  balance_drawdown_percent?: number;
  equity_drawdown_absolute?: number;
  equity_drawdown_percent?: number;
  
  // Trade Statistics
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
  win_rate?: number;
  largest_profit_trade?: number;
  largest_loss_trade?: number;
  average_profit_trade?: number;
  average_loss_trade?: number;
  
  // Additional Metrics
  sharpe_ratio?: number;
  recovery_factor?: number;
  calmar_ratio?: number;
  sortino_ratio?: number;
  
  // Consecutive Statistics
  max_consecutive_wins?: number;
  max_consecutive_losses?: number;
  max_consecutive_wins_amount?: number;
  max_consecutive_losses_amount?: number;
  avg_consecutive_wins?: number;
  avg_consecutive_losses?: number;
  
  // Engagement Metrics
  views: number;
  downloads: number;
  likes: number;
  rating: number;
  rating_count: number;
  
  // File Information
  original_filename?: string;
  file_size?: number;
  file_hash?: string;
  raw_html_data?: string;
  
  created_at: string;
  updated_at: string;
}

export interface TradingStrategyWithAuthor extends TradingStrategy {
  author_name: string;
  author_username: string;
  author_avatar?: string;
  author_role: UserRole;
  is_liked?: boolean;
  is_downloaded?: boolean;
  user_rating?: number;
}

export interface StrategyLike {
  id: string;
  strategy_id: string;
  user_id: string;
  created_at: string;
}

export interface StrategyDownload {
  id: string;
  strategy_id: string;
  user_id: string;
  downloaded_at: string;
}

export interface StrategyRating {
  id: string;
  strategy_id: string;
  user_id: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export interface StrategyComment {
  id: string;
  strategy_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StrategyCommentWithUser extends StrategyComment {
  user_name: string;
  user_username: string;
  user_avatar?: string;
  like_count: number;
  is_liked?: boolean;
  reply_count: number;
  replies?: StrategyCommentWithUser[];
}

export interface StrategyPerformanceMetrics {
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageProfitTrade: number;
  averageLossTrade: number;
  largestProfitTrade: number;
  largestLossTrade: number;
  recoveryFactor: number;
  expectedPayoff: number;
}

export interface StrategyUploadData {
  name: string;
  description?: string;
  category: string;
  tags: string[];
  timeframe?: string;
  isPremium: boolean;
  htmlContent: string;
  filename: string;
  fileSize: number;
}

// Manual Backtest System Types
export interface ManualBacktest {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  
  // Configuration
  initial_capital: number;
  risk_per_trade_percent: number;
  max_risk_percent: number;
  commission_per_trade: number;
  currency: string;
  
  // Strategy Details
  category: string;
  timeframe: string;
  market: string;
  tags: string[];
  
  // Status
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
  
  // Performance Summary
  current_balance: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  total_pnl_percent: number;
  max_drawdown_amount: number;
  max_drawdown_percent: number;
  profit_factor: number;
  sharpe_ratio: number;
  largest_win: number;
  largest_loss: number;
  average_win: number;
  average_loss: number;
  max_consecutive_wins: number;
  max_consecutive_losses: number;
  
  created_at: string;
  updated_at: string;
}

export interface ManualBacktestTrade {
  id: string;
  backtest_id: string;
  
  // Trade Info
  symbol: string;
  trade_type: 'long' | 'short';
  position_size: number;
  
  // Entry
  entry_date: string;
  entry_time: string;
  entry_price: number;
  stop_loss?: number;
  take_profit?: number;
  
  // Exit
  exit_date?: string;
  exit_time?: string;
  exit_price?: number;
  exit_reason?: 'tp' | 'sl' | 'manual' | 'time';
  
  // Risk Management
  risk_amount: number;
  risk_reward_ratio?: number;
  
  // Results
  pnl: number;
  pnl_percent: number;
  commission: number;
  duration_minutes?: number;
  
  // Status
  status: 'open' | 'closed';
  
  // Notes
  entry_notes?: string;
  exit_notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ManualBacktestDailyMetrics {
  id: string;
  backtest_id: string;
  date: string;
  
  starting_balance: number;
  ending_balance: number;
  daily_pnl: number;
  daily_pnl_percent: number;
  trades_count: number;
  winning_trades: number;
  losing_trades: number;
  
  cumulative_pnl: number;
  cumulative_pnl_percent: number;
  drawdown_amount: number;
  drawdown_percent: number;
  
  created_at: string;
}

export interface CreateManualBacktestData {
  name: string;
  description?: string;
  initial_capital: number;
  risk_per_trade_percent?: number;
  max_risk_percent?: number;
  commission_per_trade?: number;
  currency?: string;
  category?: string;
  timeframe?: string;
  market?: string;
  tags?: string[];
}

export interface CreateTradeData {
  symbol: string;
  trade_type: 'long' | 'short';
  position_size: number;
  entry_date: string;
  entry_time: string;
  entry_price: number;
  stop_loss?: number;
  take_profit?: number;
  risk_amount: number;
  entry_notes?: string;
}

export interface UpdateTradeData {
  exit_date?: string;
  exit_time?: string;
  exit_price?: number;
  exit_reason?: 'tp' | 'sl' | 'manual' | 'time';
  exit_notes?: string;
  manual_pnl?: number; // RR-based trades için manuel P&L
}

// Forum System Types
export interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  category_id: string;
  mentioned_strategies: string[];
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  vote_score: number;
  last_reply_at?: string;
  last_reply_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ForumTopicWithDetails extends ForumTopic {
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    role: UserRole;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  mentioned_strategies_data?: TradingStrategy[];
}

export interface ForumPost {
  id: string;
  topic_id: string;
  author_id: string;
  parent_id?: string;
  content: string;
  mentioned_strategies: string[];
  is_edited: boolean;
  vote_score: number;
  mentioned_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ForumPostWithDetails extends ForumPost {
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    role: UserRole;
  };
  mentioned_user?: {
    id: string;
    username: string;
  };
  mentioned_strategies_data?: TradingStrategy[];
  replies?: ForumPostWithDetails[];
  reply_count: number;
}

