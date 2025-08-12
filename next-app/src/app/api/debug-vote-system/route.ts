import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Authentication failed',
        user: null,
        authError: authError?.message
      });
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Test vote permissions - try to read votes
    const { data: voteTest, error: voteReadError } = await supabase
      .from('forum_topic_votes')
      .select('*')
      .limit(5);
    
    // Test if user can insert votes
    let insertTest = null;
    let insertError = null;
    
    try {
      const { data: testInsert, error: testInsertError } = await supabase
        .from('forum_topic_votes')
        .insert({
          topic_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          user_id: user.id,
          vote_type: 1
        })
        .select()
        .single();
      
      insertTest = testInsert;
      insertError = testInsertError;
      
      // Clean up test insert if successful
      if (testInsert) {
        await supabase
          .from('forum_topic_votes')
          .delete()
          .eq('id', testInsert.id);
      }
    } catch (e) {
      insertError = e;
    }
    
    // Get sample topic for real test
    const { data: sampleTopic } = await supabase
      .from('forum_topics')
      .select('id, title, vote_score')
      .limit(1)
      .single();
    
    // Try to get existing vote for sample topic
    let existingVote = null;
    let existingVoteError = null;
    
    if (sampleTopic) {
      const { data: vote, error: voteError } = await supabase
        .from('forum_topic_votes')
        .select('*')
        .eq('topic_id', sampleTopic.id)
        .eq('user_id', user.id)
        .single();
      
      existingVote = vote;
      existingVoteError = voteError;
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        auth: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          profile: profile,
          profileError: profileError?.message
        },
        database: {
          canReadVotes: !voteReadError,
          voteReadError: voteReadError?.message,
          voteCount: voteTest?.length || 0,
          
          canInsertVotes: !insertError,
          insertError: insertError?.message || insertError,
          
          sampleTopic: sampleTopic,
          existingVote: existingVote,
          existingVoteError: existingVoteError?.message
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}