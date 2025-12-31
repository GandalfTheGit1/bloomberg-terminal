/**
 * Market Impact Analyzer
 * Comprehensive analysis of economic events and their impact on stock markets
 */

import { EconomicEvent, StockMovement, EventImpactAnalysis, analyzeEventImpact, identifyEventPatterns } from './economic-analysis';
import { fetchComprehensiveMarketData } from './data-sources';
import { updateProbability, BayesianUpdateResult } from './bayesian';

export interface MarketAnalysisResult {
  symbol: string;
  eventImpacts: EventImpactAnalysis[];
  overallCorrelation: number;
  predictiveAccuracy: number;
  riskMetrics: {
    volatilityIncrease: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  futureEventPredictions: EventPrediction[];
}

export interface EventPrediction {
  eventType: string;
  probability: number;
  expectedImpact: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  timeHorizon: number; // days
  basedOnHistoricalPattern: boolean;
}

/**
 * Comprehensive market impact analysis
 */
export async function analyzeMarketImpact(
  symbols: string[],
  startDate: string,
  endDate: string,
  analysisConfig: {
    eventTimeWindow: number;
    minCorrelationThreshold: number;
    includeVolatilityAnalysis: boolean;
  } = {
    eventTimeWindow: 5,
    minCorrelationThreshold: 0.1,
    includeVolatilityAnalysis: true
  }
): Promise<MarketAnalysisResult[]> {
  
  console.log(`Fetching market data for ${symbols.join(', ')} from ${startDate} to ${endDate}...`);
  
  // Fetch comprehensive market data
  const { economicEvents, stockData } = await fetchComprehensiveMarketData(
    symbols,
    startDate,
    endDate
  );
  
  console.log(`Found ${economicEvents.length} economic events and stock data for ${Object.keys(stockData).length} symbols`);
  
  const results: MarketAnalysisResult[] = [];
  
  for (const symbol of symbols) {
    const symbolStockData = stockData[symbol];
    if (!symbolStockData || symbolStockData.length === 0) {
      console.warn(`No stock data found for ${symbol}`);
      continue;
    }
    
    console.log(`Analyzing ${symbol} with ${symbolStockData.length} data points...`);
    
    // Analyze impact of each economic event on this stock
    const eventImpacts: EventImpactAnalysis[] = [];
    
    for (const event of economicEvents) {
      const impact = analyzeEventImpact(
        event,
        symbolStockData,
        analysisConfig.eventTimeWindow
      );
      
      // Only include impacts above threshold
      if (Math.abs(impact.correlation) >= analysisConfig.minCorrelationThreshold) {
        eventImpacts.push(impact);
      }
    }
    
    // Calculate overall metrics
    const overallCorrelation = calculateOverallCorrelation(eventImpacts);
    const predictiveAccuracy = calculatePredictiveAccuracy(eventImpacts);
    
    // Calculate risk metrics
    const riskMetrics = analysisConfig.includeVolatilityAnalysis 
      ? calculateRiskMetrics(symbolStockData, eventImpacts)
      : { volatilityIncrease: 0, maxDrawdown: 0, sharpeRatio: 0 };
    
    // Generate future event predictions
    const futureEventPredictions = generateFutureEventPredictions(
      eventImpacts,
      symbol
    );
    
    results.push({
      symbol,
      eventImpacts,
      overallCorrelation,
      predictiveAccuracy,
      riskMetrics,
      futureEventPredictions
    });
  }
  
  return results;
}

/**
 * Calculate overall correlation across all events
 */
function calculateOverallCorrelation(eventImpacts: EventImpactAnalysis[]): number {
  if (eventImpacts.length === 0) return 0;
  
  const correlations = eventImpacts.map(impact => Math.abs(impact.correlation));
  return correlations.reduce((sum, corr) => sum + corr, 0) / correlations.length;
}

/**
 * Calculate predictive accuracy based on historical performance
 */
function calculatePredictiveAccuracy(eventImpacts: EventImpactAnalysis[]): number {
  if (eventImpacts.length === 0) return 0;
  
  // Simplified accuracy calculation based on correlation strength and significance
  const accuracyScores = eventImpacts.map(impact => {
    const correlationScore = Math.abs(impact.correlation);
    const significanceScore = impact.significance < 0.05 ? 1 : impact.significance < 0.1 ? 0.7 : 0.3;
    return (correlationScore + significanceScore) / 2;
  });
  
  return accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length * 100;
}

/**
 * Calculate risk metrics including volatility and drawdown
 */
function calculateRiskMetrics(
  stockData: StockMovement[],
  eventImpacts: EventImpactAnalysis[]
): {
  volatilityIncrease: number;
  maxDrawdown: number;
  sharpeRatio: number;
} {
  // Calculate baseline volatility (non-event periods)
  const eventDates = new Set(eventImpacts.flatMap(impact => 
    impact.stockMovements.map(stock => stock.date.toISOString().split('T')[0])
  ));
  
  const nonEventData = stockData.filter(stock => 
    !eventDates.has(stock.date.toISOString().split('T')[0])
  );
  
  const baselineVolatility = calculateVolatility(nonEventData.map(s => s.percentChange));
  
  // Calculate event-period volatility
  const eventData = stockData.filter(stock => 
    eventDates.has(stock.date.toISOString().split('T')[0])
  );
  
  const eventVolatility = calculateVolatility(eventData.map(s => s.percentChange));
  
  const volatilityIncrease = baselineVolatility > 0 ? 
    ((eventVolatility - baselineVolatility) / baselineVolatility) * 100 : 0;
  
  // Calculate maximum drawdown
  const maxDrawdown = calculateMaxDrawdown(stockData);
  
  // Calculate Sharpe ratio (simplified)
  const returns = stockData.map(s => s.percentChange);
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const volatility = calculateVolatility(returns);
  const sharpeRatio = volatility > 0 ? avgReturn / volatility : 0;
  
  return {
    volatilityIncrease,
    maxDrawdown,
    sharpeRatio
  };
}

/**
 * Calculate volatility (standard deviation of returns)
 */
function calculateVolatility(returns: number[]): number {
  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  return Math.sqrt(variance);
}

/**
 * Calculate maximum drawdown
 */
function calculateMaxDrawdown(stockData: StockMovement[]): number {
  if (stockData.length === 0) return 0;
  
  let maxDrawdown = 0;
  let peak = stockData[0].closePrice;
  
  for (const stock of stockData) {
    if (stock.closePrice > peak) {
      peak = stock.closePrice;
    }
    
    const drawdown = (peak - stock.closePrice) / peak * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

/**
 * Generate future event predictions based on historical patterns
 */
function generateFutureEventPredictions(
  eventImpacts: EventImpactAnalysis[],
  symbol: string
): EventPrediction[] {
  const patterns = identifyEventPatterns(eventImpacts);
  
  if (!patterns) return [];
  
  // Generate predictions for next 90 days
  const predictions: EventPrediction[] = [];
  
  // Fed meeting prediction (quarterly)
  if (eventImpacts.some(impact => impact.event.type === 'fed_meeting')) {
    const fedImpacts = eventImpacts.filter(impact => impact.event.type === 'fed_meeting');
    const avgImpact = fedImpacts.reduce((sum, impact) => sum + impact.impactMagnitude, 0) / fedImpacts.length;
    
    predictions.push({
      eventType: 'fed_meeting',
      probability: 95, // Fed meetings are scheduled
      expectedImpact: avgImpact,
      confidenceInterval: {
        lower: avgImpact * 0.7,
        upper: avgImpact * 1.3
      },
      timeHorizon: 45, // Next Fed meeting in ~45 days
      basedOnHistoricalPattern: true
    });
  }
  
  // Earnings prediction (quarterly)
  if (eventImpacts.some(impact => impact.event.type === 'earnings_release')) {
    const earningsImpacts = eventImpacts.filter(impact => impact.event.type === 'earnings_release');
    const avgImpact = earningsImpacts.reduce((sum, impact) => sum + impact.impactMagnitude, 0) / earningsImpacts.length;
    
    predictions.push({
      eventType: 'earnings_release',
      probability: 100, // Earnings are scheduled
      expectedImpact: avgImpact,
      confidenceInterval: {
        lower: avgImpact * 0.5,
        upper: avgImpact * 1.5
      },
      timeHorizon: 30, // Next earnings in ~30 days
      basedOnHistoricalPattern: true
    });
  }
  
  return predictions;
}

/**
 * Update event predictions using Bayesian inference
 */
export function updateEventPrediction(
  prediction: EventPrediction,
  newEvidence: {
    type: 'market_sentiment' | 'analyst_revision' | 'economic_indicator';
    strength: number; // 0-1
    supports: boolean; // true if supports the prediction
  }
): EventPrediction & { bayesianUpdate: BayesianUpdateResult } {
  
  // Calculate likelihood based on evidence type and strength
  const likelihood = newEvidence.supports ? 
    0.5 + (newEvidence.strength * 0.4) : // 0.5 to 0.9 if supports
    0.5 - (newEvidence.strength * 0.4);  // 0.1 to 0.5 if contradicts
  
  // Calculate evidence probability (base rate)
  const evidenceProb = 0.3 + (newEvidence.strength * 0.4); // 0.3 to 0.7
  
  const bayesianUpdate = updateProbability({
    prior: prediction.probability,
    likelihood,
    evidence: evidenceProb
  });
  
  return {
    ...prediction,
    probability: bayesianUpdate.posterior,
    bayesianUpdate
  };
}

/**
 * Generate a comprehensive market report
 */
export function generateMarketReport(
  analysisResults: MarketAnalysisResult[]
): {
  summary: string;
  keyFindings: string[];
  riskAssessment: string;
  recommendations: string[];
} {
  const summary = `Analysis of ${analysisResults.length} symbols reveals varying degrees of sensitivity to economic events. ` +
    `Average correlation: ${(analysisResults.reduce((sum, result) => sum + result.overallCorrelation, 0) / analysisResults.length * 100).toFixed(1)}%`;
  
  const keyFindings = [
    `Highest correlation: ${analysisResults.reduce((max, result) => 
      result.overallCorrelation > max.overallCorrelation ? result : max
    ).symbol} (${(analysisResults.reduce((max, result) => 
      result.overallCorrelation > max.overallCorrelation ? result : max
    ).overallCorrelation * 100).toFixed(1)}%)`,
    
    `Most predictable events: ${analysisResults
      .flatMap(result => result.eventImpacts)
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 3)
      .map(impact => impact.event.type)
      .join(', ')}`,
    
    `Average predictive accuracy: ${(analysisResults.reduce((sum, result) => 
      sum + result.predictiveAccuracy, 0) / analysisResults.length).toFixed(1)}%`
  ];
  
  const avgVolatilityIncrease = analysisResults.reduce((sum, result) => 
    sum + result.riskMetrics.volatilityIncrease, 0) / analysisResults.length;
  
  const riskAssessment = avgVolatilityIncrease > 20 ? 
    `High risk: Economic events increase volatility by ${avgVolatilityIncrease.toFixed(1)}% on average` :
    avgVolatilityIncrease > 10 ?
    `Moderate risk: Economic events increase volatility by ${avgVolatilityIncrease.toFixed(1)}% on average` :
    `Low risk: Economic events have minimal impact on volatility (${avgVolatilityIncrease.toFixed(1)}% increase)`;
  
  const recommendations = [
    analysisResults.some(result => result.overallCorrelation > 0.3) ?
      'Consider event-driven trading strategies for highly correlated stocks' :
      'Focus on fundamental analysis as event correlation is low',
    
    avgVolatilityIncrease > 15 ?
      'Implement volatility-based position sizing around major economic events' :
      'Standard position sizing is appropriate',
    
    'Monitor upcoming Fed meetings and earnings releases for highest impact events'
  ];
  
  return {
    summary,
    keyFindings,
    riskAssessment,
    recommendations
  };
}