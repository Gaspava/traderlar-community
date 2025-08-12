import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Check current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const migrationSQL = `
-- =====================================================
-- COMPLETE DATABASE REBUILD FOR VOTE SYSTEM
-- =====================================================
-- This script will rebuild the entire vote system from scratch
-- Run this in Supabase SQL Editor as an admin user

-- Step 1: Drop existing vote-related tables and policies
-- =====================================================

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Users can view all votes" ON forum_topic_votes;
DROP POLICY IF EXISTS "Users can insert own votes" ON forum_topic_votes;
DROP POLICY IF EXISTS "Users can update own votes" ON forum_topic_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON forum_topic_votes;
DROP POLICY IF EXISTS "Anyone can view votes" ON forum_topic_votes;
DROP POLICY IF EXISTS "Authenticated users can insert votes" ON forum_topic_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON forum_topic_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON forum_topic_votes;

DROP POLICY IF EXISTS "Users can view all post votes" ON forum_post_votes;
DROP POLICY IF EXISTS "Users can insert own post votes" ON forum_post_votes;
DROP POLICY IF EXISTS "Users can update own post votes" ON forum_post_votes;
DROP POLICY IF EXISTS "Users can delete own post votes" ON forum_post_votes;
DROP POLICY IF EXISTS "Anyone can view post votes" ON forum_post_votes;
DROP POLICY IF EXISTS "Authenticated users can insert post votes" ON forum_post_votes;
DROP POLICY IF EXISTS "Users can update their own post votes" ON forum_post_votes;
DROP POLICY IF EXISTS "Users can delete their own post votes" ON forum_post_votes;

-- Drop existing tables (if they exist)
DROP TABLE IF EXISTS forum_topic_votes CASCADE;
DROP TABLE IF EXISTS forum_post_votes CASCADE;

-- Step 2: Create new vote tables with proper structure
-- =====================================================

-- Create forum_topic_votes table
CREATE TABLE forum_topic_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID NOT NULL,
    user_id UUID NOT NULL,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_topic_votes_topic 
        FOREIGN KEY (topic_id) 
        REFERENCES forum_topics(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_topic_votes_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Ensure one vote per user per topic
    UNIQUE(topic_id, user_id)
);

-- Create forum_post_votes table  
CREATE TABLE forum_post_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_post_votes_post 
        FOREIGN KEY (post_id) 
        REFERENCES forum_posts(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_post_votes_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Ensure one vote per user per post
    UNIQUE(post_id, user_id)
);

-- Step 3: Create indexes for performance
-- =====================================================

-- Indexes for forum_topic_votes
CREATE INDEX idx_topic_votes_topic_id ON forum_topic_votes(topic_id);
CREATE INDEX idx_topic_votes_user_id ON forum_topic_votes(user_id);
CREATE INDEX idx_topic_votes_vote_type ON forum_topic_votes(vote_type);
CREATE INDEX idx_topic_votes_created_at ON forum_topic_votes(created_at DESC);

-- Indexes for forum_post_votes
CREATE INDEX idx_post_votes_post_id ON forum_post_votes(post_id);
CREATE INDEX idx_post_votes_user_id ON forum_post_votes(user_id);
CREATE INDEX idx_post_votes_vote_type ON forum_post_votes(vote_type);
CREATE INDEX idx_post_votes_created_at ON forum_post_votes(created_at DESC);

-- Step 4: Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE forum_topic_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_votes ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies (LIBERAL PERMISSIONS FOR TESTING)
-- =====================================================

-- Forum Topic Votes Policies
CREATE POLICY "Anyone can view topic votes"
    ON forum_topic_votes
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert topic votes"
    ON forum_topic_votes
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own topic votes"
    ON forum_topic_votes
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topic votes"
    ON forum_topic_votes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Forum Post Votes Policies
CREATE POLICY "Anyone can view post votes"
    ON forum_post_votes
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert post votes"
    ON forum_post_votes
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own post votes"
    ON forum_post_votes
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post votes"
    ON forum_post_votes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Step 6: Grant permissions to authenticated users
-- =====================================================

GRANT ALL ON forum_topic_votes TO authenticated;
GRANT ALL ON forum_post_votes TO authenticated;

GRANT USAGE ON SEQUENCE forum_topic_votes_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE forum_post_votes_id_seq TO authenticated;

-- Step 7: Create functions for vote score calculation
-- =====================================================

-- Function to calculate topic vote score
CREATE OR REPLACE FUNCTION calculate_topic_vote_score(topic_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
    SELECT COALESCE(SUM(vote_type), 0)::INTEGER
    FROM forum_topic_votes
    WHERE topic_id = topic_uuid;
$$;

-- Function to calculate post vote score  
CREATE OR REPLACE FUNCTION calculate_post_vote_score(post_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
    SELECT COALESCE(SUM(vote_type), 0)::INTEGER
    FROM forum_post_votes
    WHERE post_id = post_uuid;
$$;

-- Step 8: Create trigger functions for automatic score updates
-- =====================================================

-- Function to update topic vote score
CREATE OR REPLACE FUNCTION update_topic_vote_score()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
    -- Update the topic's vote_score
    UPDATE forum_topics 
    SET vote_score = calculate_topic_vote_score(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.topic_id
            ELSE NEW.topic_id
        END
    )
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.topic_id
        ELSE NEW.topic_id
    END;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update post vote score
CREATE OR REPLACE FUNCTION update_post_vote_score()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
    -- Update the post's vote_score (if forum_posts table has vote_score column)
    -- UPDATE forum_posts 
    -- SET vote_score = calculate_post_vote_score(
    --     CASE 
    --         WHEN TG_OP = 'DELETE' THEN OLD.post_id
    --         ELSE NEW.post_id
    --     END
    -- )
    -- WHERE id = CASE 
    --     WHEN TG_OP = 'DELETE' THEN OLD.post_id
    --     ELSE NEW.post_id
    -- END;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Step 9: Create triggers for automatic score updates
-- =====================================================

-- Topic vote triggers
DROP TRIGGER IF EXISTS topic_vote_score_trigger ON forum_topic_votes;
CREATE TRIGGER topic_vote_score_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON forum_topic_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_topic_vote_score();

-- Post vote triggers (uncomment if forum_posts has vote_score column)
-- DROP TRIGGER IF EXISTS post_vote_score_trigger ON forum_post_votes;
-- CREATE TRIGGER post_vote_score_trigger
--     AFTER INSERT OR UPDATE OR DELETE
--     ON forum_post_votes
--     FOR EACH ROW
--     EXECUTE FUNCTION update_post_vote_score();

-- Step 10: Initialize existing topics with correct vote scores
-- =====================================================

-- Update all existing topics to have correct vote scores
UPDATE forum_topics 
SET vote_score = calculate_topic_vote_score(id);

-- Step 11: Create updated_at trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_topic_votes_updated_at ON forum_topic_votes;
CREATE TRIGGER update_topic_votes_updated_at
    BEFORE UPDATE ON forum_topic_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_votes_updated_at ON forum_post_votes;
CREATE TRIGGER update_post_votes_updated_at
    BEFORE UPDATE ON forum_post_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================

-- Verification queries (run these to check if everything works):

-- 1. Check table structure:
-- SELECT * FROM information_schema.tables WHERE table_name IN ('forum_topic_votes', 'forum_post_votes');

-- 2. Check policies:
-- SELECT * FROM pg_policies WHERE tablename IN ('forum_topic_votes', 'forum_post_votes');

-- 3. Check foreign key constraints:
-- SELECT * FROM information_schema.table_constraints WHERE table_name IN ('forum_topic_votes', 'forum_post_votes');

-- 4. Test vote score calculation:
-- SELECT id, title, vote_score, calculate_topic_vote_score(id) as calculated_score FROM forum_topics LIMIT 5;
    `;

    return NextResponse.json({
      success: true,
      message: 'Database rebuild SQL generated successfully',
      instructions: [
        '🚨 IMPORTANT: This will completely rebuild your vote system database tables!',
        '',
        '📋 Steps to execute:',
        '1. Go to your Supabase Dashboard (https://app.supabase.com)',
        '2. Select your project',
        '3. Go to SQL Editor',
        '4. Create a new query',
        '5. Copy the SQL below and paste it',
        '6. Click "Run" to execute',
        '7. Check the results for any errors',
        '',
        '⚠️  This will:',
        '- Drop all existing vote tables and policies',
        '- Create new vote tables with proper constraints',
        '- Set up correct RLS policies for all users',
        '- Add indexes for performance',
        '- Create automatic vote score calculation',
        '- Add triggers for real-time updates',
        '',
        '✅ After running, test the vote system at /forum'
      ],
      sql: migrationSQL,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating database rebuild SQL:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}