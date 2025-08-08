-- Create trade history table
CREATE TABLE IF NOT EXISTS strategy_trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID REFERENCES trading_strategies(id) ON DELETE CASCADE,
    
    -- Trade Details
    ticket BIGINT NOT NULL,
    open_time TIMESTAMP WITH TIME ZONE,
    close_time TIMESTAMP WITH TIME ZONE,
    trade_type VARCHAR(10) CHECK (trade_type IN ('buy', 'sell')),
    size DECIMAL(10, 4),
    symbol VARCHAR(20),
    
    -- Prices
    open_price DECIMAL(15, 5),
    close_price DECIMAL(15, 5),
    stop_loss DECIMAL(15, 5),
    take_profit DECIMAL(15, 5),
    
    -- Financials
    commission DECIMAL(10, 2) DEFAULT 0,
    swap DECIMAL(10, 2) DEFAULT 0,
    profit DECIMAL(15, 2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_strategy_trades_strategy_id ON strategy_trades(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_trades_open_time ON strategy_trades(open_time DESC);
CREATE INDEX IF NOT EXISTS idx_strategy_trades_profit ON strategy_trades(profit DESC);
CREATE INDEX IF NOT EXISTS idx_strategy_trades_symbol ON strategy_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_strategy_trades_type ON strategy_trades(trade_type);

-- Create RLS policy
ALTER TABLE strategy_trades ENABLE ROW LEVEL SECURITY;

-- Policies for strategy_trades
CREATE POLICY "Anyone can view trades" ON strategy_trades FOR SELECT USING (true);
CREATE POLICY "Strategy authors can insert trades" ON strategy_trades FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trading_strategies 
            WHERE id = strategy_id 
            AND author_id = auth.uid()
        )
    );

-- Create function to calculate trade statistics
CREATE OR REPLACE FUNCTION calculate_trade_statistics(strategy_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_trades', COUNT(*),
        'winning_trades', COUNT(*) FILTER (WHERE profit > 0),
        'losing_trades', COUNT(*) FILTER (WHERE profit < 0),
        'win_rate', ROUND((COUNT(*) FILTER (WHERE profit > 0))::numeric / NULLIF(COUNT(*), 0) * 100, 2),
        'gross_profit', COALESCE(SUM(profit) FILTER (WHERE profit > 0), 0),
        'gross_loss', COALESCE(SUM(profit) FILTER (WHERE profit < 0), 0),
        'net_profit', COALESCE(SUM(profit), 0),
        'largest_win', COALESCE(MAX(profit), 0),
        'largest_loss', COALESCE(MIN(profit), 0),
        'average_win', COALESCE(AVG(profit) FILTER (WHERE profit > 0), 0),
        'average_loss', COALESCE(AVG(profit) FILTER (WHERE profit < 0), 0),
        'profit_factor', CASE 
            WHEN COALESCE(ABS(SUM(profit) FILTER (WHERE profit < 0)), 0) = 0 THEN NULL
            ELSE ROUND(COALESCE(SUM(profit) FILTER (WHERE profit > 0), 0) / COALESCE(ABS(SUM(profit) FILTER (WHERE profit < 0)), 1), 2)
        END,
        'total_commission', COALESCE(SUM(commission), 0),
        'total_swap', COALESCE(SUM(swap), 0)
    ) INTO result
    FROM strategy_trades
    WHERE strategy_id = strategy_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to get trade history with pagination
CREATE OR REPLACE FUNCTION get_strategy_trades(
    strategy_uuid UUID,
    page_limit INTEGER DEFAULT 50,
    page_offset INTEGER DEFAULT 0,
    order_by VARCHAR DEFAULT 'open_time',
    order_dir VARCHAR DEFAULT 'DESC'
)
RETURNS TABLE (
    id UUID,
    ticket BIGINT,
    open_time TIMESTAMP WITH TIME ZONE,
    close_time TIMESTAMP WITH TIME ZONE,
    trade_type VARCHAR,
    size DECIMAL,
    symbol VARCHAR,
    open_price DECIMAL,
    close_price DECIMAL,
    stop_loss DECIMAL,
    take_profit DECIMAL,
    commission DECIMAL,
    swap DECIMAL,
    profit DECIMAL,
    duration INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    EXECUTE format('
        SELECT 
            t.id,
            t.ticket,
            t.open_time,
            t.close_time,
            t.trade_type,
            t.size,
            t.symbol,
            t.open_price,
            t.close_price,
            t.stop_loss,
            t.take_profit,
            t.commission,
            t.swap,
            t.profit,
            t.close_time - t.open_time as duration
        FROM strategy_trades t
        WHERE t.strategy_id = $1
        ORDER BY t.%I %s
        LIMIT $2 OFFSET $3
    ', order_by, order_dir)
    USING strategy_uuid, page_limit, page_offset;
END;
$$ LANGUAGE plpgsql;