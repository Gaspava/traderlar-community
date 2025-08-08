# Forum Sistemi Dokümantasyonu

## 🎯 Özellikler

### ✅ Tamamlanan Özellikler

1. **Kategori Yönetimi**
   - Database'den dinamik kategori listesi
   - Kategori bazlı konu listeleme
   - Konu ve mesaj sayıları
   - Son mesaj bilgisi

2. **Konu (Topic) Yönetimi**
   - Yeni konu oluşturma
   - Konu detay görüntüleme
   - Pin/Lock özellikleri
   - View count tracking
   - Slug bazlı URL yapısı

3. **Mesaj (Post) Sistemi**
   - Konulara yanıt yazma
   - Nested replies (yanıtlara yanıt)
   - Gerçek zamanlı mesaj ekleme
   - Edit göstergesi

4. **Vote Sistemi**
   - Upvote/Downvote fonksiyonları
   - Hem konular hem de mesajlar için
   - Vote score hesaplama
   - Kullanıcı bazlı vote tracking

5. **Kullanıcı Yetkilendirme**
   - Login kontrolü
   - Kendi içeriğini düzenleme
   - Admin yetkileri

6. **İstatistikler**
   - Toplam konu sayısı
   - Toplam mesaj sayısı
   - Aktif kullanıcı sayısı (son 30 gün)

## 📁 Veritabanı Yapısı

### Tablolar

1. **categories** - Forum kategorileri
2. **forum_topics** - Forum konuları
3. **forum_posts** - Forum mesajları
4. **forum_topic_votes** - Konu oyları
5. **forum_post_votes** - Mesaj oyları

### İlişkiler

- Bir kategori → Birden fazla konu
- Bir konu → Birden fazla mesaj
- Bir mesaj → Birden fazla yanıt (nested)
- Bir kullanıcı → Birden fazla oy

## 🚀 API Endpoints

### Topics
- `GET /api/forum/topics` - Konuları listele
- `POST /api/forum/topics` - Yeni konu oluştur
- `GET /api/forum/topics/[id]` - Konu detayı
- `PATCH /api/forum/topics/[id]` - Konu güncelle
- `DELETE /api/forum/topics/[id]` - Konu sil

### Posts
- `GET /api/forum/topics/[id]/posts` - Mesajları listele
- `POST /api/forum/topics/[id]/posts` - Yeni mesaj ekle

### Votes
- `POST /api/forum/topics/[id]/vote` - Konuya oy ver
- `POST /api/forum/posts/[id]/vote` - Mesaja oy ver

## 🎨 UI Bileşenleri

### Sayfalar
- `/forum` - Ana sayfa (kategoriler)
- `/forum/[slug]` - Kategori sayfası (konular)
- `/forum/[slug]/new-topic` - Yeni konu oluştur
- `/forum/[slug]/[topicSlug]` - Konu detayı

### Özellikler
- Responsive tasarım
- Real-time vote güncellemeleri
- Nested comment görünümü
- Loading states
- Error handling

## 🔒 Güvenlik

- Row Level Security (RLS) politikaları
- Authentication kontrolleri
- Input validation
- SQL injection koruması

## 📈 Performans

- Indexed queries
- Pagination desteği
- Lazy loading
- Optimized database queries

## 🛠️ Kullanım

### Yeni Konu Açma
1. Kategori sayfasına git
2. "Yeni Konu" butonuna tıkla
3. Başlık ve içerik gir
4. "Konuyu Paylaş" butonuna tıkla

### Yanıt Yazma
1. Konu detay sayfasına git
2. "Yanıtla" butonuna tıkla
3. Mesajını yaz
4. "Gönder" butonuna tıkla

### Oy Verme
- Yukarı ok: Beğen (+1)
- Aşağı ok: Beğenme (-1)
- Tekrar tıklama: Oyu geri al

## 🔄 Gelecek Güncellemeler

- [ ] Arama fonksiyonu
- [ ] Kullanıcı profil entegrasyonu
- [ ] Bildirim sistemi
- [ ] Mesaj düzenleme
- [ ] Zengin metin editörü
- [ ] Dosya/resim yükleme
- [ ] Moderasyon araçları
- [ ] Raporlama sistemi

## 🐛 Bilinen Sorunlar

- Kategori filtreleme nested query sorunu (geçici çözüm uygulandı)
- Sayfa yenilemede bazen vote state kaybı

## 📝 Notlar

- Tüm tarihler Türkçe formatında gösteriliyor
- Slug'lar Türkçe karakterler düzeltilerek oluşturuluyor
- Mock data yerine gerçek database kullanılıyor
- Authentication zorunlu (login olmadan sadece okuma)