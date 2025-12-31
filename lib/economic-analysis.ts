/**
 * Economic Event Analysis Engine
 * Analyzes correlations between economic events and stock market movements
 */

export interface EconomicEvent {
  id: string;
  type: 'fed_meeting' | 'earnings_release' | 'gdp_report' | 'inflation_data' | 'employment_report' | 'geopolitical';
  name: string;
  date: Date;
  expectedValue?: number;
  actualValue?: number;
  previousValue?: number;
  surprise?: number; // (actual - expected) / expected
  importance: 'low' | 'medium' | 'high';
  affectedSectors: string[];
  source: string;
}

export interface StockMovement {
  symbol: string;
  date: Date;
  openPrice: number;
  closePrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  percentChange: number;
  volatility: number;
}

export interface EventImpactAnalysis {
  event: EconomicEvent;
  stockMovements: StockMovement[];
  correlation: number;
  significance: number; // p-value
  impactMagnitude: number;
  timeWindow: {
    preEvent: number; // days before
    postEvent: number; // days after
  };
  confidence: number;
}

/**
 * Analyze correlation between economic events and stock movements
 */
export function analyzeEventImpact(
  event: EconomicEvent,
  stockData: StockMovement[],
  timeWindowDays: number = 5
): EventImpactAnalysis {
  // Filter stock data around event date
  const eventDate = event.date;
  const preEventData = stockData.filter(stock => {
    const daysDiff = (eventDate.getTime() - stock.date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= 0 && daysDiff <= timeWindowDays;
  });
  
  const postEventData = stockData.filter(stock => {
    const daysDiff = (stock.date.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= 0 && daysDiff <= timeWindowDays;
  });

  // Calculate correlation between event surprise and stock movements
  const correlation = calculateEventStockCorrelation(event, postEventData);
  
  // Calculate statistical significance
  const significance = calculateSignificance(correlation, postEventData.length);
  
  // Calculate impact magnitude (average absolute return in post-event window)
  const impactMagnitude = postEventData.reduce((sum, stock) => 
    sum + Math.abs(stock.percentChange), 0) / postEventData.length;

  return {
    event,
    stockMovements: [...preEventData, ...postEventData],
    correlation,
    significance,
    impactMagnitude,
    timeWindow: {
      preEvent: timeWindowDays,
      postEvent: timeWindowDays
    },
    confidence: calculateConfidence(correlation, significance, postEventData.length)
  };
}

/**
 * Calculate correlation between event surprise and stock returns
 */
function calculateEventStockCorrelation(
  event: EconomicEvent,
  stockMovements: StockMovement[]
): number {
  if (!event.surprise || stockMovements.length === 0) return 0;
  
  const returns = stockMovements.map(stock => stock.percentChange);
  const surprises = stockMovements.map(() => event.surprise!);
  
  return pearsonCorrelation(surprises, returns);
}

/**
 * Calculate Pearson correlation coefficient
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate statistical significance (simplified t-test)
 */
function calculateSignificance(correlation: number, sampleSize: number): number {
  if (sampleSize <= 2) return 1;
  
  const tStat = correlation * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
  
  // Simplified p-value calculation (for demonstration)
  // In practice, you'd use a proper t-distribution
  return Math.abs(tStat) > 2 ? 0.05 : 0.1;
}

/**
 * Calculate confidence in the analysis
 */
function calculateConfidence(
  correlation: number,
  significance: number,
  sampleSize: number
): number {
  const correlationStrength = Math.abs(correlation);
  const significanceScore = significance < 0.05 ? 1 : significance < 0.1 ? 0.7 : 0.3;
  const sampleSizeScore = Math.min(sampleSize / 30, 1); // Normalize to 30 samples
  
  return (correlationStrength * 0.4 + significanceScore * 0.4 + sampleSizeScore * 0.2) * 100;
}

/**
 * Identify patterns in historical event impacts
 */
export function identifyEventPatterns(
  analyses: EventImpactAnalysis[]
): {
  eventType: string;
  averageImpact: number;
  consistency: number;
  bestPredictors: string[];
} {
  const groupedByType = analyses.reduce((groups, analysis) => {
    const type = analysis.event.type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(analysis);
    return groups;
  }, {} as Record<string, EventImpactAnalysis[]>);

  return Object.entries(groupedByType).map(([eventType, typeAnalyses]) => {
    const impacts = typeAnalyses.map(a => a.impactMagnitude);
    const averageImpact = impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length;
    
    // Calculate consistency (inverse of standard deviation)
    const variance = impacts.reduce((sum, impact) => 
      sum + Math.pow(impact - averageImpact, 2), 0) / impacts.length;
    const consistency = 1 / (1 + Math.sqrt(variance));
    
    // Identify best predictors (events with highest correlation)
    const bestPredictors = typeAnalyses
      .filter(a => Math.abs(a.correlation) > 0.3)
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 3)
      .map(a => a.event.name);

    return {
      eventType,
      averageImpact,
      consistency,
      bestPredictors
    };
  })[0]; // Return first for simplicity
}