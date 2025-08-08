-- Strategy likes table for tracking user likes
CREATE TABLE IF NOT EXISTS strategy_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only like a strategy once
  UNIQUE(strategy_id, user_id)
);

-- Add RLS policies
ALTER TABLE strategy_likes ENABLE ROW LEVEL SECURITY;

-- Users can read all likes
CREATE POLICY "Anyone can view strategy likes" ON strategy_likes
  FOR SELECT USING (true);

-- Users can only insert their own likes
CREATE POLICY "Users can like strategies" ON strategy_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own likes
CREATE POLICY "Users can unlike strategies" ON strategy_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Add views and likes columns to strategies table if they don't exist
ALTER TABLE strategies 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_strategy_likes_strategy_id ON strategy_likes(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_likes_user_id ON strategy_likes(user_id);