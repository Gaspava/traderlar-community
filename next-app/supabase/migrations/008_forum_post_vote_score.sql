-- Add vote_score column to forum_posts table
ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS vote_score INTEGER DEFAULT 0 NOT NULL;

-- Create index for vote_score
CREATE INDEX IF NOT EXISTS idx_forum_posts_vote_score 
ON public.forum_posts(vote_score DESC);

-- Update existing posts with calculated vote scores
UPDATE public.forum_posts p
SET vote_score = COALESCE((
  SELECT SUM(vote_type)
  FROM public.forum_post_votes
  WHERE post_id = p.id
), 0);