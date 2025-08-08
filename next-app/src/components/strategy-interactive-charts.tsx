'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
  Sankey,
  Treemap
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Target,
  Shield,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Trade {
  profit: number;
  openTime: string;
  closeTime: string;
  type: 'buy' | 'sell';
  symbol: string;
  size: number;
}

// Win/Loss Distribution Donut Chart
export function WinLossDistribution({ trades }: { trades: Trade[] }) {
  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit < 0);
  const breakEvenTrades = trades.filter(t => t.profit === 0);
  
  const data = [
    { name: 'Kazanan', value: winningTrades.length, profit: winningTrades.reduce((sum, t) => sum + t.profit, 0) },
    { name: 'Kaybeden', value: losingTrades.length, profit: losingTrades.reduce((sum, t) => sum + t.profit, 0) },
    { name: 'Başabaş', value: breakEvenTrades.length, profit: 0 }
  ];
  
  const COLORS = ['#4ade80', '#ef4444', '#6b7280'];
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length * 100).toFixed(1) : 0;
  
  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Kazanç/Kayıp Dağılımı</h3>
          <p className="text-sm text-muted-foreground">İşlem sonuç analizi</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{winRate}%</div>
          <div className="text-xs text-muted-foreground">Kazanma Oranı</div>
        </div>
      </div>
      
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background/95 backdrop-blur border border-border p-3 rounded-lg shadow-lg">
                      <p className="font-medium">{data.name}</p>
                      <p className="text-sm text-muted-foreground">
                        İşlem: {data.value} ({((data.value / trades.length) * 100).toFixed(1)}%)
                      </p>
                      <p className="text-sm">
                        Toplam K/Z: <span className={`font-medium ${data.profit > 0 ? 'text-green-400' : data.profit < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {data.profit > 0 ? '+' : ''}{data.profit.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Stats */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{trades.length}</div>
            <div className="text-sm text-muted-foreground">Toplam İşlem</div>
          </div>
        </div>
      </div>
      
      {/* Legend with details */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index] }}></div>
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{item.value}</span>
              <span className="text-muted-foreground ml-2">
                ({item.profit > 0 ? '+' : ''}{item.profit.toFixed(2)})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Profit Distribution by Size
export function ProfitBySizeChart({ trades }: { trades: Trade[] }) {
  // Group trades by size ranges
  const sizeRanges = [
    { range: '0.01-0.1', min: 0.01, max: 0.1 },
    { range: '0.1-0.5', min: 0.1, max: 0.5 },
    { range: '0.5-1.0', min: 0.5, max: 1.0 },
    { range: '1.0-2.0', min: 1.0, max: 2.0 },
    { range: '2.0+', min: 2.0, max: Infinity }
  ];
  
  const data = sizeRanges.map(range => {
    const rangeTrades = trades.filter(t => t.size >= range.min && t.size < range.max);
    const totalProfit = rangeTrades.reduce((sum, t) => sum + t.profit, 0);
    const avgProfit = rangeTrades.length > 0 ? totalProfit / rangeTrades.length : 0;
    
    return {
      range: range.range,
      trades: rangeTrades.length,
      totalProfit,
      avgProfit,
      winRate: rangeTrades.length > 0 
        ? (rangeTrades.filter(t => t.profit > 0).length / rangeTrades.length * 100) 
        : 0
    };
  });
  
  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Pozisyon Büyüklüğü Analizi</h3>
          <p className="text-sm text-muted-foreground">Lot büyüklüğüne göre performans</p>
        </div>
        <BarChart3 className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="range" stroke="#666" />
          <YAxis yAxisId="left" stroke="#666" />
          <YAxis yAxisId="right" orientation="right" stroke="#666" />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background/95 backdrop-blur border border-border p-3 rounded-lg shadow-lg">
                    <p className="font-medium">Lot: {data.range}</p>
                    <p className="text-sm text-muted-foreground">İşlem Sayısı: {data.trades}</p>
                    <p className="text-sm">
                      Toplam K/Z: <span className={`font-medium ${data.totalProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.totalProfit > 0 ? '+' : ''}{data.totalProfit.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-sm">
                      Ort. K/Z: <span className={`font-medium ${data.avgProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.avgProfit > 0 ? '+' : ''}{data.avgProfit.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-sm">
                      Kazanma Oranı: <span className="font-medium text-primary">{data.winRate.toFixed(1)}%</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar yAxisId="left" dataKey="totalProfit" fill="#4ade80" name="Toplam Kar" />
          <Line yAxisId="right" type="monotone" dataKey="winRate" stroke="#3b82f6" strokeWidth={2} name="Kazanma Oranı %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Symbol Performance Treemap
export function SymbolPerformanceTreemap({ trades }: { trades: Trade[] }) {
  // Group trades by symbol
  const symbolData = trades.reduce((acc, trade) => {
    const symbol = trade.symbol || 'Unknown';
    if (!acc[symbol]) {
      acc[symbol] = { trades: 0, profit: 0, wins: 0 };
    }
    acc[symbol].trades++;
    acc[symbol].profit += trade.profit;
    if (trade.profit > 0) acc[symbol].wins++;
    return acc;
  }, {} as Record<string, { trades: number; profit: number; wins: number }>);
  
  const data = Object.entries(symbolData).map(([symbol, stats]) => ({
    name: symbol,
    size: Math.abs(stats.profit),
    value: stats.profit,
    trades: stats.trades,
    winRate: (stats.wins / stats.trades * 100).toFixed(1)
  }));
  
  const COLORS = ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#ef4444', '#dc2626', '#b91c1c'];
  
  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Sembol Performans Haritası</h3>
          <p className="text-sm text-muted-foreground">İşlem gören sembollerin kar/zarar dağılımı</p>
        </div>
        <Target className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4/3}
          stroke="#000"
          fill="#8884d8"
        >
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background/95 backdrop-blur border border-border p-3 rounded-lg shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm text-muted-foreground">İşlem: {data.trades}</p>
                    <p className="text-sm">
                      K/Z: <span className={`font-medium ${data.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.value > 0 ? '+' : ''}{data.value.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-sm">
                      Kazanma: <span className="font-medium text-primary">{data.winRate}%</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

// Daily Performance Calendar
export function DailyPerformanceCalendar({ trades }: { trades: Trade[] }) {
  // Get last 30 days
  const days = 30;
  const today = new Date();
  const dateData = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTrades = trades.filter(t => {
      const tradeDate = new Date(t.closeTime || t.openTime).toISOString().split('T')[0];
      return tradeDate === dateStr;
    });
    
    const dayProfit = dayTrades.reduce((sum, t) => sum + t.profit, 0);
    
    dateData.push({
      date: dateStr,
      day: date.getDate(),
      profit: dayProfit,
      trades: dayTrades.length,
      weekday: date.toLocaleDateString('tr-TR', { weekday: 'short' })
    });
  }
  
  const getColor = (profit: number) => {
    if (profit > 100) return 'bg-green-500';
    if (profit > 50) return 'bg-green-400';
    if (profit > 0) return 'bg-green-300';
    if (profit === 0) return 'bg-gray-500';
    if (profit > -50) return 'bg-red-300';
    if (profit > -100) return 'bg-red-400';
    return 'bg-red-500';
  };
  
  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">30 Günlük Performans Takvimi</h3>
          <p className="text-sm text-muted-foreground">Günlük kar/zarar özeti</p>
        </div>
        <Calendar className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {dateData.map((day, index) => (
          <motion.div
            key={day.date}
            className={`relative group cursor-pointer ${getColor(day.profit)} ${
              day.trades === 0 ? 'opacity-20' : 'opacity-100'
            } rounded-lg p-2 text-center transition-all hover:scale-110 hover:z-10`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
          >
            <div className="text-xs font-medium text-white/90">{day.day}</div>
            <div className="text-[10px] text-white/70">{day.weekday}</div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              <div className="bg-background/95 backdrop-blur border border-border px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                <div className="text-sm font-medium">{new Date(day.date).toLocaleDateString('tr-TR')}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <div>İşlem: {day.trades}</div>
                  <div>K/Z: <span className={`font-medium ${day.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {day.profit > 0 ? '+' : ''}{day.profit.toFixed(2)}
                  </span></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50 text-sm">
        <div className="text-center">
          <div className="text-muted-foreground">Karlı Gün</div>
          <div className="font-medium text-green-400">
            {dateData.filter(d => d.profit > 0).length}
          </div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Zararlı Gün</div>
          <div className="font-medium text-red-400">
            {dateData.filter(d => d.profit < 0).length}
          </div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">İşlemsiz</div>
          <div className="font-medium text-gray-400">
            {dateData.filter(d => d.trades === 0).length}
          </div>
        </div>
      </div>
    </div>
  );
}

// Risk Score Gauge
export function RiskScoreGauge({ metrics }: { metrics: any }) {
  // Calculate risk score (0-100)
  const calculateRiskScore = () => {
    let score = 50; // Base score
    
    // Adjust based on metrics
    if (metrics?.maxDrawdown < -20) score += 20;
    else if (metrics?.maxDrawdown < -10) score += 10;
    
    if (metrics?.downsideDeviation > 15) score += 15;
    else if (metrics?.downsideDeviation > 10) score += 10;
    
    if (metrics?.valueAtRisk95 < -10) score += 15;
    else if (metrics?.valueAtRisk95 < -5) score += 10;
    
    if (metrics?.ulcerIndex > 10) score += 10;
    else if (metrics?.ulcerIndex > 5) score += 5;
    
    return Math.min(Math.max(score, 0), 100);
  };
  
  const riskScore = calculateRiskScore();
  const riskLevel = riskScore > 75 ? 'Yüksek' : riskScore > 50 ? 'Orta' : 'Düşük';
  const riskColor = riskScore > 75 ? '#ef4444' : riskScore > 50 ? '#f59e0b' : '#10b981';
  
  const data = [
    { name: 'Risk', value: riskScore, fill: riskColor },
    { name: 'Safe', value: 100 - riskScore, fill: '#1f2937' }
  ];
  
  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Risk Skoru</h3>
          <p className="text-sm text-muted-foreground">Genel risk değerlendirmesi</p>
        </div>
        <Shield className="w-5 h-5" style={{ color: riskColor }} />
      </div>
      
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={data}>
            <RadialBar dataKey="value" cornerRadius={10} fill={riskColor} />
          </RadialBarChart>
        </ResponsiveContainer>
        
        {/* Center Display */}
        <div className="absolute inset-0 flex items-center justify-center -mt-8">
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: riskColor }}>{riskScore}</div>
            <div className="text-sm text-muted-foreground">{riskLevel} Risk</div>
          </div>
        </div>
      </div>
      
      {/* Risk Factors */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Max Drawdown</span>
          <span className="font-medium">{(metrics?.maxDrawdown || 0).toFixed(2)}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Value at Risk</span>
          <span className="font-medium">{(metrics?.valueAtRisk95 || 0).toFixed(2)}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Volatilite</span>
          <span className="font-medium">{(metrics?.downsideDeviation || 0).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}