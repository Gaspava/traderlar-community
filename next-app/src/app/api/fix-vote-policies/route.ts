import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Check current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    // Only allow admin to run this
    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Vote policies fix SQL ready',
      note: 'Please run the following SQL in your Supabase SQL Editor:',
      sql: `
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all votes" ON forum_topic_votes;
DROP POLICY IF EXISTS "Users can insert own votes" ON forum_topic_votes;
DROP POLICY IF EXISTS "Users can update own votes" ON forum_topic_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON forum_topic_votes;

-- Create new policies for forum_topic_votes table
CREATE POLICY "Anyone can view votes" ON forum_topic_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert votes" ON forum_topic_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON forum_topic_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON forum_topic_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Make sure RLS is enabled
ALTER TABLE forum_topic_votes ENABLE ROW LEVEL SECURITY;

-- Check if forum_post_votes table exists and fix it too
DROP POLICY IF EXISTS "Users can view all post votes" ON forum_post_votes;
DROP POLICY IF EXISTS "Users can insert own post votes" ON forum_post_votes;
DROP POLICY IF EXISTS "Users can update own post votes" ON forum_post_votes;
DROP POLICY IF EXISTS "Users can delete own post votes" ON forum_post_votes;

CREATE POLICY "Anyone can view post votes" ON forum_post_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert post votes" ON forum_post_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own post votes" ON forum_post_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post votes" ON forum_post_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Make sure RLS is enabled
ALTER TABLE forum_post_votes ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON forum_topic_votes TO authenticated;
GRANT ALL ON forum_post_votes TO authenticated;
      `,
      instructions: [
        "1. Go to your Supabase Dashboard",
        "2. Navigate to SQL Editor", 
        "3. Copy and paste the SQL above",
        "4. Run the SQL script",
        "5. Test voting functionality after running the script"
      ]
    });
    
  } catch (error) {
    console.error('Error preparing vote policies fix:', error);
    return NextResponse.json({
      success: false,
      message: 'Error preparing vote policies fix',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}