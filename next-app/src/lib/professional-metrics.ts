// Professional Trading Metrics - Optimized for Real Traders
// Only the most valuable and actionable metrics

export interface Trade {
  id: string;
  openTime: string;
  closeTime: string;
  profit: number;
  commission: number;
  swap: number;
  type: 'buy' | 'sell';
  symbol: string;
  size: number;
  openPrice: number;
  closePrice: number;
  stopLoss?: number;
  takeProfit?: number;
  duration: number | null;
}

export interface ProfessionalMetrics {
  // Core Performance Ratios
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  
  // Risk Metrics
  maxDrawdown: number;
  maxDrawdownDuration: number; // in days
  valueAtRisk95: number;
  expectedShortfall: number;
  
  // Trade Analysis
  winRate: number;
  profitFactor: number;
  averageRRR: number; // Risk/Reward Ratio
  expectancy: number; // Expected value per trade
  
  // Consistency Metrics
  maxConsecutiveLosses: number;
  maxConsecutiveWins: number;
  recoveryFactor: number;
  monthlyWinRate: number;
  largestLoss: number;
  largestWin: number;
  
  // Advanced Risk
  tailRatio: number; // Average of top 10% wins / Average of worst 10% losses
  kellyPercent: number; // Kelly Criterion optimal position size
  
  // Time Performance (simplified)
  avgTradeDuration: number; // in hours
  avgDailyReturn: number;
  
  // Detailed Stats for Dashboard
  monthlyReturns: Array<{ month: string; return: number; drawdown: number; }>;
  rollingDrawdown: Array<{ date: string; drawdown: number; }>;
  
  // Buy & Hold Comparison
  buyAndHoldComparison: {
    strategyEquity: Array<{ date: string; equity: number; }>;
    buyHoldEquity: Array<{ date: string; equity: number; }>;
    outperformance: number; // Strategy return - Buy&Hold return
    winningPeriods: number; // Number of periods strategy beat buy&hold
    totalPeriods: number;
  };
  
  // Professional Trading Metrics (NEW)
  tradingFrequency: {
    tradesPerDay: number;
    tradesPerWeek: number;
    tradesPerMonth: number;
    avgTimeBetweenTrades: number; // hours
  };
  
  timeAnalysis: {
    bestPerformingHours: Array<{ hour: number; avgReturn: number; tradeCount: number; }>;
    bestPerformingDays: Array<{ day: string; avgReturn: number; tradeCount: number; }>;
    sessionAnalysis: {
      asian: { avgReturn: number; tradeCount: number; winRate: number; };
      european: { avgReturn: number; tradeCount: number; winRate: number; };
      american: { avgReturn: number; tradeCount: number; winRate: number; };
    };
  };
  
  riskManagement: {
    avgRiskPerTrade: number; // as % of equity
    maxRiskPerTrade: number;
    riskDistribution: Array<{ riskLevel: string; count: number; avgReturn: number; }>;
    positionSizing: {
      avgPositionSize: number;
      maxPositionSize: number;
      positionSizeStdDev: number;
    };
  };
  
  tradeQuality: {
    averageHoldTime: number; // hours
    shortestTrade: number; // minutes
    longestTrade: number; // hours
    prematureTrades: number; // closed within 5 minutes
    overHeldTrades: number; // held more than 24 hours
    tradeEfficiency: number; // profitable trades / total trades with clear trend
  };
  
  streakAnalysis: {
    maxWinStreak: number;
    maxLossStreak: number;
    avgWinStreak: number;
    avgLossStreak: number;
    currentStreak: { type: 'win' | 'loss' | 'none'; count: number; };
    streakRecovery: number; // avg trades to recover from loss streak
  };
  
  marketConditions: {
    trendingMarkets: { tradeCount: number; avgReturn: number; winRate: number; };
    sidewaysMarkets: { tradeCount: number; avgReturn: number; winRate: number; };
    volatileMarkets: { tradeCount: number; avgReturn: number; winRate: number; };
  };
  
  symbolAnalysis: Array<{
    symbol: string;
    tradeCount: number;
    totalReturn: number;
    winRate: number;
    avgReturn: number;
    avgHoldTime: number;
    profitFactor: number;
  }>;
}

// Calculate professional metrics
export function calculateProfessionalMetrics(
  trades: Trade[], 
  initialBalance: number = 10000,
  riskFreeRate: number = 0.02 // 2% annual
): ProfessionalMetrics {
  if (trades.length === 0) {
    return getEmptyMetrics();
  }

  const returns = calculateDailyReturns(trades, initialBalance);
  const equityCurve = calculateEquityCurve(trades, initialBalance);
  const drawdownData = calculateDrawdowns(equityCurve);
  
  // Sort trades chronologically
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.closeTime || a.openTime).getTime() - new Date(b.closeTime || b.openTime).getTime()
  );

  // Basic calculations
  const winningTrades = sortedTrades.filter(t => (t.profit + t.commission + t.swap) > 0);
  const losingTrades = sortedTrades.filter(t => (t.profit + t.commission + t.swap) < 0);
  
  // Use proper returns calculation
  const { totalReturnPercent, annualReturn: calculatedAnnualReturn } = calculateReturns(sortedTrades, initialBalance);
  const totalReturn = totalReturnPercent / 100; // Convert to decimal
  const timePeriodYears = calculateTimePeriodYears(sortedTrades);
  const annualReturn = calculatedAnnualReturn / 100; // Convert to decimal for Sharpe calculation
  
  // Returns statistics
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const returnStdDev = calculateStandardDeviation(returns);
  const downsideReturns = returns.filter(r => r < 0);
  const downsideStdDev = calculateStandardDeviation(downsideReturns);

  // Calculate Buy & Hold comparison
  const buyAndHoldComparison = calculateBuyAndHoldComparison(sortedTrades, initialBalance);

  // Calculate new professional metrics
  const tradingFrequency = calculateTradingFrequency(sortedTrades);
  const timeAnalysis = calculateTimeAnalysis(sortedTrades);
  const riskManagement = calculateRiskManagement(sortedTrades, initialBalance);
  const tradeQuality = calculateTradeQuality(sortedTrades);
  const streakAnalysis = calculateStreakAnalysis(sortedTrades);
  const marketConditions = calculateMarketConditions(sortedTrades);
  const symbolAnalysis = calculateSymbolAnalysis(sortedTrades);

  return {
    // Core Performance Ratios
    sharpeRatio: returnStdDev > 0 ? (annualReturn - riskFreeRate) / returnStdDev : 0,
    sortinoRatio: downsideStdDev > 0 ? (annualReturn - riskFreeRate) / downsideStdDev : 0,
    calmarRatio: Math.abs(drawdownData.maxDrawdown) > 0 ? annualReturn / Math.abs(drawdownData.maxDrawdown) : 0,
    
    // Risk Metrics
    maxDrawdown: drawdownData.maxDrawdown,
    maxDrawdownDuration: drawdownData.maxDrawdownDuration,
    valueAtRisk95: calculateVaR(returns, 0.95),
    expectedShortfall: calculateExpectedShortfall(returns, 0.95),
    
    // Trade Analysis
    winRate: (winningTrades.length / sortedTrades.length) * 100,
    profitFactor: calculateProfitFactor(winningTrades, losingTrades),
    averageRRR: calculateAverageRRR(sortedTrades),
    expectancy: calculateExpectancy(sortedTrades),
    
    // Consistency Metrics
    maxConsecutiveLosses: calculateMaxConsecutiveLosses(sortedTrades),
    recoveryFactor: Math.abs(totalReturn / (drawdownData.maxDrawdown || -0.01)),
    monthlyWinRate: calculateMonthlyWinRate(sortedTrades),
    largestLoss: Math.min(...sortedTrades.map(t => t.profit + t.commission + t.swap)),
    largestWin: Math.max(...sortedTrades.map(t => t.profit + t.commission + t.swap)),
    
    // Advanced Risk
    tailRatio: calculateTailRatio(sortedTrades),
    kellyPercent: calculateKellyPercent(winningTrades, losingTrades),
    
    // Time Performance
    avgTradeDuration: calculateAvgTradeDuration(sortedTrades),
    avgDailyReturn: avgReturn,
    
    // Detailed Stats
    monthlyReturns: calculateMonthlyReturns(sortedTrades, initialBalance),
    rollingDrawdown: calculateRollingDrawdown(equityCurve),
    
    // Buy & Hold Comparison
    buyAndHoldComparison,
    
    // Professional Trading Metrics (NEW)
    tradingFrequency,
    timeAnalysis,
    riskManagement,
    tradeQuality,
    streakAnalysis,
    marketConditions,
    symbolAnalysis
  };
}

// Helper functions
function calculateDailyReturns(trades: Trade[], initialBalance: number): number[] {
  if (trades.length === 0) return [];
  
  // Sort trades chronologically FIRST
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.closeTime || a.openTime).getTime() - new Date(b.closeTime || b.openTime).getTime()
  );
  
  // Group trades by day and calculate daily returns IN ORDER
  const dailyData: Array<{ date: string; pnl: number }> = [];
  const dailyPnL: { [date: string]: number } = {};
  
  sortedTrades.forEach(trade => {
    const date = new Date(trade.closeTime || trade.openTime).toDateString();
    const pnl = trade.profit + trade.commission + trade.swap;
    
    if (!dailyPnL[date]) {
      dailyPnL[date] = 0;
      dailyData.push({ date, pnl: 0 });
    }
    dailyPnL[date] += pnl;
  });
  
  // Update pnl values in dailyData
  dailyData.forEach(item => {
    item.pnl = dailyPnL[item.date];
  });

  // Calculate returns maintaining chronological order
  let currentBalance = initialBalance;
  const returns: number[] = [];
  
  dailyData.forEach(({ pnl }) => {
    const returnPercent = (pnl / currentBalance) * 100;
    returns.push(returnPercent);
    currentBalance += pnl;
  });

  return returns;
}

function calculateEquityCurve(trades: Trade[], initialBalance: number): number[] {
  let balance = initialBalance;
  const curve = [balance];
  
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.closeTime || a.openTime).getTime() - new Date(b.closeTime || b.openTime).getTime()
  );
  
  sortedTrades.forEach(trade => {
    const pnl = trade.profit + trade.commission + trade.swap;
    balance += pnl;
    curve.push(balance);
  });
  
  return curve;
}

function calculateDrawdowns(equityCurve: number[]) {
  let peak = equityCurve[0];
  let maxDrawdown = 0;
  let maxDrawdownDuration = 0;
  let currentDrawdownStart = -1;
  
  for (let i = 1; i < equityCurve.length; i++) {
    if (equityCurve[i] > peak) {
      peak = equityCurve[i];
      if (currentDrawdownStart >= 0) {
        maxDrawdownDuration = Math.max(maxDrawdownDuration, i - currentDrawdownStart);
        currentDrawdownStart = -1;
      }
    } else {
      if (currentDrawdownStart < 0) {
        currentDrawdownStart = i;
      }
      const drawdown = ((peak - equityCurve[i]) / peak) * 100;
      maxDrawdown = Math.min(maxDrawdown, -drawdown);
    }
  }
  
  // Handle ongoing drawdown
  if (currentDrawdownStart >= 0) {
    maxDrawdownDuration = Math.max(maxDrawdownDuration, equityCurve.length - currentDrawdownStart);
  }
  
  return { maxDrawdown, maxDrawdownDuration };
}

function calculateVaR(returns: number[], confidence: number): number {
  if (returns.length === 0) return 0;
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidence) * sortedReturns.length);
  return sortedReturns[index] || 0;
}

function calculateExpectedShortfall(returns: number[], confidence: number): number {
  const var95 = calculateVaR(returns, confidence);
  const lossesWorseThanVaR = returns.filter(r => r <= var95);
  
  if (lossesWorseThanVaR.length === 0) return var95;
  return lossesWorseThanVaR.reduce((sum, r) => sum + r, 0) / lossesWorseThanVaR.length;
}

function calculateProfitFactor(winningTrades: Trade[], losingTrades: Trade[]): number {
  const totalProfit = winningTrades.reduce((sum, t) => sum + (t.profit + t.commission + t.swap), 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit + t.commission + t.swap), 0));
  
  return totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;
}

function calculateAverageRRR(trades: Trade[]): number {
  // Calculate average Risk/Reward ratio based on actual trade results
  const validTrades = trades.filter(t => {
    const pnl = t.profit + t.commission + t.swap;
    return pnl !== 0; // Exclude breakeven trades
  });
  
  if (validTrades.length === 0) return 0;
  
  const winners = validTrades.filter(t => (t.profit + t.commission + t.swap) > 0);
  const losers = validTrades.filter(t => (t.profit + t.commission + t.swap) < 0);
  
  if (losers.length === 0) return winners.length > 0 ? Infinity : 0;
  
  const avgWin = winners.reduce((sum, t) => sum + (t.profit + t.commission + t.swap), 0) / winners.length;
  const avgLoss = Math.abs(losers.reduce((sum, t) => sum + (t.profit + t.commission + t.swap), 0) / losers.length);
  
  return avgLoss > 0 ? avgWin / avgLoss : 0;
}

function calculateExpectancy(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  
  const totalPnL = trades.reduce((sum, t) => sum + (t.profit + t.commission + t.swap), 0);
  return totalPnL / trades.length;
}

function calculateMaxConsecutiveLosses(trades: Trade[]): number {
  let maxLosses = 0;
  let currentLosses = 0;
  
  trades.forEach(trade => {
    const pnl = trade.profit + trade.commission + trade.swap;
    if (pnl < 0) {
      currentLosses++;
      maxLosses = Math.max(maxLosses, currentLosses);
    } else {
      currentLosses = 0;
    }
  });
  
  return maxLosses;
}

function calculateMonthlyWinRate(trades: Trade[]): number {
  const monthlyData: { [month: string]: { wins: number; total: number } } = {};
  
  trades.forEach(trade => {
    const date = new Date(trade.closeTime || trade.openTime);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const pnl = trade.profit + trade.commission + trade.swap;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { wins: 0, total: 0 };
    }
    
    monthlyData[monthKey].total++;
    if (pnl > 0) {
      monthlyData[monthKey].wins++;
    }
  });
  
  const monthlyWinRates = Object.values(monthlyData).map(data => 
    data.total > 0 ? (data.wins / data.total) * 100 : 0
  );
  
  return monthlyWinRates.length > 0 ? 
    monthlyWinRates.reduce((a, b) => a + b, 0) / monthlyWinRates.length : 0;
}

function calculateTailRatio(trades: Trade[]): number {
  const pnls = trades.map(t => t.profit + t.commission + t.swap).sort((a, b) => b - a);
  if (pnls.length < 10) return 0;
  
  const topCount = Math.max(1, Math.floor(pnls.length * 0.1));
  const bottomCount = Math.max(1, Math.floor(pnls.length * 0.1));
  
  const avgTopWins = pnls.slice(0, topCount).reduce((a, b) => a + b, 0) / topCount;
  const avgWorstLosses = Math.abs(pnls.slice(-bottomCount).reduce((a, b) => a + b, 0) / bottomCount);
  
  return avgWorstLosses > 0 ? avgTopWins / avgWorstLosses : 0;
}

function calculateKellyPercent(winningTrades: Trade[], losingTrades: Trade[]): number {
  if (winningTrades.length === 0 || losingTrades.length === 0) return 0;
  
  const winRate = winningTrades.length / (winningTrades.length + losingTrades.length);
  const avgWin = winningTrades.reduce((sum, t) => sum + (t.profit + t.commission + t.swap), 0) / winningTrades.length;
  const avgLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit + t.commission + t.swap), 0) / losingTrades.length);
  
  if (avgLoss === 0) return 0;
  
  const payoffRatio = avgWin / avgLoss;
  const kellyFraction = winRate - ((1 - winRate) / payoffRatio);
  
  return Math.max(0, Math.min(0.25, kellyFraction)) * 100; // Cap at 25% for safety
}

function calculateAvgTradeDuration(trades: Trade[]): number {
  const durations = trades
    .filter(t => t.duration !== null && t.duration > 0)
    .map(t => t.duration!);
  
  if (durations.length === 0) return 0;
  
  const avgMinutes = durations.reduce((a, b) => a + b, 0) / durations.length;
  return avgMinutes / 60; // Convert to hours
}

// Calculate returns including proper annual return calculation
export function calculateReturns(trades: Trade[], initialBalance: number) {
  if (trades.length === 0) {
    return {
      totalReturn: 0,
      totalReturnPercent: 0,
      annualReturn: 0,
      monthlyReturn: 0
    };
  }

  // Sort trades chronologically
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.closeTime || a.openTime).getTime() - new Date(b.closeTime || b.openTime).getTime()
  );

  // Calculate total P&L
  const totalPnL = sortedTrades.reduce((sum, trade) => 
    sum + trade.profit + trade.commission + trade.swap, 0
  );

  // Calculate returns
  const totalReturnPercent = (totalPnL / initialBalance) * 100;
  
  // Calculate time period
  const firstTradeDate = new Date(sortedTrades[0].openTime);
  const lastTradeDate = new Date(sortedTrades[sortedTrades.length - 1].closeTime || sortedTrades[sortedTrades.length - 1].openTime);
  const timeDiffMs = lastTradeDate.getTime() - firstTradeDate.getTime();
  const yearsDiff = timeDiffMs / (1000 * 60 * 60 * 24 * 365.25);
  
  // Annualized return using compound formula
  const finalBalance = initialBalance + totalPnL;
  const annualReturn = yearsDiff > 0 ? 
    (Math.pow(finalBalance / initialBalance, 1 / yearsDiff) - 1) * 100 : 
    totalReturnPercent;
  
  const monthlyReturn = yearsDiff > 0 ? totalReturnPercent / (yearsDiff * 12) : 0;

  return {
    totalReturn: totalPnL,
    totalReturnPercent,
    annualReturn,
    monthlyReturn
  };
}

function calculateMonthlyReturns(trades: Trade[], initialBalance: number): Array<{ month: string; return: number; drawdown: number; }> {
  const monthlyData: { [month: string]: { trades: Trade[]; balance: number } } = {};
  let runningBalance = initialBalance;
  
  // Group trades by month
  trades.forEach(trade => {
    const date = new Date(trade.closeTime || trade.openTime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { trades: [], balance: runningBalance };
    }
    monthlyData[monthKey].trades.push(trade);
  });
  
  // Calculate monthly returns and drawdowns
  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => {
      const monthPnL = data.trades.reduce((sum, t) => sum + t.profit + t.commission + t.swap, 0);
      const returnPercent = (monthPnL / data.balance) * 100;
      
      // Calculate max drawdown within the month
      let peak = data.balance;
      let maxDD = 0;
      let balance = data.balance;
      
      data.trades.forEach(trade => {
        const pnl = trade.profit + trade.commission + trade.swap;
        balance += pnl;
        peak = Math.max(peak, balance);
        const dd = ((peak - balance) / peak) * 100;
        maxDD = Math.max(maxDD, dd);
      });
      
      runningBalance = balance;
      
      return {
        month: month,
        return: returnPercent,
        drawdown: -maxDD
      };
    });
}

function calculateRollingDrawdown(equityCurve: number[]): Array<{ date: string; drawdown: number; }> {
  const result: Array<{ date: string; drawdown: number; }> = [];
  let peak = equityCurve[0];
  
  equityCurve.forEach((equity, index) => {
    peak = Math.max(peak, equity);
    const drawdown = peak > 0 ? -((peak - equity) / peak) * 100 : 0;
    
    result.push({
      date: new Date(Date.now() - (equityCurve.length - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      drawdown
    });
  });
  
  return result;
}

function calculateTimePeriodYears(trades: Trade[]): number {
  if (trades.length === 0) return 1;
  
  const firstTrade = trades[0];
  const lastTrade = trades[trades.length - 1];
  
  const startTime = new Date(firstTrade.openTime).getTime();
  const endTime = new Date(lastTrade.closeTime || lastTrade.openTime).getTime();
  
  const yearsDiff = (endTime - startTime) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.max(yearsDiff, 1/365.25); // Minimum 1 day
}

// NEW PROFESSIONAL METRICS CALCULATION FUNCTIONS

// Trading Frequency Analysis
function calculateTradingFrequency(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      tradesPerDay: 0,
      tradesPerWeek: 0,
      tradesPerMonth: 0,
      avgTimeBetweenTrades: 0
    };
  }

  const firstTrade = new Date(trades[0].openTime);
  const lastTrade = new Date(trades[trades.length - 1].closeTime || trades[trades.length - 1].openTime);
  
  const totalDays = Math.max(1, (lastTrade.getTime() - firstTrade.getTime()) / (24 * 60 * 60 * 1000));
  const totalWeeks = totalDays / 7;
  const totalMonths = totalDays / 30.44; // Average days per month
  
  // Calculate average time between trades
  let totalTimeBetween = 0;
  for (let i = 1; i < trades.length; i++) {
    const currentTime = new Date(trades[i].openTime).getTime();
    const prevTime = new Date(trades[i-1].closeTime || trades[i-1].openTime).getTime();
    totalTimeBetween += (currentTime - prevTime) / (60 * 60 * 1000); // Convert to hours
  }
  
  return {
    tradesPerDay: totalDays > 0 ? trades.length / totalDays : 0,
    tradesPerWeek: totalWeeks > 0 ? trades.length / totalWeeks : 0,
    tradesPerMonth: totalMonths > 0 ? trades.length / totalMonths : 0,
    avgTimeBetweenTrades: trades.length > 1 ? totalTimeBetween / (trades.length - 1) : 0
  };
}

// Time-based Performance Analysis
function calculateTimeAnalysis(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      bestPerformingHours: [],
      bestPerformingDays: [],
      sessionAnalysis: {
        asian: { avgReturn: 0, tradeCount: 0, winRate: 0 },
        european: { avgReturn: 0, tradeCount: 0, winRate: 0 },
        american: { avgReturn: 0, tradeCount: 0, winRate: 0 }
      }
    };
  }

  // Hour analysis
  const hourlyData: { [hour: number]: { trades: Trade[]; totalReturn: number; } } = {};
  const dayData: { [day: string]: { trades: Trade[]; totalReturn: number; } } = {};
  const sessionData = {
    asian: { trades: [] as Trade[], totalReturn: 0 },
    european: { trades: [] as Trade[], totalReturn: 0 },
    american: { trades: [] as Trade[], totalReturn: 0 }
  };

  trades.forEach(trade => {
    const tradeTime = new Date(trade.openTime);
    const hour = tradeTime.getUTCHours();
    const dayName = tradeTime.toLocaleDateString('en-US', { weekday: 'long' });
    const pnl = trade.profit + trade.commission + trade.swap;

    // Hour analysis
    if (!hourlyData[hour]) hourlyData[hour] = { trades: [], totalReturn: 0 };
    hourlyData[hour].trades.push(trade);
    hourlyData[hour].totalReturn += pnl;

    // Day analysis
    if (!dayData[dayName]) dayData[dayName] = { trades: [], totalReturn: 0 };
    dayData[dayName].trades.push(trade);
    dayData[dayName].totalReturn += pnl;

    // Session analysis (UTC hours)
    if (hour >= 0 && hour < 8) { // Asian session
      sessionData.asian.trades.push(trade);
      sessionData.asian.totalReturn += pnl;
    } else if (hour >= 8 && hour < 16) { // European session
      sessionData.european.trades.push(trade);
      sessionData.european.totalReturn += pnl;
    } else { // American session
      sessionData.american.trades.push(trade);
      sessionData.american.totalReturn += pnl;
    }
  });

  // Calculate best performing hours
  const bestPerformingHours = Object.entries(hourlyData)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      avgReturn: data.totalReturn / data.trades.length,
      tradeCount: data.trades.length
    }))
    .sort((a, b) => b.avgReturn - a.avgReturn)
    .slice(0, 6); // Top 6 hours

  // Calculate best performing days
  const bestPerformingDays = Object.entries(dayData)
    .map(([day, data]) => ({
      day,
      avgReturn: data.totalReturn / data.trades.length,
      tradeCount: data.trades.length
    }))
    .sort((a, b) => b.avgReturn - a.avgReturn);

  // Calculate session analysis
  const sessionAnalysis = {
    asian: {
      avgReturn: sessionData.asian.trades.length > 0 ? sessionData.asian.totalReturn / sessionData.asian.trades.length : 0,
      tradeCount: sessionData.asian.trades.length,
      winRate: sessionData.asian.trades.length > 0 ? (sessionData.asian.trades.filter(t => (t.profit + t.commission + t.swap) > 0).length / sessionData.asian.trades.length) * 100 : 0
    },
    european: {
      avgReturn: sessionData.european.trades.length > 0 ? sessionData.european.totalReturn / sessionData.european.trades.length : 0,
      tradeCount: sessionData.european.trades.length,
      winRate: sessionData.european.trades.length > 0 ? (sessionData.european.trades.filter(t => (t.profit + t.commission + t.swap) > 0).length / sessionData.european.trades.length) * 100 : 0
    },
    american: {
      avgReturn: sessionData.american.trades.length > 0 ? sessionData.american.totalReturn / sessionData.american.trades.length : 0,
      tradeCount: sessionData.american.trades.length,
      winRate: sessionData.american.trades.length > 0 ? (sessionData.american.trades.filter(t => (t.profit + t.commission + t.swap) > 0).length / sessionData.american.trades.length) * 100 : 0
    }
  };

  return {
    bestPerformingHours,
    bestPerformingDays,
    sessionAnalysis
  };
}

// Risk Management Analysis
function calculateRiskManagement(trades: Trade[], initialBalance: number) {
  if (trades.length === 0) {
    return {
      avgRiskPerTrade: 0,
      maxRiskPerTrade: 0,
      riskDistribution: [],
      positionSizing: {
        avgPositionSize: 0,
        maxPositionSize: 0,
        positionSizeStdDev: 0
      }
    };
  }

  let runningBalance = initialBalance;
  const riskPerTrade: number[] = [];
  const positionSizes: number[] = [];
  const riskLevels: { [level: string]: { count: number; totalReturn: number; } } = {
    'Low (0-1%)': { count: 0, totalReturn: 0 },
    'Medium (1-3%)': { count: 0, totalReturn: 0 },
    'High (3-5%)': { count: 0, totalReturn: 0 },
    'Very High (5%+)': { count: 0, totalReturn: 0 }
  };

  trades.forEach(trade => {
    const pnl = trade.profit + trade.commission + trade.swap;
    
    // Calculate REAL risk based on stop loss if available
    let potentialRisk = 0;
    
    if (trade.stopLoss && trade.stopLoss > 0) {
      // Real risk calculation: distance from entry to stop loss * position size
      if (trade.type === 'buy') {
        potentialRisk = Math.abs((trade.openPrice - trade.stopLoss) * trade.size);
      } else { // sell
        potentialRisk = Math.abs((trade.stopLoss - trade.openPrice) * trade.size);
      }
    } else {
      // Fallback: use actual loss for losing trades, or 2% of position value for winners
      if (pnl < 0) {
        potentialRisk = Math.abs(pnl);
      } else {
        // For winning trades without stop loss, estimate risk as 2% of position value
        potentialRisk = trade.openPrice * trade.size * 0.02;
      }
    }
    
    const riskPercent = (potentialRisk / runningBalance) * 100;
    riskPerTrade.push(riskPercent);
    
    // Position size analysis (using trade size as proxy)
    positionSizes.push(trade.size);
    
    // Risk distribution
    if (riskPercent <= 1) {
      riskLevels['Low (0-1%)'].count++;
      riskLevels['Low (0-1%)'].totalReturn += pnl;
    } else if (riskPercent <= 3) {
      riskLevels['Medium (1-3%)'].count++;
      riskLevels['Medium (1-3%)'].totalReturn += pnl;
    } else if (riskPercent <= 5) {
      riskLevels['High (3-5%)'].count++;
      riskLevels['High (3-5%)'].totalReturn += pnl;
    } else {
      riskLevels['Very High (5%+)'].count++;
      riskLevels['Very High (5%+)'].totalReturn += pnl;
    }
    
    runningBalance += pnl;
  });

  const avgRisk = riskPerTrade.reduce((a, b) => a + b, 0) / riskPerTrade.length;
  const maxRisk = Math.max(...riskPerTrade);
  
  const avgPositionSize = positionSizes.reduce((a, b) => a + b, 0) / positionSizes.length;
  const maxPositionSize = Math.max(...positionSizes);
  const positionSizeStdDev = calculateStandardDeviation(positionSizes);

  const riskDistribution = Object.entries(riskLevels).map(([level, data]) => ({
    riskLevel: level,
    count: data.count,
    avgReturn: data.count > 0 ? data.totalReturn / data.count : 0
  }));

  return {
    avgRiskPerTrade: avgRisk,
    maxRiskPerTrade: maxRisk,
    riskDistribution,
    positionSizing: {
      avgPositionSize,
      maxPositionSize,
      positionSizeStdDev
    }
  };
}

// Trade Quality Analysis
function calculateTradeQuality(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      averageHoldTime: 0,
      shortestTrade: 0,
      longestTrade: 0,
      prematureTrades: 0,
      overHeldTrades: 0,
      tradeEfficiency: 0
    };
  }

  const holdTimes: number[] = [];
  let prematureTrades = 0;
  let overHeldTrades = 0;
  let efficientTrades = 0;

  trades.forEach(trade => {
    const duration = trade.duration || 0; // in minutes
    holdTimes.push(duration);

    // Classify trades by duration
    if (duration < 5) prematureTrades++; // Less than 5 minutes
    if (duration > 1440) overHeldTrades++; // More than 24 hours

    // Trade efficiency: profitable trades with reasonable duration
    const pnl = trade.profit + trade.commission + trade.swap;
    if (pnl > 0 && duration >= 5 && duration <= 1440) {
      efficientTrades++;
    }
  });

  const validHoldTimes = holdTimes.filter(t => t > 0);
  const avgHoldTime = validHoldTimes.length > 0 ? validHoldTimes.reduce((a, b) => a + b, 0) / validHoldTimes.length : 0;
  const shortestTrade = validHoldTimes.length > 0 ? Math.min(...validHoldTimes) : 0;
  const longestTrade = validHoldTimes.length > 0 ? Math.max(...validHoldTimes) : 0;

  return {
    averageHoldTime: avgHoldTime / 60, // Convert to hours
    shortestTrade,
    longestTrade: longestTrade / 60, // Convert to hours
    prematureTrades,
    overHeldTrades,
    tradeEfficiency: (efficientTrades / trades.length) * 100
  };
}

// Streak Analysis
function calculateStreakAnalysis(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      maxWinStreak: 0,
      maxLossStreak: 0,
      avgWinStreak: 0,
      avgLossStreak: 0,
      currentStreak: { type: 'none' as const, count: 0 },
      streakRecovery: 0
    };
  }

  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  
  const winStreaks: number[] = [];
  const lossStreaks: number[] = [];
  const recoveryTimes: number[] = [];
  
  let lossStreakStart = -1;

  trades.forEach((trade, index) => {
    const pnl = trade.profit + trade.commission + trade.swap;
    
    if (pnl > 0) {
      // Winning trade
      currentWinStreak++;
      
      // End loss streak if any
      if (currentLossStreak > 0) {
        lossStreaks.push(currentLossStreak);
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
        
        // Calculate recovery time
        if (lossStreakStart >= 0) {
          recoveryTimes.push(index - lossStreakStart);
        }
        
        currentLossStreak = 0;
        lossStreakStart = -1;
      }
    } else if (pnl < 0) {
      // Losing trade
      currentLossStreak++;
      
      if (lossStreakStart === -1) {
        lossStreakStart = index;
      }
      
      // End win streak if any
      if (currentWinStreak > 0) {
        winStreaks.push(currentWinStreak);
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
        currentWinStreak = 0;
      }
    }
  });

  // Handle final streak
  if (currentWinStreak > 0) {
    winStreaks.push(currentWinStreak);
    maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
  }
  if (currentLossStreak > 0) {
    lossStreaks.push(currentLossStreak);
    maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
  }

  const avgWinStreak = winStreaks.length > 0 ? winStreaks.reduce((a, b) => a + b, 0) / winStreaks.length : 0;
  const avgLossStreak = lossStreaks.length > 0 ? lossStreaks.reduce((a, b) => a + b, 0) / lossStreaks.length : 0;
  const avgRecovery = recoveryTimes.length > 0 ? recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length : 0;

  // Determine current streak
  const lastTrade = trades[trades.length - 1];
  const lastPnl = lastTrade.profit + lastTrade.commission + lastTrade.swap;
  const currentStreak = {
    type: lastPnl > 0 ? 'win' as const : lastPnl < 0 ? 'loss' as const : 'none' as const,
    count: lastPnl > 0 ? currentWinStreak : lastPnl < 0 ? currentLossStreak : 0
  };

  return {
    maxWinStreak,
    maxLossStreak,
    avgWinStreak,
    avgLossStreak,
    currentStreak,
    streakRecovery: avgRecovery
  };
}

// Market Conditions Analysis
function calculateMarketConditions(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      trendingMarkets: { tradeCount: 0, avgReturn: 0, winRate: 0 },
      sidewaysMarkets: { tradeCount: 0, avgReturn: 0, winRate: 0 },
      volatileMarkets: { tradeCount: 0, avgReturn: 0, winRate: 0 }
    };
  }

  // Enhanced market condition classification
  const trendingTrades: Trade[] = [];
  const sidewaysTrades: Trade[] = [];
  const volatileTrades: Trade[] = [];

  trades.forEach(trade => {
    // Calculate price movement during trade
    const priceMovement = Math.abs((trade.closePrice - trade.openPrice) / trade.openPrice) * 100;
    
    // Also consider trade duration for better classification
    const durationHours = (trade.duration || 0) / 60;
    
    // Calculate movement per hour (volatility indicator)
    const movementPerHour = durationHours > 0 ? priceMovement / durationHours : priceMovement;
    
    // Enhanced classification logic
    if (movementPerHour > 0.5 || priceMovement > 3) {
      // High volatility: rapid price movement
      volatileTrades.push(trade);
    } else if (priceMovement > 0.8 && durationHours > 2) {
      // Trending: sustained directional movement
      trendingTrades.push(trade);
    } else {
      // Sideways: low movement or quick scalps
      sidewaysTrades.push(trade);
    }
  });

  const calculateConditionMetrics = (conditionTrades: Trade[]) => {
    if (conditionTrades.length === 0) {
      return { tradeCount: 0, avgReturn: 0, winRate: 0 };
    }

    const totalReturn = conditionTrades.reduce((sum, t) => sum + t.profit + t.commission + t.swap, 0);
    const avgReturn = totalReturn / conditionTrades.length;
    const winningTrades = conditionTrades.filter(t => (t.profit + t.commission + t.swap) > 0).length;
    const winRate = (winningTrades / conditionTrades.length) * 100;

    return {
      tradeCount: conditionTrades.length,
      avgReturn,
      winRate
    };
  };

  return {
    trendingMarkets: calculateConditionMetrics(trendingTrades),
    sidewaysMarkets: calculateConditionMetrics(sidewaysTrades),
    volatileMarkets: calculateConditionMetrics(volatileTrades)
  };
}

// Symbol Analysis
function calculateSymbolAnalysis(trades: Trade[]) {
  if (trades.length === 0) return [];

  const symbolData: { [symbol: string]: Trade[] } = {};
  
  trades.forEach(trade => {
    if (!symbolData[trade.symbol]) {
      symbolData[trade.symbol] = [];
    }
    symbolData[trade.symbol].push(trade);
  });

  return Object.entries(symbolData).map(([symbol, symbolTrades]) => {
    const totalReturn = symbolTrades.reduce((sum, t) => sum + t.profit + t.commission + t.swap, 0);
    const avgReturn = totalReturn / symbolTrades.length;
    const winningTrades = symbolTrades.filter(t => (t.profit + t.commission + t.swap) > 0).length;
    const winRate = (winningTrades / symbolTrades.length) * 100;
    
    const avgHoldTime = symbolTrades
      .filter(t => t.duration && t.duration > 0)
      .reduce((sum, t) => sum + (t.duration || 0), 0) / Math.max(1, symbolTrades.filter(t => t.duration && t.duration > 0).length);

    // Calculate profit factor for this symbol
    const winners = symbolTrades.filter(t => (t.profit + t.commission + t.swap) > 0);
    const losers = symbolTrades.filter(t => (t.profit + t.commission + t.swap) < 0);
    
    const totalProfit = winners.reduce((sum, t) => sum + (t.profit + t.commission + t.swap), 0);
    const totalLoss = Math.abs(losers.reduce((sum, t) => sum + (t.profit + t.commission + t.swap), 0));
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    return {
      symbol,
      tradeCount: symbolTrades.length,
      totalReturn,
      winRate,
      avgReturn,
      avgHoldTime: avgHoldTime / 60, // Convert to hours
      profitFactor: Math.min(profitFactor, 999) // Cap at 999 to avoid display issues
    };
  }).sort((a, b) => b.totalReturn - a.totalReturn); // Sort by total return
}

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  
  return Math.sqrt(variance);
}

// Calculate Buy & Hold comparison
function calculateBuyAndHoldComparison(trades: Trade[], initialBalance: number) {
  if (trades.length === 0) {
    return {
      strategyEquity: [],
      buyHoldEquity: [],
      outperformance: 0,
      winningPeriods: 0,
      totalPeriods: 0
    };
  }

  // Get the main trading symbols and their weights
  const symbolCounts: { [symbol: string]: number } = {};
  trades.forEach(trade => {
    symbolCounts[trade.symbol] = (symbolCounts[trade.symbol] || 0) + 1;
  });

  // Find the most traded symbol as our buy & hold benchmark
  const primarySymbol = Object.keys(symbolCounts).reduce((a, b) => 
    symbolCounts[a] > symbolCounts[b] ? a : b
  );

  // Calculate strategy equity curve
  let strategyBalance = initialBalance;
  const strategyEquity: Array<{ date: string; equity: number; }> = [];
  
  // Sort trades chronologically
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.closeTime || a.openTime).getTime() - new Date(b.closeTime || b.openTime).getTime()
  );

  // Calculate buy & hold performance
  // For simulation, we'll use a typical market growth rate
  const startDate = new Date(sortedTrades[0].openTime);
  const endDate = new Date(sortedTrades[sortedTrades.length - 1].closeTime || sortedTrades[sortedTrades.length - 1].openTime);
  const timePeriodYears = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  
  // Estimate buy & hold return based on symbol type
  let annualBenchmarkReturn = 0.10; // Default 10% for stocks
  if (primarySymbol.includes('USD') || primarySymbol.includes('EUR') || primarySymbol.includes('GBP')) {
    annualBenchmarkReturn = 0.08; // 8% for major currencies
  } else if (primarySymbol.includes('BTC') || primarySymbol.includes('ETH')) {
    annualBenchmarkReturn = 0.15; // 15% for crypto (simplified)
  } else if (primarySymbol.includes('GOLD') || primarySymbol.includes('XAU')) {
    annualBenchmarkReturn = 0.07; // 7% for gold
  }

  // Generate equity curves
  strategyEquity.push({ date: startDate.toISOString().split('T')[0], equity: initialBalance });
  const buyHoldEquity: Array<{ date: string; equity: number; }> = [];
  let buyHoldBalance = initialBalance;
  buyHoldEquity.push({ date: startDate.toISOString().split('T')[0], equity: buyHoldBalance });

  // Calculate daily increments
  const dailyBenchmarkReturn = Math.pow(1 + annualBenchmarkReturn, 1/365) - 1;
  
  let currentDate = new Date(startDate);
  let tradeIndex = 0;
  let winningPeriods = 0;
  let totalPeriods = 0;

  // Generate daily equity points
  while (currentDate <= endDate && tradeIndex < sortedTrades.length) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Update buy & hold (daily compound growth)
    buyHoldBalance *= (1 + dailyBenchmarkReturn);
    
    // Update strategy balance based on trades closed on this day
    while (tradeIndex < sortedTrades.length) {
      const tradeCloseDate = new Date(sortedTrades[tradeIndex].closeTime || sortedTrades[tradeIndex].openTime);
      if (tradeCloseDate.toDateString() === currentDate.toDateString()) {
        const trade = sortedTrades[tradeIndex];
        strategyBalance += trade.profit + trade.commission + trade.swap;
        tradeIndex++;
      } else if (tradeCloseDate > currentDate) {
        break;
      } else {
        tradeIndex++;
      }
    }
    
    strategyEquity.push({ date: dateStr, equity: strategyBalance });
    buyHoldEquity.push({ date: dateStr, equity: buyHoldBalance });
    
    // Count winning periods (weekly comparison)
    if (currentDate.getDay() === 0) { // Sunday - end of week
      if (strategyBalance > buyHoldBalance) {
        winningPeriods++;
      }
      totalPeriods++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const strategyReturn = ((strategyBalance - initialBalance) / initialBalance) * 100;
  const buyHoldReturn = ((buyHoldBalance - initialBalance) / initialBalance) * 100;

  return {
    strategyEquity,
    buyHoldEquity,
    outperformance: strategyReturn - buyHoldReturn,
    winningPeriods,
    totalPeriods: Math.max(totalPeriods, 1)
  };
}

function getEmptyMetrics(): ProfessionalMetrics {
  return {
    sharpeRatio: 0,
    sortinoRatio: 0,
    calmarRatio: 0,
    maxDrawdown: 0,
    maxDrawdownDuration: 0,
    valueAtRisk95: 0,
    expectedShortfall: 0,
    winRate: 0,
    profitFactor: 0,
    averageRRR: 0,
    expectancy: 0,
    maxConsecutiveLosses: 0,
    recoveryFactor: 0,
    monthlyWinRate: 0,
    largestLoss: 0,
    largestWin: 0,
    tailRatio: 0,
    kellyPercent: 0,
    avgTradeDuration: 0,
    avgDailyReturn: 0,
    monthlyReturns: [],
    rollingDrawdown: [],
    buyAndHoldComparison: {
      strategyEquity: [],
      buyHoldEquity: [],
      outperformance: 0,
      winningPeriods: 0,
      totalPeriods: 0
    },
    tradingFrequency: {
      tradesPerDay: 0,
      tradesPerWeek: 0,
      tradesPerMonth: 0,
      avgTimeBetweenTrades: 0
    },
    timeAnalysis: {
      bestPerformingHours: [],
      bestPerformingDays: [],
      sessionAnalysis: {
        asian: { avgReturn: 0, tradeCount: 0, winRate: 0 },
        european: { avgReturn: 0, tradeCount: 0, winRate: 0 },
        american: { avgReturn: 0, tradeCount: 0, winRate: 0 }
      }
    },
    riskManagement: {
      avgRiskPerTrade: 0,
      maxRiskPerTrade: 0,
      riskDistribution: [],
      positionSizing: {
        avgPositionSize: 0,
        maxPositionSize: 0,
        positionSizeStdDev: 0
      }
    },
    tradeQuality: {
      averageHoldTime: 0,
      shortestTrade: 0,
      longestTrade: 0,
      prematureTrades: 0,
      overHeldTrades: 0,
      tradeEfficiency: 0
    },
    streakAnalysis: {
      maxWinStreak: 0,
      maxLossStreak: 0,
      avgWinStreak: 0,
      avgLossStreak: 0,
      currentStreak: { type: 'none', count: 0 },
      streakRecovery: 0
    },
    marketConditions: {
      trendingMarkets: { tradeCount: 0, avgReturn: 0, winRate: 0 },
      sidewaysMarkets: { tradeCount: 0, avgReturn: 0, winRate: 0 },
      volatileMarkets: { tradeCount: 0, avgReturn: 0, winRate: 0 }
    },
    symbolAnalysis: []
  };
}