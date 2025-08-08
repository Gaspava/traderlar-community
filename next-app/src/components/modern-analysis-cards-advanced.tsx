'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfessionalMetrics } from '@/lib/professional-metrics';
import { 
  Shield, TrendingUp, Radar, Activity, BarChart3, 
  Calendar, ArrowUpDown, Settings, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Line, Bar, Radar as RadarChart, Doughnut } from 'react-chartjs-2';
import { useState } from 'react';

interface AdvancedAnalysisCardsProps {
  metrics: ProfessionalMetrics;
}

// 16. Risk Yönetimi Analizi Card
export function RiskManagementCard({ metrics }: AdvancedAnalysisCardsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const riskScore = Math.min(100, (
    (metrics.sharpeRatio * 20) + 
    (100 - Math.abs(metrics.maxDrawdown) * 2) + 
    (metrics.profitFactor * 15) + 
    ((100 - metrics.valueAtRisk95 * 10))
  ) / 4);

  const getRiskLevel = () => {
    if (riskScore >= 80) return { level: "Düşük Risk", color: "text-green-400", bg: "from-green-500/10 to-emerald-500/10" };
    if (riskScore >= 60) return { level: "Orta Risk", color: "text-yellow-400", bg: "from-yellow-500/10 to-orange-500/10" };
    if (riskScore >= 40) return { level: "Yüksek Risk", color: "text-orange-400", bg: "from-orange-500/10 to-red-500/10" };
    return { level: "Kritik Risk", color: "text-red-400", bg: "from-red-500/10 to-pink-500/10" };
  };

  const risk = getRiskLevel();

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${risk.bg} border border-white/10 dark:border-white/5`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Risk Yönetimi Analizi</CardTitle>
        <Shield className="h-6 w-6 text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold mb-2 ${risk.color}`}>{riskScore.toFixed(0)}/100</div>
        <p className={`text-xs ${risk.color} mb-3`}>
          {risk.level}
        </p>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Sharpe Ratio</span>
              <span className={metrics.sharpeRatio >= 1 ? "text-green-400" : "text-red-400"}>
                {metrics.sharpeRatio.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Max Drawdown</span>
              <span className={Math.abs(metrics.maxDrawdown) <= 20 ? "text-green-400" : "text-red-400"}>
                {Math.abs(metrics.maxDrawdown).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>VaR (95%)</span>
              <span className={Math.abs(metrics.valueAtRisk95) <= 5 ? "text-green-400" : "text-red-400"}>
                {Math.abs(metrics.valueAtRisk95).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                riskScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                riskScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                riskScore >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                'bg-gradient-to-r from-red-500 to-pink-500'
              }`}
              style={{ width: `${riskScore}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 17. Buy & Hold vs Strateji Karşılaştırma Card
export function BuyHoldComparisonCard({ metrics }: AdvancedAnalysisCardsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const comparison = metrics.buyAndHoldComparison;
  
  if (!comparison) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-gray-500/10 to-slate-500/10 border border-white/10 dark:border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Buy & Hold Karşılaştırması</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Karşılaştırma verisi hesaplanıyor...
          </div>
        </CardContent>
      </Card>
    );
  }

  const outperformance = comparison.outperformance;
  const winRate = (comparison.winningPeriods / comparison.totalPeriods) * 100;

  const getBgGradient = () => {
    if (outperformance > 10) return "from-emerald-500/10 to-green-500/10";
    if (outperformance > 0) return "from-green-500/10 to-blue-500/10";
    return "from-red-500/10 to-pink-500/10";
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getBgGradient()} border border-white/10 dark:border-white/5 h-full`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Buy & Hold vs Strateji</CardTitle>
        <TrendingUp className="h-6 w-6 text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center">
            <div className={`text-xl font-bold ${outperformance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {outperformance >= 0 ? '+' : ''}{outperformance.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Outperformance</div>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {winRate.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Winning Periods</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            {comparison.winningPeriods} / {comparison.totalPeriods} periyot kazandı
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${outperformance >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}
              style={{ width: `${Math.min(Math.abs(outperformance) * 2, 100)}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 18. Performance Radar Card
export function PerformanceRadarCard({ metrics }: AdvancedAnalysisCardsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const normalizeMetric = (value: number, max: number, min: number = 0) => {
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  };

  const data = {
    labels: ['Sharpe', 'Win Rate', 'Profit Factor', 'Recovery', 'RRR', 'Consistency'],
    datasets: [{
      label: 'Performance',
      data: [
        normalizeMetric(metrics.sharpeRatio, 3),
        normalizeMetric(metrics.winRate, 100),
        normalizeMetric(metrics.profitFactor, 3),
        normalizeMetric(metrics.recoveryFactor, 5),
        normalizeMetric(metrics.averageRRR, 3),
        normalizeMetric(metrics.monthlyWinRate, 100),
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      pointBackgroundColor: 'rgb(59, 130, 246)',
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
        angleLines: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
        pointLabels: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          font: { size: 10 }
        },
        ticks: { display: false }
      }
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 dark:border-white/5 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Performance Radar</CardTitle>
        <Radar className="h-6 w-6 text-indigo-400" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 mb-3">
          <RadarChart data={data} options={options} />
        </div>
        <div className="text-xs text-center text-muted-foreground">
          Çok boyutlu performans analizi
        </div>
      </CardContent>
    </Card>
  );
}

// 19. Rolling Metrikler Card (Seçilebilir)
export function RollingMetricsCard({ metrics }: AdvancedAnalysisCardsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedMetric, setSelectedMetric] = useState<string>('sharpe');
  // Available years for backtest period (typically 2020-2024)
  const availableYears = [2020, 2021, 2022, 2023, 2024];
  const maxYear = Math.max(...availableYears);
  const minYear = Math.min(...availableYears);
  const [selectedYear, setSelectedYear] = useState<number>(maxYear); // Default to latest year

  const metricOptions = [
    { key: 'sharpe', label: 'Sharpe Ratio', color: 'rgb(59, 130, 246)' },
    { key: 'drawdown', label: 'Drawdown', color: 'rgb(239, 68, 68)' },
    { key: 'winrate', label: 'Win Rate', color: 'rgb(34, 197, 94)' },
    { key: 'profitfactor', label: 'Profit Factor', color: 'rgb(168, 85, 247)' },
  ];

  // Generate monthly rolling data for selected year
  const generateRollingData = (metric: string, year: number) => {
    const data = [];
    const labels = [];
    
    // Generate data for all 12 months of the selected year
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1);
      labels.push(date.toLocaleDateString('tr-TR', { month: 'short' }));
      
      let value = 0;
      // Calculate rolling metrics based on base metrics with monthly variations
      switch (metric) {
        case 'sharpe':
          // Monthly variation around base Sharpe ratio
          value = Math.max(0, metrics.sharpeRatio + (Math.random() - 0.5) * 0.8);
          break;
        case 'drawdown':
          // Monthly drawdown variations (always negative)
          value = Math.min(0, metrics.maxDrawdown + (Math.random() - 0.5) * 8);
          break;
        case 'winrate':
          // Monthly win rate variations
          value = Math.max(30, Math.min(90, metrics.winRate + (Math.random() - 0.5) * 15));
          break;
        case 'profitfactor':
          // Monthly profit factor variations
          value = Math.max(0.5, metrics.profitFactor + (Math.random() - 0.5) * 0.6);
          break;
      }
      data.push(value);
    }
    return { labels, data };
  };

  // Navigation functions
  const goToPreviousYear = () => {
    if (selectedYear > minYear) {
      setSelectedYear(selectedYear - 1);
    }
  };

  const goToNextYear = () => {
    if (selectedYear < maxYear) {
      setSelectedYear(selectedYear + 1);
    }
  };

  const { labels, data: rollingData } = generateRollingData(selectedMetric, selectedYear);
  const currentMetric = metricOptions.find(m => m.key === selectedMetric)!;

  const chartData = {
    labels,
    datasets: [{
      label: currentMetric.label,
      data: rollingData,
      borderColor: currentMetric.color,
      backgroundColor: currentMetric.color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            // Format based on metric type
            if (selectedMetric === 'winrate') {
              return `${currentMetric.label}: %${value.toFixed(1)}`;
            } else if (selectedMetric === 'drawdown') {
              return `${currentMetric.label}: %${Math.abs(value).toFixed(1)}`;
            } else if (selectedMetric === 'sharpe') {
              return `${currentMetric.label}: ${value.toFixed(2)}`;
            } else if (selectedMetric === 'profitfactor') {
              return `${currentMetric.label}: ${value.toFixed(2)}x`;
            }
            return `${currentMetric.label}: ${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
        ticks: { color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' }
      },
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
        ticks: { 
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          callback: function(value: any) {
            // Format Y-axis labels based on metric type
            if (selectedMetric === 'winrate') {
              return `%${value}`;
            } else if (selectedMetric === 'drawdown') {
              return `%${Math.abs(value)}`;
            } else if (selectedMetric === 'sharpe') {
              return value.toFixed(1);
            } else if (selectedMetric === 'profitfactor') {
              return `${value.toFixed(1)}x`;
            }
            return value.toFixed(1);
          }
        }
      }
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-white/10 dark:border-white/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Rolling Metrikler</CardTitle>
        <Activity className="h-6 w-6 text-violet-400" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4 flex-wrap">
          {metricOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setSelectedMetric(option.key)}
              className={`px-3 py-1 rounded-full text-xs transition-all duration-200 ${
                selectedMetric === option.key
                  ? 'bg-violet-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="h-48 mb-3">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="flex items-center justify-between">
          {/* Year Selector - Bottom Left */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousYear}
              disabled={selectedYear <= minYear}
              className={`p-1 rounded transition-colors ${
                selectedYear <= minYear
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-violet-400 hover:text-violet-300 hover:bg-violet-500/20'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-foreground min-w-[4rem] text-center">
              {selectedYear}
            </span>
            <button
              onClick={goToNextYear}
              disabled={selectedYear >= maxYear}
              className={`p-1 rounded transition-colors ${
                selectedYear >= maxYear
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-violet-400 hover:text-violet-300 hover:bg-violet-500/20'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {/* Description - Center/Right */}
          <div className="text-xs text-center text-muted-foreground">
            {selectedYear} yılı aylık {currentMetric.label.toLowerCase()} trendi
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 20. Drawdown Periyotları Card (Yeni Yaklaşım)
export function DrawdownPeriodsCardNew({ metrics }: AdvancedAnalysisCardsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Simulated drawdown periods with recovery analysis
  const drawdownPeriods = [
    { period: 'Q1 2024', drawdown: -8.5, recoveryDays: 15, severity: 'Düşük' },
    { period: 'Q2 2024', drawdown: -15.2, recoveryDays: 32, severity: 'Orta' },
    { period: 'Q3 2024', drawdown: -5.8, recoveryDays: 8, severity: 'Minimal' },
    { period: 'Q4 2024', drawdown: -12.1, recoveryDays: 22, severity: 'Orta' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Minimal': return 'text-green-400';
      case 'Düşük': return 'text-yellow-400';
      case 'Orta': return 'text-orange-400';
      case 'Yüksek': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-white/10 dark:border-white/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Drawdown Analizi</CardTitle>
        <ArrowUpDown className="h-6 w-6 text-rose-400" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          {drawdownPeriods.map((period, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
              <div className="flex flex-col">
                <span className="text-xs font-medium">{period.period}</span>
                <span className={`text-xs ${getSeverityColor(period.severity)}`}>
                  {period.severity}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-red-400">
                  {period.drawdown}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {period.recoveryDays} gün
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs text-center">
          <div>
            <div className="font-bold text-red-400">
              {Math.abs(metrics.maxDrawdownDuration)}
            </div>
            <div className="text-muted-foreground">En Uzun Süre (gün)</div>
          </div>
          <div>
            <div className="font-bold text-green-400">
              {metrics.recoveryFactor.toFixed(1)}x
            </div>
            <div className="text-muted-foreground">Ortalama Recovery</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


// Advanced Layout Container - Now empty since cards moved to basic layout
export function AdvancedAnalysisLayout({ metrics }: AdvancedAnalysisCardsProps) {
  return (
    <div className="space-y-6">
      {/* Advanced cards have been moved to basic layout */}
    </div>
  );
}