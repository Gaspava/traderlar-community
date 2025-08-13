-- Sample categories
INSERT INTO categories (id, name, slug, color, description, created_at) VALUES
('c1', 'Forex', 'forex', '#10B981', 'Forex piyasası tartışmaları', NOW()),
('c2', 'Kripto', 'kripto', '#F59E0B', 'Kripto para tartışmaları', NOW()),
('c3', 'Analiz', 'analiz', '#3B82F6', 'Teknik ve temel analizler', NOW()),
('c4', 'Eğitim', 'egitim', '#8B5CF6', 'Trading eğitim içerikleri', NOW()),
('c5', 'Strateji', 'strateji', '#EC4899', 'Trading stratejileri', NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  color = EXCLUDED.color;

-- Sample users (if not exists)
INSERT INTO users (id, email, username, name, created_at) VALUES
('u1', 'trader1@example.com', 'ForexMaster', 'Forex Master', NOW()),
('u2', 'trader2@example.com', 'CryptoExpert', 'Crypto Expert', NOW()),
('u3', 'trader3@example.com', 'TechAnalyst', 'Tech Analyst', NOW()),
('u4', 'trader4@example.com', 'ProTrader', 'Professional Trader', NOW()),
('u5', 'trader5@example.com', 'AlgoTrader', 'Algo Trader', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample Articles
INSERT INTO articles (
  title, 
  slug, 
  excerpt, 
  content, 
  author_id, 
  category_id, 
  featured_image,
  read_time,
  tags,
  view_count,
  created_at,
  updated_at
) VALUES
-- Makale 1
(
  'Forex Piyasasında Risk Yönetimi: Kapsamlı Rehber',
  'forex-risk-yonetimi-rehber',
  'Forex piyasasında başarılı olmanın anahtarı doğru risk yönetimi stratejileridir. Bu rehberde tüm detayları bulabilirsiniz.',
  'Forex piyasasında risk yönetimi, trader''ların sermayelerini korumak ve uzun vadede karlı olmak için uyguladıkları stratejiler bütünüdür. 

## Risk Yönetiminin Önemi

Risk yönetimi, trading''de en kritik unsurlardan biridir. İstatistiklere göre, trader''ların %90''ı ilk yıllarında başarısız olur ve bunun ana sebeplerinden biri yetersiz risk yönetimidir.

## Temel Risk Yönetimi Kuralları

1. **Pozisyon Boyutlandırma**: Her işlemde riskinizi sermayenizin %1-2''si ile sınırlayın.
2. **Stop Loss Kullanımı**: Her işlemde mutlaka stop loss kullanın.
3. **Risk/Ödül Oranı**: Minimum 1:2 risk/ödül oranı hedefleyin.
4. **Çeşitlendirme**: Tüm sermayenizi tek bir işleme yatırmayın.

## Pratik Uygulamalar

Risk yönetimi teoride kolay görünse de pratikte disiplin gerektirir. Duygusal kararlar vermekten kaçının ve trading planınıza sadık kalın.',
  'u1',
  'c1',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  12,
  ARRAY['forex', 'risk-yönetimi', 'trading', 'eğitim'],
  1543,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),

-- Makale 2
(
  'Bitcoin Halving ve Piyasa Üzerindeki Etkileri',
  'bitcoin-halving-piyasa-etkileri',
  'Bitcoin halving olayları kripto piyasasını nasıl etkiliyor? Geçmiş veriler ve gelecek tahminleri.',
  'Bitcoin halving, yaklaşık her 4 yılda bir gerçekleşen ve madencilik ödüllerinin yarıya indirildiği önemli bir olaydır.

## Halving Nedir?

Bitcoin protokolünde yerleşik olan halving mekanizması, enflasyonu kontrol altında tutmak için tasarlanmıştır. Her 210,000 blokta bir madencilik ödülleri yarıya iner.

## Geçmiş Halving''ler ve Fiyat Hareketleri

- **2012 Halving**: BTC fiyatı 12$''dan 1,000$''a yükseldi
- **2016 Halving**: BTC fiyatı 650$''dan 20,000$''a yükseldi  
- **2020 Halving**: BTC fiyatı 8,000$''dan 69,000$''a yükseldi

## 2024 Halving Beklentileri

Nisan 2024''te gerçekleşen son halving sonrası piyasa dinamikleri değişti. Kurumsal yatırımcıların artan ilgisi ve ETF onayları fiyat hareketlerini etkiliyor.',
  'u2',
  'c2',
  'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800',
  10,
  ARRAY['bitcoin', 'halving', 'kripto', 'analiz'],
  2156,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),

-- Makale 3
(
  'Fibonacci Retracement: Teknik Analizde Altın Oran',
  'fibonacci-retracement-teknik-analiz',
  'Fibonacci seviyeleri nasıl hesaplanır ve trading stratejilerinizde nasıl kullanabilirsiniz?',
  'Fibonacci retracement, teknik analizde en çok kullanılan araçlardan biridir. Doğadaki altın orana dayanan bu yöntem, destek ve direnç seviyelerini belirlemede oldukça etkilidir.

## Fibonacci Seviyeleri

Ana Fibonacci seviyeleri:
- %23.6
- %38.2
- %50.0
- %61.8 (Altın Oran)
- %78.6

## Nasıl Uygulanır?

1. Önemli bir dip ve tepe noktası belirleyin
2. Fibonacci aracını bu iki nokta arasına çizin
3. Oluşan seviyeleri potansiyel destek/direnç olarak kullanın

## Trading Stratejileri

Fibonacci seviyeleri tek başına kullanılmamalı, diğer göstergelerle teyit edilmelidir. RSI, MACD gibi momentum göstergeleriyle birlikte kullanıldığında başarı oranı artar.',
  'u3',
  'c3',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  8,
  ARRAY['fibonacci', 'teknik-analiz', 'trading'],
  987,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
),

-- Makale 4
(
  'Algoritmik Trading: Python ile Bot Geliştirme',
  'algoritmik-trading-python-bot',
  'Python kullanarak kendi trading botunuzu nasıl geliştirebilirsiniz? Adım adım rehber.',
  'Algoritmik trading, önceden belirlenmiş kurallara göre otomatik alım satım yapan sistemlerdir. Python, zengin kütüphane desteği ile bu alanda en popüler dildir.

## Gerekli Kütüphaneler

```python
import pandas as pd
import numpy as np
import ccxt  # Kripto borsaları için
import ta  # Teknik analiz
from backtesting import Backtest, Strategy
```

## Basit Bir Strateji Örneği

```python
class SimpleMA(Strategy):
    def init(self):
        self.ma20 = self.I(SMA, self.data.Close, 20)
        self.ma50 = self.I(SMA, self.data.Close, 50)
    
    def next(self):
        if crossover(self.ma20, self.ma50):
            self.buy()
        elif crossover(self.ma50, self.ma20):
            self.sell()
```

## Risk Yönetimi ve Backtest

Her strateji mutlaka geçmiş verilerle test edilmeli ve risk parametreleri optimize edilmelidir.',
  'u5',
  'c4',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
  15,
  ARRAY['python', 'algoritmik-trading', 'bot', 'programlama'],
  3421,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),

-- Makale 5
(
  'Trading Psikolojisi: Duygularınızı Kontrol Edin',
  'trading-psikolojisi-duygu-kontrolu',
  'Başarılı bir trader olmak için psikolojik faktörleri nasıl yönetmelisiniz?',
  'Trading''de başarının %80''i psikolojidir. En iyi strateji bile, duygusal kontrol olmadan başarısız olur.

## Yaygın Psikolojik Hatalar

1. **FOMO (Fear of Missing Out)**: Kaçırma korkusu
2. **Açgözlülük**: Kar realizasyonunu geciktirme
3. **Korku**: Erken pozisyon kapatma
4. **İntikam Trading''i**: Kayıpları telafi etme çabası

## Duygusal Kontrol Teknikleri

- Trading günlüğü tutun
- Meditasyon ve mindfulness pratikleri
- Risk yönetimi kurallarına sıkı sıkıya uyun
- Trading planı oluşturun ve ona sadık kalın

## Başarılı Trader Mindset''i

Kayıplar trading''in doğal bir parçasıdır. Önemli olan uzun vadeli karlılıktır.',
  'u4',
  'c4',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  7,
  ARRAY['psikoloji', 'trading', 'mindset', 'eğitim'],
  1876,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
);

-- Sample Trading Strategies
INSERT INTO trading_strategies (
  name,
  slug,
  description,
  author_id,
  category_id,
  timeframe,
  tags,
  performance,
  download_count,
  like_count,
  view_count,
  is_premium,
  created_at,
  updated_at
) VALUES
-- Strateji 1
(
  'RSI Divergence Master Strategy',
  'rsi-divergence-master',
  'RSI divergence sinyalleri ile güçlü dönüş noktalarını yakalayan momentum stratejisi. Yüksek başarı oranı ile dikkat çekiyor.',
  'u5',
  'c5',
  'H4',
  ARRAY['RSI', 'Divergence', 'Momentum', 'Swing'],
  '{"total_return": 186.5, "win_rate": 72.3, "total_trades": 342, "max_drawdown": 12.5}'::jsonb,
  567,
  234,
  4532,
  false,
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
),

-- Strateji 2
(
  'Bollinger Bands Scalping System',
  'bollinger-bands-scalping',
  'Bollinger Bands ve RSI kombinasyonu ile 5 dakikalık grafikte scalping. Yüksek frekanslı işlemler için optimize edilmiş.',
  'u3',
  'c5',
  'M5',
  ARRAY['Bollinger', 'Scalping', 'RSI', 'High-Frequency'],
  '{"total_return": 95.2, "win_rate": 68.9, "total_trades": 1876, "max_drawdown": 8.3}'::jsonb,
  892,
  412,
  6734,
  true,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
),

-- Strateji 3
(
  'Moving Average Crossover Pro',
  'ma-crossover-pro',
  'Klasik MA crossover stratejisinin gelişmiş versiyonu. Trend filtresi ve volatilite adaptasyonu ile güçlendirilmiş.',
  'u1',
  'c5',
  'H1',
  ARRAY['Moving Average', 'Trend', 'Crossover'],
  '{"total_return": 234.5, "win_rate": 58.7, "total_trades": 156, "max_drawdown": 18.2}'::jsonb,
  1234,
  567,
  9876,
  false,
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
),

-- Strateji 4
(
  'Ichimoku Cloud Trading System',
  'ichimoku-cloud-system',
  'Ichimoku göstergesinin tüm bileşenlerini kullanan kapsamlı trend takip stratejisi. Orta ve uzun vadeli trader''lar için ideal.',
  'u4',
  'c5',
  'D1',
  ARRAY['Ichimoku', 'Trend', 'Japanese', 'Long-term'],
  '{"total_return": 312.8, "win_rate": 65.4, "total_trades": 89, "max_drawdown": 22.7}'::jsonb,
  456,
  189,
  3421,
  true,
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days'
),

-- Strateji 5
(
  'MACD Histogram Reversal',
  'macd-histogram-reversal',
  'MACD histogram sıfır çizgisi geçişleri ve divergence sinyalleri ile momentum değişimlerini yakalayan strateji.',
  'u2',
  'c5',
  'H4',
  ARRAY['MACD', 'Histogram', 'Reversal', 'Momentum'],
  '{"total_return": 145.6, "win_rate": 61.2, "total_trades": 287, "max_drawdown": 15.4}'::jsonb,
  678,
  298,
  5432,
  false,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days'
),

-- Strateji 6
(
  'Support Resistance Breakout',
  'support-resistance-breakout',
  'Dinamik destek ve direnç seviyelerinin kırılımlarını takip eden breakout stratejisi. Volume konfirmasyonu ile güçlendirilmiş.',
  'u3',
  'c5',
  'H1',
  ARRAY['Support', 'Resistance', 'Breakout', 'Volume'],
  '{"total_return": 178.9, "win_rate": 59.8, "total_trades": 423, "max_drawdown": 19.6}'::jsonb,
  345,
  156,
  2987,
  false,
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '18 days'
),

-- Strateji 7
(
  'Fibonacci Retracement Pro',
  'fibonacci-retracement-pro',
  'Fibonacci seviyeleri ile kombinlenmiş price action stratejisi. Swing trader''lar için optimize edilmiş.',
  'u1',
  'c5',
  'H4',
  ARRAY['Fibonacci', 'Price Action', 'Swing', 'Retracement'],
  '{"total_return": 201.3, "win_rate": 64.7, "total_trades": 198, "max_drawdown": 16.8}'::jsonb,
  789,
  367,
  6123,
  true,
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days'
),

-- Strateji 8
(
  'Grid Trading Bot',
  'grid-trading-bot',
  'Yatay piyasalarda kar eden otomatik grid trading sistemi. Kripto piyasaları için özel olarak tasarlandı.',
  'u5',
  'c2',
  'M15',
  ARRAY['Grid', 'Bot', 'Crypto', 'Automated'],
  '{"total_return": 89.4, "win_rate": 78.9, "total_trades": 2341, "max_drawdown": 7.2}'::jsonb,
  1567,
  789,
  12345,
  true,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
);

-- Add some article comments for demonstration
INSERT INTO article_comments (article_id, user_id, content, created_at)
SELECT 
  a.id,
  u.id,
  'Harika bir makale, çok faydalı bilgiler var!',
  NOW() - INTERVAL '1 day'
FROM articles a
CROSS JOIN users u
WHERE u.username = 'ForexMaster'
LIMIT 3;

-- Forum topics için de birkaç örnek ekleyelim
INSERT INTO forum_topics (
  title,
  content,
  slug,
  author_id,
  category_id,
  view_count,
  vote_score,
  reply_count,
  created_at,
  updated_at
) VALUES
(
  'EUR/USD Paritesinde Kritik Seviyeler',
  'EUR/USD paritesi 1.0800 desteğini test ediyor. Bu seviyenin kırılması durumunda neler olabilir?',
  'eurusd-kritik-seviyeler',
  'u1',
  'c1',
  234,
  45,
  12,
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 hours'
),
(
  'Bitcoin 100K Hedefine Ulaşabilir mi?',
  'BTC yeniden yükselişe geçti. Teknik göstergeler 100K seviyesini işaret ediyor. Sizce bu hedef gerçekçi mi?',
  'bitcoin-100k-hedefi',
  'u2',
  'c2',
  567,
  89,
  34,
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '6 hours'
);