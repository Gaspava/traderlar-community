-- First, delete existing categories to avoid conflicts
DELETE FROM public.categories;

-- Insert new categories with updated list
INSERT INTO public.categories (name, slug, description, icon, color) VALUES
    ('Genel Tartışma', 'genel-tartisma', 'Trading dünyasıyla ilgili genel konular ve sohbetler', 'MessageCircle', '#10b981'),
    ('Algoritmik Ticaret', 'algoritmik-ticaret', 'Algoritmik trading stratejileri, bot geliştirme ve otomatik sistemler', 'Bot', '#3b82f6'),
    ('Strateji Paylaşımı', 'strateji-paylasimi', 'Trading stratejilerini paylaşın, tartışın ve geliştirin', 'TrendingUp', '#f59e0b'),
    ('Prop Firm ve Fon Yönetimi', 'prop-firm-ve-fon-yonetimi', 'Prop trading firmaları, challenge süreçleri ve fon yönetimi', 'Building', '#8b5cf6'),
    ('Yazılım ve Otomasyon', 'yazilim-ve-otomasyon', 'Trading yazılımları, API entegrasyonları ve otomasyon çözümleri', 'Code', '#06b6d4'),
    ('Portföy ve Performans', 'portfoly-ve-performans', 'Portföy yönetimi, risk analizi ve performans değerlendirme', 'PieChart', '#ec4899'),
    ('Piyasa Analizleri', 'piyasa-analizleri', 'Güncel piyasa analizleri, teknik ve temel analiz', 'LineChart', '#ef4444'),
    ('Eğitim Kaynakları', 'egitim-kaynaklari', 'Trading eğitimi, kitaplar, kurslar ve öğrenme materyalleri', 'GraduationCap', '#14b8a6'),
    ('Trade Psikolojisi', 'trade-psikolojisi', 'Trading psikolojisi, disiplin ve duygusal kontrol', 'Brain', '#f97316'),
    ('Hukuk ve Vergilendirme', 'hukuk-ve-vergilendirme', 'Trading ile ilgili yasal konular ve vergi düzenlemeleri', 'Scale', '#64748b');