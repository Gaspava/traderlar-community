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
    
    // Build query
    let query = supabase
      .from('trading_strategies')
      .select(`
        *,
        author:users!trading_strategies_author_id_fkey(
          id,
          username,
          name,
          avatar_url,
          role,
          is_verified
        )
      `);
    
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
      
      return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 });
    }
    
    // Transform data for frontend
    const transformedStrategies = strategies?.map(strategy => ({
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      author: strategy.author?.name || 'Unknown',
      authorAvatar: strategy.author?.avatar_url || '👤',
      authorUsername: strategy.author?.username || 'unknown',
      category: strategy.category,
      tags: strategy.tags || [],
      performance: {
        totalReturn: strategy.total_net_profit || 0,
        winRate: strategy.win_rate || 0,
        maxDrawdown: strategy.max_drawdown_percent || 0,
        sharpeRatio: strategy.sharpe_ratio || 0,
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
    
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    
    // Read and parse file
    const fileContent = await file.text();
    const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');
    
    // Check for duplicate
    const { data: existingStrategy } = await supabase
      .from('trading_strategies')
      .select('id')
      .eq('file_hash', fileHash)
      .single();
    
    if (existingStrategy) {
      return NextResponse.json({ error: 'Bu dosya daha önce yüklenmiş' }, { status: 409 });
    }
    
    // Parse metrics
    const parsedMetrics = TradingStrategyParser.parseMetaTraderHTML(fileContent);
    
    if (!TradingStrategyParser.validateMetrics(parsedMetrics)) {
      return NextResponse.json({ 
        error: 'Geçerli trading metrikleri bulunamadı. Lütfen MetaTrader backtest raporu yüklediğinizden emin olun.' 
      }, { status: 400 });
    }
    
    // Insert strategy
    const { data: strategy, error: insertError } = await supabase
      .from('trading_strategies')
      .insert({
        name,
        description,
        author_id: user.id,
        category,
        tags,
        timeframe,
        is_premium: isPremium,
        
        // Performance metrics
        total_net_profit: parsedMetrics.totalNetProfit,
        gross_profit: parsedMetrics.grossProfit,
        gross_loss: parsedMetrics.grossLoss,
        profit_factor: parsedMetrics.profitFactor,
        expected_payoff: parsedMetrics.expectedPayoff,
        
        // Risk metrics
        max_drawdown_absolute: parsedMetrics.maxDrawdownAbsolute,
        max_drawdown_percent: parsedMetrics.maxDrawdownPercent,
        balance_drawdown_absolute: parsedMetrics.balanceDrawdownAbsolute,
        balance_drawdown_percent: parsedMetrics.balanceDrawdownPercent,
        equity_drawdown_absolute: parsedMetrics.equityDrawdownAbsolute,
        equity_drawdown_percent: parsedMetrics.equityDrawdownPercent,
        
        // Trade statistics
        total_trades: parsedMetrics.totalTrades,
        winning_trades: parsedMetrics.winningTrades,
        losing_trades: parsedMetrics.losingTrades,
        win_rate: parsedMetrics.winRate,
        largest_profit_trade: parsedMetrics.largestProfitTrade,
        largest_loss_trade: parsedMetrics.largestLossTrade,
        average_profit_trade: parsedMetrics.averageProfitTrade,
        average_loss_trade: parsedMetrics.averageLossTrade,
        
        // Additional metrics
        sharpe_ratio: parsedMetrics.sharpeRatio,
        recovery_factor: parsedMetrics.recoveryFactor,
        
        // Consecutive statistics
        max_consecutive_wins: parsedMetrics.maxConsecutiveWins,
        max_consecutive_losses: parsedMetrics.maxConsecutiveLosses,
        max_consecutive_wins_amount: parsedMetrics.maxConsecutiveWinsAmount,
        max_consecutive_losses_amount: parsedMetrics.maxConsecutiveLossesAmount,
        avg_consecutive_wins: parsedMetrics.avgConsecutiveWins,
        avg_consecutive_losses: parsedMetrics.avgConsecutiveLosses,
        
        // File information
        original_filename: file.name,
        file_size: file.size,
        file_hash: fileHash,
        raw_html_data: fileContent
      })
      .select()
      .single();
    
    if (insertError) {
      
      return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      strategy,
      message: 'Strategy created successfully',
      summary: TradingStrategyParser.generateSummary(parsedMetrics)
    }, { status: 201 });
    
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