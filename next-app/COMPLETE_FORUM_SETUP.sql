-- Forum Vote Sistemi - Tam Kurulum SQL
-- Bu SQL kodunu Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Forum Posts tablosuna vote_score alanını ekleyelim (eğer yoksa)
ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS vote_score INTEGER DEFAULT 0 NOT NULL;

-- 2. Forum Topics Table (eğer yoksa)
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

-- 3. Forum Posts Table (eğer yoksa)
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

-- 4. Forum Topic Votes Table
CREATE TABLE IF NOT EXISTS public.forum_topic_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 for downvote, 1 for upvote
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(topic_id, user_id)
);

-- 5. Forum Post Votes Table
CREATE TABLE IF NOT EXISTS public.forum_post_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 for downvote, 1 for upvote
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(post_id, user_id)
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_author_id ON public.forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON public.forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON public.forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_last_reply_at ON public.forum_topics(last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_slug ON public.forum_topics(slug);
CREATE INDEX IF NOT EXISTS idx_forum_topics_vote_score ON public.forum_topics(vote_score DESC);

CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_id ON public.forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON public.forum_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_vote_score ON public.forum_posts(vote_score DESC);

CREATE INDEX IF NOT EXISTS idx_forum_topic_votes_topic_id ON public.forum_topic_votes(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_topic_votes_user_id ON public.forum_topic_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_votes_post_id ON public.forum_post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_votes_user_id ON public.forum_post_votes(user_id);

-- 7. Enable Row Level Security
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topic_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_votes ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for Forum Topics
DROP POLICY IF EXISTS "Forum topics are viewable by everyone" ON public.forum_topics;
DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Authors can update own topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Authors can delete own topics" ON public.forum_topics;

CREATE POLICY "Forum topics are viewable by everyone" ON public.forum_topics
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create topics" ON public.forum_topics
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own topics" ON public.forum_topics
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own topics" ON public.forum_topics
    FOR DELETE USING (auth.uid() = author_id);

-- 9. RLS Policies for Forum Posts
DROP POLICY IF EXISTS "Forum posts are viewable by everyone" ON public.forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.forum_posts;

CREATE POLICY "Forum posts are viewable by everyone" ON public.forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts" ON public.forum_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts" ON public.forum_posts
    FOR DELETE USING (auth.uid() = author_id);

-- 10. RLS Policies for Topic Votes
DROP POLICY IF EXISTS "Topic votes are viewable by everyone" ON public.forum_topic_votes;
DROP POLICY IF EXISTS "Authenticated users can vote on topics" ON public.forum_topic_votes;
DROP POLICY IF EXISTS "Users can update own topic votes" ON public.forum_topic_votes;
DROP POLICY IF EXISTS "Users can delete own topic votes" ON public.forum_topic_votes;

CREATE POLICY "Topic votes are viewable by everyone" ON public.forum_topic_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on topics" ON public.forum_topic_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic votes" ON public.forum_topic_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own topic votes" ON public.forum_topic_votes
    FOR DELETE USING (auth.uid() = user_id);

-- 11. RLS Policies for Post Votes
DROP POLICY IF EXISTS "Post votes are viewable by everyone" ON public.forum_post_votes;
DROP POLICY IF EXISTS "Authenticated users can vote on posts" ON public.forum_post_votes;
DROP POLICY IF EXISTS "Users can update own post votes" ON public.forum_post_votes;
DROP POLICY IF EXISTS "Users can delete own post votes" ON public.forum_post_votes;

CREATE POLICY "Post votes are viewable by everyone" ON public.forum_post_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on posts" ON public.forum_post_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own post votes" ON public.forum_post_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own post votes" ON public.forum_post_votes
    FOR DELETE USING (auth.uid() = user_id);

-- 12. Vote score güncelleme fonksiyonları (opsiyonel, performans için)
CREATE OR REPLACE FUNCTION update_topic_vote_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.forum_topics 
    SET vote_score = (
        SELECT COALESCE(SUM(vote_type), 0) 
        FROM public.forum_topic_votes 
        WHERE topic_id = COALESCE(NEW.topic_id, OLD.topic_id)
    )
    WHERE id = COALESCE(NEW.topic_id, OLD.topic_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_vote_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.forum_posts 
    SET vote_score = (
        SELECT COALESCE(SUM(vote_type), 0) 
        FROM public.forum_post_votes 
        WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    )
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 13. Trigger'ları oluştur
DROP TRIGGER IF EXISTS trigger_update_topic_vote_score ON public.forum_topic_votes;
DROP TRIGGER IF EXISTS trigger_update_post_vote_score ON public.forum_post_votes;

CREATE TRIGGER trigger_update_topic_vote_score
    AFTER INSERT OR UPDATE OR DELETE ON public.forum_topic_votes
    FOR EACH ROW EXECUTE FUNCTION update_topic_vote_score();

CREATE TRIGGER trigger_update_post_vote_score
    AFTER INSERT OR UPDATE OR DELETE ON public.forum_post_votes
    FOR EACH ROW EXECUTE FUNCTION update_post_vote_score();

-- 14. Test verisi (opsiyonel)
-- Test kategorisi oluştur (eğer categories tablosu varsa)
INSERT INTO public.categories (name, slug, description, color, icon) 
VALUES ('Forum Test', 'forum-test', 'Test kategorisi', '#3B82F6', 'MessageCircle')
ON CONFLICT (slug) DO NOTHING;

SELECT 'Forum vote sistemi başarıyla kuruldu!' as status;