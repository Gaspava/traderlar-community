-- Create trading strategies table
CREATE TABLE IF NOT EXISTS trading_strategies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50) DEFAULT 'Other',
    tags TEXT[] DEFAULT '{}',
    timeframe VARCHAR(10),
    is_premium BOOLEAN DEFAULT false,
    
    -- Performance Metrics
    total_net_profit DECIMAL(15, 2),
    gross_profit DECIMAL(15, 2),
    gross_loss DECIMAL(15, 2),
    profit_factor DECIMAL(8, 2),
    expected_payoff DECIMAL(10, 2),
    
    -- Risk Metrics
    max_drawdown_absolute DECIMAL(15, 2),
    max_drawdown_percent DECIMAL(8, 2),
    balance_drawdown_absolute DECIMAL(15, 2),
    balance_drawdown_percent DECIMAL(8, 2),
    equity_drawdown_absolute DECIMAL(15, 2),
    equity_drawdown_percent DECIMAL(8, 2),
    
    -- Trade Statistics
    total_trades INTEGER,
    winning_trades INTEGER,
    losing_trades INTEGER,
    win_rate DECIMAL(5, 2),
    largest_profit_trade DECIMAL(15, 2),
    largest_loss_trade DECIMAL(15, 2),
    average_profit_trade DECIMAL(10, 2),
    average_loss_trade DECIMAL(10, 2),
    
    -- Additional Metrics
    sharpe_ratio DECIMAL(8, 3),
    recovery_factor DECIMAL(8, 2),
    calmar_ratio DECIMAL(8, 3),
    sortino_ratio DECIMAL(8, 3),
    
    -- Consecutive Statistics
    max_consecutive_wins INTEGER,
    max_consecutive_losses INTEGER,
    max_consecutive_wins_amount DECIMAL(15, 2),
    max_consecutive_losses_amount DECIMAL(15, 2),
    avg_consecutive_wins DECIMAL(5, 2),
    avg_consecutive_losses DECIMAL(5, 2),
    
    -- Engagement Metrics
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- File Information
    original_filename VARCHAR(255),
    file_size INTEGER,
    file_hash VARCHAR(64),
    raw_html_data TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategy likes table for user interactions
CREATE TABLE IF NOT EXISTS strategy_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID REFERENCES trading_strategies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(strategy_id, user_id)
);

-- Create strategy downloads table
CREATE TABLE IF NOT EXISTS strategy_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID REFERENCES trading_strategies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategy ratings table
CREATE TABLE IF NOT EXISTS strategy_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID REFERENCES trading_strategies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(strategy_id, user_id)
);

-- Create strategy comments table
CREATE TABLE IF NOT EXISTS strategy_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID REFERENCES trading_strategies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES strategy_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trading_strategies_author ON trading_strategies(author_id);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_category ON trading_strategies(category);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_created_at ON trading_strategies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_rating ON trading_strategies(rating DESC);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_downloads ON trading_strategies(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_win_rate ON trading_strategies(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_profit_factor ON trading_strategies(profit_factor DESC);
CREATE INDEX IF NOT EXISTS idx_strategy_likes_strategy ON strategy_likes(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_downloads_strategy ON strategy_downloads(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_ratings_strategy ON strategy_ratings(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_comments_strategy ON strategy_comments(strategy_id);

-- Create function to update strategy stats
CREATE OR REPLACE FUNCTION update_strategy_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'strategy_likes' THEN
        UPDATE trading_strategies 
        SET likes = (
            SELECT COUNT(*) 
            FROM strategy_likes 
            WHERE strategy_id = COALESCE(NEW.strategy_id, OLD.strategy_id)
        )
        WHERE id = COALESCE(NEW.strategy_id, OLD.strategy_id);
        
    ELSIF TG_TABLE_NAME = 'strategy_downloads' THEN
        UPDATE trading_strategies 
        SET downloads = (
            SELECT COUNT(*) 
            FROM strategy_downloads 
            WHERE strategy_id = NEW.strategy_id
        )
        WHERE id = NEW.strategy_id;
        
    ELSIF TG_TABLE_NAME = 'strategy_ratings' THEN
        UPDATE trading_strategies 
        SET 
            rating = (
                SELECT COALESCE(AVG(rating), 0) 
                FROM strategy_ratings 
                WHERE strategy_id = COALESCE(NEW.strategy_id, OLD.strategy_id)
            ),
            rating_count = (
                SELECT COUNT(*) 
                FROM strategy_ratings 
                WHERE strategy_id = COALESCE(NEW.strategy_id, OLD.strategy_id)
            )
        WHERE id = COALESCE(NEW.strategy_id, OLD.strategy_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update stats
CREATE TRIGGER trigger_update_strategy_likes
    AFTER INSERT OR DELETE ON strategy_likes
    FOR EACH ROW EXECUTE FUNCTION update_strategy_stats();

CREATE TRIGGER trigger_update_strategy_downloads
    AFTER INSERT ON strategy_downloads
    FOR EACH ROW EXECUTE FUNCTION update_strategy_stats();

CREATE TRIGGER trigger_update_strategy_ratings
    AFTER INSERT OR UPDATE OR DELETE ON strategy_ratings
    FOR EACH ROW EXECUTE FUNCTION update_strategy_stats();

-- Create function to increment strategy views
CREATE OR REPLACE FUNCTION increment_strategy_views(strategy_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE trading_strategies 
    SET views = views + 1 
    WHERE id = strategy_uuid;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for trading_strategies
CREATE POLICY "Anyone can view published strategies" ON trading_strategies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create strategies" ON trading_strategies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own strategies" ON trading_strategies FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own strategies" ON trading_strategies FOR DELETE USING (auth.uid() = author_id);

-- Create RLS Policies for strategy_likes
CREATE POLICY "Anyone can view likes" ON strategy_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like strategies" ON strategy_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes" ON strategy_likes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for strategy_downloads
CREATE POLICY "Anyone can view download count" ON strategy_downloads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can download strategies" ON strategy_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for strategy_ratings
CREATE POLICY "Anyone can view ratings" ON strategy_ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can rate strategies" ON strategy_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON strategy_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ratings" ON strategy_ratings FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for strategy_comments
CREATE POLICY "Anyone can view comments" ON strategy_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON strategy_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON strategy_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON strategy_comments FOR DELETE USING (auth.uid() = user_id);

-- Add some sample data (optional)
-- INSERT INTO trading_strategies (name, description, category, tags, timeframe, total_net_profit, win_rate, max_drawdown_percent, sharpe_ratio)
-- VALUES 
-- ('Sample RSI Strategy', 'A sample RSI-based trading strategy', 'Forex', ARRAY['RSI', 'H1'], 'H1', 15000.50, 65.5, -12.3, 1.8);

NOTIFY pgrst, 'reload schema';