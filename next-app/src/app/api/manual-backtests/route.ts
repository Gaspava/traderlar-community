import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateManualBacktestData } from '@/lib/supabase/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    
    let query = supabase
      .from('manual_backtests')
      .select('*')
      .eq('user_id', user.id)
      .order(sortBy as any, { ascending: sortBy === 'name' });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: backtests, error } = await query;

    if (error) {
      
      return NextResponse.json({ error: 'Failed to fetch backtests' }, { status: 500 });
    }

    return NextResponse.json({ backtests });
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateManualBacktestData = await request.json();

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!body.initial_capital || body.initial_capital < 100) {
      return NextResponse.json({ error: 'Initial capital must be at least 100' }, { status: 400 });
    }

    // Create the backtest
    const { data: backtest, error } = await supabase
      .from('manual_backtests')
      .insert({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        user_id: user.id,
        initial_capital: body.initial_capital,
        risk_per_trade_percent: body.risk_per_trade_percent || 2,
        max_risk_percent: body.max_risk_percent || 10,
        commission_per_trade: body.commission_per_trade || 0,
        currency: body.currency || 'USD',
        category: body.category || 'Manual',
        timeframe: body.timeframe || 'H1',
        market: body.market || 'Forex',
        tags: body.tags || [],
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      
      return NextResponse.json({ error: 'Failed to create backtest' }, { status: 500 });
    }

    return NextResponse.json({ backtest }, { status: 201 });
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}