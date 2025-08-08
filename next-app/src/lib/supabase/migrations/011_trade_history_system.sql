-- Create strategy_trades table for storing individual trade data
CREATE TABLE IF NOT EXISTS strategy_trades (
    id BIGSERIAL PRIMARY KEY,
    strategy_id UUID NOT NULL REFERENCES trading_strategies(id) ON DELETE CASCADE,
    ticket BIGINT NOT NULL,
    open_time TIMESTAMP WITH TIME ZONE NOT NULL,
    close_time TIMESTAMP WITH TIME ZONE,
    trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('buy', 'sell')),
    size DECIMAL(15,2) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    open_price DECIMAL(15,5) NOT NULL,
    close_price DECIMAL(15,5),
    stop_loss DECIMAL(15,5),
    take_profit DECIMAL(15,5),
    commission DECIMAL(15,2) DEFAULT 0,
    swap DECIMAL(15,2) DEFAULT 0,
    profit DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_strategy_trades_strategy_id ON strategy_trades(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_trades_open_time ON strategy_trades(open_time);
CREATE INDEX IF NOT EXISTS idx_strategy_trades_close_time ON strategy_trades(close_time);
CREATE INDEX IF NOT EXISTS idx_strategy_trades_symbol ON strategy_trades(symbol);

-- Add RLS (Row Level Security) policies
ALTER TABLE strategy_trades ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all strategy trades (public read access)
CREATE POLICY "Allow public read access to strategy_trades" ON strategy_trades
    FOR SELECT USING (true);

-- Policy: Only authenticated users can insert/update/delete trades
CREATE POLICY "Allow authenticated users to manage strategy_trades" ON strategy_trades
    FOR ALL USING (auth.role() = 'authenticated');

-- Add comment for documentation
COMMENT ON TABLE strategy_trades IS 'Individual trade data for trading strategies extracted from MetaTrader backtest reports';