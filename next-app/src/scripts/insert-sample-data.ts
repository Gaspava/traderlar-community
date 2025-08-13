import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertSampleData() {
  console.log('Starting to insert sample data...');

  try {
    // 1. Insert categories
    console.log('Inserting categories...');
    const categories = [
      { name: 'Forex', slug: 'forex', color: '#10B981', description: 'Forex piyasası tartışmaları' },
      { name: 'Kripto', slug: 'kripto', color: '#F59E0B', description: 'Kripto para tartışmaları' },
      { name: 'Analiz', slug: 'analiz', color: '#3B82F6', description: 'Teknik ve temel analizler' },
      { name: 'Eğitim', slug: 'egitim', color: '#8B5CF6', description: 'Trading eğitim içerikleri' },
      { name: 'Strateji', slug: 'strateji', color: '#EC4899', description: 'Trading stratejileri' }
    ];

    const { data: catData, error: catError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();
    
    if (catError) console.error('Category error:', catError);
    else console.log(`✓ ${catData?.length || 0} categories inserted`);

    // Create category map for references
    const categoryMap = new Map();
    if (catData) {
      catData.forEach(cat => {
        categoryMap.set(cat.slug, cat.id);
      });
    }

    // 2. Insert sample articles
    console.log('Inserting articles...');
    const articles = [
      {
        title: 'Forex Piyasasında Risk Yönetimi: Kapsamlı Rehber',
        slug: 'forex-risk-yonetimi-rehber',
        excerpt: 'Forex piyasasında başarılı olmanın anahtarı doğru risk yönetimi stratejileridir.',
        content: `Forex piyasasında risk yönetimi, trader'ların sermayelerini korumak için uyguladıkları stratejiler bütünüdür.

## Risk Yönetiminin Önemi
Risk yönetimi, trading'de en kritik unsurlardan biridir.

## Temel Kurallar
1. Pozisyon Boyutlandırma
2. Stop Loss Kullanımı
3. Risk/Ödül Oranı`,
        category_id: 'c1',
        featured_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        read_time: 12,
        tags: ['forex', 'risk-yönetimi', 'trading'],
        view_count: 1543
      },
      {
        title: 'Bitcoin Halving ve Piyasa Üzerindeki Etkileri',
        slug: 'bitcoin-halving-piyasa-etkileri',
        excerpt: 'Bitcoin halving olayları kripto piyasasını nasıl etkiliyor?',
        content: `Bitcoin halving, yaklaşık her 4 yılda bir gerçekleşen önemli bir olaydır.

## Geçmiş Halving'ler
- 2012: $12 → $1,000
- 2016: $650 → $20,000
- 2020: $8,000 → $69,000`,
        category_id: 'c2',
        featured_image: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800',
        read_time: 10,
        tags: ['bitcoin', 'halving', 'kripto'],
        view_count: 2156
      },
      {
        title: 'Fibonacci Retracement: Teknik Analizde Altın Oran',
        slug: 'fibonacci-retracement-teknik-analiz',
        excerpt: 'Fibonacci seviyeleri nasıl hesaplanır ve nasıl kullanılır?',
        content: `Fibonacci retracement, teknik analizde en çok kullanılan araçlardan biridir.

## Ana Seviyeler
- %23.6
- %38.2
- %50.0
- %61.8 (Altın Oran)
- %78.6`,
        category_id: 'c3',
        featured_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        read_time: 8,
        tags: ['fibonacci', 'teknik-analiz'],
        view_count: 987
      },
      {
        title: 'Algoritmik Trading: Python ile Bot Geliştirme',
        slug: 'algoritmik-trading-python-bot',
        excerpt: 'Python kullanarak kendi trading botunuzu nasıl geliştirebilirsiniz?',
        content: `Algoritmik trading, önceden belirlenmiş kurallara göre otomatik alım satım yapan sistemlerdir.

## Gerekli Kütüphaneler
- pandas
- numpy
- ccxt
- ta-lib`,
        category_id: 'c4',
        featured_image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
        read_time: 15,
        tags: ['python', 'algoritmik-trading', 'bot'],
        view_count: 3421
      },
      {
        title: 'Trading Psikolojisi: Duygularınızı Kontrol Edin',
        slug: 'trading-psikolojisi-duygu-kontrolu',
        excerpt: 'Başarılı bir trader olmak için psikolojik faktörleri nasıl yönetmelisiniz?',
        content: `Trading'de başarının %80'i psikolojidir.

## Yaygın Hatalar
1. FOMO
2. Açgözlülük
3. Korku
4. İntikam Trading'i`,
        category_id: 'c4',
        featured_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        read_time: 7,
        tags: ['psikoloji', 'trading', 'mindset'],
        view_count: 1876
      }
    ];

    const { data: articleData, error: artError } = await supabase
      .from('articles')
      .insert(articles)
      .select();
    
    if (artError) console.error('Article error:', artError);
    else console.log(`✓ ${articleData?.length || 0} articles inserted`);

    // 3. Insert trading strategies
    console.log('Inserting trading strategies...');
    const strategies = [
      {
        name: 'RSI Divergence Master Strategy',
        slug: 'rsi-divergence-master',
        description: 'RSI divergence sinyalleri ile güçlü dönüş noktalarını yakalayan momentum stratejisi.',
        category_id: 'c5',
        timeframe: 'H4',
        tags: ['RSI', 'Divergence', 'Momentum'],
        performance: {
          total_return: 186.5,
          win_rate: 72.3,
          total_trades: 342,
          max_drawdown: 12.5
        },
        download_count: 567,
        like_count: 234,
        view_count: 4532,
        is_premium: false
      },
      {
        name: 'Bollinger Bands Scalping System',
        slug: 'bollinger-bands-scalping',
        description: 'Bollinger Bands ve RSI kombinasyonu ile 5 dakikalık grafikte scalping.',
        category_id: 'c5',
        timeframe: 'M5',
        tags: ['Bollinger', 'Scalping', 'RSI'],
        performance: {
          total_return: 95.2,
          win_rate: 68.9,
          total_trades: 1876,
          max_drawdown: 8.3
        },
        download_count: 892,
        like_count: 412,
        view_count: 6734,
        is_premium: true
      },
      {
        name: 'Moving Average Crossover Pro',
        slug: 'ma-crossover-pro',
        description: 'Klasik MA crossover stratejisinin gelişmiş versiyonu.',
        category_id: 'c5',
        timeframe: 'H1',
        tags: ['Moving Average', 'Trend', 'Crossover'],
        performance: {
          total_return: 234.5,
          win_rate: 58.7,
          total_trades: 156,
          max_drawdown: 18.2
        },
        download_count: 1234,
        like_count: 567,
        view_count: 9876,
        is_premium: false
      },
      {
        name: 'Ichimoku Cloud Trading System',
        slug: 'ichimoku-cloud-system',
        description: 'Ichimoku göstergesinin tüm bileşenlerini kullanan kapsamlı trend takip stratejisi.',
        category_id: 'c5',
        timeframe: 'D1',
        tags: ['Ichimoku', 'Trend', 'Japanese'],
        performance: {
          total_return: 312.8,
          win_rate: 65.4,
          total_trades: 89,
          max_drawdown: 22.7
        },
        download_count: 456,
        like_count: 189,
        view_count: 3421,
        is_premium: true
      },
      {
        name: 'MACD Histogram Reversal',
        slug: 'macd-histogram-reversal',
        description: 'MACD histogram sıfır çizgisi geçişleri ve divergence sinyalleri.',
        category_id: 'c5',
        timeframe: 'H4',
        tags: ['MACD', 'Histogram', 'Reversal'],
        performance: {
          total_return: 145.6,
          win_rate: 61.2,
          total_trades: 287,
          max_drawdown: 15.4
        },
        download_count: 678,
        like_count: 298,
        view_count: 5432,
        is_premium: false
      },
      {
        name: 'Grid Trading Bot',
        slug: 'grid-trading-bot',
        description: 'Yatay piyasalarda kar eden otomatik grid trading sistemi.',
        category_id: 'c2',
        timeframe: 'M15',
        tags: ['Grid', 'Bot', 'Crypto', 'Automated'],
        performance: {
          total_return: 89.4,
          win_rate: 78.9,
          total_trades: 2341,
          max_drawdown: 7.2
        },
        download_count: 1567,
        like_count: 789,
        view_count: 12345,
        is_premium: true
      }
    ];

    const { data: stratData, error: stratError } = await supabase
      .from('trading_strategies')
      .insert(strategies)
      .select();
    
    if (stratError) console.error('Strategy error:', stratError);
    else console.log(`✓ ${stratData?.length || 0} strategies inserted`);

    // 4. Insert forum topics
    console.log('Inserting forum topics...');
    const forumTopics = [
      {
        title: 'EUR/USD Paritesinde Kritik Seviyeler',
        content: 'EUR/USD paritesi 1.0800 desteğini test ediyor. Bu seviyenin kırılması durumunda neler olabilir?',
        slug: 'eurusd-kritik-seviyeler',
        category_id: 'c1',
        view_count: 234,
        vote_score: 45,
        reply_count: 12
      },
      {
        title: 'Bitcoin 100K Hedefine Ulaşabilir mi?',
        content: 'BTC yeniden yükselişe geçti. Teknik göstergeler 100K seviyesini işaret ediyor.',
        slug: 'bitcoin-100k-hedefi',
        category_id: 'c2',
        view_count: 567,
        vote_score: 89,
        reply_count: 34
      }
    ];

    const { data: topicData, error: topicError } = await supabase
      .from('forum_topics')
      .insert(forumTopics)
      .select();
    
    if (topicError) console.error('Forum topic error:', topicError);
    else console.log(`✓ ${topicData?.length || 0} forum topics inserted`);

    console.log('\n✅ Sample data insertion completed!');

  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Run the script
insertSampleData();