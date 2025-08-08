-- User Profile Extensions
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS github VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_trading INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_style VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_markets TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- User Statistics Table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_posts INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  total_likes_given INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  total_following INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  best_answers INTEGER DEFAULT 0,
  strategies_shared INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2),
  average_return DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Follow System
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Achievements/Badges System
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50),
  points INTEGER DEFAULT 0,
  requirement_type VARCHAR(50), -- 'posts', 'likes', 'followers', 'trading', 'custom'
  requirement_value INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- User Experience/Level System
CREATE TABLE IF NOT EXISTS user_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  next_level_xp INTEGER DEFAULT 100,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  last_xp_earned TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Trading Performance
CREATE TABLE IF NOT EXISTS trading_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  trades_count INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  total_pnl DECIMAL(12,2) DEFAULT 0,
  best_trade DECIMAL(12,2),
  worst_trade DECIMAL(12,2),
  average_win DECIMAL(12,2),
  average_loss DECIMAL(12,2),
  win_rate DECIMAL(5,2),
  profit_factor DECIMAL(5,2),
  sharpe_ratio DECIMAL(5,2),
  max_drawdown DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- User Activity Log
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'like', 'follow', 'achievement', 'trade'
  activity_data JSONB DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_trading_performance_user_month ON trading_performance(user_id, month DESC);

-- Functions
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_stats
  SET updated_at = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user online status
CREATE OR REPLACE FUNCTION update_user_online_status(user_id UUID, is_online BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    is_online = is_online,
    last_seen = CASE WHEN NOT is_online THEN NOW() ELSE last_seen END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user level from XP
CREATE OR REPLACE FUNCTION calculate_user_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(xp / 50)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get XP required for next level
CREATE OR REPLACE FUNCTION calculate_next_level_xp(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN POWER(current_level, 2) * 50;
END;
$$ LANGUAGE plpgsql;

-- Insert default achievements
INSERT INTO achievements (name, description, icon, category, points, requirement_type, requirement_value) VALUES
  ('İlk Adım', 'İlk gönderinizi paylaşın', '🎯', 'Başlangıç', 10, 'posts', 1),
  ('Aktif Trader', '10 gönderi paylaşın', '📈', 'İçerik', 50, 'posts', 10),
  ('Popüler Trader', '100 takipçiye ulaşın', '⭐', 'Sosyal', 100, 'followers', 100),
  ('Yardımsever', '50 yararlı oy alın', '🤝', 'Topluluk', 75, 'custom', 50),
  ('Strateji Ustası', '5 strateji paylaşın', '🎲', 'Trading', 100, 'custom', 5),
  ('Kazanan Trader', '%60 başarı oranına ulaşın', '🏆', 'Trading', 200, 'custom', 60),
  ('Forum Lideri', '10 en iyi cevap', '👑', 'Forum', 150, 'custom', 10),
  ('Erken Üye', 'İlk 1000 üyeden biri olun', '🌟', 'Özel', 500, 'custom', 1000),
  ('Haftalık Aktif', '7 gün üst üste giriş yapın', '🔥', 'Aktivite', 25, 'custom', 7),
  ('Aylık Lider', 'Aylık liderlik tablosunda ilk 10''a girin', '🥇', 'Yarışma', 300, 'custom', 10);

-- Triggers
CREATE TRIGGER update_user_stats_trigger
AFTER INSERT OR UPDATE ON user_activities
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

-- RLS Policies
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Everyone can view stats
CREATE POLICY "Public can view user stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Follow policies
CREATE POLICY "Public can view follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Achievement policies
CREATE POLICY "Public can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Public can view user achievements" ON user_achievements FOR SELECT USING (true);

-- Experience policies
CREATE POLICY "Public can view experience" ON user_experience FOR SELECT USING (true);
CREATE POLICY "System can update experience" ON user_experience FOR ALL USING (true);

-- Trading performance policies
CREATE POLICY "Users can view own trading performance" ON trading_performance FOR SELECT USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM users WHERE id = user_id AND settings->>'public_trading_stats' = 'true'
));
CREATE POLICY "Users can update own trading performance" ON trading_performance FOR ALL USING (auth.uid() = user_id);

-- Activity policies
CREATE POLICY "Users can view own activities" ON user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activities" ON user_activities FOR INSERT WITH CHECK (true);