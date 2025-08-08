-- Create forum_topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  view_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  vote_score integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  last_reply_at timestamp with time zone,
  last_reply_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create forum_posts table (replies)
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  vote_score integer DEFAULT 0,
  is_accepted boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create forum_topic_votes table
CREATE TABLE IF NOT EXISTS forum_topic_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type integer NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(topic_id, user_id)
);

-- Create forum_post_votes table
CREATE TABLE IF NOT EXISTS forum_post_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type integer NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_author_id ON forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_slug ON forum_topics(slug);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_last_reply_at ON forum_topics(last_reply_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_id ON forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON forum_posts(parent_id);

-- Enable RLS
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topic_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_topics
CREATE POLICY "Forum topics viewable by everyone" ON forum_topics
  FOR SELECT USING (true);

CREATE POLICY "Forum topics can be created by authenticated users" ON forum_topics
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Forum topics can be updated by author" ON forum_topics
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Forum topics can be deleted by author" ON forum_topics
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for forum_posts
CREATE POLICY "Forum posts viewable by everyone" ON forum_posts
  FOR SELECT USING (NOT is_deleted OR auth.uid() = author_id);

CREATE POLICY "Forum posts can be created by authenticated users" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Forum posts can be updated by author" ON forum_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Forum posts can be soft deleted by author" ON forum_posts
  FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (is_deleted = true);

-- RLS Policies for votes
CREATE POLICY "Votes viewable by everyone" ON forum_topic_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own topic votes" ON forum_topic_votes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Post votes viewable by everyone" ON forum_post_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own post votes" ON forum_post_votes
  FOR ALL USING (auth.uid() = user_id);

-- Functions to update vote scores
CREATE OR REPLACE FUNCTION update_forum_topic_vote_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_topics
  SET vote_score = (
    SELECT COALESCE(SUM(vote_type), 0)
    FROM forum_topic_votes
    WHERE topic_id = COALESCE(NEW.topic_id, OLD.topic_id)
  )
  WHERE id = COALESCE(NEW.topic_id, OLD.topic_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_forum_post_vote_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET vote_score = (
    SELECT COALESCE(SUM(vote_type), 0)
    FROM forum_post_votes
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
  )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for vote score updates
DROP TRIGGER IF EXISTS update_topic_vote_score ON forum_topic_votes;
CREATE TRIGGER update_topic_vote_score
AFTER INSERT OR UPDATE OR DELETE ON forum_topic_votes
FOR EACH ROW EXECUTE FUNCTION update_forum_topic_vote_score();

DROP TRIGGER IF EXISTS update_post_vote_score ON forum_post_votes;
CREATE TRIGGER update_post_vote_score
AFTER INSERT OR UPDATE OR DELETE ON forum_post_votes
FOR EACH ROW EXECUTE FUNCTION update_forum_post_vote_score();

-- Function to update reply count and last reply info
CREATE OR REPLACE FUNCTION update_forum_topic_reply_info()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics
    SET 
      reply_count = reply_count + 1,
      last_reply_at = NEW.created_at,
      last_reply_user_id = NEW.author_id
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics
    SET reply_count = reply_count - 1
    WHERE id = OLD.topic_id;
    
    -- Update last reply info
    UPDATE forum_topics
    SET 
      last_reply_at = (
        SELECT MAX(created_at) 
        FROM forum_posts 
        WHERE topic_id = OLD.topic_id
      ),
      last_reply_user_id = (
        SELECT author_id 
        FROM forum_posts 
        WHERE topic_id = OLD.topic_id 
        ORDER BY created_at DESC 
        LIMIT 1
      )
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reply count updates
DROP TRIGGER IF EXISTS update_topic_reply_info ON forum_posts;
CREATE TRIGGER update_topic_reply_info
AFTER INSERT OR DELETE ON forum_posts
FOR EACH ROW EXECUTE FUNCTION update_forum_topic_reply_info();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_forum_topic_view_count(topic_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE forum_topics
  SET view_count = view_count + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql;

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON forum_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();