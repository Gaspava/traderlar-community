-- Function to get trending articles
CREATE OR REPLACE FUNCTION get_trending_articles(limit_count INTEGER DEFAULT 6)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  slug VARCHAR(255),
  excerpt TEXT,
  cover_image TEXT,
  view_count INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  author_name VARCHAR(255),
  author_username VARCHAR(255),
  author_avatar TEXT,
  categories JSON,
  like_count BIGINT,
  comment_count BIGINT,
  trend_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.slug,
    a.excerpt,
    a.cover_image,
    a.view_count,
    a.published_at,
    u.name AS author_name,
    u.username AS author_username,
    u.avatar_url AS author_avatar,
    COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'slug', c.slug,
          'color', c.color
        )
      ) FILTER (WHERE c.id IS NOT NULL),
      '[]'::json
    ) AS categories,
    COUNT(DISTINCT al.id) AS like_count,
    COUNT(DISTINCT com.id) AS comment_count,
    -- Calculate trend score based on views, likes, comments and recency
    (
      (a.view_count * 0.3) +
      (COUNT(DISTINCT al.id) * 10) +
      (COUNT(DISTINCT com.id) * 5) +
      -- Recency bonus (articles published in last 7 days get higher score)
      CASE 
        WHEN a.published_at > NOW() - INTERVAL '7 days' THEN 100
        WHEN a.published_at > NOW() - INTERVAL '14 days' THEN 50
        WHEN a.published_at > NOW() - INTERVAL '30 days' THEN 20
        ELSE 0
      END
    ) AS trend_score
  FROM articles a
  JOIN users u ON a.author_id = u.id
  LEFT JOIN article_categories ac ON a.id = ac.article_id
  LEFT JOIN categories c ON ac.category_id = c.id
  LEFT JOIN article_likes al ON a.id = al.article_id
  LEFT JOIN comments com ON a.id = com.article_id
  WHERE a.is_published = true
  GROUP BY a.id, u.id
  ORDER BY trend_score DESC, a.published_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;