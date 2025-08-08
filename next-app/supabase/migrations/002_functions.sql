-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, username, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        -- Generate unique username from email
        LOWER(REPLACE(split_part(NEW.email, '@', 1), '.', '_')),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment article view count
CREATE OR REPLACE FUNCTION public.increment_article_view(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.articles
    SET view_count = view_count + 1
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get article with author info
CREATE OR REPLACE FUNCTION public.get_article_with_author(article_slug TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    content TEXT,
    excerpt TEXT,
    cover_image TEXT,
    view_count INTEGER,
    is_published BOOLEAN,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    author_id UUID,
    author_name TEXT,
    author_username TEXT,
    author_avatar TEXT,
    author_role user_role,
    categories JSONB,
    like_count BIGINT,
    comment_count BIGINT,
    is_liked BOOLEAN,
    is_saved BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.slug,
        a.content,
        a.excerpt,
        a.cover_image,
        a.view_count,
        a.is_published,
        a.published_at,
        a.created_at,
        a.updated_at,
        a.author_id,
        u.name AS author_name,
        u.username AS author_username,
        u.avatar_url AS author_avatar,
        u.role AS author_role,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'slug', c.slug,
                    'color', c.color,
                    'icon', c.icon
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories,
        COUNT(DISTINCT al.user_id) AS like_count,
        COUNT(DISTINCT cm.id) AS comment_count,
        EXISTS (
            SELECT 1 FROM public.article_likes
            WHERE article_id = a.id AND user_id = auth.uid()
        ) AS is_liked,
        EXISTS (
            SELECT 1 FROM public.saved_articles
            WHERE article_id = a.id AND user_id = auth.uid()
        ) AS is_saved
    FROM public.articles a
    JOIN public.users u ON a.author_id = u.id
    LEFT JOIN public.article_categories ac ON a.id = ac.article_id
    LEFT JOIN public.categories c ON ac.category_id = c.id
    LEFT JOIN public.article_likes al ON a.id = al.article_id
    LEFT JOIN public.comments cm ON a.id = cm.article_id
    WHERE a.slug = article_slug
    GROUP BY a.id, u.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get comments with nested structure
CREATE OR REPLACE FUNCTION public.get_article_comments(p_article_id UUID)
RETURNS TABLE (
    id UUID,
    article_id UUID,
    user_id UUID,
    parent_id UUID,
    content TEXT,
    is_edited BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    user_name TEXT,
    user_username TEXT,
    user_avatar TEXT,
    mentioned_username TEXT,
    like_count BIGINT,
    is_liked BOOLEAN,
    reply_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH comment_stats AS (
        SELECT 
            c.id,
            COUNT(DISTINCT cl.user_id) AS like_count,
            COUNT(DISTINCT cr.id) AS reply_count
        FROM public.comments c
        LEFT JOIN public.comment_likes cl ON c.id = cl.comment_id
        LEFT JOIN public.comments cr ON c.id = cr.parent_id
        WHERE c.article_id = p_article_id
        GROUP BY c.id
    )
    SELECT 
        c.id,
        c.article_id,
        c.user_id,
        c.parent_id,
        c.content,
        c.is_edited,
        c.created_at,
        c.updated_at,
        u.name AS user_name,
        u.username AS user_username,
        u.avatar_url AS user_avatar,
        mu.username AS mentioned_username,
        COALESCE(cs.like_count, 0) AS like_count,
        EXISTS (
            SELECT 1 FROM public.comment_likes
            WHERE comment_id = c.id AND user_id = auth.uid()
        ) AS is_liked,
        COALESCE(cs.reply_count, 0) AS reply_count
    FROM public.comments c
    JOIN public.users u ON c.user_id = u.id
    LEFT JOIN public.users mu ON c.mentioned_user_id = mu.id
    LEFT JOIN comment_stats cs ON c.id = cs.id
    WHERE c.article_id = p_article_id
    ORDER BY c.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending articles
CREATE OR REPLACE FUNCTION public.get_trending_articles(
    limit_count INTEGER DEFAULT 10,
    days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    cover_image TEXT,
    view_count INTEGER,
    published_at TIMESTAMPTZ,
    author_name TEXT,
    author_username TEXT,
    author_avatar TEXT,
    categories JSONB,
    like_count BIGINT,
    comment_count BIGINT,
    trend_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH article_stats AS (
        SELECT 
            a.id,
            COUNT(DISTINCT al.user_id) AS like_count,
            COUNT(DISTINCT c.id) AS comment_count,
            -- Calculate trend score based on views, likes, comments and recency
            (
                (a.view_count * 0.1) +
                (COUNT(DISTINCT al.user_id) * 10) +
                (COUNT(DISTINCT c.id) * 5) +
                -- Boost for recent articles
                (CASE 
                    WHEN a.published_at > NOW() - INTERVAL '1 day' THEN 50
                    WHEN a.published_at > NOW() - INTERVAL '3 days' THEN 20
                    WHEN a.published_at > NOW() - INTERVAL '7 days' THEN 10
                    ELSE 0
                END)
            ) AS trend_score
        FROM public.articles a
        LEFT JOIN public.article_likes al ON a.id = al.article_id
        LEFT JOIN public.comments c ON a.id = c.article_id
        WHERE a.is_published = true
            AND a.published_at > NOW() - (days_back || ' days')::INTERVAL
        GROUP BY a.id
    )
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
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', cat.id,
                    'name', cat.name,
                    'slug', cat.slug,
                    'color', cat.color,
                    'icon', cat.icon
                )
            ) FILTER (WHERE cat.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories,
        ast.like_count,
        ast.comment_count,
        ast.trend_score
    FROM public.articles a
    JOIN public.users u ON a.author_id = u.id
    JOIN article_stats ast ON a.id = ast.id
    LEFT JOIN public.article_categories ac ON a.id = ac.article_id
    LEFT JOIN public.categories cat ON ac.category_id = cat.id
    GROUP BY a.id, u.id, ast.like_count, ast.comment_count, ast.trend_score
    ORDER BY ast.trend_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search articles
CREATE OR REPLACE FUNCTION public.search_articles(
    search_term TEXT,
    category_slug TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    cover_image TEXT,
    view_count INTEGER,
    published_at TIMESTAMPTZ,
    author_name TEXT,
    author_username TEXT,
    author_avatar TEXT,
    categories JSONB,
    like_count BIGINT,
    comment_count BIGINT,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_articles AS (
        SELECT 
            a.id,
            COUNT(*) OVER() AS total_count
        FROM public.articles a
        LEFT JOIN public.article_categories ac ON a.id = ac.article_id
        LEFT JOIN public.categories c ON ac.category_id = c.id
        WHERE a.is_published = true
            AND (
                search_term IS NULL OR search_term = '' OR
                a.title ILIKE '%' || search_term || '%' OR
                a.excerpt ILIKE '%' || search_term || '%' OR
                a.content ILIKE '%' || search_term || '%'
            )
            AND (
                category_slug IS NULL OR
                c.slug = category_slug
            )
        GROUP BY a.id
    )
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
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'id', cat.id,
                    'name', cat.name,
                    'slug', cat.slug,
                    'color', cat.color,
                    'icon', cat.icon
                )
            ) FILTER (WHERE cat.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories,
        COUNT(DISTINCT al.user_id) AS like_count,
        COUNT(DISTINCT cm.id) AS comment_count,
        fa.total_count
    FROM filtered_articles fa
    JOIN public.articles a ON fa.id = a.id
    JOIN public.users u ON a.author_id = u.id
    LEFT JOIN public.article_categories ac ON a.id = ac.article_id
    LEFT JOIN public.categories cat ON ac.category_id = cat.id
    LEFT JOIN public.article_likes al ON a.id = al.article_id
    LEFT JOIN public.comments cm ON a.id = cm.article_id
    GROUP BY a.id, u.id, fa.total_count
    ORDER BY a.published_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;