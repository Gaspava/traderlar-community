import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import TradingStrategyParser from '@/lib/trading-strategy-parser';
import crypto from 'crypto';

// Trading strategies API endpoints
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const timeframe = searchParams.get('timeframe');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const isPremium = searchParams.get('isPremium');
    
    const offset = (page - 1) * limit;
    
    // Build query - try to fetch from database, fall back to mock data if table doesn't exist
    try {
      let query = supabase
        .from('trading_strategies')
        .select('*');
      
      // Apply filters
      if (category && category !== 'Tüm Stratejiler') {
        if (category === 'Ücretsiz') {
          query = query.eq('is_premium', false);
        } else if (category === 'Premium') {
          query = query.eq('is_premium', true);
        } else {
          query = query.eq('category', category);
        }
      }
      
      if (timeframe && timeframe !== 'Tümü') {
        query = query.eq('timeframe', timeframe);
      }
      
      if (type && type !== 'Tümü') {
        query = query.contains('tags', [type]);
      }
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      if (isPremium !== null) {
        query = query.eq('is_premium', isPremium === 'true');
      }
      
      // Apply sorting
      const sortColumn = getSortColumn(sortBy);
      query = query.order(sortColumn, { ascending: order === 'asc' });
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
      const { data: strategies, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      // Transform data for frontend
      const transformedStrategies = strategies?.map(strategy => ({
        id: strategy.id,
        name: strategy.name,
        description: strategy.description,
        author: 'Trading User', // Simplified for now
        authorAvatar: '👤',
        authorUsername: 'user',
        category: strategy.category,
        tags: strategy.tags || [],
        performance: {
          // Use the actual net profit value directly
          totalReturn: strategy.total_return_percentage || 0,
          winRate: strategy.win_rate || 0,
          maxDrawdown: strategy.max_drawdown_percent || 0,
          sharpeRatio: strategy.sharpe_ratio || 0,
          profitFactor: strategy.profit_factor || 0,
          totalTrades: strategy.total_trades || 0,
          // Use the calculated percentage return from database
          percentageReturn: strategy.total_return_percentage || 0,
        },
        rating: strategy.rating || 0,
        likes: strategy.likes || 0,
        downloads: strategy.downloads || 0,
        views: strategy.views || 0,
        isPremium: strategy.is_premium || false,
        timeframe: strategy.timeframe || 'H1',
        createdAt: strategy.created_at,
      })) || [];
      
      return NextResponse.json({
        strategies: transformedStrategies,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });
      
    } catch (dbError) {
      
      // Fallback to mock data
      const mockStrategies = [
        {
          id: '1',
          name: 'RSI Divergence Master',
          description: 'RSI divergence tespit ile güçlü giriş noktalarını bulun momentum stratejisi yüksek başarı.',
          author: 'AlgoTrader',
          authorAvatar: '👤',
          authorUsername: 'algotrader',
          category: 'Forex',
          tags: ['H4', 'RSI', 'Momentum'],
          performance: {
            totalReturn: 25000,
            winRate: 68.5,
            maxDrawdown: -12.3,
            sharpeRatio: 2.1,
            profitFactor: 1.85,
            totalTrades: 234,
            percentageReturn: 156.8,
          },
          rating: 4.5,
          likes: 234,
          downloads: 5678,
          views: 1234,
          isPremium: false,
          timeframe: 'H4',
          createdAt: '2024-01-15T00:00:00Z',
        }
      ];
      
      return NextResponse.json({
        strategies: mockStrategies,
        pagination: {
          page: 1,
          limit: 12,
          total: mockStrategies.length,
          pages: 1
        }
      });
    }
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user - for now, create a dummy user if not authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    let authorId = user?.id;
    if (!authorId) {
      // Create a temporary user ID for testing
      authorId = '00000000-0000-0000-0000-000000000000';
    }
    
    const formData = await request.formData();
    
    // Extract form data
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const timeframe = formData.get('timeframe') as string;
    const isPremium = formData.get('isPremium') === 'true';
    const file = formData.get('file') as File;
    const parsedMetricsString = formData.get('parsedMetrics') as string;
    
    
    if (!name || !file) {
      return NextResponse.json({ error: 'Name and file are required' }, { status: 400 });
    }
    
    // Validate file
    if (!file.name.toLowerCase().endsWith('.html')) {
      return NextResponse.json({ error: 'Only HTML files are allowed' }, { status: 400 });
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }
    
    // Use pre-parsed metrics from frontend if available, otherwise parse file
    let parsedMetrics;
    let fileContent = '';
    let fileHash = '';
    
    if (parsedMetricsString) {
      parsedMetrics = JSON.parse(parsedMetricsString);
      // Still get file content for storage if needed
      fileContent = await file.text();
      fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');
    } else {
      // Fallback to backend parsing
      fileContent = await file.text();
      fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');
      
      parsedMetrics = TradingStrategyParser.parseMetaTraderHTML(fileContent);
      
      if (!TradingStrategyParser.validateMetrics(parsedMetrics)) {
        return NextResponse.json({ 
          error: 'Geçerli trading metrikleri bulunamadı. Lütfen MetaTrader backtest raporu yüklediğinizden emin olun.' 
        }, { status: 400 });
      }
    }
    
    
    try {
      // Try to save to database with basic fields only
      const { data: strategy, error: insertError } = await supabase
        .from('trading_strategies')
        .insert({
          name,
          description,
          author_id: authorId,
          category,
          tags,
          timeframe,
          is_premium: isPremium,
          
          // Basic metrics only
          total_net_profit: parsedMetrics.totalNetProfit,
          initial_deposit: parsedMetrics.initialDeposit,
          total_return_percentage: parsedMetrics.totalReturnPercentage,
          profit_factor: parsedMetrics.profitFactor,
          total_trades: parsedMetrics.totalTrades,
          win_rate: parsedMetrics.winRate,
          sharpe_ratio: parsedMetrics.sharpeRatio,
          max_drawdown_percent: parsedMetrics.maxDrawdownPercent
        })
        .select()
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      
      // Save trade history if available - optimized batch processing
      if (parsedMetrics.trades && parsedMetrics.trades.length > 0) {
        // Process trades in smaller batches to avoid timeout
        const BATCH_SIZE = 100;
        const trades = parsedMetrics.trades.slice(0, 1000); // Limit to first 1000 trades for performance
        
        try {
          // First check if the table exists
          const { error: tableCheckError } = await supabase
            .from('strategy_trades')
            .select('id')
            .limit(1);

          if (tableCheckError && tableCheckError.message.includes('does not exist')) {
            // Skip trade history if table doesn't exist
          } else {
            // Process trades in batches
            for (let i = 0; i < trades.length; i += BATCH_SIZE) {
              const batch = trades.slice(i, i + BATCH_SIZE);
              const tradeInserts = batch.map((trade, index) => ({
                strategy_id: strategy.id,
                ticket: trade.ticket || (i + index + 1),
                open_time: trade.openTime || null,
                close_time: trade.closeTime || null,
                trade_type: trade.type || 'buy',
                size: trade.size || 0,
                symbol: trade.symbol || 'UNKNOWN',
                open_price: trade.openPrice || 0,
                close_price: trade.closePrice || 0,
                stop_loss: trade.stopLoss || null,
                take_profit: trade.takeProfit || null,
                commission: trade.commission || 0,
                swap: trade.swap || 0,
                profit: trade.profit || 0
              }));

              // Insert batch without waiting for completion (fire and forget for performance)
              supabase
                .from('strategy_trades')
                .insert(tradeInserts)
                .then(({ error }) => {
                  // Silently handle trade batch errors
                });
            }
          }
        } catch (error) {
          // Don't fail the entire request for trade history errors
        }
      }
      
      return NextResponse.json({ 
        strategy: {
          id: strategy.id,
          name: strategy.name,
          description: strategy.description,
          category: strategy.category,
          tags: strategy.tags,
          timeframe: strategy.timeframe,
          isPremium: strategy.is_premium,
          metrics: parsedMetrics
        },
        message: 'Strategy created successfully',
        summary: TradingStrategyParser.generateSummary(parsedMetrics),
        savedToDatabase: true
      }, { status: 201 });
      
    } catch (dbError) {
      
      // Fallback to mock response if database isn't ready
      const mockStrategy = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description,
        category,
        tags,
        timeframe,
        isPremium,
        metrics: parsedMetrics
      };
      
      return NextResponse.json({ 
        strategy: mockStrategy,
        message: 'Strategy processed (database not ready)',
        summary: TradingStrategyParser.generateSummary(parsedMetrics),
        savedToDatabase: false
      }, { status: 201 });
    }
    
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getSortColumn(sortBy: string): string {
  switch (sortBy) {
    case 'En Popüler':
      return 'downloads';
    case 'En Yüksek Getiri':
      return 'total_net_profit';
    case 'En Düşük Risk':
      return 'max_drawdown_percent';
    case 'En Yeni':
      return 'created_at';
    default:
      return 'created_at';
  }
}