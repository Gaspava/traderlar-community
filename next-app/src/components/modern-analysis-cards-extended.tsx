'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfessionalMetrics } from '@/lib/professional-metrics';
import { 
  RefreshCw, DollarSign, Clock, Calendar, Users, 
  BarChart3, Shield, TrendingUp, Radar, Activity,
  Sun, Moon, ArrowUpCircle, ArrowDownCircle, AlertTriangle
} from 'lucide-react';
import { Line, Bar, Radar as RadarChart, Doughnut } from 'react-chartjs-2';
import { useState } from 'react';

interface ExtendedAnalysisCardsProps {
  metrics: ProfessionalMetrics;
}

// 8. Recovery Factor Card
export function RecoveryFactorCard({ metrics }: ExtendedAnalysisCardsProps) {
  const recovery = metrics.recoveryFactor;
  
  const getColor = () => {
    if (recovery >= 3) return "text-emerald-400";
    if (recovery >= 2) return "text-green-400";
    if (recovery >= 1) return "text-yellow-400";
    return "text-red-400";
  };

  const getBgGradient = () => {
    if (recovery >= 3) return "from-emerald-500/10 to-green-500/10";
    if (recovery >= 2) return "from-green-500/10 to-blue-500/10";
    if (recovery >= 1) return "from-yellow-500/10 to-orange-500/10";
    return "from-red-500/10 to-pink-500/10";
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getBgGradient()} border border-white/10 dark:border-white/5`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recovery Factor</CardTitle>
        <RefreshCw className="h-6 w-6 text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold mb-2 ${getColor()}`}>{recovery.toFixed(1)}x</div>
        <p className="text-xs text-muted-foreground mb-3">
          Toparlanma gücü katsayısı
        </p>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Net kar / Max drawdown oranı
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Hedef (2.0x)</span>
            <span className={recovery >= 2 ? "text-green-400" : "text-red-400"}>
              {recovery >= 2 ? "✓" : "✗"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 9. İşlem Başına Beklenen Kar Card
export function ExpectedProfitCard({ metrics }: ExtendedAnalysisCardsProps) {
  const expectancy = metrics.expectancy;
  
  const getColor = () => {
    if (expectancy > 0) return "text-green-400";
    if (expectancy === 0) return "text-yellow-400";
    return "text-red-400";
  };

  const getBgGradient = () => {
    if (expectancy > 0) return "from-green-500/10 to-emerald-500/10";
    if (expectancy === 0) return "from-yellow-500/10 to-orange-500/10";
    return "from-red-500/10 to-pink-500/10";
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getBgGradient()} border border-white/10 dark:border-white/5`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">İşlem Başına Beklenen Kar</CardTitle>
        <DollarSign className="h-6 w-6 text-green-400" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold mb-2 ${getColor()}`}>
          ${expectancy > 0 ? '+' : ''}{expectancy.toFixed(2)}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Matematiksel beklenti
        </p>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            (Win Rate × Avg Win) - (Loss Rate × Avg Loss)
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${expectancy > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}
              style={{ width: `${Math.min(Math.abs(expectancy) * 10, 100)}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 10. İşlem Başına Ortalama Süre Card
export function AverageTradeDurationCard({ metrics }: ExtendedAnalysisCardsProps) {
  const avgDuration = metrics.avgTradeDuration || 0;
  const hours = avgDuration;
  
  const getTradingStyle = () => {
    if (hours < 1) return { style: "Scalping", color: "text-red-400", bg: "from-red-500/10 to-pink-500/10" };
    if (hours < 4) return { style: "Day Trading", color: "text-green-400", bg: "from-green-500/10 to-emerald-500/10" };
    if (hours < 24) return { style: "Swing Trading", color: "text-blue-400", bg: "from-blue-500/10 to-cyan-500/10" };
    return { style: "Position Trading", color: "text-purple-400", bg: "from-purple-500/10 to-pink-500/10" };
  };

  const style = getTradingStyle();

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${style.bg} border border-white/10 dark:border-white/5`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Ortalama İşlem Süresi</CardTitle>
        <Clock className="h-6 w-6 text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {hours < 1 ? `${(hours * 60).toFixed(0)}m` : 
           hours < 24 ? `${hours.toFixed(1)}h` : 
           `${(hours / 24).toFixed(1)}d`}
        </div>
        <p className={`text-xs ${style.color} mb-3`}>
          {style.style}
        </p>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Trading stili belirleniyor
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Optimal Alan</span>
            <span className={hours >= 1 && hours <= 8 ? "text-green-400" : "text-yellow-400"}>
              {hours >= 1 && hours <= 8 ? "✓" : "⚠"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 11-13. İşlem Sayısı Kartları (Günlük, Haftalık, Aylık)
export function TradingFrequencyCards({ metrics }: ExtendedAnalysisCardsProps) {
  // Simulated data - gerçek uygulamada metrics'ten gelecek
  const dailyTrades = (metrics.totalTrades || 0) / Math.max((metrics.tradingDays || 1), 1);
  const weeklyTrades = dailyTrades * 5; // 5 iş günü
  const monthlyTrades = dailyTrades * 20; // 20 iş günü

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Günlük */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/10 dark:border-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Günlük Ortalama</CardTitle>
          <Sun className="h-5 w-5 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold mb-2">{dailyTrades.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">işlem/gün</p>
        </CardContent>
      </Card>

      {/* Haftalık */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/10 dark:border-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Haftalık Ortalama</CardTitle>
          <Calendar className="h-5 w-5 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold mb-2">{weeklyTrades.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">işlem/hafta</p>
        </CardContent>
      </Card>

      {/* Aylık */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 dark:border-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aylık Ortalama</CardTitle>
          <Moon className="h-5 w-5 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold mb-2">{monthlyTrades.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">işlem/ay</p>
        </CardContent>
      </Card>
    </div>
  );
}

// 14. Ortalama Bekleme Süresi Card
export function AverageWaitTimeCard({ metrics }: ExtendedAnalysisCardsProps) {
  // Simulated data - gerçek uygulamada hesaplanacak
  const avgWaitTime = (metrics.avgTradeDuration || 0) * 0.3; // Örnek hesaplama
  
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 dark:border-white/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Ortalama Bekleme Süresi</CardTitle>
        <Clock className="h-6 w-6 text-indigo-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {avgWaitTime < 1 ? `${(avgWaitTime * 60).toFixed(0)}m` : `${avgWaitTime.toFixed(1)}h`}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          İşlemler arası ortalama süre
        </p>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Pozisyon alma sıklığı
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
              style={{ width: `${Math.min(avgWaitTime * 10, 100)}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 15. Saatlik Kar Analizi Card
export function HourlyProfitAnalysisCard({ metrics }: ExtendedAnalysisCardsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Simulated hourly data
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    entryProfit: Math.random() * 200 - 100,
    exitProfit: Math.random() * 150 - 75
  }));

  const chartData = {
    labels: hourlyData.map(d => `${d.hour.toString().padStart(2, '0')}:00`),
    datasets: [
      {
        label: 'Giriş Karı',
        data: hourlyData.map(d => d.entryProfit),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
      },
      {
        label: 'Çıkış Karı',
        data: hourlyData.map(d => d.exitProfit),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        }
      }
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/10 dark:border-white/5 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Saatlik Kar Analizi</CardTitle>
        <BarChart3 className="h-6 w-6 text-cyan-400" />
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-4">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="text-center">
            <div className="text-green-400 font-bold">En İyi Giriş</div>
            <div className="text-muted-foreground">14:00 - 16:00</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">En İyi Çıkış</div>
            <div className="text-muted-foreground">10:00 - 12:00</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Extended Layout Container
export function ExtendedAnalysisLayout({ metrics }: ExtendedAnalysisCardsProps) {
  return (
    <div className="space-y-6">
      {/* Recovery Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <RecoveryFactorCard metrics={metrics} />
      </div>
      
      {/* Average Trade Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AverageTradeDurationCard metrics={metrics} />
      </div>
      
      {/* Trading Frequency */}
      <TradingFrequencyCards metrics={metrics} />
      
      {/* Wait Time Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AverageWaitTimeCard metrics={metrics} />
      </div>
    </div>
  );
}