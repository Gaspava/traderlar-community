-- Admin Forum Deletion Policy Fix
-- Bu SQL kodunu Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Önce mevcut DELETE politikalarını kaldır
DROP POLICY IF EXISTS "Authors can delete own topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Admins can delete any topic" ON public.forum_topics;
DROP POLICY IF EXISTS "Admins can delete any post" ON public.forum_posts;

-- 2. Forum Topics için yeni DELETE politikaları oluştur
-- Kullanıcılar kendi konularını silebilir
CREATE POLICY "Authors can delete own topics" ON public.forum_topics
    FOR DELETE USING (auth.uid() = author_id);

-- Admin'ler tüm konuları silebilir
CREATE POLICY "Admins can delete any topic" ON public.forum_topics
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 3. Forum Posts için yeni DELETE politikaları oluştur
-- Kullanıcılar kendi postlarını silebilir
CREATE POLICY "Authors can delete own posts" ON public.forum_posts
    FOR DELETE USING (auth.uid() = author_id);

-- Admin'ler tüm postları silebilir
CREATE POLICY "Admins can delete any post" ON public.forum_posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 4. Forum Topic Votes için admin silme politikası
DROP POLICY IF EXISTS "Admins can delete any topic vote" ON public.forum_topic_votes;
CREATE POLICY "Admins can delete any topic vote" ON public.forum_topic_votes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 5. Forum Post Votes için admin silme politikası
DROP POLICY IF EXISTS "Admins can delete any post vote" ON public.forum_post_votes;
CREATE POLICY "Admins can delete any post vote" ON public.forum_post_votes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 6. Admin'ler için UPDATE politikaları da ekleyelim (sabitleme, kilitleme vb. için)
DROP POLICY IF EXISTS "Admins can update any topic" ON public.forum_topics;
CREATE POLICY "Admins can update any topic" ON public.forum_topics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update any post" ON public.forum_posts;
CREATE POLICY "Admins can update any post" ON public.forum_posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 7. Admin rolü kontrolü için helper function (opsiyonel, performans için)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Cascade delete ayarlarını kontrol et (foreign key constraints)
-- Forum posts zaten ON DELETE CASCADE olarak ayarlı olmalı
-- Eğer değilse, aşağıdaki komutları çalıştırın:

-- Önce mevcut constraint'leri kaldır
ALTER TABLE public.forum_posts 
DROP CONSTRAINT IF EXISTS forum_posts_topic_id_fkey;

ALTER TABLE public.forum_topic_votes 
DROP CONSTRAINT IF EXISTS forum_topic_votes_topic_id_fkey;

ALTER TABLE public.forum_post_votes 
DROP CONSTRAINT IF EXISTS forum_post_votes_post_id_fkey;

-- Yeni CASCADE constraint'leri ekle
ALTER TABLE public.forum_posts
ADD CONSTRAINT forum_posts_topic_id_fkey 
FOREIGN KEY (topic_id) 
REFERENCES public.forum_topics(id) 
ON DELETE CASCADE;

ALTER TABLE public.forum_topic_votes
ADD CONSTRAINT forum_topic_votes_topic_id_fkey 
FOREIGN KEY (topic_id) 
REFERENCES public.forum_topics(id) 
ON DELETE CASCADE;

ALTER TABLE public.forum_post_votes
ADD CONSTRAINT forum_post_votes_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES public.forum_posts(id) 
ON DELETE CASCADE;

-- 9. Test için: Mevcut politikaları listele
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('forum_topics', 'forum_posts', 'forum_topic_votes', 'forum_post_votes')
ORDER BY tablename, policyname;