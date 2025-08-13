-- Veritabanı Temizlik Fonksiyonları
-- Bu SQL kodunu Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Makale yorumlarını ve ilişkili verilerini silme fonksiyonu
CREATE OR REPLACE FUNCTION delete_article_comments(article_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Comment likes'ları sil
    DELETE FROM comment_likes 
    WHERE comment_id IN (
        SELECT id FROM comments WHERE article_id = delete_article_comments.article_id
    );
    
    -- Child comments'ları sil (reply sistemi varsa)
    DELETE FROM comments 
    WHERE parent_id IN (
        SELECT id FROM comments WHERE article_id = delete_article_comments.article_id
    );
    
    -- Ana comments'ları sil
    DELETE FROM comments 
    WHERE article_id = delete_article_comments.article_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Kullanıcıya ait tüm verileri silme fonksiyonu (GDPR compliance)
CREATE OR REPLACE FUNCTION delete_user_data(user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- User'a ait tüm beğenileri sil
    DELETE FROM article_likes WHERE user_id = delete_user_data.user_id;
    DELETE FROM comment_likes WHERE user_id = delete_user_data.user_id;
    DELETE FROM forum_topic_votes WHERE user_id = delete_user_data.user_id;
    DELETE FROM forum_post_votes WHERE user_id = delete_user_data.user_id;
    DELETE FROM strategy_favorites WHERE user_id = delete_user_data.user_id;
    DELETE FROM strategy_ratings WHERE user_id = delete_user_data.user_id;
    DELETE FROM strategy_downloads WHERE user_id = delete_user_data.user_id;
    
    -- User'a ait yorumları sil
    DELETE FROM comments WHERE user_id = delete_user_data.user_id;
    DELETE FROM strategy_comments WHERE user_id = delete_user_data.user_id;
    
    -- User'a ait forum posts'ları sil
    DELETE FROM forum_posts WHERE author_id = delete_user_data.user_id;
    
    -- User'a ait forum topics'ları sil
    DELETE FROM forum_topics WHERE author_id = delete_user_data.user_id;
    
    -- User'a ait stratejileri sil
    DELETE FROM trading_strategies WHERE author_id = delete_user_data.user_id;
    
    -- User'a ait makaleleri sil
    DELETE FROM articles WHERE author_id = delete_user_data.user_id;
    
    -- User'a ait manual backtests'ları sil
    DELETE FROM manual_backtests WHERE user_id = delete_user_data.user_id;
    
    -- User'a ait notifications'ları sil
    DELETE FROM notifications WHERE user_id = delete_user_data.user_id;
    DELETE FROM notifications WHERE sender_id = delete_user_data.user_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Strateji ile ilişkili tüm verileri silme fonksiyonu
CREATE OR REPLACE FUNCTION delete_strategy_data(strategy_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Strategy favorites sil
    DELETE FROM strategy_favorites WHERE strategy_id = delete_strategy_data.strategy_id;
    
    -- Strategy ratings sil
    DELETE FROM strategy_ratings WHERE strategy_id = delete_strategy_data.strategy_id;
    
    -- Strategy comments sil
    DELETE FROM strategy_comments WHERE strategy_id = delete_strategy_data.strategy_id;
    
    -- Strategy downloads sil
    DELETE FROM strategy_downloads WHERE strategy_id = delete_strategy_data.strategy_id;
    
    -- Manual backtests sil (strategy ile ilişkili)
    DELETE FROM manual_backtest_trades 
    WHERE backtest_id IN (
        SELECT id FROM manual_backtests 
        WHERE strategy_id = delete_strategy_data.strategy_id
    );
    
    DELETE FROM manual_backtests WHERE strategy_id = delete_strategy_data.strategy_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Forum topic ile ilişkili tüm verileri silme fonksiyonu
CREATE OR REPLACE FUNCTION delete_forum_topic_data(topic_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Post votes'ları sil
    DELETE FROM forum_post_votes 
    WHERE post_id IN (
        SELECT id FROM forum_posts WHERE topic_id = delete_forum_topic_data.topic_id
    );
    
    -- Topic votes'ları sil
    DELETE FROM forum_topic_votes WHERE topic_id = delete_forum_topic_data.topic_id;
    
    -- Posts'ları sil
    DELETE FROM forum_posts WHERE topic_id = delete_forum_topic_data.topic_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Kategori ile ilişkili tüm verileri silme fonksiyonu
CREATE OR REPLACE FUNCTION delete_category_data(category_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Article categories ilişkilerini sil
    DELETE FROM article_categories WHERE category_id = delete_category_data.category_id;
    
    -- Forum topics'ları başka kategoriye taşı ya da sil (business logic'e göre)
    UPDATE forum_topics 
    SET category_id = (SELECT id FROM categories WHERE slug = 'genel' LIMIT 1)
    WHERE category_id = delete_category_data.category_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Otomatik temizlik fonksiyonu (eski verileri temizler)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- 1 yıldan eski soft delete'li kayıtları sil
    DELETE FROM articles 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '1 year';
    
    -- 6 aydan eski log kayıtlarını sil (eğer log tablosu varsa)
    -- DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '6 months';
    
    -- 1 aydan eski geçici dosyaları temizle (eğer temp files tablosu varsa)
    -- DELETE FROM temp_files WHERE created_at < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- 7. Performans için istatistikleri güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_content_stats()
RETURNS VOID AS $$
BEGIN
    -- Article comment count'ları güncelle
    UPDATE articles 
    SET comment_count = (
        SELECT COUNT(*) 
        FROM comments 
        WHERE article_id = articles.id
    );
    
    -- Article like count'ları güncelle
    UPDATE articles 
    SET like_count = (
        SELECT COUNT(*) 
        FROM article_likes 
        WHERE article_id = articles.id
    );
    
    -- Forum topic reply count'ları güncelle
    UPDATE forum_topics 
    SET reply_count = (
        SELECT COUNT(*) 
        FROM forum_posts 
        WHERE topic_id = forum_topics.id
    );
    
    -- User statistics güncelle
    UPDATE users 
    SET 
        article_count = (
            SELECT COUNT(*) 
            FROM articles 
            WHERE author_id = users.id AND is_published = true
        ),
        strategy_count = (
            SELECT COUNT(*) 
            FROM trading_strategies 
            WHERE author_id = users.id
        );
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger'lar için güvenli silme fonksiyonu
CREATE OR REPLACE FUNCTION safe_cascade_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Bu fonksiyon trigger'larda kullanılabilir
    -- Cascade delete işlemlerini kontrol eder
    RAISE NOTICE 'Cascade delete triggered for table: %, id: %', TG_TABLE_NAME, OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Fonksiyonların kullanımı için örnekler:
-- SELECT delete_article_comments('article-uuid-here');
-- SELECT delete_user_data('user-uuid-here');
-- SELECT delete_strategy_data('strategy-uuid-here');
-- SELECT cleanup_old_data();
-- SELECT update_content_stats();

SELECT 'Database cleanup functions created successfully!' as status;