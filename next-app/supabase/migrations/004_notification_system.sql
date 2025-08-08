-- Notification System Tables

-- Notification Types
CREATE TABLE IF NOT EXISTS notification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  template TEXT, -- Message template with placeholders
  icon VARCHAR(50),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type_id UUID REFERENCES notification_types(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Additional data (user info, links, etc.)
  is_read BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type_id UUID NOT NULL REFERENCES notification_types(id),
  in_app BOOLEAN DEFAULT TRUE,
  email BOOLEAN DEFAULT TRUE,
  push BOOLEAN DEFAULT FALSE,
  frequency VARCHAR(20) DEFAULT 'instant', -- 'instant', 'daily', 'weekly', 'never'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type_id)
);

-- Email Queue for batch sending
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  template_name VARCHAR(50),
  template_data JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sending', 'sent', 'failed'
  attempts INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push Subscriptions (for web push notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL, -- p256dh and auth keys
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Notification Groups (for grouping similar notifications)
CREATE TABLE IF NOT EXISTS notification_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_key VARCHAR(100) NOT NULL,
  count INTEGER DEFAULT 1,
  last_notification_id UUID REFERENCES notifications(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, group_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notification_groups_user ON notification_groups(user_id);

-- Insert default notification types
INSERT INTO notification_types (name, description, template, icon, color) VALUES
  ('new_follower', 'Yeni takipçi', '{follower_name} sizi takip etmeye başladı', 'UserPlus', 'blue'),
  ('new_comment', 'Yeni yorum', '{commenter_name} gönderinize yorum yaptı: "{comment_preview}"', 'MessageCircle', 'green'),
  ('new_like', 'Yeni beğeni', '{liker_name} gönderinizi beğendi', 'Heart', 'red'),
  ('mention', 'Bahsetme', '{mentioner_name} sizi bir yorumda bahsetti', 'At', 'purple'),
  ('new_message', 'Yeni mesaj', '{sender_name} size mesaj gönderdi', 'Mail', 'blue'),
  ('achievement_earned', 'Başarı kazandınız', '"{achievement_name}" başarısını kazandınız!', 'Award', 'yellow'),
  ('best_answer', 'En iyi cevap seçildi', 'Cevabınız en iyi cevap olarak seçildi', 'CheckCircle', 'green'),
  ('forum_reply', 'Forum cevabı', '{replier_name} konunuza cevap verdi', 'MessageSquare', 'blue'),
  ('strategy_feedback', 'Strateji geri bildirimi', '{user_name} stratejinize yorum yaptı', 'TrendingUp', 'orange'),
  ('level_up', 'Seviye atladınız', 'Tebrikler! {new_level}. seviyeye ulaştınız', 'Star', 'yellow'),
  ('weekly_summary', 'Haftalık özet', 'Bu haftaki aktiviteniz hazır', 'Calendar', 'gray'),
  ('trade_alert', 'Trade uyarısı', 'Takip ettiğiniz trader yeni pozisyon açtı', 'AlertCircle', 'red'),
  ('system_announcement', 'Sistem duyurusu', '{announcement_title}', 'Bell', 'blue');

-- Functions

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_type_id UUID;
  v_template TEXT;
  v_title VARCHAR(255);
  v_message TEXT;
  v_icon VARCHAR(50);
  v_color VARCHAR(20);
BEGIN
  -- Get notification type info
  SELECT id, template, icon, color 
  INTO v_type_id, v_template, v_icon, v_color
  FROM notification_types 
  WHERE name = p_type AND is_active = TRUE;
  
  IF v_type_id IS NULL THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type;
  END IF;
  
  -- Build message from template
  v_message := v_template;
  v_title := p_data->>'title';
  
  -- Replace placeholders in template
  FOR key, value IN SELECT * FROM jsonb_each_text(p_data) LOOP
    v_message := REPLACE(v_message, '{' || key || '}', value);
  END LOOP;
  
  -- If no custom title, use type name
  IF v_title IS NULL THEN
    v_title := INITCAP(REPLACE(p_type, '_', ' '));
  END IF;
  
  -- Insert notification
  INSERT INTO notifications (user_id, type_id, title, message, data)
  VALUES (p_user_id, v_type_id, v_title, v_message, p_data || jsonb_build_object('icon', v_icon, 'color', v_color))
  RETURNING id INTO v_notification_id;
  
  -- Trigger realtime update
  PERFORM pg_notify(
    'new_notification',
    json_build_object(
      'user_id', p_user_id,
      'notification_id', v_notification_id
    )::text
  );
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all as read
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id AND NOT is_read;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id AND id = ANY(p_notification_ids) AND NOT is_read;
  END IF;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id AND NOT is_read
  );
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Delete read notifications older than 30 days
  DELETE FROM notifications
  WHERE is_read = TRUE AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Delete expired notifications
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Triggers

-- Auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id, type_id, in_app, email)
  SELECT NEW.id, id, TRUE, TRUE
  FROM notification_types
  WHERE is_active = TRUE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_preferences_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_notification_preferences();

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_groups ENABLE ROW LEVEL SECURITY;

-- Notification policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Preference policies
CREATE POLICY "Users can view own preferences" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Email queue policies
CREATE POLICY "System can manage email queue" ON email_queue FOR ALL USING (true);

-- Push subscription policies
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Notification group policies
CREATE POLICY "Users can view own groups" ON notification_groups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage groups" ON notification_groups FOR ALL USING (true);