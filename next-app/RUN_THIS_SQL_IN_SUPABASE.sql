-- MANUEL BACKTEST SİSTEMİ VERİTABANI MIGRATION'I
-- Bu SQL dosyasını Supabase Dashboard > SQL Editor'da çalıştırın

-- Manual Backtest System Migration
-- Creates tables for manual backtesting functionality

-- Main manual backtests table
CREATE TABLE IF NOT EXISTS manual_backtests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Backtest Configuration
    initial_capital DECIMAL(15, 2) NOT NULL DEFAULT 10000,
    risk_per_trade_percent DECIMAL(5, 2) DEFAULT 2.0,
    max_risk_percent DECIMAL(5, 2) DEFAULT 10.0,
    commission_per_trade DECIMAL(8, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Strategy Details
    category VARCHAR(50) DEFAULT 'Manual',
    timeframe VARCHAR(10) DEFAULT 'H1',
    market VARCHAR(50) DEFAULT 'Forex',
    tags TEXT[] DEFAULT '{}',
    
    -- Backtest Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    
    -- Performance Summary (updated on each trade)
    current_balance DECIMAL(15, 2) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0,
    total_pnl DECIMAL(15, 2) DEFAULT 0,
    total_pnl_percent DECIMAL(8, 2) DEFAULT 0,
    max_drawdown_amount DECIMAL(15, 2) DEFAULT 0,
    max_drawdown_percent DECIMAL(8, 2) DEFAULT 0,
    profit_factor DECIMAL(8, 2) DEFAULT 0,
    sharpe_ratio DECIMAL(8, 3) DEFAULT 0,
    largest_win DECIMAL(15, 2) DEFAULT 0,
    largest_loss DECIMAL(15, 2) DEFAULT 0,
    average_win DECIMAL(10, 2) DEFAULT 0,
    average_loss DECIMAL(10, 2) DEFAULT 0,
    max_consecutive_wins INTEGER DEFAULT 0,
    max_consecutive_losses INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual trades table
CREATE TABLE IF NOT EXISTS manual_backtest_trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    backtest_id UUID REFERENCES manual_backtests(id) ON DELETE CASCADE NOT NULL,
    
    -- Trade Basic Info
    symbol VARCHAR(20) NOT NULL,
    trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('long', 'short')),
    position_size DECIMAL(15, 2) NOT NULL,
    
    -- Entry Details
    entry_date DATE NOT NULL,
    entry_time TIME NOT NULL,
    entry_price DECIMAL(15, 8) NOT NULL,
    stop_loss DECIMAL(15, 8),
    take_profit DECIMAL(15, 8),
    
    -- Exit Details (NULL if still open)
    exit_date DATE,
    exit_time TIME,
    exit_price DECIMAL(15, 8),
    exit_reason VARCHAR(20) CHECK (exit_reason IN ('tp', 'sl', 'manual', 'time')),
    
    -- Risk Management
    risk_amount DECIMAL(15, 2) NOT NULL,
    risk_reward_ratio DECIMAL(8, 2),
    
    -- Results
    pnl DECIMAL(15, 2) DEFAULT 0,
    pnl_percent DECIMAL(8, 2) DEFAULT 0,
    commission DECIMAL(10, 2) DEFAULT 0,
    duration_minutes INTEGER,
    
    -- Trade Status
    status VARCHAR(10) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    
    -- Notes
    entry_notes TEXT,
    exit_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily metrics table for tracking performance over time
CREATE TABLE IF NOT EXISTS manual_backtest_daily_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    backtest_id UUID REFERENCES manual_backtests(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    
    -- Daily Stats
    starting_balance DECIMAL(15, 2) NOT NULL,
    ending_balance DECIMAL(15, 2) NOT NULL,
    daily_pnl DECIMAL(15, 2) NOT NULL,
    daily_pnl_percent DECIMAL(8, 2) NOT NULL,
    trades_count INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    
    -- Running Stats
    cumulative_pnl DECIMAL(15, 2) NOT NULL,
    cumulative_pnl_percent DECIMAL(8, 2) NOT NULL,
    drawdown_amount DECIMAL(15, 2) DEFAULT 0,
    drawdown_percent DECIMAL(8, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(backtest_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manual_backtests_user_id ON manual_backtests(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_backtests_status ON manual_backtests(status);
CREATE INDEX IF NOT EXISTS idx_manual_backtests_created_at ON manual_backtests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_manual_backtest_trades_backtest_id ON manual_backtest_trades(backtest_id);
CREATE INDEX IF NOT EXISTS idx_manual_backtest_trades_symbol ON manual_backtest_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_manual_backtest_trades_entry_date ON manual_backtest_trades(entry_date);
CREATE INDEX IF NOT EXISTS idx_manual_backtest_trades_status ON manual_backtest_trades(status);

CREATE INDEX IF NOT EXISTS idx_manual_backtest_daily_metrics_backtest_id ON manual_backtest_daily_metrics(backtest_id);
CREATE INDEX IF NOT EXISTS idx_manual_backtest_daily_metrics_date ON manual_backtest_daily_metrics(date);

-- Enable RLS (Row Level Security)
ALTER TABLE manual_backtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_backtest_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_backtest_daily_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for manual_backtests
CREATE POLICY "Users can view their own backtests" ON manual_backtests 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backtests" ON manual_backtests 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backtests" ON manual_backtests 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backtests" ON manual_backtests 
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for manual_backtest_trades
CREATE POLICY "Users can view trades from their own backtests" ON manual_backtest_trades 
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM manual_backtests 
        WHERE manual_backtests.id = manual_backtest_trades.backtest_id 
        AND manual_backtests.user_id = auth.uid()
    ));

CREATE POLICY "Users can create trades in their own backtests" ON manual_backtest_trades 
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM manual_backtests 
        WHERE manual_backtests.id = manual_backtest_trades.backtest_id 
        AND manual_backtests.user_id = auth.uid()
    ));

CREATE POLICY "Users can update trades in their own backtests" ON manual_backtest_trades 
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM manual_backtests 
        WHERE manual_backtests.id = manual_backtest_trades.backtest_id 
        AND manual_backtests.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete trades from their own backtests" ON manual_backtest_trades 
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM manual_backtests 
        WHERE manual_backtests.id = manual_backtest_trades.backtest_id 
        AND manual_backtests.user_id = auth.uid()
    ));

-- RLS Policies for manual_backtest_daily_metrics
CREATE POLICY "Users can view daily metrics from their own backtests" ON manual_backtest_daily_metrics 
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM manual_backtests 
        WHERE manual_backtests.id = manual_backtest_daily_metrics.backtest_id 
        AND manual_backtests.user_id = auth.uid()
    ));

CREATE POLICY "System can create daily metrics" ON manual_backtest_daily_metrics 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update daily metrics" ON manual_backtest_daily_metrics 
    FOR UPDATE USING (true);

-- Function to calculate and update backtest metrics
CREATE OR REPLACE FUNCTION update_backtest_metrics(backtest_uuid UUID)
RETURNS void AS $$
DECLARE
    total_trades_count INTEGER;
    winning_trades_count INTEGER;
    losing_trades_count INTEGER;
    total_pnl_amount DECIMAL(15,2);
    current_balance_amount DECIMAL(15,2);
    initial_capital_amount DECIMAL(15,2);
    largest_win_amount DECIMAL(15,2);
    largest_loss_amount DECIMAL(15,2);
    avg_win_amount DECIMAL(10,2);
    avg_loss_amount DECIMAL(10,2);
    gross_profit DECIMAL(15,2);
    gross_loss DECIMAL(15,2);
    win_rate_percent DECIMAL(5,2);
    profit_factor_calc DECIMAL(8,2);
    total_pnl_percent_calc DECIMAL(8,2);
BEGIN
    -- Get initial capital
    SELECT initial_capital INTO initial_capital_amount
    FROM manual_backtests 
    WHERE id = backtest_uuid;
    
    -- Calculate basic metrics
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN pnl > 0 THEN 1 END),
        COUNT(CASE WHEN pnl < 0 THEN 1 END),
        COALESCE(SUM(pnl), 0),
        COALESCE(MAX(pnl), 0),
        COALESCE(MIN(pnl), 0),
        COALESCE(SUM(CASE WHEN pnl > 0 THEN pnl END), 0),
        COALESCE(ABS(SUM(CASE WHEN pnl < 0 THEN pnl END)), 0)
    INTO 
        total_trades_count,
        winning_trades_count,
        losing_trades_count,
        total_pnl_amount,
        largest_win_amount,
        largest_loss_amount,
        gross_profit,
        gross_loss
    FROM manual_backtest_trades
    WHERE backtest_id = backtest_uuid AND status = 'closed';
    
    -- Calculate current balance
    current_balance_amount := initial_capital_amount + total_pnl_amount;
    
    -- Calculate averages
    IF winning_trades_count > 0 THEN
        SELECT AVG(pnl) INTO avg_win_amount
        FROM manual_backtest_trades
        WHERE backtest_id = backtest_uuid AND status = 'closed' AND pnl > 0;
    ELSE
        avg_win_amount := 0;
    END IF;
    
    IF losing_trades_count > 0 THEN
        SELECT AVG(pnl) INTO avg_loss_amount
        FROM manual_backtest_trades
        WHERE backtest_id = backtest_uuid AND status = 'closed' AND pnl < 0;
    ELSE
        avg_loss_amount := 0;
    END IF;
    
    -- Calculate percentages
    IF total_trades_count > 0 THEN
        win_rate_percent := (winning_trades_count::DECIMAL / total_trades_count::DECIMAL) * 100;
    ELSE
        win_rate_percent := 0;
    END IF;
    
    IF gross_loss > 0 THEN
        profit_factor_calc := gross_profit / gross_loss;
    ELSE
        profit_factor_calc := CASE WHEN gross_profit > 0 THEN 999.99 ELSE 0 END;
    END IF;
    
    IF initial_capital_amount > 0 THEN
        total_pnl_percent_calc := (total_pnl_amount / initial_capital_amount) * 100;
    ELSE
        total_pnl_percent_calc := 0;
    END IF;
    
    -- Update the backtest record
    UPDATE manual_backtests SET
        current_balance = current_balance_amount,
        total_trades = total_trades_count,
        winning_trades = winning_trades_count,
        losing_trades = losing_trades_count,
        win_rate = win_rate_percent,
        total_pnl = total_pnl_amount,
        total_pnl_percent = total_pnl_percent_calc,
        profit_factor = profit_factor_calc,
        largest_win = largest_win_amount,
        largest_loss = largest_loss_amount,
        average_win = avg_win_amount,
        average_loss = avg_loss_amount,
        updated_at = NOW()
    WHERE id = backtest_uuid;
    
END;
$$ LANGUAGE plpgsql;

-- Trigger to update metrics when trades change
CREATE OR REPLACE FUNCTION trigger_update_backtest_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update metrics for the affected backtest
    PERFORM update_backtest_metrics(COALESCE(NEW.backtest_id, OLD.backtest_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_manual_backtest_trades_metrics
    AFTER INSERT OR UPDATE OR DELETE ON manual_backtest_trades
    FOR EACH ROW EXECUTE FUNCTION trigger_update_backtest_metrics();

-- Function to initialize backtest balance
CREATE OR REPLACE FUNCTION initialize_backtest_balance()
RETURNS TRIGGER AS $$
BEGIN
    NEW.current_balance := NEW.initial_capital;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize balance on backtest creation
CREATE TRIGGER trigger_initialize_backtest_balance
    BEFORE INSERT ON manual_backtests
    FOR EACH ROW EXECUTE FUNCTION initialize_backtest_balance();

-- Comments for documentation
COMMENT ON TABLE manual_backtests IS 'Manual backtesting sessions created by users';
COMMENT ON TABLE manual_backtest_trades IS 'Individual trades within manual backtests';
COMMENT ON TABLE manual_backtest_daily_metrics IS 'Daily performance tracking for manual backtests';

-- Migration tamamlandı!
-- Aşağıdaki mesajı görürseniz migration başarılı demektir:
SELECT 'Manuel Backtest Sistemi başarıyla kuruldu! 🎉' as result;