import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

    const { data: backtest, error } = await supabase
      .from('manual_backtests')
      .select('*')
      .eq('id', id)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .eq('id', id)
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
      .eq('id', id)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First verify ownership
    const { data: backtest, error: fetchError } = await supabase
      .from('manual_backtests')
      .select('id, name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !backtest) {
      return NextResponse.json({ error: 'Backtest not found or unauthorized' }, { status: 404 });
    }

    // Delete all trades first (foreign key constraint)
    const { error: tradesDeleteError } = await supabase
      .from('manual_backtest_trades')
      .delete()
      .eq('backtest_id', id);

    if (tradesDeleteError) {
      console.error('Error deleting trades:', tradesDeleteError);
      return NextResponse.json({ error: 'Failed to delete trades' }, { status: 500 });
    }

    // Delete the backtest
    const { error: backtestDeleteError } = await supabase
      .from('manual_backtests')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (backtestDeleteError) {
      console.error('Error deleting backtest:', backtestDeleteError);
      return NextResponse.json({ error: 'Failed to delete backtest' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Backtest "${backtest.name}" and all its trades have been deleted successfully` 
    });
  } catch (error) {
    console.error('Error in DELETE /api/manual-backtests/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}