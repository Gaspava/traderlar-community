'use client';

import { useEffect, useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ManualBacktestTrade } from '@/lib/supabase/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceChartProps {
  trades: ManualBacktestTrade[];
  initialCapital: number;
  currency?: string;
  height?: number;
}

export default function PerformanceChart({ 
  trades, 
  initialCapital, 
  currency = 'USD',
  height = 400 
}: PerformanceChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Calculate cumulative performance data
  const chartData = useMemo(() => {
    const closedTrades = trades
      .filter(trade => trade.status === 'closed' && trade.pnl !== null)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (closedTrades.length === 0) {
      return {
        labels: ['Başlangıç'],
        datasets: [
          {
            label: 'Portföy Değeri',
            data: [initialCapital],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          }
        ]
      };
    }

    const labels: string[] = ['Başlangıç'];
    const portfolioValues: number[] = [initialCapital];
    const pnlValues: number[] = [0];
    
    let runningBalance = initialCapital;
    
    closedTrades.forEach((trade, index) => {
      runningBalance += (trade.pnl || 0);
      
      // Create label with date info
      const tradeDate = new Date(trade.created_at);
      const label = tradeDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
      });
      
      labels.push(label);
      portfolioValues.push(runningBalance);
      pnlValues.push(runningBalance - initialCapital);
    });

    // Determine line color based on overall performance
    const totalPnL = runningBalance - initialCapital;
    const lineColor = totalPnL >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
    const fillColor = totalPnL >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';

    return {
      labels,
      datasets: [
        {
          label: 'Portföy Değeri',
          data: portfolioValues,
          borderColor: lineColor,
          backgroundColor: fillColor,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: portfolioValues.map((value, index) => {
            if (index === 0) return 'rgb(59, 130, 246)';
            const pnl = pnlValues[index];
            return pnl >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
          }),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ]
    };
  }, [trades, initialCapital]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          }
        }
      },
      title: {
        display: true,
        text: 'Portföy Performansı',
        color: 'rgb(209, 213, 219)',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 'bold',
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'Inter, sans-serif',
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 12,
        },
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            const value = context.raw as number;
            const formatter = new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });
            
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += formatter.format(value);
            
            // Add P&L information for non-initial points
            if (context.dataIndex > 0) {
              const pnl = value - initialCapital;
              const pnlPercent = ((pnl / initialCapital) * 100).toFixed(2);
              const pnlSign = pnl >= 0 ? '+' : '';
              const pnlPercentSign = parseFloat(pnlPercent) >= 0 ? '+' : '';
              label += ` (${pnlSign}${formatter.format(pnl)} / ${pnlPercentSign}${pnlPercent}%)`;
            }
            
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'İşlemler',
          color: 'rgb(156, 163, 175)',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: 'bold',
          }
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            family: 'Inter, sans-serif',
            size: 11,
          },
          maxTicksLimit: 10,
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
          drawBorder: false,
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: `Portföy Değeri (${currency})`,
          color: 'rgb(156, 163, 175)',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: 'bold',
          }
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            family: 'Inter, sans-serif',
            size: 11,
          },
          callback: function(value) {
            return new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value as number);
          }
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
          drawBorder: false,
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 8,
        hoverBorderWidth: 3,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    }
  };

  return (
    <div style={{ height: `${height}px` }} className="relative">
      <Line 
        ref={chartRef}
        data={chartData} 
        options={options} 
      />
      
      {trades.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Henüz veri yok</p>
            <p className="text-sm text-muted-foreground">
              İlk işleminizi ekleyince grafik görünecek
            </p>
          </div>
        </div>
      )}
    </div>
  );
}