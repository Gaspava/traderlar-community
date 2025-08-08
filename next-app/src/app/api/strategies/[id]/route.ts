import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Fetch strategy from database
    const { data: strategy, error } = await supabase
      .from('trading_strategies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !strategy) {
      console.log('Strategy fetch error:', error);
      console.log('Error details:', error?.message, error?.details);
      
      // If database table doesn't exist, return mock data
      if (error?.message?.includes('does not exist') || error?.code === 'PGRST116') {
        console.log('Database table not found, returning mock strategy data');
        return NextResponse.json({
          id: id,
          name: 'Demo Strategy',
          description: 'Demo strategy - database not ready yet',
          longDescription: 'This is a demo strategy shown because the database is not ready yet.',
          author: {
            id: 'demo',
            name: 'Demo User',
            username: 'demo',
            avatar: '👤',
            verified: false,
            followers: 0,
            strategies: 1
          },
          category: 'Demo',
          tags: ['Demo'],
          performance: {
            totalReturn: 25.5,
            annualReturn: 12.8,
            winRate: 65.0,
            profitFactor: 1.5,
            maxDrawdown: -8.5,
            avgDrawdown: -3.2,
            sharpeRatio: 1.8,
            sortinoRatio: 2.1,
            calmarRatio: 1.5,
            totalTrades: 150,
            winningTrades: 98,
            losingTrades: 52,
            avgWin: 2.1,
            avgLoss: -1.2,
            largestWin: 8.5,
            largestLoss: -4.2,
            avgTradeDuration: '2.5 hours',
            totalNetProfit: 2550,
            initialDeposit: 10000
          },
          equityCurve: [],
          monthlyReturns: [],
          drawdownChart: [],
          tradeHistory: [],
          rating: 4.0,
          reviews: 0,
          likes: 45,
          downloads: 123,
          views: 456,
          isPremium: false,
          price: 0,
          timeframe: 'H1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          requirements: [
            'MetaTrader 4/5',
            'Minimum 1000$ sermaye',
            'VPS önerilir',
            'Temel teknik analiz bilgisi'
          ],
          riskLevel: 'Medium',
          minCapital: 1000,
          backtestPeriod: '2020-2024 (4 yıl)',
          forwardTestPeriod: '6 ay'
        });
      }
      
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }
    
    console.log('Raw strategy data from database:', {
      id: strategy.id,
      total_trades: strategy.total_trades,
      win_rate: strategy.win_rate,
      max_drawdown_percent: strategy.max_drawdown_percent,
      total_net_profit: strategy.total_net_profit,
      initial_deposit: strategy.initial_deposit,
      total_return_percentage: strategy.total_return_percentage,
      profit_factor: strategy.profit_factor,
      sharpe_ratio: strategy.sharpe_ratio
    });
    
    const totalTrades = strategy.total_trades || 0;
    console.log('Total trades value:', totalTrades, 'Type:', typeof totalTrades);
    
    // Transform data for frontend
    const transformedStrategy = {
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      longDescription: strategy.long_description || strategy.description,
      author: {
        id: strategy.author_id || 'anonymous',
        name: 'Trading User',
        username: 'user',
        avatar: '👤',
        verified: false,
        followers: 0,
        strategies: 1
      },
      category: strategy.category,
      tags: strategy.tags || [],
      performance: {
        // Use the properly calculated total return percentage from database
        totalReturn: strategy.total_return_percentage || 0,
        annualReturn: strategy.total_return_percentage ? Math.round((strategy.total_return_percentage / 4) * 10) / 10 : 0, // Rough estimate: total return / 4 years
        winRate: strategy.win_rate || 0,
        profitFactor: strategy.profit_factor || 0,
        maxDrawdown: strategy.max_drawdown_percent || 0,
        avgDrawdown: 0, // Calculate if needed
        sharpeRatio: strategy.sharpe_ratio || 0,
        sortinoRatio: 0, // Calculate if needed
        calmarRatio: 0, // Calculate if needed
        totalTrades: totalTrades,
        winningTrades: Math.round(totalTrades * (strategy.win_rate || 0) / 100),
        losingTrades: Math.round(totalTrades * (100 - (strategy.win_rate || 0)) / 100),
        avgWin: 0, // Calculate if needed
        avgLoss: 0, // Calculate if needed
        largestWin: 0, // Calculate if needed
        largestLoss: 0, // Calculate if needed
        avgTradeDuration: 'N/A',
        totalNetProfit: strategy.total_net_profit || 0,
        initialDeposit: strategy.initial_deposit || 0
      },
      equityCurve: [], // Add if stored
      monthlyReturns: [], // Add if stored
      drawdownChart: [], // Add if stored
      tradeHistory: [], // Add if stored
      rating: strategy.rating || 0,
      reviews: 0,
      likes: strategy.likes || 0,
      downloads: strategy.downloads || 0,
      views: strategy.views || 0,
      isPremium: strategy.is_premium || false,
      price: strategy.price || 0,
      timeframe: strategy.timeframe || 'H1',
      createdAt: strategy.created_at,
      updatedAt: strategy.updated_at || strategy.created_at,
      requirements: [
        'MetaTrader 4/5',
        'Minimum 1000$ sermaye',
        'VPS önerilir',
        'Temel teknik analiz bilgisi'
      ],
      riskLevel: 'Medium',
      minCapital: 1000,
      backtestPeriod: '2020-2024 (4 yıl)',
      forwardTestPeriod: '6 ay'
    };
    
    // Increment view count
    await supabase
      .from('trading_strategies')
      .update({ views: (strategy.views || 0) + 1 })
      .eq('id', id);
    
    console.log('Sending response with totalTrades:', transformedStrategy.performance.totalTrades);
    
    return NextResponse.json(transformedStrategy);
    
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}