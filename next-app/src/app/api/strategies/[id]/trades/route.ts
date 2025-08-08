import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '99999999');
    const sortBy = searchParams.get('sortBy') || 'open_time';
    const order = searchParams.get('order') || 'desc';
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type');
    
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('strategy_trades')
      .select('*')
      .eq('strategy_id', id);
    
    if (symbol) {
      query = query.eq('symbol', symbol);
    }
    
    if (type && (type === 'buy' || type === 'sell')) {
      query = query.eq('trade_type', type);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: order === 'asc' });
    
    let trades: any[] = [];
    let error: any = null;
    let count: any = 0;
    
    // Apply pagination only if limit is reasonable (Supabase range() has limits)
    if (limit < 10000000) { // Normal pagination
      query = query.range(offset, offset + limit - 1);
      console.log(`Using range pagination: ${offset} to ${offset + limit - 1}`);
      
      const result = await query;
      trades = result.data || [];
      error = result.error;
      count = result.count;
    } else {
      console.log('Fetching ALL trades without range limit using multiple queries...');
      
      // For very large datasets, we need to fetch in chunks to avoid Supabase limits
      let allTrades: any[] = [];
      let currentOffset = 0;
      const chunkSize = 1000; // Supabase default limit
      let hasMoreData = true;
      
      while (hasMoreData) {
        console.log(`Fetching chunk: offset ${currentOffset}, limit ${chunkSize}`);
        
        let chunkQuery = supabase
          .from('strategy_trades')
          .select('*')
          .eq('strategy_id', id)
          .order(sortBy, { ascending: order === 'asc' })
          .range(currentOffset, currentOffset + chunkSize - 1);
          
        if (symbol) {
          chunkQuery = chunkQuery.eq('symbol', symbol);
        }
        
        if (type && (type === 'buy' || type === 'sell')) {
          chunkQuery = chunkQuery.eq('trade_type', type);
        }
        
        const { data: chunkTrades, error: chunkError } = await chunkQuery;
        
        if (chunkError) {
          error = chunkError;
          break;
        }
        
        if (chunkTrades && chunkTrades.length > 0) {
          allTrades = allTrades.concat(chunkTrades);
          currentOffset += chunkSize;
          
          // If we got less than chunkSize, we've reached the end
          if (chunkTrades.length < chunkSize) {
            hasMoreData = false;
          }
        } else {
          hasMoreData = false;
        }
      }
      
      console.log(`Fetched total of ${allTrades.length} trades`);
      trades = allTrades;
      count = allTrades.length;
    }
    
    if (error) {
      console.error('Error fetching trades:', error);
      console.error('Error details:', error.message, error.details);
      
      // If table doesn't exist, return empty result instead of error
      if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
        console.log('strategy_trades table does not exist, returning empty trades');
        return NextResponse.json({
          trades: [],
          pagination: {
            page: 1,
            limit: limit,
            total: 0,
            pages: 0
          }
        });
      }
      
      return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
    }
    
    console.log(`Found ${trades?.length || 0} trades for strategy ${id}`);
    
    // Sort trades by open_time to ensure chronological order (oldest first for numbering)
    const sortedTradesForNumbering = [...(trades || [])].sort((a, b) => 
      new Date(a.open_time).getTime() - new Date(b.open_time).getTime()
    );
    
    // Create a map of trade ID to sequential number (oldest = 1)
    const tradeNumberMap = new Map();
    sortedTradesForNumbering.forEach((trade, index) => {
      tradeNumberMap.set(trade.id, index + 1);
    });
    
    // Transform data for frontend
    const transformedTrades = trades?.map(trade => ({
      id: trade.id,
      ticket: trade.ticket,
      tradeNumber: tradeNumberMap.get(trade.id), // Sequential number starting from 1 for oldest
      openTime: trade.open_time,
      closeTime: trade.close_time,
      type: trade.trade_type,
      size: trade.size,
      symbol: trade.symbol,
      openPrice: trade.open_price,
      closePrice: trade.close_price,
      stopLoss: trade.stop_loss,
      takeProfit: trade.take_profit,
      commission: trade.commission,
      swap: trade.swap,
      profit: trade.profit,
      duration: trade.close_time && trade.open_time 
        ? Math.round((new Date(trade.close_time).getTime() - new Date(trade.open_time).getTime()) / (1000 * 60)) // minutes
        : null
    })) || [];
    
    return NextResponse.json({
      trades: transformedTrades,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/strategies/[id]/trades:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}