import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const results = {
      authentication: { status: 'OK', user_id: user.id },
      user_profile: { status: 'UNKNOWN', data: null, error: null },
      vote_tables: { status: 'UNKNOWN', topic_votes: false, post_votes: false },
      permissions: { status: 'UNKNOWN', can_insert: false, can_read: false },
      sample_data: { status: 'UNKNOWN', topics: [], votes: [] },
      foreign_keys: { status: 'UNKNOWN', constraints: [] }
    };
    
    // 1. Check user profile
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        results.user_profile = { status: 'OK', data: profile, error: null };
      } else {
        results.user_profile = { status: 'ERROR', data: null, error: profileError?.message || 'Profile not found' };
      }
    } catch (error) {
      results.user_profile = { status: 'ERROR', data: null, error: error instanceof Error ? error.message : 'Profile check failed' };
    }
    
    // 2. Check if vote tables exist
    try {
      const { data: topicVotes, error: topicError } = await supabase
        .from('forum_topic_votes')
        .select('id')
        .limit(1);
      
      results.vote_tables.topic_votes = !topicError;
      
      const { data: postVotes, error: postError } = await supabase
        .from('forum_post_votes')
        .select('id')
        .limit(1);
      
      results.vote_tables.post_votes = !postError;
      
      if (results.vote_tables.topic_votes && results.vote_tables.post_votes) {
        results.vote_tables.status = 'OK';
      } else {
        results.vote_tables.status = 'ERROR';
      }
    } catch (error) {
      results.vote_tables = { status: 'ERROR', topic_votes: false, post_votes: false };
    }
    
    // 3. Test permissions
    try {
      // Test read permission
      const { data: readTest, error: readError } = await supabase
        .from('forum_topic_votes')
        .select('id, vote_type')
        .limit(5);
      
      results.permissions.can_read = !readError;
      
      // Test insert permission with dummy data
      const { data: insertTest, error: insertError } = await supabase
        .from('forum_topic_votes')
        .insert({
          topic_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          user_id: user.id,
          vote_type: 1
        })
        .select()
        .single();
      
      if (insertTest) {
        results.permissions.can_insert = true;
        
        // Clean up test data
        await supabase
          .from('forum_topic_votes')
          .delete()
          .eq('id', insertTest.id);
      } else {
        results.permissions.can_insert = false;
        results.permissions.insert_error = insertError?.message;
      }
      
      if (results.permissions.can_read && results.permissions.can_insert) {
        results.permissions.status = 'OK';
      } else {
        results.permissions.status = 'ERROR';
      }
    } catch (error) {
      results.permissions = { 
        status: 'ERROR', 
        can_insert: false, 
        can_read: false,
        error: error instanceof Error ? error.message : 'Permission test failed'
      };
    }
    
    // 4. Get sample data
    try {
      const { data: topics, error: topicsError } = await supabase
        .from('forum_topics')
        .select('id, title, vote_score, author_id')
        .limit(5);
      
      if (topics) {
        results.sample_data.topics = topics;
        
        // Get votes for these topics
        const topicIds = topics.map(t => t.id);
        const { data: votes } = await supabase
          .from('forum_topic_votes')
          .select('topic_id, user_id, vote_type')
          .in('topic_id', topicIds)
          .limit(10);
        
        results.sample_data.votes = votes || [];
        results.sample_data.status = 'OK';
      } else {
        results.sample_data.status = 'ERROR';
        results.sample_data.error = topicsError?.message;
      }
    } catch (error) {
      results.sample_data.status = 'ERROR';
      results.sample_data.error = error instanceof Error ? error.message : 'Sample data fetch failed';
    }
    
    // 5. Overall status
    const overallStatus = 
      results.authentication.status === 'OK' &&
      results.user_profile.status === 'OK' &&
      results.vote_tables.status === 'OK' &&
      results.permissions.status === 'OK' &&
      results.sample_data.status === 'OK';
    
    return NextResponse.json({
      success: true,
      overall_status: overallStatus ? 'HEALTHY' : 'NEEDS_ATTENTION',
      timestamp: new Date().toISOString(),
      results,
      recommendations: overallStatus ? [
        '✅ Database is properly configured!',
        '✅ Vote system should work correctly',
        '✅ All permissions are set up properly'
      ] : [
        '🔧 Database needs configuration',
        '1. Run /api/rebuild-database to get migration SQL',
        '2. Execute the SQL in Supabase Dashboard',
        '3. Test again with this endpoint'
      ]
    });
    
  } catch (error) {
    console.error('Database verification error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}