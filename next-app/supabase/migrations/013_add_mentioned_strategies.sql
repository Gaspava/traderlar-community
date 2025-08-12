-- Add mentioned_strategies column to forum_topics
ALTER TABLE public.forum_topics ADD COLUMN mentioned_strategies UUID[] DEFAULT '{}' NOT NULL;

-- Add mentioned_strategies column to forum_posts  
ALTER TABLE public.forum_posts ADD COLUMN mentioned_strategies UUID[] DEFAULT '{}' NOT NULL;

-- Create indexes for better performance when querying by mentioned strategies
CREATE INDEX idx_forum_topics_mentioned_strategies ON public.forum_topics USING GIN(mentioned_strategies);
CREATE INDEX idx_forum_posts_mentioned_strategies ON public.forum_posts USING GIN(mentioned_strategies);

-- Add comments to explain the column
COMMENT ON COLUMN public.forum_topics.mentioned_strategies IS 'Array of strategy IDs mentioned in the topic content using @strateji mentions';
COMMENT ON COLUMN public.forum_posts.mentioned_strategies IS 'Array of strategy IDs mentioned in the post content using @strateji mentions';