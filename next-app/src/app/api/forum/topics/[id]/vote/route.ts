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

    // Check if topic exists
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('id, vote_score')
      .eq('id', id)
      .single();

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Get existing vote
    const { data: existingVote } = await supabase
      .from('forum_topic_votes')
      .select('vote_type')
      .eq('topic_id', id)
      .eq('user_id', user.id)
      .single();

    // Perform vote operation
    if (vote_type === null) {
      // Remove vote
      if (existingVote) {
        const { error } = await supabase
          .from('forum_topic_votes')
          .delete()
          .eq('topic_id', id)
          .eq('user_id', user.id);

        if (error) {
          return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
        }
      }
    } else {
      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('forum_topic_votes')
          .update({ vote_type })
          .eq('topic_id', id)
          .eq('user_id', user.id);

        if (error) {
          return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
        }
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('forum_topic_votes')
          .insert({
            topic_id: id,
            user_id: user.id,
            vote_type
          });

        if (error) {
          return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
        }
      }
    }

    // Calculate the new vote score from database (reliable source of truth)
    const { data: allVotes, error: voteError } = await supabase
      .from('forum_topic_votes')
      .select('vote_type')
      .eq('topic_id', id);

    if (voteError) {
      return NextResponse.json({ error: 'Failed to calculate vote score' }, { status: 500 });
    }

    // Calculate actual vote score from all votes
    const newVoteScore = allVotes?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0;

    // Update topic vote score with calculated value
    const { error: updateError } = await supabase
      .from('forum_topics')
      .update({ vote_score: newVoteScore })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update topic vote score' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      vote_type, 
      vote_score: newVoteScore,
      total_votes: allVotes?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}