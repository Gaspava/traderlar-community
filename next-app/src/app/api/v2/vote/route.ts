import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId, voteType } = body;

    // Validate input
    if (!targetType || !targetId || (voteType !== 1 && voteType !== -1 && voteType !== null)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid parameters. targetType (topic/post), targetId, and voteType (1/-1/null) required',
        code: 'INVALID_PARAMS'
      }, { status: 400 });
    }

    if (targetType !== 'topic' && targetType !== 'post') {
      return NextResponse.json({
        success: false,
        error: 'targetType must be "topic" or "post"',
        code: 'INVALID_TARGET_TYPE'
      }, { status: 400 });
    }

    // Verify user exists in users table (for foreign key constraint)
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found. Please try logging out and back in.',
        code: 'USER_PROFILE_MISSING',
        debug: { userId: user.id, userError: userError?.message }
      }, { status:400 });
    }

    // Verify target exists
    const targetTable = targetType === 'topic' ? 'forum_topics' : 'forum_posts';
    const { data: target, error: targetError } = await supabase
      .from(targetTable)
      .select('id, vote_score')
      .eq('id', targetId)
      .single();

    if (targetError || !target) {
      return NextResponse.json({
        success: false,
        error: `Target ${targetType} not found`,
        code: 'TARGET_NOT_FOUND'
      }, { status: 404 });
    }

    const voteTable = targetType === 'topic' ? 'forum_topic_votes' : 'forum_post_votes';
    const targetColumnId = targetType === 'topic' ? 'topic_id' : 'post_id';

    // Get existing vote
    const { data: existingVote, error: existingVoteError } = await supabase
      .from(voteTable)
      .select('id, vote_type')
      .eq(targetColumnId, targetId)
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle to avoid error when no rows found

    let voteOperation = 'none';
    let newVoteScore = target.vote_score || 0;

    // Handle vote logic
    if (voteType === null) {
      // Remove vote
      if (existingVote) {
        const { error: deleteError } = await supabase
          .from(voteTable)
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) {
          
          return NextResponse.json({
            success: false,
            error: 'Failed to remove vote',
            code: 'DELETE_ERROR',
            debug: deleteError.message
          }, { status: 500 });
        }

        newVoteScore -= existingVote.vote_type;
        voteOperation = 'removed';
      }
    } else {
      if (existingVote) {
        // Update existing vote
        if (existingVote.vote_type !== voteType) {
          const { error: updateError } = await supabase
            .from(voteTable)
            .update({ vote_type: voteType, updated_at: new Date().toISOString() })
            .eq('id', existingVote.id);

          if (updateError) {
            
            return NextResponse.json({
              success: false,
              error: 'Failed to update vote',
              code: 'UPDATE_ERROR',
              debug: updateError.message
            }, { status: 500 });
          }

          newVoteScore = newVoteScore - existingVote.vote_type + voteType;
          voteOperation = 'updated';
        }
      } else {
        // Create new vote
        const insertData = {
          [targetColumnId]: targetId,
          user_id: user.id,
          vote_type: voteType
        };

        const { error: insertError } = await supabase
          .from(voteTable)
          .insert(insertData);

        if (insertError) {
          
          return NextResponse.json({
            success: false,
            error: 'Failed to create vote',
            code: 'INSERT_ERROR', 
            debug: insertError.message
          }, { status: 500 });
        }

        newVoteScore += voteType;
        voteOperation = 'created';
      }
    }

    // Update target score if operation was successful and score changed
    if (voteOperation !== 'none' && newVoteScore !== target.vote_score) {
      const { error: updateTargetError } = await supabase
        .from(targetTable)
        .update({ vote_score: newVoteScore })
        .eq('id', targetId);

      if (updateTargetError) {
        
        return NextResponse.json({
          success: false,
          error: 'Failed to update topic score',
          code: 'SCORE_UPDATE_ERROR',
          debug: updateTargetError.message,
          vote_recorded: true
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        voteType: voteType,
        voteScore: newVoteScore,
        operation: voteOperation,
        targetType: targetType,
        targetId: targetId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      debug: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}