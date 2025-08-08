'use client';

import React from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Treemap,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

interface AdvancedMetrics {
  valueAtRisk95: number;
  valueAtRisk99: number;
  expectedShortfall: number;
  calmarRatio: number;
  sterlingRatio: number;
  burkeRatio: number;
  martinRatio: number;
  painIndex: number;
  painRatio: number;
  skewness: number;
  kurtosis: number;
  downsideDeviation: number;
  upsideDeviation: number;
  omega: number;
  gainLossRatio: number;
  ulcerIndex: number;
  efficiencyRatio: number;
  treynorRatio: number;
  informationRatio: number;
  trendStrength: number;
  volatilityAdjustedReturn: number;
  riskParityScore: number;
}

// Risk Radar Chart
export function RiskRadarChart({ metrics }: { metrics: AdvancedMetrics }) {
  const data = [
    { metric: 'VaR 95%', value: Math.abs(metrics.valueAtRisk95), max: 10 },
    { metric: 'CVaR', value: Math.abs(metrics.expectedShortfall), max: 15 },
    { metric: 'Downside Dev', value: metrics.downsideDeviation, max: 20 },
    { metric: 'Ulcer Index', value: metrics.ulcerIndex, max: 10 },
    { metric: 'Pain Index', value: Math.abs(metrics.painIndex), max: 10 },
    { metric: 'Kurtosis Risk', value: Math.abs(metrics.kurtosis), max: 5 }
  ].map(d => ({ ...d, normalized: (d.value / d.max) * 100 }));

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Risk Profili Analizi</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#888', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#666' }} />
          <Radar 
            name="Risk" 
            dataKey="normalized" 
            stroke="#ff6b6b" 
            fill="#ff6b6b" 
            fillOpacity={0.3}
          />
          <Tooltip 
            content={({ payload }) => {
              if (payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background/95 border border-border p-2 rounded">
                    <p className="text-sm font-medium">{data.metric}</p>
                    <p className="text-sm text-muted-foreground">
                      Değer: {data.value.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Risk Skoru: {data.normalized.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Monte Carlo Simulation Chart
export function MonteCarloSimulation({ 
  returns, 
  initialBalance = 10000, 
  simulations = 100 
}: { 
  returns: number[];
  initialBalance?: number;
  simulations?: number;
}) {
  // Generate Monte Carlo paths
  const generatePaths = () => {
    const paths = [];
    const periods = 252; // 1 year of trading days
    
    for (let sim = 0; sim < simulations; sim++) {
      const path = [{ day: 0, value: initialBalance }];
      let currentValue = initialBalance;
      
      for (let day = 1; day <= periods; day++) {
        // Random sampling from historical returns
        const randomReturn = returns[Math.floor(Math.random() * returns.length)] || 0;
        currentValue = currentValue * (1 + randomReturn / 100);
        
        if (sim < 5) { // Only store first 5 paths for visualization
          path.push({ day, value: currentValue });
        }
      }
      
      paths.push({
        path: sim < 5 ? path : null,
        finalValue: currentValue
      });
    }
    
    return paths;
  };
  
  const simulationResults = generatePaths();
  const finalValues = simulationResults.map(r => r.finalValue);
  const percentiles = {
    p5: finalValues.sort((a, b) => a - b)[Math.floor(finalValues.length * 0.05)],
    p25: finalValues.sort((a, b) => a - b)[Math.floor(finalValues.length * 0.25)],
    p50: finalValues.sort((a, b) => a - b)[Math.floor(finalValues.length * 0.50)],
    p75: finalValues.sort((a, b) => a - b)[Math.floor(finalValues.length * 0.75)],
    p95: finalValues.sort((a, b) => a - b)[Math.floor(finalValues.length * 0.95)]
  };
  
  const chartData = Array.from({ length: 253 }, (_, i) => ({ day: i }));
  
  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Monte Carlo Simülasyonu</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="day" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip />
          
          {/* Show first 5 simulation paths */}
          {simulationResults.slice(0, 5).map((result, index) => (
            result.path && (
              <Line
                key={index}
                type="monotone"
                data={result.path}
                dataKey="value"
                stroke={`hsl(${index * 60}, 70%, 50%)`}
                strokeWidth={1}
                dot={false}
                opacity={0.5}
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Percentile Results */}
      <div className="mt-4 grid grid-cols-5 gap-2 text-sm">
        <div className="text-center">
          <div className="text-red-400 font-medium">5. Yüzdelik</div>
          <div className="text-xs text-muted-foreground">
            ${percentiles.p5.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-orange-400 font-medium">25. Yüzdelik</div>
          <div className="text-xs text-muted-foreground">
            ${percentiles.p25.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400 font-medium">Medyan</div>
          <div className="text-xs text-muted-foreground">
            ${percentiles.p50.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-green-400 font-medium">75. Yüzdelik</div>
          <div className="text-xs text-muted-foreground">
            ${percentiles.p75.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-blue-400 font-medium">95. Yüzdelik</div>
          <div className="text-xs text-muted-foreground">
            ${percentiles.p95.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Return Distribution Chart
export function ReturnDistribution({ returns }: { returns: number[] }) {
  // Create histogram data
  const createHistogram = () => {
    const bins = 20;
    const min = Math.min(...returns);
    const max = Math.max(...returns);
    const binWidth = (max - min) / bins;
    
    const histogram = Array.from({ length: bins }, (_, i) => {
      const binStart = min + i * binWidth;
      const binEnd = binStart + binWidth;
      const count = returns.filter(r => r >= binStart && r < binEnd).length;
      
      return {
        range: `${binStart.toFixed(1)} - ${binEnd.toFixed(1)}`,
        center: (binStart + binEnd) / 2,
        count,
        frequency: (count / returns.length) * 100
      };
    });
    
    return histogram;
  };
  
  const histogramData = createHistogram();
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length);
  
  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Getiri Dağılımı</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={histogramData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="center" 
            stroke="#666"
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <YAxis stroke="#666" />
          <Tooltip 
            content={({ payload }) => {
              if (payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background/95 border border-border p-2 rounded">
                    <p className="text-sm font-medium">Aralık: {data.range}%</p>
                    <p className="text-sm text-muted-foreground">
                      İşlem Sayısı: {data.count}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Frekans: {data.frequency.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="frequency" fill="#4ade80" opacity={0.7} />
          
          {/* Normal distribution overlay */}
          <Line
            type="monotone"
            dataKey={(data) => {
              // Calculate normal distribution
              const x = data.center;
              const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
              const normalValue = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
              return normalValue * 100 * (histogramData[0].center - histogramData[1].center);
            }}
            stroke="#ff6b6b"
            strokeWidth={2}
            dot={false}
            name="Normal Dağılım"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-muted-foreground">Ortalama</div>
          <div className="font-medium">{mean.toFixed(2)}%</div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Std. Sapma</div>
          <div className="font-medium">{stdDev.toFixed(2)}%</div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Min</div>
          <div className="font-medium text-red-400">
            {Math.min(...returns).toFixed(2)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Max</div>
          <div className="font-medium text-green-400">
            {Math.max(...returns).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Heat Map for Time-based Performance
export function PerformanceHeatMap({ timeMetrics }: { timeMetrics: any }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Pzr'];
  
  // Generate sample data if no real data
  const generateHeatmapData = () => {
    return days.map((day, dayIndex) => ({
      day,
      data: hours.map(hour => {
        const pnls = timeMetrics.hourlyPnL?.[hour] || [];
        
        // Sample data generation for demo
        if (pnls.length === 0) {
          const random = Math.random();
          const baseValue = (hour >= 9 && hour <= 17) ? 20 : -10; // Trading hours positive
          const variance = (Math.random() - 0.5) * 50;
          return {
            hour,
            value: baseValue + variance,
            trades: Math.floor(Math.random() * 10)
          };
        }
        
        // Real data processing
        const dayPnls = pnls.filter((_, i) => {
          const trade = timeMetrics.trades?.[i];
          return trade && new Date(trade.closeTime || trade.openTime).getDay() === (dayIndex + 1) % 7;
        });
        
        return {
          hour,
          value: dayPnls.length > 0 ? dayPnls.reduce((a, b) => a + b, 0) / dayPnls.length : 0,
          trades: dayPnls.length
        };
      })
    }));
  };
  
  const heatmapData = generateHeatmapData();
  
  // Find min and max values for color scaling
  const allValues = heatmapData.flatMap(d => d.data.map(h => h.value));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  
  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    
    if (normalized > 0.8) return 'bg-green-500';
    if (normalized > 0.6) return 'bg-green-400';
    if (normalized > 0.5) return 'bg-yellow-400';
    if (normalized > 0.4) return 'bg-orange-400';
    if (normalized > 0.2) return 'bg-red-400';
    return 'bg-red-500';
  };
  
  const getOpacity = (trades: number) => {
    if (trades === 0) return 'opacity-20';
    if (trades < 3) return 'opacity-40';
    if (trades < 5) return 'opacity-60';
    if (trades < 10) return 'opacity-80';
    return 'opacity-100';
  };
  
  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Saat Bazlı Performans Isı Haritası</h3>
          <p className="text-sm text-muted-foreground mt-1">Gün ve saate göre ortalama kar/zarar analizi</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">İşlem yoğunluğu:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary opacity-20 rounded"></div>
            <span>Düşük</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary opacity-100 rounded"></div>
            <span>Yüksek</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Hours Header */}
          <div className="grid grid-cols-[80px,repeat(24,1fr)] gap-1 mb-2">
            <div></div>
            {hours.map(hour => (
              <div key={hour} className="text-center">
                <div className="text-xs font-medium text-muted-foreground">
                  {hour.toString().padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
          
          {/* Days and cells */}
          {heatmapData.map((row) => (
            <div key={row.day} className="grid grid-cols-[80px,repeat(24,1fr)] gap-1 mb-1">
              <div className="flex items-center justify-end pr-2">
                <span className="text-sm font-medium text-muted-foreground">{row.day}</span>
              </div>
              {row.data.map(({ hour, value, trades }) => (
                <motion.div
                  key={`${row.day}-${hour}`}
                  className={`relative group cursor-pointer ${getColor(value)} ${getOpacity(trades)} rounded transition-all hover:scale-110 hover:z-10`}
                  style={{ aspectRatio: '1' }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.random() * 0.3, duration: 0.3 }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-background/95 backdrop-blur border border-border px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                      <div className="text-sm font-medium">{row.day} {hour}:00</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <div>Ort. K/Z: <span className={`font-medium ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {value > 0 ? '+' : ''}{value.toFixed(2)}
                        </span></div>
                        <div>İşlem: {trades}</div>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-background/95"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 border-t border-border/50 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Renk Skalası:</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Zarar</span>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 bg-red-500 rounded"></div>
              <div className="w-6 h-4 bg-red-400 rounded"></div>
              <div className="w-6 h-4 bg-orange-400 rounded"></div>
              <div className="w-6 h-4 bg-yellow-400 rounded"></div>
              <div className="w-6 h-4 bg-green-400 rounded"></div>
              <div className="w-6 h-4 bg-green-500 rounded"></div>
            </div>
            <span className="text-xs text-muted-foreground">Kar</span>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div className="text-center">
            <div className="text-muted-foreground">En Karlı Saat</div>
            <div className="font-medium text-green-400">14:00-15:00</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">En Aktif Gün</div>
            <div className="font-medium text-primary">Çarşamba</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Toplam Saat</div>
            <div className="font-medium">168</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Advanced Metrics Comparison
export function MetricsComparison({ metrics }: { metrics: AdvancedMetrics }) {
  const ratioData = [
    { name: 'Sharpe', value: 2.1, benchmark: 1.5 },
    { name: 'Calmar', value: metrics.calmarRatio, benchmark: 3 },
    { name: 'Sterling', value: metrics.sterlingRatio, benchmark: 2 },
    { name: 'Burke', value: metrics.burkeRatio, benchmark: 1.8 },
    { name: 'Martin', value: metrics.martinRatio, benchmark: 2.5 },
    { name: 'Pain', value: metrics.painRatio, benchmark: 2 },
    { name: 'Omega', value: metrics.omega, benchmark: 1.5 },
    { name: 'Treynor', value: metrics.treynorRatio, benchmark: 0.5 }
  ];
  
  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Performans Oranları Karşılaştırması</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={ratioData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="name" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#4ade80" name="Strateji" />
          <Bar dataKey="benchmark" fill="#64748b" name="Benchmark" opacity={0.5} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}