import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: backtest, error } = await supabase
      .from('manual_backtests')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Backtest not found' }, { status: 404 });
      }
      console.error('Error fetching backtest:', error);
      return NextResponse.json({ error: 'Failed to fetch backtest' }, { status: 500 });
    }

    return NextResponse.json({ backtest });
  } catch (error) {
    console.error('Error in GET /api/manual-backtests/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate ownership
    const { data: existingBacktest, error: fetchError } = await supabase
      .from('manual_backtests')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingBacktest) {
      return NextResponse.json({ error: 'Backtest not found' }, { status: 404 });
    }

    // Update the backtest
    const { data: backtest, error } = await supabase
      .from('manual_backtests')
      .update({
        name: body.name?.trim(),
        description: body.description?.trim() || null,
        status: body.status,
        risk_per_trade_percent: body.risk_per_trade_percent,
        max_risk_percent: body.max_risk_percent,
        commission_per_trade: body.commission_per_trade,
        category: body.category,
        timeframe: body.timeframe,
        market: body.market,
        tags: body.tags,
        end_date: body.end_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating backtest:', error);
      return NextResponse.json({ error: 'Failed to update backtest' }, { status: 500 });
    }

    return NextResponse.json({ backtest });
  } catch (error) {
    console.error('Error in PUT /api/manual-backtests/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate ownership and delete
    const { error } = await supabase
      .from('manual_backtests')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting backtest:', error);
      return NextResponse.json({ error: 'Failed to delete backtest' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/manual-backtests/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}