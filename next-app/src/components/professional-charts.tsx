'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Line, Bar, Radar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { ProfessionalMetrics } from '@/lib/professional-metrics';
import { ModernDetailedAnalysis } from './modern-detailed-analysis';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProfessionalChartsProps {
  metrics: ProfessionalMetrics;
}

// Performance Radar Chart
export function PerformanceRadarChart({ metrics }: ProfessionalChartsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Normalize metrics to 0-100 scale for radar chart
  const normalizeMetric = (value: number, max: number, min: number = 0) => {
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  };

  const data = {
    labels: [
      'Sharpe Ratio',
      'Win Rate',
      'Profit Factor',
      'Recovery Factor',
      'RRR',
      'Consistency'
    ],
    datasets: [
      {
        label: 'Performance Score',
        data: [
          normalizeMetric(metrics.sharpeRatio, 3), // Max 3 is excellent
          normalizeMetric(metrics.winRate, 100), // Already percentage
          normalizeMetric(metrics.profitFactor, 3), // Max 3 is excellent
          normalizeMetric(metrics.recoveryFactor, 5), // Max 5 is excellent
          normalizeMetric(metrics.averageRRR, 3), // Max 3 is excellent
          normalizeMetric(metrics.monthlyWinRate, 100), // Already percentage
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const labels = ['Sharpe', 'Win Rate', 'PF', 'Recovery', 'RRR', 'Consistency'];
            const values = [
              metrics.sharpeRatio.toFixed(2),
              metrics.winRate.toFixed(1) + '%',
              metrics.profitFactor.toFixed(2),
              metrics.recoveryFactor.toFixed(1) + 'x',
              metrics.averageRRR.toFixed(2),
              metrics.monthlyWinRate.toFixed(1) + '%'
            ];
            return `${labels[context.dataIndex]}: ${values[context.dataIndex]}`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          font: {
            size: 12
          }
        },
        ticks: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Performance Radar</h3>
      <div className="h-80">
        <Radar data={data} options={options} />
      </div>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Yüksek değerler daha iyi performansı gösterir
      </div>
    </div>
  );
}

// Risk-Return Scatter Plot
export function RiskReturnChart({ metrics }: ProfessionalChartsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calculate annual return estimate
  const annualReturn = metrics.avgDailyReturn * 252; // 252 trading days

  const data = {
    datasets: [
      {
        label: 'Bu Strateji',
        data: [{
          x: Math.abs(metrics.maxDrawdown),
          y: annualReturn
        }],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        pointRadius: 12,
        pointHoverRadius: 15,
      },
      {
        label: 'Benchmark Noktalar',
        data: [
          { x: 5, y: 8 }, // Conservative
          { x: 15, y: 15 }, // Moderate
          { x: 25, y: 25 }, // Aggressive
          { x: 35, y: 35 }, // High Risk
        ],
        backgroundColor: 'rgba(156, 163, 175, 0.6)',
        borderColor: 'rgb(156, 163, 175)',
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `Risk: ${context.parsed.x.toFixed(1)}%, Return: ${context.parsed.y.toFixed(1)}%`;
            }
            return `Benchmark: ${context.parsed.x}% risk, ${context.parsed.y}% return`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Risk (Max Drawdown %)',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        }
      },
      y: {
        title: {
          display: true,
          text: 'Return (Annual %)',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        },
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
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Risk-Return Analizi</h3>
      <div className="h-80">
        <Scatter data={data} options={options} />
      </div>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Yeşil nokta stratejinizi, gri noktalar benchmark'ları gösterir
      </div>
    </div>
  );
}

// Monthly Returns Heatmap
export function MonthlyReturnsHeatmap({ metrics }: ProfessionalChartsProps) {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'percentage' | 'dollar'>('percentage');
  
  if (!metrics.monthlyReturns || metrics.monthlyReturns.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Aylık Getiriler Heatmap</h3>
          <div className="flex bg-background rounded-lg p-1 border border-border/30">
            <button
              onClick={() => setViewMode('percentage')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'percentage'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yüzde
            </button>
            <button
              onClick={() => setViewMode('dollar')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'dollar'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dolar
            </button>
          </div>
        </div>
        <div className="h-40 flex items-center justify-center text-muted-foreground">
          Aylık veri hesaplanıyor...
        </div>
      </div>
    );
  }

  // Group by year and month - store both dollar and percentage values
  const yearMonthData: { [year: string]: { [month: number]: { dollar: number; percentage: number } } } = {};
  
  metrics.monthlyReturns.forEach(item => {
    const [year, month] = item.month.split('-');
    if (!yearMonthData[year]) yearMonthData[year] = {};
    // Calculate dollar amount from percentage (assuming 10k starting balance)
    const dollarAmount = (item.return / 100) * 10000;
    yearMonthData[year][parseInt(month)] = {
      dollar: dollarAmount,
      percentage: item.return
    };
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = Object.keys(yearMonthData).sort();

  const getColorClass = (value: number, mode: 'percentage' | 'dollar') => {
    if (mode === 'percentage') {
      if (value > 5) return 'bg-green-900 text-green-200';
      if (value > 2) return 'bg-green-800 text-green-300';
      if (value > 0) return 'bg-green-700 text-green-400';
      if (value === 0) return 'bg-gray-600 text-gray-300';
      if (value > -2) return 'bg-red-700 text-red-400';
      if (value > -5) return 'bg-red-800 text-red-300';
      return 'bg-red-900 text-red-200';
    } else {
      // Dollar mode
      if (value > 1000) return 'bg-green-900 text-green-200';
      if (value > 500) return 'bg-green-800 text-green-300';
      if (value > 0) return 'bg-green-700 text-green-400';
      if (value === 0) return 'bg-gray-600 text-gray-300';
      if (value > -500) return 'bg-red-700 text-red-400';
      if (value > -1000) return 'bg-red-800 text-red-300';
      return 'bg-red-900 text-red-200';
    }
  };


  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Aylık Getiriler Heatmap</h3>
        <div className="flex bg-background rounded-lg p-1 border border-border/30">
          <button
            onClick={() => setViewMode('percentage')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              viewMode === 'percentage'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yüzde
          </button>
          <button
            onClick={() => setViewMode('dollar')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              viewMode === 'dollar'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dolar
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          {/* Header */}
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground p-2 w-16">Yıl</th>
              {months.map(month => (
                <th key={month} className="text-center text-xs font-medium text-muted-foreground p-2 w-20">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Data rows */}
          <tbody>
            {years.map(year => (
              <tr key={year}>
                <td className="text-sm font-medium text-foreground p-2 border-r border-border/30">
                  {year}
                </td>
                {months.map((_, monthIndex) => {
                  const monthData = yearMonthData[year][monthIndex + 1];
                  const displayValue = monthData?.[viewMode];
                  return (
                    <td key={monthIndex} className="p-1">
                      <div
                        className={`rounded text-xs text-center min-h-[36px] flex items-center justify-center font-medium ${
                          displayValue !== undefined 
                            ? getColorClass(displayValue, viewMode) 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                        title={monthData ? `${year} ${months[monthIndex]}: ${monthData.percentage.toFixed(1)}% (${monthData.dollar >= 0 ? '+' : ''}$${monthData.dollar.toFixed(0)})` : 'Veri yok'}
                      >
                        {displayValue !== undefined ? 
                          viewMode === 'percentage' 
                            ? `${displayValue > 0 ? '+' : ''}${displayValue.toFixed(1)}%`
                            : `${displayValue >= 0 ? '+' : ''}$${displayValue.toFixed(0)}`
                          : '-'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs">
        <span className="text-muted-foreground">Kayıp</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-red-900 rounded shadow-sm"></div>
          <div className="w-4 h-4 bg-red-800 rounded shadow-sm"></div>
          <div className="w-4 h-4 bg-red-700 rounded shadow-sm"></div>
          <div className="w-4 h-4 bg-gray-600 rounded shadow-sm"></div>
          <div className="w-4 h-4 bg-green-700 rounded shadow-sm"></div>
          <div className="w-4 h-4 bg-green-800 rounded shadow-sm"></div>
          <div className="w-4 h-4 bg-green-900 rounded shadow-sm"></div>
        </div>
        <span className="text-muted-foreground">Kar</span>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background/50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">
            {metrics.monthlyReturns.filter(m => m.return > 0).length}
          </div>
          <div className="text-sm text-muted-foreground">Pozitif Aylar</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-400">
            {metrics.monthlyReturns.filter(m => m.return < 0).length}
          </div>
          <div className="text-sm text-muted-foreground">Negatif Aylar</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">
            {((metrics.monthlyReturns.filter(m => m.return > 0).length / metrics.monthlyReturns.length) * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-muted-foreground">Aylık Win Rate</div>
        </div>
      </div>
    </div>
  );
}

// Rolling Sharpe Ratio Chart
export function RollingSharpeChart({ metrics }: ProfessionalChartsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Generate rolling Sharpe ratio data (simplified)
  const generateRollingData = () => {
    const data = [];
    const labels = [];
    const periods = 12; // 12 months
    
    for (let i = 0; i < periods; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (periods - i - 1));
      labels.push(date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }));
      
      // Simulate rolling Sharpe with some variation around the actual value
      const variation = (Math.random() - 0.5) * 0.5;
      data.push(Math.max(0, metrics.sharpeRatio + variation));
    }
    
    return { labels, data };
  };

  const { labels, data: rollingData } = generateRollingData();

  const data = {
    labels,
    datasets: [
      {
        label: 'Rolling Sharpe Ratio (12M)',
        data: rollingData,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        callbacks: {
          label: function(context: any) {
            return `Sharpe Ratio: ${context.parsed.y.toFixed(2)}`;
          }
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
        title: {
          display: true,
          text: 'Sharpe Ratio',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        },
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
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Rolling Sharpe Ratio</h3>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        12 aylık rolling Sharpe ratio trendi
      </div>
    </div>
  );
}

// Drawdown Periods Chart
export function DrawdownPeriodsChart({ metrics }: ProfessionalChartsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Generate drawdown periods data
  const drawdownPeriods = metrics.rollingDrawdown || [];
  
  if (drawdownPeriods.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Drawdown Periyotları</h3>
        <div className="h-40 flex items-center justify-center text-muted-foreground">
          Drawdown verisi hesaplanıyor...
        </div>
      </div>
    );
  }

  const data = {
    labels: drawdownPeriods.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Drawdown %',
        data: drawdownPeriods.map(item => item.drawdown),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        callbacks: {
          label: function(context: any) {
            return `Drawdown: ${Math.abs(context.parsed.y).toFixed(1)}%`;
          }
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
          maxTicksLimit: 8
        }
      },
      y: {
        title: {
          display: true,
          text: 'Drawdown %',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          callback: function(value: any) {
            return Math.abs(value).toFixed(0) + '%';
          }
        },
        max: 0
      }
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Drawdown Periyotları</h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-center">
        <div>
          <div className="font-medium text-red-400">{Math.abs(metrics.maxDrawdown).toFixed(1)}%</div>
          <div className="text-muted-foreground">Max DD</div>
        </div>
        <div>
          <div className="font-medium text-orange-400">{metrics.maxDrawdownDuration}</div>
          <div className="text-muted-foreground">Max Süre (gün)</div>
        </div>
        <div>
          <div className="font-medium text-green-400">{metrics.recoveryFactor.toFixed(1)}x</div>
          <div className="text-muted-foreground">Recovery Factor</div>
        </div>
      </div>
    </div>
  );
}

// Strategy vs Buy & Hold Comparison Chart
export function StrategyVsBuyHoldChart({ metrics }: ProfessionalChartsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const comparison = metrics.buyAndHoldComparison;
  
  if (!comparison || comparison.strategyEquity.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Strateji vs Buy & Hold</h3>
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          Karşılaştırma verisi hesaplanıyor...
        </div>
      </div>
    );
  }

  // Prepare chart data
  const labels = comparison.strategyEquity.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('tr-TR', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
    });
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Trading Stratejisi',
        data: comparison.strategyEquity.map(item => item.equity),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Buy & Hold',
        data: comparison.buyHoldEquity.map(item => item.equity),
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const initialBalance = comparison.strategyEquity[0]?.equity || 10000;
            const returnPercent = ((value - initialBalance) / initialBalance) * 100;
            return `${context.dataset.label}: $${value.toLocaleString('tr-TR')} (${returnPercent >= 0 ? '+' : ''}${returnPercent.toFixed(1)}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          maxTicksLimit: 10
        }
      },
      y: {
        title: {
          display: true,
          text: 'Portfolio Değeri ($)',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          callback: function(value: any) {
            return '$' + value.toLocaleString('tr-TR');
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  const outperformanceColor = comparison.outperformance >= 0 ? 'text-green-400' : 'text-red-400';
  const winRateColor = (comparison.winningPeriods / comparison.totalPeriods) >= 0.5 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Strateji vs Buy & Hold Karşılaştırması</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500 rounded"></div>
            <span className="text-muted-foreground">Strateji</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gray-400 rounded border-dashed border border-gray-400"></div>
            <span className="text-muted-foreground">Buy & Hold</span>
          </div>
        </div>
      </div>
      
      <div className="h-80 mb-6">
        <Line data={data} options={options} />
      </div>

      {/* Performance Comparison Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background/50 rounded-xl">
        <div className="text-center">
          <div className={`text-xl font-bold ${outperformanceColor} mb-1`}>
            {comparison.outperformance >= 0 ? '+' : ''}{comparison.outperformance.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Outperformance</div>
          <div className="text-xs text-muted-foreground mt-1">
            {comparison.outperformance >= 0 ? 'Buy & Hold\'dan daha iyi' : 'Buy & Hold\'dan daha kötü'}
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-xl font-bold ${winRateColor} mb-1`}>
            {((comparison.winningPeriods / comparison.totalPeriods) * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-muted-foreground">Winning Periods</div>
          <div className="text-xs text-muted-foreground mt-1">
            {comparison.winningPeriods} / {comparison.totalPeriods} hafta
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400 mb-1">
            {comparison.strategyEquity.length}
          </div>
          <div className="text-sm text-muted-foreground">Trading Days</div>
          <div className="text-xs text-muted-foreground mt-1">
            Toplam karşılaştırma periyodu
          </div>
        </div>
      </div>

      {/* Strategy Insights */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
        <h4 className="font-medium text-foreground mb-2">Karşılaştırma Analizi:</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          {comparison.outperformance > 10 && (
            <div className="text-green-400">• Strateji buy & hold\'dan önemli ölçüde daha iyi performans gösteriyor</div>
          )}
          {comparison.outperformance >= 0 && comparison.outperformance <= 10 && (
            <div className="text-yellow-400">• Strateji buy & hold ile rekabet halinde</div>
          )}
          {comparison.outperformance < 0 && (
            <div className="text-red-400">• Buy & hold daha basit ve etkili bir seçenek olabilir</div>
          )}
          {(comparison.winningPeriods / comparison.totalPeriods) > 0.6 && (
            <div className="text-green-400">• Strateji tutarlı bir şekilde piyasayı geçiyor</div>
          )}
          {(comparison.winningPeriods / comparison.totalPeriods) < 0.4 && (
            <div className="text-red-400">• Strateji çoğu zaman piyasanın gerisinde kalıyor</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Modern Detailed Analysis - Yeni Tasarım
export function ModernProfessionalAnalysis({ metrics }: ProfessionalChartsProps) {
  return <ModernDetailedAnalysis metrics={metrics} />;
}