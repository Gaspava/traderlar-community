-- Forum system setup for Supabase
-- Run this SQL in Supabase SQL Editor

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'forum_%';

-- Forum Topics Table
CREATE TABLE IF NOT EXISTS public.forum_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    is_pinned BOOLEAN DEFAULT false NOT NULL,
    is_locked BOOLEAN DEFAULT false NOT NULL,
    view_count INTEGER DEFAULT 0 NOT NULL,
    reply_count INTEGER DEFAULT 0 NOT NULL,
    vote_score INTEGER DEFAULT 0 NOT NULL,
    last_reply_at TIMESTAMPTZ,
    last_reply_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Forum Posts Table
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    vote_score INTEGER DEFAULT 0 NOT NULL,
    is_edited BOOLEAN DEFAULT false NOT NULL,
    mentioned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Forum Topic Votes Table
CREATE TABLE IF NOT EXISTS public.forum_topic_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(topic_id, user_id)
);

-- Forum Post Votes Table
CREATE TABLE IF NOT EXISTS public.forum_post_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_topics_author_id ON public.forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON public.forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON public.forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_slug ON public.forum_topics(slug);
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_id ON public.forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON public.forum_posts(author_id);

-- Enable RLS
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topic_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Forum Topics
DROP POLICY IF EXISTS "Forum topics are viewable by everyone" ON public.forum_topics;
CREATE POLICY "Forum topics are viewable by everyone" ON public.forum_topics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.forum_topics;
CREATE POLICY "Authenticated users can create topics" ON public.forum_topics
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- RLS Policies for Forum Posts  
DROP POLICY IF EXISTS "Forum posts are viewable by everyone" ON public.forum_posts;
CREATE POLICY "Forum posts are viewable by everyone" ON public.forum_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- RLS Policies for Votes
DROP POLICY IF EXISTS "Topic votes are viewable by everyone" ON public.forum_topic_votes;
CREATE POLICY "Topic votes are viewable by everyone" ON public.forum_topic_votes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote on topics" ON public.forum_topic_votes;
CREATE POLICY "Authenticated users can vote on topics" ON public.forum_topic_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Post votes are viewable by everyone" ON public.forum_post_votes;
CREATE POLICY "Post votes are viewable by everyone" ON public.forum_post_votes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote on posts" ON public.forum_post_votes;
CREATE POLICY "Authenticated users can vote on posts" ON public.forum_post_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Check results
SELECT 'Setup complete. Tables created:' as message;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'forum_%';