import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
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
      .eq('id', params.id)
      .single();

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Get existing vote
    const { data: existingVote } = await supabase
      .from('forum_topic_votes')
      .select('vote_type')
      .eq('topic_id', params.id)
      .eq('user_id', user.id)
      .single();

    let newVoteScore = topic.vote_score;

    if (vote_type === null) {
      // Remove vote
      if (existingVote) {
        const { error } = await supabase
          .from('forum_topic_votes')
          .delete()
          .eq('topic_id', params.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error removing vote:', error);
          return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
        }

        // Update vote score
        newVoteScore -= existingVote.vote_type;
      }
    } else {
      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('forum_topic_votes')
          .update({ vote_type })
          .eq('topic_id', params.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating vote:', error);
          return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
        }

        // Update vote score
        newVoteScore = newVoteScore - existingVote.vote_type + vote_type;
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('forum_topic_votes')
          .insert({
            topic_id: params.id,
            user_id: user.id,
            vote_type
          });

        if (error) {
          console.error('Error creating vote:', error);
          return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
        }

        // Update vote score
        newVoteScore += vote_type;
      }
    }

    // Update topic vote score
    const { error: updateError } = await supabase
      .from('forum_topics')
      .update({ vote_score: newVoteScore })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating vote score:', updateError);
    }

    return NextResponse.json({ 
      vote_type, 
      vote_score: newVoteScore 
    });
  } catch (error) {
    console.error('Error in vote route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}