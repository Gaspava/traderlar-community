-- Simple trading strategies table for testing
CREATE TABLE IF NOT EXISTS trading_strategies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    author_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    category VARCHAR(50) DEFAULT 'Other',
    timeframe VARCHAR(10),
    is_premium BOOLEAN DEFAULT false,
    
    -- Basic metrics
    total_net_profit DECIMAL(15, 2),
    profit_factor DECIMAL(8, 2),
    total_trades INTEGER,
    win_rate DECIMAL(5, 2),
    sharpe_ratio DECIMAL(8, 3),
    
    -- Engagement
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make table public readable
ALTER TABLE trading_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view strategies" ON trading_strategies FOR SELECT USING (true);
CREATE POLICY "Anyone can create strategies" ON trading_strategies FOR INSERT WITH CHECK (true);