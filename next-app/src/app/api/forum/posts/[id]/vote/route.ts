import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vote_type } = body;

    // Validate vote type
    if (vote_type !== 1 && vote_type !== -1 && vote_type !== null) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    // Check if post exists
    const { data: post } = await supabase
      .from('forum_posts')
      .select('id')
      .eq('id', id)
      .single();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get existing vote
    const { data: existingVote } = await supabase
      .from('forum_post_votes')
      .select('vote_type')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single();

    if (vote_type === null) {
      // Remove vote
      if (existingVote) {
        const { error } = await supabase
          .from('forum_post_votes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error removing vote:', error);
          return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
        }
      }
    } else {
      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('forum_post_votes')
          .update({ vote_type })
          .eq('post_id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating vote:', error);
          return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
        }
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('forum_post_votes')
          .insert({
            post_id: id,
            user_id: user.id,
            vote_type
          });

        if (error) {
          console.error('Error creating vote:', error);
          return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
        }
      }
    }

    // Calculate new vote score from database
    const { data: voteScoreResult, error: voteScoreError } = await supabase
      .from('forum_post_votes')
      .select('vote_type')
      .eq('post_id', id);

    if (voteScoreError) {
      console.error('Error fetching votes for calculation:', voteScoreError);
      return NextResponse.json({ error: 'Failed to calculate vote score' }, { status: 500 });
    }

    const newVoteScore = voteScoreResult?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0;

    // Update post vote score in database (if posts table has vote_score column)
    // Note: Uncomment if forum_posts table has vote_score column
    // const { error: updateScoreError } = await supabase
    //   .from('forum_posts')
    //   .update({ vote_score: newVoteScore })
    //   .eq('id', id);
    // 
    // if (updateScoreError) {
    //   console.error('Error updating post vote score:', updateScoreError);
    // }

    return NextResponse.json({ 
      success: true,
      vote_type, 
      vote_score: newVoteScore,
      total_votes: voteScoreResult?.length || 0
    });
  } catch (error) {
    console.error('Error in vote route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}