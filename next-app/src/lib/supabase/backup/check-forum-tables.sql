-- Check if forum tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('forum_topics', 'forum_posts', 'forum_topic_votes', 'forum_post_votes');

-- Check forum_topics structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'forum_topics'
ORDER BY ordinal_position;

-- Check if categories table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'categories'
);

-- Check if users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
);

-- Test query to see if it works
SELECT 
  ft.*,
  u.name as author_name,
  c.name as category_name
FROM forum_topics ft
LEFT JOIN auth.users au ON ft.author_id = au.id
LEFT JOIN users u ON au.id = u.id
LEFT JOIN categories c ON ft.category_id = c.id
LIMIT 1;