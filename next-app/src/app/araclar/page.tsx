'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BarChart3, 
  Calculator, 
  TrendingUp, 
  Clock,
  Target,
  Activity,
  FileText,
  Settings,
  ChevronRight
} from 'lucide-react';

const tools = [
  {
    id: 'manuel-backtest',
    title: 'Manuel Backtest',
    description: 'RR bazlı manuel trading testi. TradingView benzeri manuel testleri grafiğe dökün ve analiz edin.',
    icon: BarChart3,
    href: '/araclar/manuel-backtest',
    color: 'from-blue-500 to-cyan-500',
    features: ['RR bazlı otomatik TP/SL', 'Tek sayfa hızlı test', 'Real-time grafik', 'Klavye kısayolları'],
    featured: true
  },
  {
    id: 'risk-calculator',
    title: 'Risk Hesaplayıcı',
    description: 'Pozisyon boyutunu ve risk seviyelerini hesaplayın.',
    icon: Calculator,
    href: '/araclar/risk-calculator',
    color: 'from-green-500 to-emerald-500',
    features: ['Pozisyon boyutu', 'Stop loss hesaplama', 'Risk-reward analizi', 'Para yönetimi'],
    comingSoon: true
  },
  {
    id: 'performance-tracker',
    title: 'Performans Takipçisi',
    description: 'Günlük, haftalık ve aylık performansınızı takip edin.',
    icon: TrendingUp,
    href: '/araclar/performance-tracker',
    color: 'from-purple-500 to-pink-500',
    features: ['Günlük P&L', 'Performans trendleri', 'Karşılaştırmalı analiz', 'Hedef takibi'],
    comingSoon: true
  },
  {
    id: 'trading-journal',
    title: 'Trading Günlüğü',
    description: 'İşlemlerinizi kaydedin ve analiz edin.',
    icon: FileText,
    href: '/araclar/trading-journal',
    color: 'from-orange-500 to-red-500',
    features: ['İşlem kaydı', 'Analiz notları', 'Psikolojik takip', 'İstatistikler'],
    comingSoon: true
  },
  {
    id: 'market-scanner',
    title: 'Piyasa Tarayıcı',
    description: 'Teknik analiz sinyallerini tarayın ve fırsatları keşfedin.',
    icon: Activity,
    href: '/araclar/market-scanner',
    color: 'from-indigo-500 to-purple-500',
    features: ['Teknik sinyaller', 'Tarama filtreleri', 'Uyarı sistemi', 'Watchlist'],
    comingSoon: true
  },
  {
    id: 'session-timer',
    title: 'Trading Saati',
    description: 'Trading seanslarınızı zamanlayın ve odaklanmanızı sağlayın.',
    icon: Clock,
    href: '/araclar/session-timer',
    color: 'from-teal-500 to-green-500',
    features: ['Pomodoro timer', 'Oturum takibi', 'Mola hatırlatıcıları', 'Verimlilik analizi'],
    comingSoon: true
  }
];

export default function AraclarPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-background via-card/30 to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Settings className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Trading Araçları
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Profesyonel trading deneyiminizi geliştirecek güçlü araçlar ve analiz platformları
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group ${tool.comingSoon ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {tool.comingSoon ? (
                <div className="relative bg-card border border-border/50 rounded-2xl p-8 h-full">
                  {/* Coming Soon Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-medium border border-yellow-500/20">
                    Yakında
                  </div>
                  
                  <ToolContent tool={tool} />
                </div>
              ) : (
                <Link href={tool.href} className="block h-full">
                  <div className="relative bg-card border border-border/50 rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 group-hover:border-primary/20">
                    <ToolContent tool={tool} />
                    
                    {/* Hover Arrow */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <ChevronRight className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-card border border-border/50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Daha Fazla Araç Geliyor
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trading deneyiminizi daha da geliştirmek için sürekli olarak yeni araçlar üzerinde çalışıyoruz. 
              Önerileriniz için bizimle iletişime geçin.
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Hedefimiz: Profesyonel trader'lar için eksiksiz araç seti
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ToolContent({ tool }: { tool: typeof tools[0] }) {
  return (
    <>
      {/* Icon */}
      <div className="mb-6 relative">
        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${tool.color} text-white shadow-lg`}>
          <tool.icon className="w-8 h-8" />
        </div>
        {tool.featured && (
          <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
            YENİ
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-3">
          {tool.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground mb-3">Özellikler:</h4>
        <ul className="space-y-2">
          {tool.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}