'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useParams } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  Download,
  Heart,
  Share2,
  BarChart3,
  Activity,
  User,
  Users,
  CheckCircle,
  Target,
  Play,
  MessageCircle,
  Flag,
  Settings,
  Info,
  CheckSquare,
  Receipt,
  Award,
  Zap,
  Brain,
  Shield,
  TrendingUp as TrendIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { calculateProfessionalMetrics, calculateReturns } from '@/lib/professional-metrics';
import { getMetricAnalysis, analyzeStrategyProfile } from '@/lib/metric-analysis';
import {
  PerformanceRadarChart,
  RiskReturnChart,
  MonthlyReturnsHeatmap,
  RollingSharpeChart,
  DrawdownPeriodsChart,
  StrategyVsBuyHoldChart,
  ModernProfessionalAnalysis
} from '@/components/professional-charts';

interface Trade {
  id: string;
  ticket: number;
  tradeNumber?: number;
  openTime: string;
  closeTime: string;
  type: 'buy' | 'sell';
  size: number;
  symbol: string;
  openPrice: number;
  closePrice: number;
  stopLoss?: number;
  takeProfit?: number;
  commission: number;
  swap: number;
  profit: number;
  duration: number | null;
}

interface EquityPoint {
  date: string;
  equity: number;
  cumulative: number;
}

interface StrategyDetails {
  id: string;
  name: string;
  description: string;
  author_id: string;
  category: string;
  tags: string[];
  timeframe: string;
  is_premium: boolean;
  total_net_profit: number;
  profit_factor: number;
  total_trades: number;
  win_rate: number;
  sharpe_ratio: number;
  max_drawdown_percent: number;
  created_at: string;
  updated_at?: string;
  ea_link?: string;
  views?: number;
  likes?: number;
  downloads?: number;
}

// Demo data
const mockStrategy: StrategyDetails = {
  id: '1',
  name: 'RSI Divergence Master',
  description: 'RSI divergence tespit ile güçlü giriş noktalarını bulun momentum stratejisi yüksek başarı.',
  longDescription: `Bu gelişmiş trading stratejisi, RSI osilatörü ile fiyat hareketi arasındaki divergensları analiz ederek güçlü giriş ve çıkış sinyalleri üretir.

**Ana Özellikler:**
- Çoklu zaman dilimi analizi
- Adaptif RSI parametreleri  
- Volume konfirmasyonu
- Risk yönetimi entegrasyonu
- Otomatik stop-loss ve take-profit seviyeleri

Strateji özellikle trend dönüş noktalarında yüksek başarı oranı gösterir ve uzun vadeli performans için optimize edilmiştir.`,
  author: {
    id: 'author1',
    name: 'AlgoTrader',
    username: 'algotrader',
    avatar: '👤',
    verified: true,
    followers: 2500,
    strategies: 15
  },
  ea_link: 'https://example.com/ea-download/rsi-divergence-master.ex4',
  views: 12450,
  likes: 234,
  downloads: 5678,
  updated_at: '2024-01-28',
  category: 'Forex',
  tags: ['RSI', 'Divergence', 'Momentum', 'H4'],
  performance: {
    totalReturn: 156.8,
    annualReturn: 89.3,
    winRate: 68.5,
    profitFactor: 1.85,
    maxDrawdown: -12.3,
    avgDrawdown: -5.7,
    sharpeRatio: 2.1,
    sortinoRatio: 2.8,
    calmarRatio: 7.2,
    totalTrades: 1245,
    winningTrades: 852,
    losingTrades: 393,
    avgWin: 2.4,
    avgLoss: -1.3,
    largestWin: 8.7,
    largestLoss: -4.2,
    avgTradeDuration: '4.2 saat'
  },
  equityCurve: [
    { date: '2024-01', equity: 10000, benchmark: 10000 },
    { date: '2024-02', equity: 10850, benchmark: 10120 },
    { date: '2024-03', equity: 12183, benchmark: 10245 },
    { date: '2024-04', equity: 11927, benchmark: 10189 },
    { date: '2024-05', equity: 13798, benchmark: 10456 },
    { date: '2024-06', equity: 15066, benchmark: 10678 },
    { date: '2024-07', equity: 16090, benchmark: 10823 },
    { date: '2024-08', equity: 17924, benchmark: 11045 },
    { date: '2024-09', equity: 17297, benchmark: 10934 },
    { date: '2024-10', equity: 19758, benchmark: 11234 },
    { date: '2024-11', equity: 21319, benchmark: 11456 },
    { date: '2024-12', equity: 22490, benchmark: 11589 }
  ],
  monthlyReturns: [
    { month: 'Oca', return: 8.5 },
    { month: 'Şub', return: 12.3 },
    { month: 'Mar', return: -2.1 },
    { month: 'Nis', return: 15.7 },
    { month: 'May', return: 9.2 },
    { month: 'Haz', return: 6.8 },
    { month: 'Tem', return: 11.4 },
    { month: 'Ağu', return: -3.5 },
    { month: 'Eyl', return: 14.2 },
    { month: 'Eki', return: 7.9 },
    { month: 'Kas', return: 10.1 },
    { month: 'Ara', return: 5.3 }
  ],
  drawdownChart: [
    { date: '2024-01', drawdown: 0 },
    { date: '2024-02', drawdown: -2.1 },
    { date: '2024-03', drawdown: -0.8 },
    { date: '2024-04', drawdown: -4.2 },
    { date: '2024-05', drawdown: -1.5 },
    { date: '2024-06', drawdown: -0.3 },
    { date: '2024-07', drawdown: -2.8 },
    { date: '2024-08', drawdown: -1.2 },
    { date: '2024-09', drawdown: -6.5 },
    { date: '2024-10', drawdown: -3.1 },
    { date: '2024-11', drawdown: -1.8 },
    { date: '2024-12', drawdown: -0.5 }
  ],
  tradeHistory: [
    { date: '2024-12-28', type: 'buy', result: 'win', pnl: 2.4, duration: '3.2h' },
    { date: '2024-12-27', type: 'sell', result: 'win', pnl: 1.8, duration: '5.1h' },
    { date: '2024-12-26', type: 'buy', result: 'loss', pnl: -1.2, duration: '2.8h' },
    { date: '2024-12-25', type: 'sell', result: 'win', pnl: 3.1, duration: '4.5h' },
    { date: '2024-12-24', type: 'buy', result: 'win', pnl: 1.9, duration: '6.2h' }
  ],
  rating: 4.5,
  reviews: 89,
  likes: 234,
  downloads: 5678,
  views: 12450,
  isPremium: false,
  price: 0,
  timeframe: 'H4',
  createdAt: '2024-01-15',
  updatedAt: '2024-01-28',
  requirements: [
    'MetaTrader 4/5',
    'Minimum 1000$ sermaye',
    'VPS önerilir',
    'Temel teknik analiz bilgisi'
  ],
  riskLevel: 'Medium',
  minCapital: 1000,
  backtestPeriod: '2020-2024 (4 yıl)',
  forwardTestPeriod: '6 ay'
};

export default function StrategyDetailPage() {
  const params = useParams();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [strategy, setStrategy] = useState<StrategyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [liked, setLiked] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState<string | null>(null);
  
  // Trade history state
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradesLoading, setTradesLoading] = useState(false);
  const [equityCurve, setEquityCurve] = useState<EquityPoint[]>([]);
  const [drawdownData, setDrawdownData] = useState<{date: string, drawdown: number, equity: number}[]>([]);
  const [yearlyReturns, setYearlyReturns] = useState<{year: string, months: {[key: string]: {return: number, trades: number, profit: number}}, yearTotal: number}[]>([]);
  const [calculatedAnnualReturn, setCalculatedAnnualReturn] = useState<number | null>(null);
  const [tradesPagination, setTradesPagination] = useState({
    page: 1,
    limit: 99999999, // Very high limit to get all trades
    total: 0,
    pages: 0
  });

  // Calculate professional metrics for use across all tabs
  const professionalMetrics = trades.length > 0 ? calculateProfessionalMetrics(trades, strategy?.performance?.initialDeposit || 10000) : null;

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/strategies/${params.id}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, response.statusText, errorText);
          throw new Error(`Failed to fetch strategy: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Strategy data received:', data);
        setStrategy(data);
        
        // If no trades data available, set a basic annual return estimate
        if (data.performance.totalReturn && !calculatedAnnualReturn) {
          // Assume 4-year backtesting period for rough estimate
          const roughAnnualReturn = Math.round(data.performance.totalReturn / 4 * 10) / 10;
          setCalculatedAnnualReturn(roughAnnualReturn);
        }
        
        // Auto-fetch trades when strategy is loaded to generate real equity curve
        console.log('Strategy loaded, fetching trades for equity curve...');
        fetchTradesForEquityCurve();
      } catch (error) {
        console.error('Error fetching strategy:', error);
        // Fallback to mock data if fetch fails - keep with default 10000
        setStrategy(mockStrategy);
        // Set annual return from mock data
        setCalculatedAnnualReturn(mockStrategy.performance.annualReturn);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchStrategy();
    }
  }, [params.id]);

  // Fetch trades specifically for equity curve generation
  const fetchTradesForEquityCurve = async () => {
    if (!params.id) return;
    
    try {
      console.log('Fetching all trades for equity curve...');
      const url = `/api/strategies/${params.id}/trades?page=1&limit=99999999`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const allTrades = data.trades || [];
        
        console.log(`Found ${allTrades.length} trades for equity curve`);
        
        if (allTrades.length > 0) {
          // Calculate equity curve from real trade data
          console.log('Generating equity curve from real trade data...');
          calculateEquityCurve(allTrades);
          
          // Also set trades for other tabs if not already set
          if (trades.length === 0) {
            setTrades(allTrades);
            setTradesPagination(data.pagination || tradesPagination);
          }
        } else {
          console.log('No trades found, using mock equity curve');
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch trades for equity curve:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching trades for equity curve:', error);
    }
  };

  const fetchTrades = async (page = 1) => {
    if (!params.id) return;
    
    setTradesLoading(true);
    try {
      const url = `/api/strategies/${params.id}/trades?page=${page}&limit=${tradesPagination.limit}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        
        const newTrades = data.trades || [];
        
        if (page === 1) {
          setTrades(newTrades);
          // Calculate equity curve for new trades
          if (newTrades.length > 0) {
            calculateEquityCurve(newTrades);
          }
        } else {
          setTrades(prev => {
            const allTrades = [...prev, ...newTrades];
            if (allTrades.length > 0) {
              calculateEquityCurve(allTrades);
            }
            return allTrades;
          });
        }
        setTradesPagination(data.pagination || tradesPagination);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch trades:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setTradesLoading(false);
    }
  };

  // Fetch trades when trades tab is activated
  useEffect(() => {
    if (activeTab === 'trades' && trades.length === 0) {
      fetchTrades(1);
    }
  }, [activeTab]);

  // Calculate equity curve from trades
  const calculateEquityCurve = (allTrades: Trade[]) => {
    console.log('calculateEquityCurve called with', allTrades.length, 'trades');
    
    if (allTrades.length === 0) {
      console.log('No trades provided, keeping existing equity curve');
      return; // Don't clear existing curve if no trades
    }

    // Sort trades by close time
    const sortedTrades = [...allTrades].sort((a, b) => 
      new Date(a.closeTime || a.openTime).getTime() - new Date(b.closeTime || b.openTime).getTime()
    );


    // Calculate cumulative profit
    let cumulativeProfit = 0;
    const initialBalance = strategy?.performance?.initialDeposit || 10000; // Use real initial deposit from data
    
    const equityPoints: EquityPoint[] = sortedTrades.map((trade, index) => {
      const totalPnL = trade.profit + trade.commission + trade.swap;
      cumulativeProfit += totalPnL;
      
      const tradeDate = trade.closeTime || trade.openTime;
      
      return {
        date: tradeDate,
        equity: initialBalance + cumulativeProfit,
        cumulative: cumulativeProfit
      };
    });


    setEquityCurve(equityPoints);
    
    // Calculate drawdown data
    calculateDrawdown(equityPoints);
    
    // Calculate yearly returns
    calculateYearlyReturns(allTrades);
    
    // Calculate annual return from total return percentage
    if (strategy && equityPoints.length > 0) {
      const initialEquity = equityPoints[0].equity;
      const finalEquity = equityPoints[equityPoints.length - 1].equity;
      const totalReturnPercent = ((finalEquity - initialEquity) / initialEquity) * 100;
      const annualReturn = calculateAnnualReturn(allTrades, totalReturnPercent);
      setCalculatedAnnualReturn(annualReturn);
    }
  };

  // Calculate drawdown from equity curve
  const calculateDrawdown = (equityPoints: EquityPoint[]) => {
    if (equityPoints.length === 0) {
      setDrawdownData([]);
      return;
    }

    let highWaterMark = equityPoints[0].equity;
    const drawdownPoints = equityPoints.map(point => {
      // Update high water mark if current equity is higher
      if (point.equity > highWaterMark) {
        highWaterMark = point.equity;
      }
      
      // Calculate drawdown as dollar amount from high water mark
      const drawdownDollar = point.equity - highWaterMark;
      
      return {
        date: point.date,
        drawdown: drawdownDollar,
        equity: point.equity
      };
    });

    setDrawdownData(drawdownPoints);
  };

  // Calculate annual return based on total return and time period
  const calculateAnnualReturn = (allTrades: Trade[], totalReturnPercent: number) => {
    if (!allTrades || allTrades.length === 0) return 0;
    
    // Get first and last trade dates
    const sortedTrades = [...allTrades].sort((a, b) => 
      new Date(a.openTime).getTime() - new Date(b.openTime).getTime()
    );
    
    const firstTradeDate = new Date(sortedTrades[0].openTime);
    const lastTradeDate = new Date(sortedTrades[sortedTrades.length - 1].closeTime || sortedTrades[sortedTrades.length - 1].openTime);
    
    // Calculate number of years
    const timeDiffMs = lastTradeDate.getTime() - firstTradeDate.getTime();
    const yearsDiff = timeDiffMs / (1000 * 60 * 60 * 24 * 365.25); // Include leap years
    
    if (yearsDiff <= 0) return totalReturnPercent; // If less than a year, return total return
    
    // Calculate annualized return
    const annualReturn = totalReturnPercent / yearsDiff;
    
    return Math.round(annualReturn * 10) / 10; // Round to 1 decimal
  };

  // Calculate yearly returns from trades
  const calculateYearlyReturns = (allTrades: Trade[]) => {
    if (allTrades.length === 0) {
      setYearlyReturns([]);
      return;
    }

    // Sort trades by close time
    const sortedTrades = [...allTrades].sort((a, b) => 
      new Date(a.closeTime || a.openTime).getTime() - new Date(b.closeTime || b.openTime).getTime()
    );

    // Group trades by year and month
    const yearlyData: {[year: string]: {[month: string]: {trades: Trade[], profit: number}}} = {};
    
    sortedTrades.forEach(trade => {
      const tradeDate = new Date(trade.closeTime || trade.openTime);
      const year = tradeDate.getFullYear().toString();
      const month = tradeDate.getMonth() + 1; // 1-12
      
      if (!yearlyData[year]) {
        yearlyData[year] = {};
      }
      
      if (!yearlyData[year][month]) {
        yearlyData[year][month] = { trades: [], profit: 0 };
      }
      
      yearlyData[year][month].trades.push(trade);
      yearlyData[year][month].profit += trade.profit + trade.commission + trade.swap;
    });

    // Calculate yearly returns data
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    
    const yearlyReturnsData = Object.keys(yearlyData)
      .sort()
      .map(year => {
        const yearData = yearlyData[year];
        const months: {[key: string]: {return: number, trades: number, profit: number}} = {};
        let yearTotalProfit = 0;
        
        // Process each month (1-12)
        for (let monthNum = 1; monthNum <= 12; monthNum++) {
          const monthKey = monthNames[monthNum - 1];
          
          if (yearData[monthNum]) {
            const monthData = yearData[monthNum];
            const returnPercent = (monthData.profit / 1000) * 100; // Assuming 1000 base per month
            
            months[monthKey] = {
              return: returnPercent,
              trades: monthData.trades.length,
              profit: monthData.profit
            };
            
            yearTotalProfit += monthData.profit;
          } else {
            // No trades in this month
            months[monthKey] = {
              return: 0,
              trades: 0,
              profit: 0
            };
          }
        }
        
        return {
          year,
          months,
          yearTotal: yearTotalProfit
        };
      });

    setYearlyReturns(yearlyReturnsData);
  };

  // Circular Progress Component
  const CircularProgress = ({ 
    percentage, 
    size = 80, 
    strokeWidth = 6
  }: { 
    percentage: number; 
    size?: number; 
    strokeWidth?: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-foreground">
            {percentage}%
          </span>
        </div>
      </div>
    );
  };

  // Simple Line Chart
  // Equity Curve Chart Component
  const EquityCurveChart = () => {
    if (!equityCurve || equityCurve.length === 0) {
      return (
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Equity Curve</h3>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p>İşlem verisi bulunamadı</p>
            </div>
          </div>
        </div>
      );
    }

    // Prepare chart data
    const chartData = {
      labels: equityCurve.map(point => {
        const date = new Date(point.date);
        return date.toLocaleDateString('tr-TR', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
      }),
      datasets: [
        {
          label: 'Equity',
          data: equityCurve.map(point => point.equity),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          displayColors: false,
          callbacks: {
            label: function(context: any) {
              const value = context.parsed.y;
              const initialDeposit = strategy?.performance?.initialDeposit || 10000;
              const profit = value - initialDeposit; // Use real initial deposit
              return `Equity: ${value.toLocaleString('tr-TR')} (${profit >= 0 ? '+' : ''}${profit.toLocaleString('tr-TR')})`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
            maxTicksLimit: 8
          }
        },
        y: {
          display: true,
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
            callback: function(value: any) {
              return value.toLocaleString('tr-TR');
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const
      }
    };

    return (
      <div className="bg-gradient-to-br from-white/80 to-gray-50/90 dark:from-card/40 dark:to-background/60 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-emerald-500 dark:text-emerald-400">Equity Curve</h3>
          <div className="text-sm text-gray-600 dark:text-muted-foreground px-3 py-1 bg-gray-200/50 dark:bg-card/50 rounded-lg">
            {equityCurve.length} işlem
          </div>
        </div>
        <div className="h-64 relative">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-200/30 dark:bg-card/30 rounded-lg">
            <div className="text-gray-600 dark:text-muted-foreground mb-1">Başlangıç</div>
            <div className="font-bold text-cyan-500 dark:text-cyan-400">
              ${strategy?.performance?.initialDeposit?.toLocaleString('tr-TR') || '10,000'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-200/30 dark:bg-card/30 rounded-lg">
            <div className="text-gray-600 dark:text-muted-foreground mb-1">Son Equity</div>
            <div className="font-bold text-blue-500 dark:text-blue-400">
              ${equityCurve[equityCurve.length - 1]?.equity.toLocaleString('tr-TR') || 'N/A'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-200/30 dark:bg-card/30 rounded-lg">
            <div className="text-gray-600 dark:text-muted-foreground mb-1">Toplam Kar/Zarar</div>
            <div className={`font-bold ${
              (equityCurve[equityCurve.length - 1]?.equity || (strategy?.performance?.initialDeposit || 10000)) >= (strategy?.performance?.initialDeposit || 10000) 
                ? 'text-emerald-500 dark:text-emerald-400' 
                : 'text-red-500 dark:text-red-400'
            }`}>
              {(() => {
                if (equityCurve && equityCurve.length > 0) {
                  const initialDeposit = strategy?.performance?.initialDeposit || 10000;
                  const finalEquity = equityCurve[equityCurve.length - 1]?.equity || initialDeposit;
                  const totalProfitLoss = finalEquity - initialDeposit;
                  return `${totalProfitLoss >= 0 ? '+' : ''}$${totalProfitLoss.toLocaleString('tr-TR')}`;
                }
                return 'N/A';
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Drawdown Chart Component
  const DrawdownChart = () => {
    // Year selection state
    const [selectedDrawdownYear, setSelectedDrawdownYear] = useState<number>(2024); // Default to latest year
    const availableYears = [2020, 2021, 2022, 2023, 2024];
    const maxYear = Math.max(...availableYears);
    const minYear = Math.min(...availableYears);

    // Navigation functions
    const goToPreviousYear = () => {
      if (selectedDrawdownYear > minYear) {
        setSelectedDrawdownYear(selectedDrawdownYear - 1);
      }
    };

    const goToNextYear = () => {
      if (selectedDrawdownYear < maxYear) {
        setSelectedDrawdownYear(selectedDrawdownYear + 1);
      }
    };

    if (!drawdownData || drawdownData.length === 0) {
      return (
        <div className="bg-gradient-to-br from-white/80 to-gray-50/90 dark:from-card/40 dark:to-background/60 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-red-500 dark:text-red-400">Drawdown Analizi</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousYear}
                disabled={selectedDrawdownYear <= minYear}
                className={`p-1 rounded transition-colors ${
                  selectedDrawdownYear <= minYear
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-red-500 dark:text-red-400'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-muted-foreground min-w-[4rem] text-center">
                {selectedDrawdownYear}
              </span>
              <button
                onClick={goToNextYear}
                disabled={selectedDrawdownYear >= maxYear}
                className={`p-1 rounded transition-colors ${
                  selectedDrawdownYear >= maxYear
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-red-500 dark:text-red-400'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p>Drawdown verisi bulunamadı</p>
            </div>
          </div>
        </div>
      );
    }

    // Filter drawdown data by selected year
    const filteredDrawdownData = drawdownData.filter(point => {
      const date = new Date(point.date);
      return date.getFullYear() === selectedDrawdownYear;
    });

    // Use filtered data for display
    const displayData = filteredDrawdownData.length > 0 ? filteredDrawdownData : drawdownData;

    // Prepare chart data
    const chartData = {
      labels: displayData.map(point => {
        const date = new Date(point.date);
        return date.toLocaleDateString('tr-TR', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
      }),
      datasets: [
        {
          label: 'Drawdown %',
          data: displayData.map(point => point.drawdown),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          displayColors: false,
          callbacks: {
            label: function(context: any) {
              const value = context.parsed.y;
              return `Drawdown: $${value.toLocaleString('tr-TR')}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
            maxTicksLimit: 8
          }
        },
        y: {
          display: true,
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
            callback: function(value: any) {
              return '$' + value.toLocaleString('tr-TR');
            }
          },
          max: 0, // Drawdown is always negative or zero
          min: Math.min(...displayData.map(d => d.drawdown)) * 1.1 // Add some padding
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const
      }
    };

    // Calculate drawdown statistics based on filtered data
    const maxDrawdown = Math.min(...displayData.map(d => d.drawdown));
    const avgDrawdown = displayData.reduce((sum, d) => sum + d.drawdown, 0) / displayData.length;
    const drawdownPeriods = displayData.filter(d => d.drawdown < 0).length;
    const recoveryPeriods = displayData.filter(d => d.drawdown === 0).length;

    return (
      <div className="bg-gradient-to-br from-white/80 to-gray-50/90 dark:from-card/40 dark:to-background/60 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-red-500 dark:text-red-400">Drawdown Analizi</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousYear}
              disabled={selectedDrawdownYear <= minYear}
              className={`p-1 rounded transition-colors ${
                selectedDrawdownYear <= minYear
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-muted-foreground min-w-[4rem] text-center">
              {selectedDrawdownYear}
            </span>
            <button
              onClick={goToNextYear}
              disabled={selectedDrawdownYear >= maxYear}
              className={`p-1 rounded transition-colors ${
                selectedDrawdownYear >= maxYear
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-64 relative">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-200/30 dark:bg-card/30 rounded-lg">
            <div className="text-gray-600 dark:text-muted-foreground mb-1">Max Drawdown</div>
            <div className="font-bold text-red-500 dark:text-red-400">
              ${Math.abs(maxDrawdown).toLocaleString('tr-TR')}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-200/30 dark:bg-card/30 rounded-lg">
            <div className="text-gray-600 dark:text-muted-foreground mb-1">Ortalama Drawdown</div>
            <div className="font-bold text-orange-500 dark:text-orange-400">
              ${Math.abs(avgDrawdown).toLocaleString('tr-TR')}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-200/30 dark:bg-card/30 rounded-lg">
            <div className="text-gray-600 dark:text-muted-foreground mb-1">Recovery Oranı</div>
            <div className="font-bold text-emerald-500 dark:text-emerald-400">
              {displayData.length > 0 ? ((recoveryPeriods / displayData.length) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SimpleLineChart = ({ 
    data, 
    title 
  }: { 
    data: Array<{date: string, equity?: number, benchmark?: number, drawdown?: number}>;
    title: string;
  }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">{title}</h3>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <BarChart3 className="w-8 h-8" />
          </div>
        </div>
      );
    }

    const values = data.map(d => d.equity || d.benchmark || d.drawdown || 0).filter(v => v !== 0);
    const maxValue = values.length > 0 ? Math.max(...values) : 100;
    const minValue = values.length > 0 ? Math.min(...values) : 0;
    const range = maxValue - minValue || 1;

    const getY = (value: number) => {
      return 150 - ((value - minValue) / range) * 130 + 10;
    };

    const getPath = (values: number[]) => {
      if (!values || values.length === 0) return '';
      return values.map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * 360 + 20;
        const y = getY(value);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      }).join(' ');
    };

    return (
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">{title}</h3>
        <div className="relative">
          <svg width="400" height="170" className="w-full h-auto">
            {/* Grid */}
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border/30"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Equity line */}
            {data.length > 0 && 'equity' in data[0] && (
              <path
                d={getPath(data.map(d => d.equity || 0))}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                className="drop-shadow-sm"
              />
            )}

            {/* Benchmark line */}
            {data.length > 0 && 'benchmark' in data[0] && (
              <path
                d={getPath(data.map(d => d.benchmark || 0))}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1"
                strokeDasharray="4,4"
                className="opacity-60"
              />
            )}

            {/* Drawdown line */}
            {data.length > 0 && 'drawdown' in data[0] && (
              <path
                d={getPath(data.map(d => d.drawdown || 0))}
                fill="none"
                stroke="hsl(var(--destructive))"
                strokeWidth="2"
              />
            )}
          </svg>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs">
            {data.length > 0 && 'equity' in data[0] && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-primary rounded"></div>
                <span className="text-muted-foreground">Strateji</span>
              </div>
            )}
            {data.length > 0 && 'benchmark' in data[0] && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-muted-foreground rounded opacity-60"></div>
                <span className="text-muted-foreground">Benchmark</span>
              </div>
            )}
            {data.length > 0 && 'drawdown' in data[0] && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-destructive rounded"></div>
                <span className="text-muted-foreground">Drawdown</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'advanced-analysis', label: 'Detaylı Analiz', icon: Brain },
    { id: 'trades', label: 'İşlemler', icon: Receipt },
    { id: 'backtest', label: 'Backtest', icon: Activity },
    { id: 'reviews', label: 'Yorumlar', icon: MessageCircle }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-muted-foreground">Strateji yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-500 dark:text-muted-foreground mb-4">Strateji bulunamadı</p>
          <Link href="/trading-stratejileri" className="text-purple-600 dark:text-purple-400 hover:underline">
            Stratejilere dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Modern Strategy Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Back Button - Modern Design */}
              <Link 
                href="/trading-stratejileri"
                className="group inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-200 dark:border-border rounded-xl hover:bg-white dark:hover:bg-muted transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400">Geri Dön</span>
              </Link>

              {/* Strategy Title Section */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent mb-3">
                      {strategy.name}
                    </h1>
                    
                    {/* Author & Verification */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {strategy.author.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 dark:text-foreground">{strategy.author.name}</span>
                            {strategy.author.verified && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-card text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3" />
                                <span>Verified</span>
                              </div>
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                            <Sparkles className="w-3 h-3" />
                            Pro Trader
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Strategy Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-card/60 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-border/50">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600 dark:text-muted-foreground">Oluşturulma:</span>
                        <span className="font-medium text-gray-800 dark:text-foreground">
                          {strategy.created_at ? new Date(strategy.created_at).toLocaleDateString('tr-TR') : '15 Oca 2024'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-card/60 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-border/50">
                        <RefreshCw className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 dark:text-muted-foreground">Son Güncelleme:</span>
                        <span className="font-medium text-gray-800 dark:text-foreground">
                          {strategy.updated_at ? new Date(strategy.updated_at).toLocaleDateString('tr-TR') : '28 Oca 2024'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Stats */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-card/70 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-border hover:bg-white dark:hover:bg-muted transition-all duration-300">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-gray-700 dark:text-foreground">{strategy.views || 45}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-card/70 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-border hover:bg-white dark:hover:bg-muted transition-all duration-300">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-semibold text-gray-700 dark:text-foreground">{strategy.likes || 234}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-card/70 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-border hover:bg-white dark:hover:bg-muted transition-all duration-300">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold text-gray-700 dark:text-foreground">{strategy.subscribers || 1340}</span>
                      <span className="text-xs text-gray-500 dark:text-muted-foreground">İşlem</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Download Actions Bar */}
        <div className="border-b border-gray-200 dark:border-border bg-white/50 dark:bg-background/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    liked 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-border' 
                      : 'bg-gray-100 dark:bg-card text-gray-600 dark:text-muted-foreground border border-gray-200 dark:border-border hover:bg-red-50 dark:hover:bg-muted hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-border'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{strategy.likes || 234}</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-card text-gray-600 dark:text-muted-foreground border border-gray-200 dark:border-border rounded-xl hover:bg-blue-50 dark:hover:bg-muted hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-border transition-all duration-300">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Paylaş</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-card text-gray-600 dark:text-muted-foreground border border-gray-200 dark:border-border rounded-xl hover:bg-yellow-50 dark:hover:bg-muted hover:text-yellow-600 dark:hover:text-yellow-400 hover:border-yellow-200 dark:hover:border-border transition-all duration-300">
                  <Flag className="w-4 h-4" />
                  <span className="text-sm font-medium">Raporla</span>
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                {strategy.ea_link && (
                  <a 
                    href={strategy.ea_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 font-medium"
                  >
                    <Play className="w-4 h-4" />
                    <span>EA İndir</span>
                  </a>
                )}
                <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-600/30 font-medium">
                  <Download className="w-4 h-4" />
                  <span>İndir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-300/50 dark:border-border/50 bg-gray-100/20 dark:bg-background/20 backdrop-blur-sm">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center gap-3 px-6 py-4 font-medium transition-all duration-300 border-b-2 whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? 'border-purple-500 dark:border-purple-400 text-purple-600 dark:text-purple-400 bg-gradient-to-t from-purple-500/10 to-transparent shadow-lg shadow-purple-500/20'
                      : 'border-transparent text-gray-600 dark:text-muted-foreground hover:text-purple-500 dark:hover:text-purple-300 hover:border-purple-500/50 hover:bg-gradient-to-t hover:from-gray-200/30 dark:hover:from-card/30 hover:to-transparent'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 transition-all duration-300 ${
                    activeTab === tab.id ? 'text-purple-600 dark:text-purple-400 drop-shadow-lg drop-shadow-purple-500/50' : 'group-hover:scale-110'
                  }`} />
                  <span className="font-semibold">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Performance Metrics */}
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-6">Performans Metrikleri</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="bg-gradient-to-br from-white/80 to-gray-50/90 dark:from-card/50 dark:to-background/70 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-purple-500 dark:text-purple-400 mb-2">
                      +{strategy.performance.totalReturn || 0}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground font-medium">Toplam Getiri</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white/80 to-gray-50/90 dark:from-card/50 dark:to-background/70 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-blue-500 dark:text-blue-400 mb-2">
                      +{calculatedAnnualReturn !== null ? calculatedAnnualReturn : (strategy.performance.annualReturn || 0)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground font-medium">Yıllık Getiri</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white/80 to-gray-50/90 dark:from-card/50 dark:to-background/70 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-green-500 dark:text-green-400 mb-2">
                      {strategy.performance.profitFactor}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground font-medium">Profit Factor</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white/80 to-gray-50/90 dark:from-card/50 dark:to-background/70 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-pink-500 dark:text-pink-400 mb-2">
                      {strategy.performance.sharpeRatio}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground font-medium">Sharpe Ratio</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white/80 to-gray-50/90 dark:from-card/50 dark:to-background/70 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-500 mb-2">
                      {strategy.performance.totalTrades}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground font-medium">Toplam İşlem</div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <EquityCurveChart />
                <DrawdownChart />
              </div>

              {/* Monthly Returns Heatmap */}
              {professionalMetrics ? (
                <MonthlyReturnsHeatmap metrics={professionalMetrics} />
              ) : (
                <div className="bg-card rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Aylık Getiriler Heatmap</h3>
                  <div className="h-40 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                      <p>Aylık getiri analizi için işlem verisi gerekli</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Açıklama</h2>
                <div className="bg-card rounded-xl p-6">
                  <div className="prose max-w-none text-foreground">
                    {strategy.longDescription.split('\n\n').map((paragraph, index) => (
                      <div key={index} className="mb-4">
                        {paragraph.startsWith('**') ? (
                          <div className="bg-background/50 rounded-lg p-4">
                            <div dangerouslySetInnerHTML={{ 
                              __html: paragraph
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
                                .replace(/- (.*)/g, '<li class="ml-4 mb-1">$1</li>')
                            }} />
                          </div>
                        ) : (
                          <p className="leading-relaxed">{paragraph}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Gereksinimler</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4">Sistem Gereksinimleri</h3>
                    <ul className="space-y-2">
                      {strategy.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2 text-muted-foreground">
                          <CheckSquare className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-card rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4">Strateji Bilgileri</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk Seviyesi:</span>
                        <span className={`font-medium ${
                          strategy.riskLevel === 'Low' ? 'text-green-400' :
                          strategy.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {strategy.riskLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min. Sermaye:</span>
                        <span className="font-medium">${strategy.minCapital}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Backtest Periyodu:</span>
                        <span className="font-medium">{strategy.backtestPeriod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Forward Test:</span>
                        <span className="font-medium">{strategy.forwardTestPeriod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* İşlemler Tab - Trade History */}
          {activeTab === 'trades' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">İşlem Geçmişi</h2>
                <div className="text-sm text-muted-foreground">
                  {tradesPagination.total} işlem
                </div>
              </div>

              {tradesLoading && trades.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : trades.length === 0 ? (
                <div className="text-center py-20">
                  <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">Bu strateji için işlem geçmişi bulunamadı.</p>
                </div>
              ) : (
                <>
                  {/* Trade Statistics Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-green-400">
                        {trades.filter(t => t.profit > 0).length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-muted-foreground">Kazanan İşlem</div>
                      <div className="text-xs text-green-400/80 mt-1">
                        %{trades.length > 0 ? ((trades.filter(t => t.profit > 0).length / trades.length) * 100).toFixed(1) : 0}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-red-400">
                        {trades.filter(t => t.profit < 0).length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-muted-foreground">Kaybeden İşlem</div>
                      <div className="text-xs text-red-400/80 mt-1">
                        %{trades.length > 0 ? ((trades.filter(t => t.profit < 0).length / trades.length) * 100).toFixed(1) : 0}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-green-400">
                        +{trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Brüt Kar</div>
                      <div className="text-xs text-green-400/80 mt-1">
                        Ort: +{trades.filter(t => t.profit > 0).length > 0 ? 
                          (trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0) / trades.filter(t => t.profit > 0).length).toFixed(2) : 0}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-red-400">
                        {trades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Brüt Zarar</div>
                      <div className="text-xs text-red-400/80 mt-1">
                        Ort: {trades.filter(t => t.profit < 0).length > 0 ? 
                          (trades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0) / trades.filter(t => t.profit < 0).length).toFixed(2) : 0}
                      </div>
                    </div>
                  </div>

                  {/* Trades Table */}
                  <div className="bg-card rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left px-2 py-2 text-xs font-medium text-gray-700 dark:text-muted-foreground">İşlem #</th>
                            <th className="text-left px-2 py-2 text-xs font-medium text-gray-700 dark:text-muted-foreground">Açılış</th>
                            <th className="text-left px-2 py-2 text-xs font-medium text-gray-700 dark:text-muted-foreground">Tür</th>
                            <th className="text-left px-2 py-2 text-xs font-medium text-gray-700 dark:text-muted-foreground">Sembol</th>
                            <th className="text-right px-2 py-2 text-xs font-medium text-gray-700 dark:text-muted-foreground">Boyut</th>
                            <th className="text-right px-2 py-2 text-xs font-medium text-gray-700 dark:text-muted-foreground">Açılış</th>
                            <th className="text-right px-2 py-2 text-xs font-medium text-gray-700 dark:text-muted-foreground">Kapanış</th>
                            <th className="text-right px-2 py-2 text-xs font-medium text-gray-700 dark:text-muted-foreground">Kar/Zarar</th>
                            <th className="text-right px-2 py-2 text-xs font-medium text-gray-700 dark:text-muted-foreground">Süre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trades.map((trade, index) => (
                            <tr key={trade.id || index} className="hover:bg-muted/20">
                              <td className="px-1 py-0.5 text-xs font-mono">{trade.tradeNumber || trade.ticket}</td>
                              <td className="px-1 py-0.5 text-xs">
                                {trade.openTime ? new Date(trade.openTime).toLocaleDateString('tr-TR') : '-'}
                              </td>
                              <td className="px-2 py-1">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  trade.type === 'buy' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {trade.type?.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-1 py-0.5 text-xs font-medium">{trade.symbol}</td>
                              <td className="px-1 py-0.5 text-xs text-right">{trade.size}</td>
                              <td className="px-1 py-0.5 text-xs text-right font-mono">{trade.openPrice?.toFixed(5)}</td>
                              <td className="px-1 py-0.5 text-xs text-right font-mono">{trade.closePrice?.toFixed(5)}</td>
                              <td className={`px-1 py-0.5 text-xs font-bold text-right ${
                                trade.profit > 0 ? 'text-green-400' : trade.profit < 0 ? 'text-red-400' : 'text-muted-foreground'
                              }`}>
                                {trade.profit > 0 ? '+' : ''}{trade.profit?.toFixed(2)}
                              </td>
                              <td className="px-1 py-0.5 text-xs text-muted-foreground text-right">
                                {trade.duration ? `${trade.duration}m` : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Load More Button */}
                  {tradesPagination.page < tradesPagination.pages && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => fetchTrades(tradesPagination.page + 1)}
                        disabled={tradesLoading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        {tradesLoading ? 'Yükleniyor...' : 'Daha Fazla İşlem Yükle'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Advanced Analysis Tab */}
          {activeTab === 'advanced-analysis' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Professional Metrics Header */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Profesyonel Analiz</h2>
                    <p className="text-sm text-muted-foreground">Kurumsal seviye risk ve performans metrikleri</p>
                  </div>
                </div>

                {(() => {
                  
                  // Get metric analyses
                  const sharpeAnalysis = professionalMetrics ? getMetricAnalysis('sharpeRatio', professionalMetrics.sharpeRatio) : null;
                  const winRateAnalysis = professionalMetrics ? getMetricAnalysis('winRate', professionalMetrics.winRate) : null;
                  const drawdownAnalysis = professionalMetrics ? getMetricAnalysis('maxDrawdown', professionalMetrics.maxDrawdown) : null;
                  const profitFactorAnalysis = professionalMetrics ? getMetricAnalysis('profitFactor', professionalMetrics.profitFactor) : null;
                  const durationAnalysis = professionalMetrics ? getMetricAnalysis('avgTradeDuration', professionalMetrics.avgTradeDuration) : null;
                  const kellyAnalysis = professionalMetrics ? getMetricAnalysis('kellyPercent', professionalMetrics.kellyPercent) : null;
                  
                  // Get overall strategy profile
                  const strategyProfile = professionalMetrics ? analyzeStrategyProfile({
                    winRate: professionalMetrics.winRate,
                    profitFactor: professionalMetrics.profitFactor,
                    sharpeRatio: professionalMetrics.sharpeRatio,
                    maxDrawdown: professionalMetrics.maxDrawdown,
                    avgTradeDuration: professionalMetrics.avgTradeDuration
                  }) : null;
                  
                  if (!professionalMetrics) {
                    return (
                      <div className="text-center py-20">
                        <Brain className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                        <p className="text-muted-foreground">Profesyonel analiz için işlem verisi gerekli.</p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Only Modern Professional Analysis */}
                      <ModernProfessionalAnalysis metrics={professionalMetrics} />

                      {/* Keep existing modal functionality - Old analysis sections removed */}

                      {/* Detailed Analysis Modal/Panel */}
                      {showDetailedAnalysis && ((() => {
                        const analyses: { [key: string]: any } = {
                          sharpe: sharpeAnalysis,
                          winRate: winRateAnalysis,
                          drawdown: drawdownAnalysis,
                          profitFactor: profitFactorAnalysis,
                          duration: durationAnalysis,
                          kelly: kellyAnalysis
                        };

                        const currentAnalysis = analyses[showDetailedAnalysis];
                        if (!currentAnalysis) return null;

                        return (
                          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                              <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold">Detaylı Metrik Analizi</h3>
                                  <button onClick={() => setShowDetailedAnalysis(null)} className="p-2 hover:bg-muted rounded-lg">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className={`font-medium ${currentAnalysis.color}`}>{currentAnalysis.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-2">{currentAnalysis.description}</p>
                                  </div>
                                  {currentAnalysis.implications.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-foreground mb-2">Anlamı:</h5>
                                      <ul className="space-y-1">
                                        {currentAnalysis.implications.map((impl: string, i: number) => (
                                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                                            {impl}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {currentAnalysis.recommendations.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-foreground mb-2">Öneriler:</h5>
                                      <ul className="space-y-1">
                                        {currentAnalysis.recommendations.map((rec: string, i: number) => (
                                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                            {rec}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })())}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {/* Other tabs */}
          {(activeTab === 'backtest' || activeTab === 'reviews') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="mb-6">
                {activeTab === 'backtest' && <Activity className="w-8 h-8 text-muted-foreground mx-auto" />}
                {activeTab === 'reviews' && <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto" />}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {activeTab === 'backtest' && 'Backtest Sonuçları'}
                {activeTab === 'reviews' && 'Kullanıcı Yorumları'}
              </h3>
              <p className="text-muted-foreground">
                Bu bölüm geliştirme aşamasında...
              </p>
            </motion.div>
          )}
      </div>
    </div>
  );
}
