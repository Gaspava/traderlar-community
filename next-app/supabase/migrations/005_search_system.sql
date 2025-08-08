-- Search System Tables and Functions

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),
  usage_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article Tags
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (article_id, tag_id)
);

-- Forum Topic Tags
CREATE TABLE IF NOT EXISTS forum_topic_tags (
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (topic_id, tag_id)
);

-- Strategy Tags
CREATE TABLE IF NOT EXISTS strategy_tags (
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (strategy_id, tag_id)
);

-- Search History
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  clicked_result_id UUID,
  clicked_result_type VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Popular Searches
CREATE TABLE IF NOT EXISTS popular_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL UNIQUE,
  search_count INTEGER DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search Suggestions
CREATE TABLE IF NOT EXISTS search_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term VARCHAR(255) NOT NULL UNIQUE,
  suggestion_type VARCHAR(50), -- 'user', 'article', 'tag', 'topic', 'strategy'
  weight INTEGER DEFAULT 1,
  data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create necessary tables that don't exist yet
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  category VARCHAR(50),
  timeframe VARCHAR(20),
  risk_level VARCHAR(20),
  expected_return VARCHAR(50),
  market_types TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  category_id UUID,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  last_reply_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
CREATE INDEX IF NOT EXISTS idx_popular_searches_query ON popular_searches(query);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(
  to_tsvector('turkish', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(excerpt, ''))
);

CREATE INDEX IF NOT EXISTS idx_users_search ON users USING gin(
  to_tsvector('turkish', coalesce(name, '') || ' ' || coalesce(username, '') || ' ' || coalesce(bio, ''))
);

CREATE INDEX IF NOT EXISTS idx_forum_topics_search ON forum_topics USING gin(
  to_tsvector('turkish', coalesce(title, '') || ' ' || coalesce(content, ''))
);

CREATE INDEX IF NOT EXISTS idx_strategies_search ON strategies USING gin(
  to_tsvector('turkish', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, ''))
);

-- Functions

-- Unified search function
CREATE OR REPLACE FUNCTION search_all(
  p_query TEXT,
  p_types TEXT[] DEFAULT ARRAY['articles', 'users', 'topics', 'strategies'],
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_filters JSONB DEFAULT '{}'
) RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  url TEXT,
  author JSONB,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  WITH search_results AS (
    -- Search articles
    SELECT 
      a.id,
      'article' as type,
      a.title,
      a.excerpt as description,
      '/articles/' || a.slug as url,
      jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'username', u.username,
        'avatar_url', u.avatar_url
      ) as author,
      ARRAY(
        SELECT t.name 
        FROM article_tags at 
        JOIN tags t ON t.id = at.tag_id 
        WHERE at.article_id = a.id
      ) as tags,
      a.created_at,
      ts_rank(
        to_tsvector('turkish', coalesce(a.title, '') || ' ' || coalesce(a.content, '')),
        plainto_tsquery('turkish', p_query)
      ) as relevance
    FROM articles a
    JOIN users u ON u.id = a.user_id
    WHERE 
      'articles' = ANY(p_types) AND
      a.is_published = true AND
      to_tsvector('turkish', coalesce(a.title, '') || ' ' || coalesce(a.content, '')) @@ plainto_tsquery('turkish', p_query)
    
    UNION ALL
    
    -- Search users
    SELECT 
      u.id,
      'user' as type,
      u.name as title,
      u.bio as description,
      '/profile/' || u.username as url,
      jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'username', u.username,
        'avatar_url', u.avatar_url
      ) as author,
      ARRAY[]::TEXT[] as tags,
      u.created_at,
      ts_rank(
        to_tsvector('turkish', coalesce(u.name, '') || ' ' || coalesce(u.username, '') || ' ' || coalesce(u.bio, '')),
        plainto_tsquery('turkish', p_query)
      ) as relevance
    FROM users u
    WHERE 
      'users' = ANY(p_types) AND
      to_tsvector('turkish', coalesce(u.name, '') || ' ' || coalesce(u.username, '') || ' ' || coalesce(u.bio, '')) @@ plainto_tsquery('turkish', p_query)
    
    UNION ALL
    
    -- Search forum topics
    SELECT 
      ft.id,
      'topic' as type,
      ft.title,
      LEFT(ft.content, 200) as description,
      '/forum/topic/' || ft.slug as url,
      jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'username', u.username,
        'avatar_url', u.avatar_url
      ) as author,
      ARRAY(
        SELECT t.name 
        FROM forum_topic_tags ftt 
        JOIN tags t ON t.id = ftt.tag_id 
        WHERE ftt.topic_id = ft.id
      ) as tags,
      ft.created_at,
      ts_rank(
        to_tsvector('turkish', coalesce(ft.title, '') || ' ' || coalesce(ft.content, '')),
        plainto_tsquery('turkish', p_query)
      ) as relevance
    FROM forum_topics ft
    JOIN users u ON u.id = ft.user_id
    WHERE 
      'topics' = ANY(p_types) AND
      to_tsvector('turkish', coalesce(ft.title, '') || ' ' || coalesce(ft.content, '')) @@ plainto_tsquery('turkish', p_query)
    
    UNION ALL
    
    -- Search strategies
    SELECT 
      s.id,
      'strategy' as type,
      s.title,
      s.description,
      '/strategies/' || s.slug as url,
      jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'username', u.username,
        'avatar_url', u.avatar_url
      ) as author,
      ARRAY(
        SELECT t.name 
        FROM strategy_tags st 
        JOIN tags t ON t.id = st.tag_id 
        WHERE st.strategy_id = s.id
      ) as tags,
      s.created_at,
      ts_rank(
        to_tsvector('turkish', coalesce(s.title, '') || ' ' || coalesce(s.description, '') || ' ' || coalesce(s.content, '')),
        plainto_tsquery('turkish', p_query)
      ) as relevance
    FROM strategies s
    JOIN users u ON u.id = s.user_id
    WHERE 
      'strategies' = ANY(p_types) AND
      s.is_published = true AND
      to_tsvector('turkish', coalesce(s.title, '') || ' ' || coalesce(s.description, '') || ' ' || coalesce(s.content, '')) @@ plainto_tsquery('turkish', p_query)
  )
  SELECT * FROM search_results
  ORDER BY relevance DESC, created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Search suggestions function
CREATE OR REPLACE FUNCTION get_search_suggestions(
  p_query TEXT,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  suggestion TEXT,
  type TEXT,
  data JSONB
) AS $$
BEGIN
  RETURN QUERY
  -- Get matching tags
  SELECT 
    t.name as suggestion,
    'tag' as type,
    jsonb_build_object('id', t.id, 'slug', t.slug, 'count', t.usage_count) as data
  FROM tags t
  WHERE t.name ILIKE p_query || '%'
  ORDER BY t.usage_count DESC
  LIMIT p_limit / 3
  
  UNION ALL
  
  -- Get matching users
  SELECT 
    u.name as suggestion,
    'user' as type,
    jsonb_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url) as data
  FROM users u
  WHERE u.name ILIKE p_query || '%' OR u.username ILIKE p_query || '%'
  ORDER BY (SELECT COUNT(*) FROM follows WHERE following_id = u.id) DESC
  LIMIT p_limit / 3
  
  UNION ALL
  
  -- Get popular searches
  SELECT 
    ps.query as suggestion,
    'search' as type,
    jsonb_build_object('count', ps.search_count) as data
  FROM popular_searches ps
  WHERE ps.query ILIKE p_query || '%'
  ORDER BY ps.search_count DESC
  LIMIT p_limit / 3;
END;
$$ LANGUAGE plpgsql;

-- Update popular searches
CREATE OR REPLACE FUNCTION update_popular_search(p_query TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO popular_searches (query, search_count, last_searched)
  VALUES (LOWER(TRIM(p_query)), 1, NOW())
  ON CONFLICT (query) DO UPDATE
  SET 
    search_count = popular_searches.search_count + 1,
    last_searched = NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert some default tags
INSERT INTO tags (name, slug, category, is_featured) VALUES
  ('Bitcoin', 'bitcoin', 'Kripto', true),
  ('Ethereum', 'ethereum', 'Kripto', true),
  ('Forex', 'forex', 'Piyasa', true),
  ('Teknik Analiz', 'teknik-analiz', 'Analiz', true),
  ('Temel Analiz', 'temel-analiz', 'Analiz', true),
  ('Scalping', 'scalping', 'Strateji', true),
  ('Swing Trading', 'swing-trading', 'Strateji', true),
  ('Day Trading', 'day-trading', 'Strateji', true),
  ('Risk Yönetimi', 'risk-yonetimi', 'Eğitim', true),
  ('Psikoloji', 'psikoloji', 'Eğitim', false),
  ('Altcoin', 'altcoin', 'Kripto', false),
  ('BIST', 'bist', 'Piyasa', true),
  ('Emtia', 'emtia', 'Piyasa', false),
  ('Fibonacci', 'fibonacci', 'Teknik', false),
  ('Elliott Wave', 'elliott-wave', 'Teknik', false),
  ('Destek Direnç', 'destek-direnc', 'Teknik', false),
  ('Stop Loss', 'stop-loss', 'Risk', false),
  ('Take Profit', 'take-profit', 'Risk', false),
  ('Margin Trading', 'margin-trading', 'Strateji', false),
  ('Options', 'options', 'Strateji', false)
ON CONFLICT (name) DO NOTHING;

-- RLS Policies
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topic_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;

-- Everyone can view tags
CREATE POLICY "Public can view tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON tags FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Tag associations
CREATE POLICY "Public can view article tags" ON article_tags FOR SELECT USING (true);
CREATE POLICY "Article authors can manage tags" ON article_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM articles WHERE id = article_id AND user_id = auth.uid())
);

-- Search history
CREATE POLICY "Users can view own search history" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert search history" ON search_history FOR INSERT WITH CHECK (true);

-- Popular searches
CREATE POLICY "Public can view popular searches" ON popular_searches FOR SELECT USING (true);
CREATE POLICY "System can manage popular searches" ON popular_searches FOR ALL USING (true);