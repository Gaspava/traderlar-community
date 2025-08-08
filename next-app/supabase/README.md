# Supabase Database Setup

## Migration Dosyalarını Çalıştırma

### Yöntem 1: Supabase Dashboard'dan (Önerilen)

1. [Supabase Dashboard](https://app.supabase.com)'a gidin
2. Projenizi seçin
3. Sol menüden **SQL Editor**'e tıklayın
4. Yeni bir query oluşturun
5. İlk olarak `migrations/001_initial_schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
6. **Run** butonuna tıklayın
7. Başarılı olduktan sonra, aynı şekilde `migrations/002_functions.sql` dosyasını çalıştırın

### Yöntem 2: Supabase CLI ile

```bash
# Supabase CLI kurulu değilse
npm install -g supabase

# Login
supabase login

# Projeyi bağla
supabase link --project-ref <your-project-ref>

# Migration'ları çalıştır
supabase db push
```

## Veritabanı Şeması

### Tablolar

1. **users** - Kullanıcı profilleri (auth.users ile bağlantılı)
2. **categories** - Makale kategorileri
3. **articles** - Makaleler
4. **article_categories** - Makale-kategori ilişkileri
5. **comments** - Yorumlar (nested yapı destekli)
6. **article_likes** - Makale beğenileri
7. **comment_likes** - Yorum beğenileri
8. **saved_articles** - Kaydedilen makaleler

### Özellikler

- Row Level Security (RLS) aktif
- Otomatik updated_at güncellemesi
- Kullanıcı rolleri (user/admin)
- Nested yorum yapısı
- Full-text arama desteği
- Trend hesaplama fonksiyonları

### Önemli Fonksiyonlar

- `handle_new_user()` - Yeni kullanıcı oluşturulduğunda profil oluşturur
- `increment_article_view()` - Makale görüntülenme sayısını artırır
- `get_article_with_author()` - Makale detaylarını yazar bilgisiyle getirir
- `get_article_comments()` - Yorumları nested yapıda getirir
- `get_trending_articles()` - Trend olan makaleleri hesaplar
- `search_articles()` - Makale arama fonksiyonu

## Varsayılan Kategoriler

Migration çalıştırıldığında otomatik olarak eklenir:
- Genel Tartışma
- Algoritmik Ticaret
- Strateji Paylaşımı
- Piyasa Analizleri
- Eğitim Kaynakları
- Yazılım ve Otomasyon
- Portföy ve Performans
- Kripto Analiz