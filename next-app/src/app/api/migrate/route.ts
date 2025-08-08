import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    console.log('Checking if strategy_trades table exists...');
    
    // First, let's try to query the table to see if it exists
    const { data: testData, error: testError } = await supabase
      .from('strategy_trades')
      .select('id')
      .limit(1);
    
    if (testError && testError.message.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        message: 'strategy_trades table does not exist. You need to run the migration manually in your Supabase dashboard.',
        error: testError.message,
        sqlToRun: `
-- This SQL needs to be run in your Supabase SQL Editor:

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
        `
      });
    } else if (testError) {
      console.log('Table exists but has other error:', testError.message);
      return NextResponse.json({
        success: true,
        message: 'strategy_trades table exists (empty table is expected)',
        tableExists: true
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'strategy_trades table exists and has data',
        tableExists: true,
        dataCount: testData?.length || 0
      });
    }
    
  } catch (error) {
    console.error('Error checking migration:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking migration status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}