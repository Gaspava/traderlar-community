'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfessionalMetrics } from '@/lib/professional-metrics';
import { getMetricAnalysis } from '@/lib/metric-analysis';
import { 
  TrendingUp, TrendingDown, Target, Shield, AlertTriangle, 
  Activity, Clock, Calendar, BarChart3, PieChart, 
  Zap, Users, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { HourlyProfitAnalysisCard, ExpectedProfitCard } from './modern-analysis-cards-extended';
import { RiskManagementCard, BuyHoldComparisonCard, DrawdownPeriodsCardNew } from './modern-analysis-cards-advanced';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ModernAnalysisCardsProps {
  metrics: ProfessionalMetrics;
}

// 1. Sharpe Ratio Card (En üst sırada - en önemli metrik)
export function SharpeRatioCard({ metrics }: ModernAnalysisCardsProps) {
  const { theme } = useTheme();
  const analysis = getMetricAnalysis('sharpeRatio', metrics.sharpeRatio);
  
  const getIcon = () => {
    if (metrics.sharpeRatio >= 2) return <TrendingUp className="h-6 w-6 text-emerald-400" />;
    if (metrics.sharpeRatio >= 1) return <TrendingUp className="h-6 w-6 text-green-400" />;
    if (metrics.sharpeRatio >= 0.5) return <Minus className="h-6 w-6 text-yellow-400" />;
    return <TrendingDown className="h-6 w-6 text-red-400" />;
  };

  const getBgGradient = () => {
    if (metrics.sharpeRatio >= 2) return "from-emerald-500/10 to-green-500/10";
    if (metrics.sharpeRatio >= 1) return "from-green-500/10 to-blue-500/10";
    if (metrics.sharpeRatio >= 0.5) return "from-yellow-500/10 to-orange-500/10";
    return "from-red-500/10 to-pink-500/10";
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getBgGradient()} border border-white/10 dark:border-white/5`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{metrics.sharpeRatio.toFixed(2)}</div>
        <p className={`text-xs ${analysis.color} mb-3`}>
          {analysis.title}
        </p>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Risk başına getiri performansı
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Benchmark (1.0)</span>
            <span className={metrics.sharpeRatio >= 1 ? "text-green-400" : "text-red-400"}>
              {metrics.sharpeRatio >= 1 ? "✓" : "✗"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 2. Win Rate Card
export function WinRateCard({ metrics }: ModernAnalysisCardsProps) {
  const analysis = getMetricAnalysis('winRate', metrics.winRate);
  
  const getIcon = () => {
    if (metrics.winRate >= 60) return <Target className="h-6 w-6 text-emerald-400" />;
    if (metrics.winRate >= 50) return <Target className="h-6 w-6 text-green-400" />;
    return <Target className="h-6 w-6 text-red-400" />;
  };

  const getBgGradient = () => {
    if (metrics.winRate >= 60) return "from-emerald-500/10 to-green-500/10";
    if (metrics.winRate >= 50) return "from-green-500/10 to-blue-500/10";
    return "from-red-500/10 to-pink-500/10";
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getBgGradient()} border border-white/10 dark:border-white/5`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">%{metrics.winRate.toFixed(1)}</div>
        <p className={`text-xs ${analysis.color} mb-3`}>
          {analysis.title}
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(metrics.winRate, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-muted-foreground">
          Kazanan işlem oranı
        </div>
      </CardContent>
    </Card>
  );
}

// 3. Profit Factor Card
export function ProfitFactorCard({ metrics }: ModernAnalysisCardsProps) {
  const analysis = getMetricAnalysis('profitFactor', metrics.profitFactor);
  
  const getIcon = () => {
    if (metrics.profitFactor >= 2) return <ArrowUpRight className="h-6 w-6 text-emerald-400" />;
    if (metrics.profitFactor >= 1.5) return <ArrowUpRight className="h-6 w-6 text-green-400" />;
    if (metrics.profitFactor >= 1.2) return <Minus className="h-6 w-6 text-yellow-400" />;
    return <ArrowDownRight className="h-6 w-6 text-red-400" />;
  };

  const getBgGradient = () => {
    if (metrics.profitFactor >= 2) return "from-emerald-500/10 to-green-500/10";
    if (metrics.profitFactor >= 1.5) return "from-green-500/10 to-blue-500/10";
    if (metrics.profitFactor >= 1.2) return "from-yellow-500/10 to-orange-500/10";
    return "from-red-500/10 to-pink-500/10";
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getBgGradient()} border border-white/10 dark:border-white/5`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{metrics.profitFactor.toFixed(2)}</div>
        <p className={`text-xs ${analysis.color} mb-3`}>
          {analysis.title}
        </p>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Toplam kar / Toplam zarar oranı
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Minimum (1.2)</span>
            <span className={metrics.profitFactor >= 1.2 ? "text-green-400" : "text-red-400"}>
              {metrics.profitFactor >= 1.2 ? "✓" : "✗"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 4. Max Drawdown Card
export function MaxDrawdownCard({ metrics }: ModernAnalysisCardsProps) {
  const analysis = getMetricAnalysis('maxDrawdown', metrics.maxDrawdown);
  const dd = Math.abs(metrics.maxDrawdown);
  
  const getIcon = () => {
    if (dd <= 10) return <Shield className="h-6 w-6 text-emerald-400" />;
    if (dd <= 20) return <Shield className="h-6 w-6 text-green-400" />;
    if (dd <= 30) return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
    return <AlertTriangle className="h-6 w-6 text-red-400" />;
  };

  const getBgGradient = () => {
    if (dd <= 10) return "from-emerald-500/10 to-green-500/10";
    if (dd <= 20) return "from-green-500/10 to-blue-500/10";
    if (dd <= 30) return "from-yellow-500/10 to-orange-500/10";
    return "from-red-500/10 to-pink-500/10";
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getBgGradient()} border border-white/10 dark:border-white/5`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">%{dd.toFixed(1)}</div>
        <p className={`text-xs ${analysis.color} mb-3`}>
          {analysis.title}
        </p>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            En büyük sermaye düşüşü
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Süre: {metrics.maxDrawdownDuration} gün</span>
            <span className="text-blue-400">
              {metrics.recoveryFactor.toFixed(1)}x toparlanma
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 5. VaR (Value at Risk) Card
export function VaRCard({ metrics }: ModernAnalysisCardsProps) {
  const var95 = Math.abs(metrics.valueAtRisk95);
  
  const getIcon = () => {
    if (var95 <= 2) return <Shield className="h-6 w-6 text-emerald-400" />;
    if (var95 <= 5) return <Shield className="h-6 w-6 text-green-400" />;
    if (var95 <= 10) return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
    return <AlertTriangle className="h-6 w-6 text-red-400" />;
  };

  const getBgGradient = () => {
    if (var95 <= 2) return "from-emerald-500/10 to-green-500/10";
    if (var95 <= 5) return "from-green-500/10 to-blue-500/10";
    if (var95 <= 10) return "from-yellow-500/10 to-orange-500/10";
    return "from-red-500/10 to-pink-500/10";
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getBgGradient()} border border-white/10 dark:border-white/5`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Value at Risk (95%)</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">%{var95.toFixed(1)}</div>
        <p className="text-xs text-muted-foreground mb-3">
          %95 olasılıkla maksimum günlük kayıp
        </p>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Expected Shortfall: %{Math.abs(metrics.expectedShortfall).toFixed(1)}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
              style={{ width: `${Math.min(var95 * 10, 100)}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 6. Ardışık Kayıp/Kazanç Card
export function ConsecutiveTradesCard({ metrics }: ModernAnalysisCardsProps) {
  const maxWins = metrics.maxConsecutiveWins || 0;
  const maxLosses = metrics.maxConsecutiveLosses;
  
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 dark:border-white/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Ardışık İşlemler</CardTitle>
        <Activity className="h-6 w-6 text-purple-400" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">{maxWins}</div>
            <div className="text-xs text-muted-foreground">Max Kazanç</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">{maxLosses}</div>
            <div className="text-xs text-muted-foreground">Max Kayıp</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            En büyük win/loss seriler
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Risk Kontrolü</span>
            <span className={maxLosses <= 5 ? "text-green-400" : "text-red-400"}>
              {maxLosses <= 5 ? "İyi" : "Dikkat"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Modern Layout Container
export function ModernAnalysisLayout({ metrics }: ModernAnalysisCardsProps) {
  return (
    <div className="space-y-6">
      {/* Top Priority Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SharpeRatioCard metrics={metrics} />
        <WinRateCard metrics={metrics} />
        <ProfitFactorCard metrics={metrics} />
        <MaxDrawdownCard metrics={metrics} />
      </div>
      
      {/* Hourly Analysis - Right below main metrics, spanning 2 card heights */}
      <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-6">
        <div className="md:col-span-4 md:row-span-2">
          <HourlyProfitAnalysisCard metrics={metrics} />
        </div>
        <div className="md:col-span-2">
          <ConsecutiveTradesCard metrics={metrics} />
        </div>
        <div className="md:col-span-2">
          <VaRCard metrics={metrics} />
        </div>
      </div>
      
      {/* Risk Management Row - Below Hourly Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-6">
        <div className="md:col-span-2 xl:col-span-2">
          <RiskManagementCard metrics={metrics} />
        </div>
        <div className="md:col-span-1 xl:col-span-2">
          <div className="grid grid-rows-2 gap-6 h-full">
            <BuyHoldComparisonCard metrics={metrics} />
            <ExpectedProfitCard metrics={metrics} />
          </div>
        </div>
        <div className="md:col-span-1 xl:col-span-2">
          <DrawdownPeriodsCardNew metrics={metrics} />
        </div>
      </div>
    </div>
  );
}