# Trading Strategies Database Setup

## Durum
Strateji oluşturma işlemi başarılı çalışıyor, ancak stratejiler listede görünmüyor çünkü veritabanı tablosu henüz oluşturulmamış.

## Çözüm Adımları

### 1. Supabase Dashboard'a Git
- [https://supabase.com/](https://supabase.com/) adresine git
- Projen ile giriş yap

### 2. SQL Editor'ı Aç
- Sol menüden "SQL Editor" seç
- "New Query" butonuna tıkla

### 3. Bu SQL Kodunu Çalıştır

```sql
-- Simple trading strategies table for testing
CREATE TABLE IF NOT EXISTS trading_strategies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    author_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    category VARCHAR(50) DEFAULT 'Other',
    timeframe VARCHAR(10),
    is_premium BOOLEAN DEFAULT false,
    
    -- Basic metrics
    total_net_profit DECIMAL(15, 2),
    profit_factor DECIMAL(8, 2),
    total_trades INTEGER,
    win_rate DECIMAL(5, 2),
    sharpe_ratio DECIMAL(8, 3),
    
    -- Engagement
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make table public readable
ALTER TABLE trading_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view strategies" ON trading_strategies FOR SELECT USING (true);
CREATE POLICY "Anyone can create strategies" ON trading_strategies FOR INSERT WITH CHECK (true);
```

### 4. Çalıştır
- "RUN" butonuna bas
- Başarılı mesajı görmeli sin

### 5. Test Et
- Web sitende yeni bir strateji oluştur
- Artık strateji listesinde görünmeli

## Beklenen Sonuç
Bu işlemden sonra:
- ✅ Yeni stratejiler veritabanına kaydedilecek
- ✅ Stratejiler listede görünecek
- ✅ Sistem tamamen çalışır hale gelecek

## Sorun Yaşarsan
Eğer SQL çalıştırırken hata alırsan, bana hata mesajını gönder ve birlikte çözelim.