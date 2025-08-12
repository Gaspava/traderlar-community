import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateTradeData } from '@/lib/supabase/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify backtest ownership
    const { data: backtest, error: backtestError } = await supabase
      .from('manual_backtests')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (backtestError || !backtest) {
      return NextResponse.json({ error: 'Backtest not found' }, { status: 404 });
    }

    // Fetch trades
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let query = supabase
      .from('manual_backtest_trades')
      .select('*')
      .eq('backtest_id', id)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (limit ? parseInt(limit) - 1 : 49));
    }

    const { data: trades, error } = await query;

    if (error) {
      console.error('Error fetching trades:', error);
      return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
    }

    return NextResponse.json({ trades });
  } catch (error) {
    console.error('Error in GET /api/manual-backtests/[id]/trades:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify backtest ownership
    const { data: backtest, error: backtestError } = await supabase
      .from('manual_backtests')
      .select('id, status, initial_capital')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (backtestError || !backtest) {
      return NextResponse.json({ error: 'Backtest not found' }, { status: 404 });
    }

    if (backtest.status !== 'active') {
      return NextResponse.json({ error: 'Cannot add trades to inactive backtest' }, { status: 400 });
    }

    const body: CreateTradeData = await request.json();

    // Validate required fields
    if (!body.symbol?.trim()) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    if (!body.trade_type || !['long', 'short'].includes(body.trade_type)) {
      return NextResponse.json({ error: 'Valid trade type is required' }, { status: 400 });
    }

    if (!body.position_size || body.position_size <= 0) {
      return NextResponse.json({ error: 'Position size must be greater than 0' }, { status: 400 });
    }

    if (!body.entry_price || body.entry_price <= 0) {
      return NextResponse.json({ error: 'Entry price must be greater than 0' }, { status: 400 });
    }

    if (!body.risk_amount || body.risk_amount <= 0) {
      return NextResponse.json({ error: 'Risk amount must be greater than 0' }, { status: 400 });
    }

    // Calculate risk-reward ratio if both SL and TP are provided
    let riskRewardRatio = null;
    if (body.stop_loss && body.take_profit) {
      const slDistance = Math.abs(body.entry_price - body.stop_loss);
      const tpDistance = Math.abs(body.take_profit - body.entry_price);
      if (slDistance > 0) {
        riskRewardRatio = Number((tpDistance / slDistance).toFixed(2));
      }
    }

    // Create the trade
    const { data: trade, error } = await supabase
      .from('manual_backtest_trades')
      .insert({
        backtest_id: id,
        symbol: body.symbol.trim().toUpperCase(),
        trade_type: body.trade_type,
        position_size: body.position_size,
        entry_date: body.entry_date,
        entry_time: body.entry_time,
        entry_price: body.entry_price,
        stop_loss: body.stop_loss,
        take_profit: body.take_profit,
        risk_amount: body.risk_amount,
        risk_reward_ratio: riskRewardRatio,
        entry_notes: body.entry_notes?.trim() || null,
        status: 'open'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating trade:', error);
      return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 });
    }

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/manual-backtests/[id]/trades:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}