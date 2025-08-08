// Professional Metric Analysis System
// Provides detailed contextual analysis for each metric range

export interface MetricAnalysis {
  rating: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  color: string;
  title: string;
  description: string;
  implications: string[];
  recommendations: string[];
}

// Sharpe Ratio Analysis (Risk-Adjusted Returns)
export function analyzeSharpeRatio(sharpeRatio: number): MetricAnalysis {
  if (sharpeRatio >= 3.0) {
    return {
      rating: 'excellent',
      color: 'text-emerald-400',
      title: 'Mükemmel Risk-Ayarlı Getiri',
      description: `${sharpeRatio.toFixed(2)} Sharpe oranı ile strateji, hedge fon standartlarının çok üzerinde performans gösteriyor. Bu seviye, profesyonel para yöneticileri arasında bile nadirdir.`,
      implications: [
        'Risk başına getiri oranı olağanüstü yüksek',
        'Tutarlı ve düşük volatilite ile yüksek getiri',
        'Kurumsal yatırımcılar için cazip seviye',
        'Piyasa koşullarından bağımsız güçlü performans'
      ],
      recommendations: [
        'Mevcut risk yönetimi parametrelerini koruyun',
        'Pozisyon boyutlarını kademeli artırabilirsiniz',
        'Bu performansı korumak için sistem değişikliklerinden kaçının'
      ]
    };
  } else if (sharpeRatio >= 2.0) {
    return {
      rating: 'excellent',
      color: 'text-green-400',
      title: 'Çok İyi Risk-Ayarlı Getiri',
      description: `${sharpeRatio.toFixed(2)} Sharpe oranı profesyonel standartlarda mükemmel bir performans gösteriyor. Çoğu başarılı hedge fon bu aralıkta çalışır.`,
      implications: [
        'Üstün risk yönetimi ve getiri dengesi',
        'Profesyonel trading standartlarında performans',
        'Düşük volatilite ile tutarlı kazançlar',
        'Scalability için uygun seviye'
      ],
      recommendations: [
        'Risk parametrelerini optimize etmeye devam edin',
        'Drawdown dönemlerini minimize edecek iyileştirmeler yapın',
        'Leverage kullanımı için uygun seviye'
      ]
    };
  } else if (sharpeRatio >= 1.5) {
    return {
      rating: 'good',
      color: 'text-green-400',
      title: 'İyi Risk-Ayarlı Getiri',
      description: `${sharpeRatio.toFixed(2)} Sharpe oranı, riskin iyi yönetildiğini ve getirilerin tutarlı olduğunu gösteriyor. Profesyonel trading için kabul edilebilir seviye.`,
      implications: [
        'Pozitif risk-getiri dengesi',
        'Orta-üst seviye performans',
        'Makul volatilite seviyesi',
        'İyileştirme potansiyeli mevcut'
      ],
      recommendations: [
        'Win rate veya average win/loss oranını iyileştirin',
        'Volatiliteyi azaltacak filtreler ekleyin',
        'Entry/exit timing optimizasyonu yapın'
      ]
    };
  } else if (sharpeRatio >= 1.0) {
    return {
      rating: 'average',
      color: 'text-yellow-400',
      title: 'Ortalama Risk-Ayarlı Getiri',
      description: `${sharpeRatio.toFixed(2)} Sharpe oranı minimum kabul edilebilir seviyede. Risk başına getiri tatmin edici değil ve iyileştirme gerekiyor.`,
      implications: [
        'Risk-getiri dengesi zayıf',
        'Yüksek volatilite problemi',
        'Tutarsız performans dönemleri',
        'Profesyonel standartların altında'
      ],
      recommendations: [
        'Risk yönetimi kurallarını sıkılaştırın',
        'Stop loss seviyelerini optimize edin',
        'Daha seçici trade filtreleri uygulayın',
        'Position sizing stratejisini gözden geçirin'
      ]
    };
  } else if (sharpeRatio >= 0.5) {
    return {
      rating: 'poor',
      color: 'text-orange-400',
      title: 'Zayıf Risk-Ayarlı Getiri',
      description: `${sharpeRatio.toFixed(2)} Sharpe oranı, alınan riske göre yetersiz getiri olduğunu gösteriyor. Strateji ciddi revizyona ihtiyaç duyuyor.`,
      implications: [
        'Risk-getiri dengesi bozuk',
        'Aşırı volatilite',
        'Güvenilmez performans',
        'Sermaye kaybı riski yüksek'
      ],
      recommendations: [
        'Trading stratejisini baştan değerlendirin',
        'Risk limitlerini ciddi şekilde azaltın',
        'Backtest sonuçlarını yeniden analiz edin',
        'Paper trading ile test edin'
      ]
    };
  } else {
    return {
      rating: 'critical',
      color: 'text-red-400',
      title: 'Kritik Risk-Getiri Dengesizliği',
      description: `${sharpeRatio.toFixed(2)} Sharpe oranı kabul edilemez seviyede. Strateji, alınan riske göre değer üretmiyor.`,
      implications: [
        'Aşırı yüksek risk, düşük getiri',
        'Sermaye kaybı neredeyse kesin',
        'Strateji temelden hatalı',
        'Acil müdahale gerekli'
      ],
      recommendations: [
        'Trading\'i derhal durdurun',
        'Stratejiyi komple yeniden tasarlayın',
        'Profesyonel danışmanlık alın',
        'Daha basit stratejilerle başlayın'
      ]
    };
  }
}

// Win Rate Analysis
export function analyzeWinRate(winRate: number): MetricAnalysis {
  if (winRate >= 70) {
    return {
      rating: 'excellent',
      color: 'text-emerald-400',
      title: 'Olağanüstü Yüksek Kazanma Oranı',
      description: `%${winRate.toFixed(1)} kazanma oranı son derece yüksek. Bu seviye genelde scalping veya yüksek frekanslı trading stratejilerinde görülür.`,
      implications: [
        'Çok güçlü trade seçimi',
        'Mükemmel piyasa timing\'i',
        'Düşük risk toleransı',
        'Tutarlı küçük kazançlar'
      ],
      recommendations: [
        'Average win/loss oranını kontrol edin',
        'Overtrading\'den kaçının',
        'Profit target\'ları optimize edin',
        'Risk/reward dengesini gözden geçirin'
      ]
    };
  } else if (winRate >= 60) {
    return {
      rating: 'good',
      color: 'text-green-400',
      title: 'Yüksek Kazanma Oranı',
      description: `%${winRate.toFixed(1)} kazanma oranı profesyonel seviyede. Tutarlı karlılık için ideal aralıkta.`,
      implications: [
        'İyi trade filtreleme',
        'Etkili risk yönetimi',
        'Güvenilir sinyal kalitesi',
        'Sürdürülebilir performans'
      ],
      recommendations: [
        'Mevcut stratejiyi koruyun',
        'RR oranını optimize edin',
        'Winning streak\'leri maksimize edin',
        'Loss recovery stratejisi geliştirin'
      ]
    };
  } else if (winRate >= 50) {
    return {
      rating: 'average',
      color: 'text-yellow-400',
      title: 'Ortalama Kazanma Oranı',
      description: `%${winRate.toFixed(1)} kazanma oranı tipik seviyede. Karlılık için RR oranı kritik önemde.`,
      implications: [
        'Standart performans',
        'RR oranına bağımlı karlılık',
        'Orta seviye trade kalitesi',
        'İyileştirme potansiyeli var'
      ],
      recommendations: [
        'Trade filtrelerini güçlendirin',
        'Entry sinyallerini optimize edin',
        'False signal\'leri azaltın',
        'Win size > loss size sağlayın'
      ]
    };
  } else if (winRate >= 40) {
    return {
      rating: 'poor',
      color: 'text-orange-400',
      title: 'Düşük Kazanma Oranı',
      description: `%${winRate.toFixed(1)} kazanma oranı düşük. Yüksek RR oranı olmadan karlılık zor.`,
      implications: [
        'Zayıf trade seçimi',
        'Yüksek false signal oranı',
        'Psikolojik baskı fazla',
        'Sermaye riski yüksek'
      ],
      recommendations: [
        'Trade kriterlerini sıkılaştırın',
        'Confirmation filter\'ları ekleyin',
        'Daha likit piyasalarda işlem yapın',
        'Stop loss disiplinine odaklanın'
      ]
    };
  } else {
    return {
      rating: 'critical',
      color: 'text-red-400',
      title: 'Kritik Düşük Kazanma Oranı',
      description: `%${winRate.toFixed(1)} kazanma oranı kabul edilemez. Strateji temel revizyon gerektiriyor.`,
      implications: [
        'Strateji çalışmıyor',
        'Sürekli sermaye kaybı',
        'Trade logic hatalı',
        'Acil müdahale şart'
      ],
      recommendations: [
        'Trading\'i durdurun',
        'Stratejiyi baştan analiz edin',
        'Paper trade ile test edin',
        'Eğitim ve mentorluk alın'
      ]
    };
  }
}

// Max Drawdown Analysis
export function analyzeMaxDrawdown(maxDrawdown: number): MetricAnalysis {
  const dd = Math.abs(maxDrawdown);
  
  if (dd <= 5) {
    return {
      rating: 'excellent',
      color: 'text-emerald-400',
      title: 'Minimal Drawdown - Üstün Risk Kontrolü',
      description: `%${dd.toFixed(1)} maksimum drawdown mükemmel risk yönetimini gösteriyor. Bu seviye kurumsal standartlarda.`,
      implications: [
        'Olağanüstü sermaye koruması',
        'Çok düşük volatilite',
        'Psikolojik açıdan rahat',
        'Compound growth için ideal'
      ],
      recommendations: [
        'Bu seviyeyi korumaya odaklanın',
        'Pozisyon boyutunu kademeli artırabilirsiniz',
        'Risk parametrelerini değiştirmeyin'
      ]
    };
  } else if (dd <= 10) {
    return {
      rating: 'good',
      color: 'text-green-400',
      title: 'Düşük Drawdown - İyi Risk Yönetimi',
      description: `%${dd.toFixed(1)} maksimum drawdown profesyonel trading için ideal seviyede. Risk iyi kontrol altında.`,
      implications: [
        'Sağlıklı risk yönetimi',
        'Makul volatilite',
        'Hızlı toparlanma potansiyeli',
        'Yatırımcı dostu seviye'
      ],
      recommendations: [
        'Drawdown sürelerini minimize edin',
        'Recovery stratejilerini güçlendirin',
        'Correlation risklerini kontrol edin'
      ]
    };
  } else if (dd <= 20) {
    return {
      rating: 'average',
      color: 'text-yellow-400',
      title: 'Orta Seviye Drawdown - Kabul Edilebilir Risk',
      description: `%${dd.toFixed(1)} maksimum drawdown normal sınırlarda ancak iyileştirme gerekli.`,
      implications: [
        'Standart risk seviyesi',
        'Orta düzey volatilite',
        'Psikolojik zorluk başlıyor',
        'Recovery süresi uzayabilir'
      ],
      recommendations: [
        'Position sizing\'i optimize edin',
        'Stop loss seviyelerini gözden geçirin',
        'Volatilite filtresi ekleyin',
        'Risk per trade\'i azaltın'
      ]
    };
  } else if (dd <= 30) {
    return {
      rating: 'poor',
      color: 'text-orange-400',
      title: 'Yüksek Drawdown - Riskli Seviye',
      description: `%${dd.toFixed(1)} maksimum drawdown yüksek risk gösteriyor. Ciddi iyileştirmeler gerekli.`,
      implications: [
        'Aşırı risk alınıyor',
        'Sermaye kaybı riski yüksek',
        'Psikolojik baskı fazla',
        'Recovery zor ve uzun'
      ],
      recommendations: [
        'Risk yönetimini baştan tasarlayın',
        'Maksimum pozisyon limitlerini azaltın',
        'Agresif trade\'lerden kaçının',
        'Portfolio çeşitlendirmesi yapın'
      ]
    };
  } else {
    return {
      rating: 'critical',
      color: 'text-red-400',
      title: 'Kritik Drawdown - Tehlikeli Seviye',
      description: `%${dd.toFixed(1)} maksimum drawdown kabul edilemez. Strateji sürdürülemez risk içeriyor.`,
      implications: [
        'Yıkıcı sermaye kaybı',
        'Strateji kontrolden çıkmış',
        'Recovery neredeyse imkansız',
        'Blow-up riski çok yüksek'
      ],
      recommendations: [
        'Trading\'i derhal durdurun',
        'Risk yönetimini komple değiştirin',
        'Çok daha küçük pozisyonlarla başlayın',
        'Profesyonel risk yönetimi eğitimi alın'
      ]
    };
  }
}

// Profit Factor Analysis
export function analyzeProfitFactor(profitFactor: number): MetricAnalysis {
  if (profitFactor >= 3.0) {
    return {
      rating: 'excellent',
      color: 'text-emerald-400',
      title: 'Olağanüstü Profit Factor',
      description: `${profitFactor.toFixed(2)} profit factor, her 1$ kayıp için ${profitFactor.toFixed(2)}$ kazanç sağlandığını gösteriyor. Bu nadir görülen bir performans.`,
      implications: [
        'Mükemmel kar/zarar oranı',
        'Çok güçlü edge',
        'Sürdürülebilir karlılık',
        'Minimum sermaye riski'
      ],
      recommendations: [
        'Bu performansı korumaya odaklanın',
        'Over-optimization\'dan kaçının',
        'Position size\'ı kademeli artırın'
      ]
    };
  } else if (profitFactor >= 2.0) {
    return {
      rating: 'good',
      color: 'text-green-400',
      title: 'Çok İyi Profit Factor',
      description: `${profitFactor.toFixed(2)} profit factor güçlü bir trading edge'i gösteriyor. Profesyonel seviyede performans.`,
      implications: [
        'Sağlıklı kar/zarar dengesi',
        'İyi risk kontrolü',
        'Tutarlı performans',
        'Güvenilir sistem'
      ],
      recommendations: [
        'Loss trade\'leri minimize edin',
        'Winner\'ları daha uzun tutun',
        'Partial profit taking düşünün'
      ]
    };
  } else if (profitFactor >= 1.5) {
    return {
      rating: 'average',
      color: 'text-yellow-400',
      title: 'Yeterli Profit Factor',
      description: `${profitFactor.toFixed(2)} profit factor pozitif ancak iyileştirme alanı var. Komisyonlar sonrası karlılığı kontrol edin.`,
      implications: [
        'Makul karlılık',
        'Orta düzey performans',
        'İyileştirme potansiyeli',
        'Komisyon hassasiyeti'
      ],
      recommendations: [
        'Average win/loss oranını artırın',
        'Cut losses quick, let profits run',
        'Trade kalitesine odaklanın'
      ]
    };
  } else if (profitFactor >= 1.2) {
    return {
      rating: 'poor',
      color: 'text-orange-400',
      title: 'Düşük Profit Factor',
      description: `${profitFactor.toFixed(2)} profit factor minimum seviyede. Komisyonlar dahil edildiğinde karlılık sorgulanabilir.`,
      implications: [
        'Zayıf kar marjı',
        'Yüksek risk',
        'Komisyon hassasiyeti',
        'Güvenilmez karlılık'
      ],
      recommendations: [
        'Stop loss disiplini geliştirin',
        'Take profit seviyelerini optimize edin',
        'Daha seçici trade yapın',
        'Spread/komisyon maliyetlerini azaltın'
      ]
    };
  } else {
    return {
      rating: 'critical',
      color: 'text-red-400',
      title: 'Negatif Edge - Zarar Eden Sistem',
      description: `${profitFactor.toFixed(2)} profit factor sistemin zarar ettiğini gösteriyor. Trading edge yok.`,
      implications: [
        'Sistem para kaybediyor',
        'Trading edge yok',
        'Strateji çalışmıyor',
        'Sermaye erozyonu'
      ],
      recommendations: [
        'Trading\'i durdurun',
        'Stratejiyi tamamen değiştirin',
        'Eğitim ve analiz yapın',
        'Demo hesapta test edin'
      ]
    };
  }
}

// Average Trade Duration Analysis
export function analyzeTradeDuration(avgDuration: number): MetricAnalysis {
  if (avgDuration < 0.5) { // Less than 30 minutes
    return {
      rating: 'average',
      color: 'text-blue-400',
      title: 'Scalping - Çok Kısa Süreli İşlemler',
      description: `Ortalama ${(avgDuration * 60).toFixed(0)} dakika işlem süresi tipik scalping stratejisi. Yüksek frekans, düşük spread gerektirir.`,
      implications: [
        'Yüksek işlem maliyeti',
        'Hızlı karar verme gerekli',
        'Spread/komisyon kritik',
        'Yoğun takip gerektirir'
      ],
      recommendations: [
        'ECN broker kullanın',
        'Spread maliyetlerini minimize edin',
        'Otomatik trading düşünün',
        'Slippage kontrolü yapın'
      ]
    };
  } else if (avgDuration < 2) { // 30 min to 2 hours
    return {
      rating: 'good',
      color: 'text-green-400',
      title: 'Day Trading - Gün İçi İşlemler',
      description: `Ortalama ${avgDuration.toFixed(1)} saat işlem süresi optimal day trading aralığında. İyi momentum yakalama.`,
      implications: [
        'Dengeli risk/ödül',
        'Makul işlem maliyeti',
        'İyi fırsat yakalama',
        'Aktif izleme gerekli'
      ],
      recommendations: [
        'Volatilite saatlerine odaklanın',
        'News trading filtresi ekleyin',
        'Partial close stratejisi uygulayın'
      ]
    };
  } else if (avgDuration < 8) { // 2 to 8 hours
    return {
      rating: 'excellent',
      color: 'text-emerald-400',
      title: 'Intraday Swing - Optimal Süre',
      description: `Ortalama ${avgDuration.toFixed(1)} saat işlem süresi mükemmel denge sağlıyor. Trend ve momentum optimal kullanımı.`,
      implications: [
        'İdeal risk/ödül dengesi',
        'Düşük işlem maliyeti',
        'Güçlü trend yakalama',
        'Esnek yönetim imkanı'
      ],
      recommendations: [
        'Trailing stop kullanın',
        'Trend strength indicator ekleyin',
        'Multi-timeframe analiz yapın'
      ]
    };
  } else if (avgDuration < 24) { // 8 to 24 hours
    return {
      rating: 'good',
      color: 'text-green-400',
      title: 'Short-term Swing - Günlük İşlemler',
      description: `Ortalama ${avgDuration.toFixed(1)} saat işlem süresi kısa vadeli swing trading. Overnight risk var.`,
      implications: [
        'Overnight risk exposure',
        'Swap maliyetleri',
        'Büyük trendleri yakalama',
        'Gap riski mevcut'
      ],
      recommendations: [
        'Swap-free hesap düşünün',
        'Gap protection stratejisi',
        'Fundamental filtre ekleyin',
        'Position sizing\'e dikkat'
      ]
    };
  } else { // More than 24 hours
    return {
      rating: 'average',
      color: 'text-yellow-400',
      title: 'Position Trading - Uzun Vadeli',
      description: `Ortalama ${(avgDuration / 24).toFixed(1)} gün işlem süresi position trading. Büyük trendlere odaklanma.`,
      implications: [
        'Yüksek swap maliyeti',
        'Büyük fiyat hareketleri',
        'Fundamental etki fazla',
        'Düşük işlem sıklığı'
      ],
      recommendations: [
        'Swap-free hesap kullanın',
        'Fundamental analiz ekleyin',
        'Wider stop loss kullanın',
        'Long-term trend following'
      ]
    };
  }
}

// Kelly Percentage Analysis
export function analyzeKellyPercentage(kellyPercent: number): MetricAnalysis {
  if (kellyPercent >= 20) {
    return {
      rating: 'excellent',
      color: 'text-emerald-400',
      title: 'Çok Yüksek Kelly - Güçlü Edge',
      description: `%${kellyPercent.toFixed(1)} Kelly değeri çok güçlü bir trading edge gösteriyor. Sistem %25\'te sınırlandırılmış.`,
      implications: [
        'Olağanüstü güçlü edge',
        'Yüksek compound potential',
        'Agresif sizing uygun',
        'Hızlı sermaye büyümesi'
      ],
      recommendations: [
        'Kelly\'nin yarısını kullanın (güvenlik için)',
        'Volatilite bazlı ayarlama yapın',
        'Drawdown limitlerini koruyun'
      ]
    };
  } else if (kellyPercent >= 10) {
    return {
      rating: 'good',
      color: 'text-green-400',
      title: 'İyi Kelly Değeri - Solid Edge',
      description: `%${kellyPercent.toFixed(1)} Kelly değeri sağlıklı bir trading edge'i gösteriyor. Optimal büyüme potansiyeli.`,
      implications: [
        'Güvenilir trading edge',
        'İyi büyüme potansiyeli',
        'Dengeli risk/ödül',
        'Sürdürülebilir sizing'
      ],
      recommendations: [
        'Kelly\'nin %50-75\'ini kullanın',
        'Market koşullarına göre ayarlayın',
        'Regular rebalancing yapın'
      ]
    };
  } else if (kellyPercent >= 5) {
    return {
      rating: 'average',
      color: 'text-yellow-400',
      title: 'Orta Kelly - Modest Edge',
      description: `%${kellyPercent.toFixed(1)} Kelly değeri mütevazı bir edge gösteriyor. Conservative sizing öneriliyor.`,
      implications: [
        'Sınırlı edge',
        'Yavaş büyüme',
        'Conservative approach gerekli',
        'Risk kontrolü önemli'
      ],
      recommendations: [
        'Maksimum %2-3 risk alın',
        'Fixed fractional sizing',
        'Edge\'i güçlendirmeye odaklanın'
      ]
    };
  } else if (kellyPercent > 0) {
    return {
      rating: 'poor',
      color: 'text-orange-400',
      title: 'Düşük Kelly - Zayıf Edge',
      description: `%${kellyPercent.toFixed(1)} Kelly değeri çok zayıf edge. Minimum position sizing gerekli.`,
      implications: [
        'Minimal edge',
        'Yüksek uncertainty',
        'Komisyon hassasiyeti',
        'Dikkatli sizing gerekli'
      ],
      recommendations: [
        'Maksimum %1 risk',
        'Stratejiyi iyileştirin',
        'Paper trade yapın',
        'Edge\'i artırmaya odaklanın'
      ]
    };
  } else {
    return {
      rating: 'critical',
      color: 'text-red-400',
      title: 'Negatif Kelly - Edge Yok',
      description: `%${kellyPercent.toFixed(1)} Kelly değeri negatif expectancy gösteriyor. Sistem para kaybediyor.`,
      implications: [
        'Trading edge yok',
        'Negatif expectancy',
        'Para kaybı garantili',
        'Sizing irrelevant'
      ],
      recommendations: [
        'Trading yapmayın',
        'Stratejiyi baştan tasarlayın',
        'Eğitim alın',
        'Demo hesapta çalışın'
      ]
    };
  }
}

// Combined Analysis Function
export function getMetricAnalysis(metricType: string, value: number): MetricAnalysis {
  switch (metricType) {
    case 'sharpeRatio':
      return analyzeSharpeRatio(value);
    case 'winRate':
      return analyzeWinRate(value);
    case 'maxDrawdown':
      return analyzeMaxDrawdown(value);
    case 'profitFactor':
      return analyzeProfitFactor(value);
    case 'avgTradeDuration':
      return analyzeTradeDuration(value);
    case 'kellyPercent':
      return analyzeKellyPercentage(value);
    default:
      return {
        rating: 'average',
        color: 'text-gray-400',
        title: 'Analiz Mevcut Değil',
        description: 'Bu metrik için detaylı analiz henüz eklenmemiş.',
        implications: [],
        recommendations: []
      };
  }
}

// Combination Analysis - Multiple Metrics Together
export function analyzeStrategyProfile(metrics: {
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgTradeDuration: number;
}): {
  profile: string;
  strengths: string[];
  weaknesses: string[];
  overallAssessment: string;
  tradingStyle: string;
} {
  const { winRate, profitFactor, sharpeRatio, maxDrawdown, avgTradeDuration } = metrics;
  
  // Determine trading style
  let tradingStyle = '';
  if (avgTradeDuration < 1) {
    tradingStyle = 'Scalping';
  } else if (avgTradeDuration < 4) {
    tradingStyle = 'Day Trading';
  } else if (avgTradeDuration < 24) {
    tradingStyle = 'Swing Trading';
  } else {
    tradingStyle = 'Position Trading';
  }
  
  // Analyze profile based on combinations
  if (winRate > 65 && profitFactor > 2 && sharpeRatio > 2) {
    return {
      profile: 'Elite Performer',
      strengths: [
        'Mükemmel trade seçimi ve timing',
        'Üstün risk yönetimi',
        'Tutarlı ve güvenilir performans',
        'Kurumsal kalite strateji'
      ],
      weaknesses: [
        'Over-optimization riski',
        'Market değişimlerine hassasiyet',
        'Yüksek beklentiler baskısı'
      ],
      overallAssessment: 'Strateji elit seviyede performans gösteriyor. Nadir görülen bir başarı kombinasyonu. Bu performansı korumak ana odak olmalı.',
      tradingStyle
    };
  } else if (winRate > 55 && profitFactor > 1.5 && Math.abs(maxDrawdown) < 20) {
    return {
      profile: 'Solid Performer',
      strengths: [
        'Dengeli risk-ödül yaklaşımı',
        'İyi win rate ve profit factor',
        'Kontrollü drawdown',
        'Sürdürülebilir strateji'
      ],
      weaknesses: [
        'Sharpe ratio iyileştirilebilir',
        'Volatilite kontrolü geliştirilebilir',
        'Edge güçlendirilebilir'
      ],
      overallAssessment: 'Güvenilir ve dengeli bir strateji. Profesyonel standartlarda performans. Minor iyileştirmelerle elite seviyeye çıkabilir.',
      tradingStyle
    };
  } else if (winRate < 45 && profitFactor > 2) {
    return {
      profile: 'High RR Specialist',
      strengths: [
        'Mükemmel risk/reward oranı',
        'Büyük kazançlar yakalama',
        'Trend following başarısı',
        'Let profits run mentalitesi'
      ],
      weaknesses: [
        'Düşük win rate psikolojik zorluk',
        'Ardışık kayıplar olası',
        'Yüksek volatilite',
        'Drawdown dönemleri uzun'
      ],
      overallAssessment: 'Klasik trend following profili. Düşük win rate yüksek RR stratejisi. Psikolojik dayanıklılık gerektirir.',
      tradingStyle
    };
  } else if (winRate > 70 && profitFactor < 1.5) {
    return {
      profile: 'High Frequency Grinder',
      strengths: [
        'Çok yüksek win rate',
        'Tutarlı küçük kazançlar',
        'Düşük drawdown',
        'Psikolojik rahatlık'
      ],
      weaknesses: [
        'Düşük profit factor',
        'Komisyon hassasiyeti yüksek',
        'Limited upside potential',
        'Bir büyük kayıp yıkıcı olabilir'
      ],
      overallAssessment: 'Tipik scalping/grid trading profili. Yüksek win rate ama düşük profit margin. Sıkı risk kontrolü kritik.',
      tradingStyle
    };
  } else if (Math.abs(maxDrawdown) > 30) {
    return {
      profile: 'High Risk Gambler',
      strengths: [
        'Potansiyel yüksek getiri',
        'Agresif fırsat yakalama',
        'Büyük market move\'ları yakalama'
      ],
      weaknesses: [
        'Aşırı yüksek risk',
        'Kontrolsüz drawdown',
        'Sermaye kaybı riski yüksek',
        'Sürdürülemez strateji'
      ],
      overallAssessment: 'Tehlikeli risk profili. Strateji kumar oynama seviyesinde risk alıyor. Acil risk yönetimi revizyonu gerekli.',
      tradingStyle
    };
  } else {
    return {
      profile: 'Developing Strategy',
      strengths: [
        'Gelişim potansiyeli var',
        'Temel yapı mevcut',
        'Test ve optimizasyon aşamasında'
      ],
      weaknesses: [
        'Tutarsız performans',
        'Belirsiz edge',
        'Optimizasyon gerekli',
        'Risk yönetimi geliştirilmeli'
      ],
      overallAssessment: 'Strateji henüz olgunlaşmamış. Daha fazla test, optimizasyon ve iyileştirme gerekiyor. Potansiyel var ama çalışma lazım.',
      tradingStyle
    };
  }
}