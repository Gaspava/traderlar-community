import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { UpdateTradeData } from '@/lib/supabase/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tradeId: string }> }
) {
  try {
    const { id, tradeId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify backtest ownership and get trade
    const { data: trade, error: tradeError } = await supabase
      .from('manual_backtest_trades')
      .select(`
        *,
        manual_backtests!inner(id, user_id, status)
      `)
      .eq('id', tradeId)
      .eq('backtest_id', id)
      .single();

    if (tradeError || !trade || (trade as any).manual_backtests.user_id !== user.id) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    const body: UpdateTradeData = await request.json();

    // Validate exit data if provided
    if (body.exit_price !== undefined) {
      if (body.exit_price <= 0) {
        return NextResponse.json({ error: 'Exit price must be greater than 0' }, { status: 400 });
      }

      if (!body.exit_date || !body.exit_time) {
        return NextResponse.json({ error: 'Exit date and time are required' }, { status: 400 });
      }
    }

    // Calculate P&L if closing the trade
    let pnl = trade.pnl;
    let pnlPercent = trade.pnl_percent;
    let status = trade.status;
    let durationMinutes = trade.duration_minutes;

    if (body.exit_price && body.exit_date && body.exit_time && trade.status === 'open') {
      // Use manual P&L from frontend if provided (for RR-based trades)
      if (body.manual_pnl !== undefined && body.manual_pnl !== null) {
        pnl = Number(body.manual_pnl.toFixed(2));
        pnlPercent = Number(((pnl / trade.risk_amount) * 100).toFixed(2));
      } else {
        // Fallback: For manual backtests, use RR-based calculation if it's a TP/SL exit
        if (body.exit_reason === 'tp' || body.exit_reason === 'sl') {
          // RR-based P&L calculation for manual backtests
          if (body.exit_reason === 'tp') {
            // Win: Risk amount × RR ratio
            pnl = Number((trade.risk_amount * trade.risk_reward_ratio).toFixed(2));
          } else {
            // Loss: Negative risk amount
            pnl = Number((-trade.risk_amount).toFixed(2));
          }
          pnlPercent = Number(((pnl / trade.risk_amount) * 100).toFixed(2));
        } else {
          // Manual exit: Calculate based on price difference
          const priceDiff = trade.trade_type === 'long' 
            ? body.exit_price - trade.entry_price
            : trade.entry_price - body.exit_price;
          
          pnl = Number((priceDiff * trade.position_size).toFixed(2));
          pnlPercent = Number(((pnl / trade.risk_amount) * 100).toFixed(2));
        }
      }
      
      status = 'closed';

      // Calculate duration
      const entryDateTime = new Date(`${trade.entry_date}T${trade.entry_time}`);
      const exitDateTime = new Date(`${body.exit_date}T${body.exit_time}`);
      durationMinutes = Math.floor((exitDateTime.getTime() - entryDateTime.getTime()) / (1000 * 60));
    }

    // Update the trade
    const { data: updatedTrade, error } = await supabase
      .from('manual_backtest_trades')
      .update({
        exit_date: body.exit_date,
        exit_time: body.exit_time,
        exit_price: body.exit_price,
        exit_reason: body.exit_reason,
        exit_notes: body.exit_notes?.trim() || null,
        pnl,
        pnl_percent: pnlPercent,
        duration_minutes: durationMinutes,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', tradeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating trade:', error);
      return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
    }

    return NextResponse.json({ trade: updatedTrade });
  } catch (error) {
    console.error('Error in PUT /api/manual-backtests/[id]/trades/[tradeId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tradeId: string }> }
) {
  try {
    const { id, tradeId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership and delete
    const { data: trade, error: fetchError } = await supabase
      .from('manual_backtest_trades')
      .select(`
        id,
        manual_backtests!inner(id, user_id)
      `)
      .eq('id', tradeId)
      .eq('backtest_id', id)
      .single();

    if (fetchError || !trade || (trade as any).manual_backtests.user_id !== user.id) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('manual_backtest_trades')
      .delete()
      .eq('id', tradeId);

    if (error) {
      console.error('Error deleting trade:', error);
      return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/manual-backtests/[id]/trades/[tradeId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}