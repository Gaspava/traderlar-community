-- Forum Topics Table
CREATE TABLE public.forum_topics (
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
    last_reply_at TIMESTAMPTZ,
    last_reply_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Forum Posts Table (replies to topics)
CREATE TABLE public.forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false NOT NULL,
    mentioned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Forum Topic Votes Table
CREATE TABLE public.forum_topic_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 for downvote, 1 for upvote
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(topic_id, user_id)
);

-- Forum Post Votes Table
CREATE TABLE public.forum_post_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 for downvote, 1 for upvote
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_forum_topics_author_id ON public.forum_topics(author_id);
CREATE INDEX idx_forum_topics_category_id ON public.forum_topics(category_id);
CREATE INDEX idx_forum_topics_created_at ON public.forum_topics(created_at DESC);
CREATE INDEX idx_forum_topics_last_reply_at ON public.forum_topics(last_reply_at DESC);
CREATE INDEX idx_forum_topics_slug ON public.forum_topics(slug);
CREATE INDEX idx_forum_posts_topic_id ON public.forum_posts(topic_id);
CREATE INDEX idx_forum_posts_author_id ON public.forum_posts(author_id);
CREATE INDEX idx_forum_posts_parent_id ON public.forum_posts(parent_id);
CREATE INDEX idx_forum_topic_votes_topic_id ON public.forum_topic_votes(topic_id);
CREATE INDEX idx_forum_topic_votes_user_id ON public.forum_topic_votes(user_id);
CREATE INDEX idx_forum_post_votes_post_id ON public.forum_post_votes(post_id);
CREATE INDEX idx_forum_post_votes_user_id ON public.forum_post_votes(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON public.forum_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_forum_topic_votes_updated_at BEFORE UPDATE ON public.forum_topic_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_forum_post_votes_updated_at BEFORE UPDATE ON public.forum_post_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to update topic reply count and last reply info
CREATE OR REPLACE FUNCTION update_topic_reply_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forum_topics
        SET 
            reply_count = reply_count + 1,
            last_reply_at = NEW.created_at,
            last_reply_user_id = NEW.author_id
        WHERE id = NEW.topic_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forum_topics
        SET reply_count = reply_count - 1
        WHERE id = OLD.topic_id;
        
        -- Update last reply info
        UPDATE public.forum_topics
        SET 
            last_reply_at = (
                SELECT created_at FROM public.forum_posts 
                WHERE topic_id = OLD.topic_id 
                ORDER BY created_at DESC LIMIT 1
            ),
            last_reply_user_id = (
                SELECT author_id FROM public.forum_posts 
                WHERE topic_id = OLD.topic_id 
                ORDER BY created_at DESC LIMIT 1
            )
        WHERE id = OLD.topic_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reply count updates
CREATE TRIGGER update_topic_reply_stats_trigger
    AFTER INSERT OR DELETE ON public.forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_topic_reply_stats();

-- Enable Row Level Security
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topic_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Forum Topics
CREATE POLICY "Forum topics are viewable by everyone" ON public.forum_topics
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create topics" ON public.forum_topics
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own topics" ON public.forum_topics
    FOR UPDATE USING (auth.uid() = author_id OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Authors can delete own topics" ON public.forum_topics
    FOR DELETE USING (auth.uid() = author_id OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLS Policies for Forum Posts
CREATE POLICY "Forum posts are viewable by everyone" ON public.forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts" ON public.forum_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts" ON public.forum_posts
    FOR DELETE USING (auth.uid() = author_id OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLS Policies for Topic Votes
CREATE POLICY "Topic votes are viewable by everyone" ON public.forum_topic_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on topics" ON public.forum_topic_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic votes" ON public.forum_topic_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own topic votes" ON public.forum_topic_votes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Post Votes
CREATE POLICY "Post votes are viewable by everyone" ON public.forum_post_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on posts" ON public.forum_post_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own post votes" ON public.forum_post_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own post votes" ON public.forum_post_votes
    FOR DELETE USING (auth.uid() = user_id);