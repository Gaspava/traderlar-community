import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Individual strategy API endpoints
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    // Get strategy with author info
    const { data: strategy, error } = await supabase
      .from('trading_strategies')
      .select(`
        *,
        author:users!trading_strategies_author_id_fkey(
          id,
          username,
          name,
          avatar_url,
          role,
          is_verified,
          bio,
          years_trading,
          trading_style
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
      }
      console.error('Error fetching strategy:', error);
      return NextResponse.json({ error: 'Failed to fetch strategy' }, { status: 500 });
    }
    
    // Increment view count
    await supabase.rpc('increment_strategy_views', { strategy_uuid: id });
    
    // Transform data for frontend
    const transformedStrategy = {
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      longDescription: strategy.description, // For now, use same description
      author: {
        id: strategy.author?.id || '',
        name: strategy.author?.name || 'Unknown',
        username: strategy.author?.username || 'unknown',
        avatar: strategy.author?.avatar_url || '👤',
        verified: strategy.author?.is_verified || false,
        bio: strategy.author?.bio,
        yearsTrading: strategy.author?.years_trading,
        tradingStyle: strategy.author?.trading_style,
        followers: 0, // TODO: Implement follower count
        strategies: 0 // TODO: Implement strategy count
      },
      category: strategy.category,
      tags: strategy.tags || [],
      performance: {
        totalReturn: calculateTotalReturn(strategy.total_net_profit, strategy.gross_profit),
        annualReturn: calculateAnnualReturn(strategy.total_net_profit),
        winRate: strategy.win_rate || 0,
        profitFactor: strategy.profit_factor || 0,
        maxDrawdown: strategy.max_drawdown_percent || 0,
        avgDrawdown: strategy.balance_drawdown_percent || 0,
        sharpeRatio: strategy.sharpe_ratio || 0,
        sortinoRatio: 0, // TODO: Calculate or store
        calmarRatio: 0, // TODO: Calculate or store
        totalTrades: strategy.total_trades || 0,
        winningTrades: strategy.winning_trades || 0,
        losingTrades: strategy.losing_trades || 0,
        avgWin: strategy.average_profit_trade || 0,
        avgLoss: Math.abs(strategy.average_loss_trade || 0),
        largestWin: strategy.largest_profit_trade || 0,
        largestLoss: Math.abs(strategy.largest_loss_trade || 0),
        avgTradeDuration: '4.2 saat' // TODO: Calculate from data
      },
      // Generate mock chart data based on performance
      equityCurve: generateEquityCurve(strategy.total_net_profit || 0),
      monthlyReturns: generateMonthlyReturns(),
      drawdownChart: generateDrawdownChart(strategy.max_drawdown_percent || 0),
      tradeHistory: generateTradeHistory(strategy.winning_trades || 0, strategy.losing_trades || 0),
      rating: strategy.rating || 0,
      reviews: strategy.rating_count || 0,
      likes: strategy.likes || 0,
      downloads: strategy.downloads || 0,
      views: strategy.views || 0,
      isPremium: strategy.is_premium || false,
      price: 0, // TODO: Implement pricing
      timeframe: strategy.timeframe || 'H1',
      createdAt: strategy.created_at,
      updatedAt: strategy.updated_at,
      requirements: [
        'MetaTrader 4/5',
        'Minimum 1000$ sermaye',
        'VPS önerilir',
        'Temel teknik analiz bilgisi'
      ],
      riskLevel: calculateRiskLevel(strategy.max_drawdown_percent || 0),
      minCapital: 1000, // TODO: Calculate based on metrics
      backtestPeriod: '2020-2024 (4 yıl)', // TODO: Extract from data
      forwardTestPeriod: '6 ay' // TODO: Extract from data
    };
    
    return NextResponse.json(transformedStrategy);
    
  } catch (error) {
    console.error('Error in GET /api/trading-strategies/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user owns the strategy
    const { data: strategy, error: fetchError } = await supabase
      .from('trading_strategies')
      .select('author_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch strategy' }, { status: 500 });
    }
    
    if (strategy.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Delete strategy
    const { error: deleteError } = await supabase
      .from('trading_strategies')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting strategy:', deleteError);
      return NextResponse.json({ error: 'Failed to delete strategy' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Strategy deleted successfully' });
    
  } catch (error) {
    console.error('Error in DELETE /api/trading-strategies/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function calculateTotalReturn(netProfit?: number, grossProfit?: number): number {
  if (netProfit) return Number((netProfit / 10000 * 100).toFixed(1));
  if (grossProfit) return Number((grossProfit / 10000 * 100).toFixed(1));
  return 0;
}

function calculateAnnualReturn(netProfit?: number): number {
  if (netProfit) return Number((netProfit / 10000 * 100 / 4).toFixed(1)); // Assuming 4 years
  return 0;
}

function calculateRiskLevel(maxDrawdown: number): 'Low' | 'Medium' | 'High' {
  const absDrawdown = Math.abs(maxDrawdown);
  if (absDrawdown <= 10) return 'Low';
  if (absDrawdown <= 20) return 'Medium';
  return 'High';
}

function generateEquityCurve(totalNetProfit: number) {
  const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', 
                 '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];
  
  return months.map((month, index) => {
    const progress = (index + 1) / months.length;
    const equity = 10000 + (totalNetProfit * progress) + (Math.random() * 1000 - 500);
    const benchmark = 10000 + (1000 * progress); // 10% annual return
    
    return {
      date: month,
      equity: Number(equity.toFixed(0)),
      benchmark: Number(benchmark.toFixed(0))
    };
  });
}

function generateMonthlyReturns() {
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  
  return months.map(month => ({
    month,
    return: Number((Math.random() * 20 - 5).toFixed(1)) // -5% to 15%
  }));
}

function generateDrawdownChart(maxDrawdown: number) {
  const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', 
                 '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];
  
  return months.map(month => ({
    date: month,
    drawdown: Number((Math.random() * Math.abs(maxDrawdown)).toFixed(1)) * -1
  }));
}

function generateTradeHistory(winningTrades: number, losingTrades: number) {
  const trades = [];
  const totalTrades = Math.min(winningTrades + losingTrades, 10); // Show last 10 trades
  
  for (let i = 0; i < totalTrades; i++) {
    const isWin = Math.random() < (winningTrades / (winningTrades + losingTrades));
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    trades.push({
      date: date.toISOString().split('T')[0],
      type: Math.random() > 0.5 ? 'buy' as const : 'sell' as const,
      result: isWin ? 'win' as const : 'loss' as const,
      pnl: isWin ? Number((Math.random() * 5 + 0.5).toFixed(1)) : Number((Math.random() * -3 - 0.5).toFixed(1)),
      duration: `${(Math.random() * 8 + 1).toFixed(1)}h`
    });
  }
  
  return trades;
}