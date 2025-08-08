// Advanced Trading Metrics Calculations

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
  duration: number | null;
}

export interface AdvancedMetrics {
  // Risk Metrics
  valueAtRisk95: number;
  valueAtRisk99: number;
  expectedShortfall: number;
  conditionalValueAtRisk: number;
  
  // Performance Metrics
  calmarRatio: number;
  sterlingRatio: number;
  burkeRatio: number;
  martinRatio: number;
  painIndex: number;
  painRatio: number;
  
  // Drawdown Metrics
  maxDrawdownDuration: number;
  averageDrawdownDuration: number;
  recoveryFactor: number;
  drawdownDeviation: number;
  
  // Statistical Metrics
  skewness: number;
  kurtosis: number;
  downsideDeviation: number;
  upsideDeviation: number;
  omega: number;
  gainLossRatio: number;
  
  // Trade Analysis
  averageWinStreak: number;
  averageLossStreak: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  ulcerIndex: number;
  
  // Time-based Metrics
  bestHour: number;
  worstHour: number;
  bestDayOfWeek: number;
  worstDayOfWeek: number;
  bestMonth: string;
  worstMonth: string;
  hourlyPnL?: { [hour: number]: number[] };
  dailyPnL?: { [day: number]: number[] };
  monthlyPnL?: { [month: string]: number[] };
  
  // Efficiency Metrics
  efficiencyRatio: number;
  treynorRatio: number;
  informationRatio: number;
  jensenAlpha: number;
  beta: number;
  
  // Market Condition Metrics
  trendStrength: number;
  volatilityAdjustedReturn: number;
  riskParityScore: number;
}

// Calculate returns from trades
export function calculateReturns(trades: Trade[], initialBalance: number = 10000): number[] {
  if (trades.length === 0) return [];
  
  let balance = initialBalance;
  const returns: number[] = [];
  
  // Sort trades by close time
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.closeTime || a.openTime).getTime() - new Date(b.closeTime || b.openTime).getTime()
  );
  
  sortedTrades.forEach(trade => {
    const totalPnL = trade.profit + trade.commission + trade.swap;
    const returnPercent = (totalPnL / balance) * 100;
    returns.push(returnPercent);
    balance += totalPnL;
  });
  
  return returns;
}

// Calculate Value at Risk (VaR)
export function calculateVaR(returns: number[], confidence: number = 0.95): number {
  if (returns.length === 0) return 0;
  
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidence) * sortedReturns.length);
  return sortedReturns[index] || 0;
}

// Calculate Expected Shortfall (CVaR)
export function calculateExpectedShortfall(returns: number[], confidence: number = 0.95): number {
  if (returns.length === 0) return 0;
  
  const var95 = calculateVaR(returns, confidence);
  const lossesWorseThanVaR = returns.filter(r => r <= var95);
  
  if (lossesWorseThanVaR.length === 0) return var95;
  
  return lossesWorseThanVaR.reduce((sum, r) => sum + r, 0) / lossesWorseThanVaR.length;
}

// Calculate Calmar Ratio
export function calculateCalmarRatio(totalReturn: number, maxDrawdown: number, years: number): number {
  if (maxDrawdown === 0 || years === 0) return 0;
  const annualReturn = totalReturn / years;
  return Math.abs(annualReturn / maxDrawdown);
}

// Calculate Sterling Ratio
export function calculateSterlingRatio(totalReturn: number, maxDrawdown: number, years: number): number {
  if (years === 0) return 0;
  const annualReturn = totalReturn / years;
  const adjustedDrawdown = Math.abs(maxDrawdown) + 10; // Sterling adds 10% to drawdown
  return annualReturn / adjustedDrawdown;
}

// Calculate Skewness
export function calculateSkewness(returns: number[]): number {
  if (returns.length < 3) return 0;
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const n = returns.length;
  
  const m3 = returns.reduce((sum, r) => sum + Math.pow(r - mean, 3), 0) / n;
  const m2 = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
  
  if (m2 === 0) return 0;
  
  return m3 / Math.pow(m2, 1.5);
}

// Calculate Kurtosis
export function calculateKurtosis(returns: number[]): number {
  if (returns.length < 4) return 0;
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const n = returns.length;
  
  const m4 = returns.reduce((sum, r) => sum + Math.pow(r - mean, 4), 0) / n;
  const m2 = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
  
  if (m2 === 0) return 0;
  
  return (m4 / Math.pow(m2, 2)) - 3; // Excess kurtosis
}

// Calculate Downside Deviation
export function calculateDownsideDeviation(returns: number[], threshold: number = 0): number {
  const downsideReturns = returns.filter(r => r < threshold);
  if (downsideReturns.length === 0) return 0;
  
  const sumSquares = downsideReturns.reduce((sum, r) => sum + Math.pow(r - threshold, 2), 0);
  return Math.sqrt(sumSquares / downsideReturns.length);
}

// Calculate Upside Deviation
export function calculateUpsideDeviation(returns: number[], threshold: number = 0): number {
  const upsideReturns = returns.filter(r => r > threshold);
  if (upsideReturns.length === 0) return 0;
  
  const sumSquares = upsideReturns.reduce((sum, r) => sum + Math.pow(r - threshold, 2), 0);
  return Math.sqrt(sumSquares / upsideReturns.length);
}

// Calculate Omega Ratio
export function calculateOmega(returns: number[], threshold: number = 0): number {
  const gains = returns.filter(r => r > threshold).reduce((sum, r) => sum + (r - threshold), 0);
  const losses = returns.filter(r => r < threshold).reduce((sum, r) => sum + (threshold - r), 0);
  
  if (losses === 0) return gains > 0 ? Infinity : 1;
  return 1 + (gains / losses);
}

// Calculate consecutive wins/losses
export function calculateStreaks(trades: Trade[]) {
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  const winStreaks: number[] = [];
  const lossStreaks: number[] = [];
  
  trades.forEach(trade => {
    const totalPnL = trade.profit + trade.commission + trade.swap;
    
    if (totalPnL > 0) {
      currentWinStreak++;
      if (currentLossStreak > 0) {
        lossStreaks.push(currentLossStreak);
        currentLossStreak = 0;
      }
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
    } else if (totalPnL < 0) {
      currentLossStreak++;
      if (currentWinStreak > 0) {
        winStreaks.push(currentWinStreak);
        currentWinStreak = 0;
      }
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
    }
  });
  
  // Add final streaks
  if (currentWinStreak > 0) winStreaks.push(currentWinStreak);
  if (currentLossStreak > 0) lossStreaks.push(currentLossStreak);
  
  return {
    maxConsecutiveWins: maxWinStreak,
    maxConsecutiveLosses: maxLossStreak,
    averageWinStreak: winStreaks.length > 0 ? winStreaks.reduce((a, b) => a + b, 0) / winStreaks.length : 0,
    averageLossStreak: lossStreaks.length > 0 ? lossStreaks.reduce((a, b) => a + b, 0) / lossStreaks.length : 0
  };
}

// Calculate Ulcer Index
export function calculateUlcerIndex(equityCurve: number[]): number {
  if (equityCurve.length < 2) return 0;
  
  let sumSquaredDrawdowns = 0;
  let peak = equityCurve[0];
  
  for (let i = 1; i < equityCurve.length; i++) {
    peak = Math.max(peak, equityCurve[i]);
    const drawdownPercent = ((peak - equityCurve[i]) / peak) * 100;
    sumSquaredDrawdowns += drawdownPercent * drawdownPercent;
  }
  
  return Math.sqrt(sumSquaredDrawdowns / equityCurve.length);
}

// Calculate time-based performance
export function calculateTimeBasedMetrics(trades: Trade[]) {
  const hourlyPnL: { [hour: number]: number[] } = {};
  const dailyPnL: { [day: number]: number[] } = {};
  const monthlyPnL: { [month: string]: number[] } = {};
  
  trades.forEach(trade => {
    const closeDate = new Date(trade.closeTime || trade.openTime);
    const hour = closeDate.getHours();
    const day = closeDate.getDay();
    const month = closeDate.toLocaleString('en-US', { month: 'short' });
    
    const totalPnL = trade.profit + trade.commission + trade.swap;
    
    if (!hourlyPnL[hour]) hourlyPnL[hour] = [];
    if (!dailyPnL[day]) dailyPnL[day] = [];
    if (!monthlyPnL[month]) monthlyPnL[month] = [];
    
    hourlyPnL[hour].push(totalPnL);
    dailyPnL[day].push(totalPnL);
    monthlyPnL[month].push(totalPnL);
  });
  
  // Find best/worst times
  let bestHour = 0, worstHour = 0, bestHourAvg = -Infinity, worstHourAvg = Infinity;
  Object.entries(hourlyPnL).forEach(([hour, pnls]) => {
    const avg = pnls.reduce((a, b) => a + b, 0) / pnls.length;
    if (avg > bestHourAvg) {
      bestHourAvg = avg;
      bestHour = parseInt(hour);
    }
    if (avg < worstHourAvg) {
      worstHourAvg = avg;
      worstHour = parseInt(hour);
    }
  });
  
  let bestDay = 0, worstDay = 0, bestDayAvg = -Infinity, worstDayAvg = Infinity;
  Object.entries(dailyPnL).forEach(([day, pnls]) => {
    const avg = pnls.reduce((a, b) => a + b, 0) / pnls.length;
    if (avg > bestDayAvg) {
      bestDayAvg = avg;
      bestDay = parseInt(day);
    }
    if (avg < worstDayAvg) {
      worstDayAvg = avg;
      worstDay = parseInt(day);
    }
  });
  
  let bestMonth = '', worstMonth = '', bestMonthAvg = -Infinity, worstMonthAvg = Infinity;
  Object.entries(monthlyPnL).forEach(([month, pnls]) => {
    const avg = pnls.reduce((a, b) => a + b, 0) / pnls.length;
    if (avg > bestMonthAvg) {
      bestMonthAvg = avg;
      bestMonth = month;
    }
    if (avg < worstMonthAvg) {
      worstMonthAvg = avg;
      worstMonth = month;
    }
  });
  
  return {
    bestHour,
    worstHour,
    bestDayOfWeek: bestDay,
    worstDayOfWeek: worstDay,
    bestMonth,
    worstMonth,
    hourlyPnL,
    dailyPnL,
    monthlyPnL
  };
}

// Calculate all advanced metrics
export function calculateAdvancedMetrics(
  trades: Trade[], 
  initialBalance: number = 10000,
  riskFreeRate: number = 0.02 // 2% annual risk-free rate
): AdvancedMetrics {
  const returns = calculateReturns(trades, initialBalance);
  const equityCurve = calculateEquityCurve(trades, initialBalance);
  const drawdowns = calculateDrawdowns(equityCurve);
  const streaks = calculateStreaks(trades);
  const timeMetrics = calculateTimeBasedMetrics(trades);
  
  // Calculate total return and time period
  const totalReturnPercent = returns.reduce((sum, r) => sum + r, 0);
  const firstTrade = trades[0];
  const lastTrade = trades[trades.length - 1];
  const timePeriodYears = firstTrade && lastTrade ? 
    (new Date(lastTrade.closeTime || lastTrade.openTime).getTime() - 
     new Date(firstTrade.openTime).getTime()) / (365.25 * 24 * 60 * 60 * 1000) : 1;
  
  // Calculate standard deviation
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate metrics
  return {
    // Risk Metrics
    valueAtRisk95: calculateVaR(returns, 0.95),
    valueAtRisk99: calculateVaR(returns, 0.99),
    expectedShortfall: calculateExpectedShortfall(returns, 0.95),
    conditionalValueAtRisk: calculateExpectedShortfall(returns, 0.99),
    
    // Performance Metrics
    calmarRatio: calculateCalmarRatio(totalReturnPercent, drawdowns.maxDrawdown, timePeriodYears),
    sterlingRatio: calculateSterlingRatio(totalReturnPercent, drawdowns.maxDrawdown, timePeriodYears),
    burkeRatio: totalReturnPercent / (drawdowns.drawdownDeviation || 1),
    martinRatio: (totalReturnPercent / timePeriodYears) / calculateUlcerIndex(equityCurve),
    painIndex: drawdowns.averageDrawdown,
    painRatio: totalReturnPercent / Math.abs(drawdowns.averageDrawdown || 1),
    
    // Drawdown Metrics
    maxDrawdownDuration: drawdowns.maxDrawdownDuration,
    averageDrawdownDuration: drawdowns.averageDrawdownDuration,
    recoveryFactor: Math.abs(totalReturnPercent / (drawdowns.maxDrawdown || 1)),
    drawdownDeviation: drawdowns.drawdownDeviation,
    
    // Statistical Metrics
    skewness: calculateSkewness(returns),
    kurtosis: calculateKurtosis(returns),
    downsideDeviation: calculateDownsideDeviation(returns),
    upsideDeviation: calculateUpsideDeviation(returns),
    omega: calculateOmega(returns),
    gainLossRatio: calculateGainLossRatio(trades),
    
    // Trade Analysis
    averageWinStreak: streaks.averageWinStreak,
    averageLossStreak: streaks.averageLossStreak,
    maxConsecutiveWins: streaks.maxConsecutiveWins,
    maxConsecutiveLosses: streaks.maxConsecutiveLosses,
    ulcerIndex: calculateUlcerIndex(equityCurve),
    
    // Time-based Metrics
    bestHour: timeMetrics.bestHour,
    worstHour: timeMetrics.worstHour,
    bestDayOfWeek: timeMetrics.bestDayOfWeek,
    worstDayOfWeek: timeMetrics.worstDayOfWeek,
    bestMonth: timeMetrics.bestMonth,
    worstMonth: timeMetrics.worstMonth,
    hourlyPnL: timeMetrics.hourlyPnL,
    dailyPnL: timeMetrics.dailyPnL,
    monthlyPnL: timeMetrics.monthlyPnL,
    
    // Efficiency Metrics (simplified calculations)
    efficiencyRatio: Math.abs(totalReturnPercent) / (stdDev || 1),
    treynorRatio: (totalReturnPercent / timePeriodYears - riskFreeRate) / 1, // Simplified beta = 1
    informationRatio: (totalReturnPercent / timePeriodYears) / (stdDev || 1),
    jensenAlpha: totalReturnPercent / timePeriodYears - riskFreeRate,
    beta: 1, // Simplified
    
    // Market Condition Metrics
    trendStrength: calculateTrendStrength(equityCurve),
    volatilityAdjustedReturn: totalReturnPercent / (stdDev || 1),
    riskParityScore: calculateRiskParityScore(returns)
  };
}

// Helper functions
function calculateEquityCurve(trades: Trade[], initialBalance: number): number[] {
  let balance = initialBalance;
  const curve = [balance];
  
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.closeTime || a.openTime).getTime() - new Date(b.closeTime || b.openTime).getTime()
  );
  
  sortedTrades.forEach(trade => {
    const totalPnL = trade.profit + trade.commission + trade.swap;
    balance += totalPnL;
    curve.push(balance);
  });
  
  return curve;
}

function calculateDrawdowns(equityCurve: number[]) {
  let peak = equityCurve[0];
  let maxDrawdown = 0;
  let currentDrawdownStart = 0;
  let maxDrawdownDuration = 0;
  let drawdownDurations: number[] = [];
  let drawdowns: number[] = [];
  
  for (let i = 0; i < equityCurve.length; i++) {
    peak = Math.max(peak, equityCurve[i]);
    const drawdown = ((peak - equityCurve[i]) / peak) * 100;
    
    if (drawdown > 0) {
      drawdowns.push(drawdown);
      if (currentDrawdownStart === 0) {
        currentDrawdownStart = i;
      }
    } else if (currentDrawdownStart > 0) {
      const duration = i - currentDrawdownStart;
      drawdownDurations.push(duration);
      maxDrawdownDuration = Math.max(maxDrawdownDuration, duration);
      currentDrawdownStart = 0;
    }
    
    maxDrawdown = Math.min(maxDrawdown, -drawdown);
  }
  
  // Handle ongoing drawdown
  if (currentDrawdownStart > 0) {
    const duration = equityCurve.length - currentDrawdownStart;
    drawdownDurations.push(duration);
    maxDrawdownDuration = Math.max(maxDrawdownDuration, duration);
  }
  
  const averageDrawdown = drawdowns.length > 0 ? 
    -drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length : 0;
  
  const averageDrawdownDuration = drawdownDurations.length > 0 ?
    drawdownDurations.reduce((a, b) => a + b, 0) / drawdownDurations.length : 0;
  
  // Calculate drawdown deviation
  const ddMean = drawdowns.reduce((a, b) => a + b, 0) / (drawdowns.length || 1);
  const drawdownDeviation = Math.sqrt(
    drawdowns.reduce((sum, dd) => sum + Math.pow(dd - ddMean, 2), 0) / (drawdowns.length || 1)
  );
  
  return {
    maxDrawdown,
    averageDrawdown,
    maxDrawdownDuration,
    averageDrawdownDuration,
    drawdownDeviation
  };
}

function calculateGainLossRatio(trades: Trade[]): number {
  const gains = trades.filter(t => t.profit > 0).map(t => t.profit);
  const losses = trades.filter(t => t.profit < 0).map(t => Math.abs(t.profit));
  
  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
  
  return avgLoss > 0 ? avgGain / avgLoss : avgGain > 0 ? Infinity : 0;
}

function calculateTrendStrength(equityCurve: number[]): number {
  if (equityCurve.length < 2) return 0;
  
  // Simple linear regression
  const n = equityCurve.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = equityCurve;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const ssResidual = y.reduce((sum, yi, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  
  const rSquared = 1 - (ssResidual / ssTotal);
  return rSquared * (slope > 0 ? 1 : -1); // Positive for uptrend, negative for downtrend
}

function calculateRiskParityScore(returns: number[]): number {
  // Simplified risk parity score based on return distribution
  const positive = returns.filter(r => r > 0);
  const negative = returns.filter(r => r < 0);
  
  if (positive.length === 0 || negative.length === 0) return 0;
  
  const avgPositive = positive.reduce((a, b) => a + b, 0) / positive.length;
  const avgNegative = Math.abs(negative.reduce((a, b) => a + b, 0) / negative.length);
  
  return 1 - Math.abs(avgPositive - avgNegative) / (avgPositive + avgNegative);
}