# 🚀 Google AdSense Entegrasyon Rehberi

Site genelinde Google AdSense reklamları başarıyla entegre edildi! İşte detaylar ve kurulum talimatları:

## 📊 Reklam Stratejisi ve Optimizasyon

### En Yüksek CPM'li Reklam Boyutları (2025)
1. **300×600 (Half-Page)** - En yüksek CPM oranı
2. **336×280 (Large Rectangle)** - Yüksek performans
3. **300×250 (Medium Rectangle)** - En çok kullanılan, yüksek görünürlük
4. **728×90 (Leaderboard)** - Above-the-fold için mükemmel
5. **320×100 (Large Mobile Banner)** - Mobil için en iyi performans

### Reklam Yerleşim Stratejisi
- **Above-the-Fold**: Sayfa yüklenir yüklenmez görünen alan
- **In-Content**: İçerik aralarında (2-3. paragraf sonrası)
- **Sidebar**: Sticky konumlandırma ile sürekli görünürlük
- **End-of-Content**: İçerik bitiminde, yüksek engagement

## 🎯 Entegre Edilmiş Reklam Konumları

### 1. Ana Sayfa (`/`)
- ✅ **Above-the-fold**: Responsive header reklam
- ✅ **Sidebar**: 300×600 Half-page (Yüksek CPM)
- ✅ **In-content**: Bölümler arası 336×280 Large Rectangle
- ✅ **Bottom**: 728×90 Leaderboard

### 2. Makale Detay (`/articles/[slug]`)
- ✅ **Above-the-fold**: Responsive header reklam
- ✅ **In-content**: Makale içi stratejik yerleşim
- ✅ **Sidebar**: 300×600 Half-page (sticky)
- ✅ **Bottom**: 336×280 Large Rectangle
- ✅ **Grid layout**: XL ekranlarda sidebar reklam alanı

### 3. Forum (`/forum`)
- ✅ **Above-the-fold**: Responsive header reklam
- ✅ **In-content**: Kategoriler arası yerleşim

### 4. Tüm Sayfalarda
- ✅ **AdSense Script**: Otomatik yükleme ve optimizasyon

## ⚙️ Kurulum Talimatları

### 1. AdSense Hesabı Ayarları
```typescript
// src/components/ads/index.ts dosyasında güncelle:
export const DEFAULT_AD_CONFIG: AdConfig = {
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // BURAYA KENDİ PUBLISHER ID'NİZİ GİRİN
  adSlots: {
    // Header ads
    headerDesktop: '1234567890', // KENDİ AD SLOT ID'LERİNİZİ GİRİN
    headerMobile: '1234567891',
    
    // Homepage ads  
    homepageTop: '1234567892',
    homepageMiddle: '1234567893', 
    homepageBottom: '1234567894',
    homepageSidebar: '1234567895',
    
    // Article ads
    articleTop: '1234567896',
    articleInContent: '1234567897', 
    articleBottom: '1234567898',
    articleSidebar: '1234567899',
    
    // Forum ads
    forumTop: '1234567900',
    forumInContent: '1234567901',
    forumSidebar: '1234567902',
    
    // Sidebar ads
    sidebarTop: '1234567906',
    sidebarMiddle: '1234567907', 
    sidebarBottom: '1234567908',
    sidebarSticky: '1234567909',
  }
};
```

### 2. AdSense Hesap Kurulumu
1. **Google AdSense'e üye olun**: https://www.google.com/adsense/
2. **Site domaininizi ekleyin**: traderlar.com
3. **Ad units oluşturun**: Yukarıdaki boyutlarda
4. **Publisher ID ve Ad Slot ID'lerini kopyalayın**
5. **ads/index.ts dosyasında güncelleyin**

### 3. Test ve Optimizasyon
```bash
# Development server'ı çalıştırın
npm run dev

# Production build test edin
npm run build
npm run start
```

## 📈 Performans Optimizasyonları

### En İyi CPM için:
1. **Half-page ads (300×600)** - Sidebar'da kullanın
2. **Large rectangles (336×280)** - In-content yerleştirin  
3. **Above-the-fold leaderboards** - Sayfa başında
4. **Sticky positioning** - Sidebar reklamları için

### Kullanıcı Deneyimi:
- ✅ Reklam etiketleri ("Reklam", "Sponsor")
- ✅ Responsive tasarım (mobil uyumlu)
- ✅ Yavaş yükleme (lazy loading)
- ✅ Dark mode uyumlu

## 🔧 Teknik Özellikler

### Component Yapısı:
```
src/components/ads/
├── AdUnit.tsx              # Temel reklam komponenti
├── AdContainer.tsx         # Reklam konteynerleri
├── HeaderAds.tsx           # Başlık reklamları
├── InContentAd.tsx         # İçerik arası reklamlar
├── SidebarAds.tsx          # Kenar çubuğu reklamları
├── AdSenseScript.tsx       # AdSense script yükleyici
└── index.ts                # Yapılandırma ve export
```

### Reklam Boyutları:
- **Desktop**: 728×90, 300×600, 336×280, 300×250
- **Mobile**: 320×100, 320×50, responsive
- **Universal**: Auto-responsive ads

## 💰 Gelir Projeksiyonu

### Tahmini Aylık Gelir (Trafik bazında):
- **10K görüntülenme/ay**: $50-150
- **100K görüntülenme/ay**: $500-1500  
- **1M görüntülenme/ay**: $5000-15000

### Faktörler:
- **Coğrafi konum**: Türkiye CPM: $0.50-2.00
- **İçerik kalitesi**: Trading/Finance yüksek CPM
- **Cihaz türü**: Desktop > Mobile CPM
- **Mevsimsellik**: Q4 en yüksek CPM

## 🚨 Önemli Notlar

### AdSense Politikaları:
- ❌ Kendi reklamlarınızı tıklamayın
- ❌ "Tıklayın" gibi teşvik edici ifadeler kullanmayın
- ✅ Organik trafik odaklı olun
- ✅ Kaliteli içerik üretin

### Performans İzleme:
- Google Analytics entegrasyonu
- AdSense raporları takibi
- A/B testing ile optimizasyon
- CTR ve CPM metriklerini izleyin

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Google AdSense Help Center
2. AdSense Community Forums  
3. Bu dokümantasyonu güncelleyin

---

**Not**: Bu entegrasyon üretim ortamına geçmeden önce tüm ad slot ID'lerin gerçek AdSense hesabınızdan alınması gerekiyor!