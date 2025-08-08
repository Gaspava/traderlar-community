import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Create the trading_strategies table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS trading_strategies (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        category VARCHAR(50) DEFAULT 'Other',
        tags TEXT[] DEFAULT '{}',
        timeframe VARCHAR(10),
        is_premium BOOLEAN DEFAULT false,
        
        total_net_profit DECIMAL(15, 2),
        gross_profit DECIMAL(15, 2),
        gross_loss DECIMAL(15, 2),
        profit_factor DECIMAL(8, 2),
        expected_payoff DECIMAL(10, 2),
        
        max_drawdown_absolute DECIMAL(15, 2),
        max_drawdown_percent DECIMAL(8, 2),
        balance_drawdown_absolute DECIMAL(15, 2),
        balance_drawdown_percent DECIMAL(8, 2),
        equity_drawdown_absolute DECIMAL(15, 2),
        equity_drawdown_percent DECIMAL(8, 2),
        
        total_trades INTEGER,
        winning_trades INTEGER,
        losing_trades INTEGER,
        win_rate DECIMAL(5, 2),
        largest_profit_trade DECIMAL(15, 2),
        largest_loss_trade DECIMAL(15, 2),
        average_profit_trade DECIMAL(10, 2),
        average_loss_trade DECIMAL(10, 2),
        
        sharpe_ratio DECIMAL(8, 3),
        recovery_factor DECIMAL(8, 2),
        calmar_ratio DECIMAL(8, 3),
        sortino_ratio DECIMAL(8, 3),
        
        max_consecutive_wins INTEGER,
        max_consecutive_losses INTEGER,
        max_consecutive_wins_amount DECIMAL(15, 2),
        max_consecutive_losses_amount DECIMAL(15, 2),
        avg_consecutive_wins DECIMAL(5, 2),
        avg_consecutive_losses DECIMAL(5, 2),
        
        views INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        
        original_filename VARCHAR(255),
        file_size INTEGER,
        file_hash VARCHAR(64),
        raw_html_data TEXT,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error } = await supabase.rpc('exec_sql', { query: createTableQuery });
    
    if (error) {
      console.error('Error creating table:', error);
      return NextResponse.json({ 
        error: 'Failed to create table', 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Table created successfully',
      success: true
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}