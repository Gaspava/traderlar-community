# Forum Admin Silme İşlemi Düzeltmesi

## Sorun
Admin kullanıcıları forum konularını silemiyordu çünkü Supabase RLS (Row Level Security) politikaları sadece konu sahiplerinin kendi konularını silmesine izin veriyordu.

## Çözüm

### Seçenek 1: RLS Politikalarını Güncelleme (Önerilen)
1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `FIX_ADMIN_DELETE_POLICY.sql` dosyasındaki SQL kodunu çalıştırın
4. Bu kod admin kullanıcılarının tüm forum konularını silebilmesi için gerekli RLS politikalarını ekler

### Seçenek 2: Service Role Key Kullanma
1. Supabase Dashboard > Settings > API bölümüne gidin
2. `service_role` (secret) anahtarını kopyalayın
3. `.env.local` dosyanıza şu satırı ekleyin:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
4. Uygulamayı yeniden başlatın

## Yapılan Değişiklikler

### 1. API Route Güncellendi (`/api/forum/topics/[id]/route.ts`)
- Admin kontrolü eklendi
- İlişkili verilerin (votes, posts) silinmesi eklendi
- Service role client desteği eklendi (eğer key varsa)

### 2. Admin Client Oluşturuldu (`/lib/supabase/admin.ts`)
- Service role key ile RLS'i bypass eden client
- Admin işlemleri için kullanılır

### 3. SQL Politikaları (`FIX_ADMIN_DELETE_POLICY.sql`)
- Admin'ler için DELETE politikaları
- Admin'ler için UPDATE politikaları
- CASCADE delete constraint'leri

## Test Etme
1. Admin hesabınızla giriş yapın
2. Admin paneline gidin: `/admin/forum-topics`
3. Herhangi bir konuyu silmeyi deneyin
4. Artık başarılı olmalı!

## Güvenlik Notu
⚠️ **SUPABASE_SERVICE_ROLE_KEY** çok güçlü bir anahtardır ve tüm RLS politikalarını bypass eder. Bu anahtarı asla client-side kodda kullanmayın ve güvenli bir şekilde saklayın!