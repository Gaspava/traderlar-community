'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ManualBacktestTrade } from '@/lib/supabase/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TradeDistributionChartProps {
  trades: ManualBacktestTrade[];
  currency?: string;
  height?: number;
}

export default function TradeDistributionChart({ 
  trades, 
  currency = 'USD',
  height = 300 
}: TradeDistributionChartProps) {
  const chartData = useMemo(() => {
    const closedTrades = trades.filter(trade => trade.status === 'closed');
    
    if (closedTrades.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Group trades by P&L ranges
    const ranges = [
      { min: -Infinity, max: -500, label: '< -500', color: 'rgb(239, 68, 68)' },
      { min: -500, max: -200, label: '-500 / -200', color: 'rgb(248, 113, 113)' },
      { min: -200, max: -50, label: '-200 / -50', color: 'rgb(252, 165, 165)' },
      { min: -50, max: 0, label: '-50 / 0', color: 'rgb(254, 202, 202)' },
      { min: 0, max: 50, label: '0 / +50', color: 'rgb(187, 247, 208)' },
      { min: 50, max: 200, label: '+50 / +200', color: 'rgb(134, 239, 172)' },
      { min: 200, max: 500, label: '+200 / +500', color: 'rgb(74, 222, 128)' },
      { min: 500, max: Infinity, label: '> +500', color: 'rgb(34, 197, 94)' }
    ];

    const distribution = ranges.map(range => ({
      ...range,
      count: closedTrades.filter(trade => 
        trade.pnl > range.min && trade.pnl <= range.max
      ).length
    })).filter(range => range.count > 0);

    return {
      labels: distribution.map(d => d.label),
      datasets: [
        {
          label: 'İşlem Sayısı',
          data: distribution.map(d => d.count),
          backgroundColor: distribution.map(d => d.color),
          borderColor: distribution.map(d => d.color),
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    };
  }, [trades]);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'P&L Dağılımı',
        color: 'rgb(209, 213, 219)',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 'bold',
        }
      },
      tooltip: {
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
            return `P&L Aralığı: ${context[0].label}`;
          },
          label: (context) => {
            const value = context.raw as number;
            const total = trades.filter(t => t.status === 'closed').length;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${value} işlem (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `P&L Aralıkları (${currency})`,
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
            size: 10,
          },
          maxRotation: 45,
        },
        grid: {
          display: false,
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'İşlem Sayısı',
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
          stepSize: 1,
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
          drawBorder: false,
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    }
  };

  const closedTrades = trades.filter(trade => trade.status === 'closed');

  if (closedTrades.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            P&L Dağılımı
          </h3>
          <p className="text-sm text-muted-foreground">
            İşlem sonuçlarının dağılımı
          </p>
        </div>
        
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Henüz tamamlanmış işlem yok</p>
            <p className="text-sm text-muted-foreground">
              İşlemleri kapattıkça dağılım grafiği görünecek
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          P&L Dağılımı
        </h3>
        <p className="text-sm text-muted-foreground">
          İşlem sonuçlarının kar/zarar aralıklarına göre dağılımı
        </p>
      </div>
      
      <div style={{ height: `${height}px` }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}