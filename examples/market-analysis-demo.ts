/**
 * Market Analysis Demo
 * Demonstrates how to analyze economic events and their impact on stock markets
 */

import { analyzeMarketImpact, generateMarketReport, updateEventPrediction } from '../lib/market-impact-analyzer';

/**
 * Demo: Analyze impact of economic events on major tech stocks
 */
export async function runMarketAnalysisDemo() {
  console.log('🚀 Starting Market Impact Analysis Demo...\n');
  
  // Define analysis parameters
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'];
  const startDate = '2023-01-01';
  const endDate = '2024-01-31';
  
  const analysisConfig = {
    eventTimeWindow: 5, // 5 days before/after events
    minCorrelationThreshold: 0.1, // Only include correlations > 10%
    includeVolatilityAnalysis: true
  };
  
  try {
    // Run comprehensive market analysis
    console.log('📊 Analyzing market impact...');
    const results = await analyzeMarketImpact(symbols, startDate, endDate, analysisConfig);
    
    // Generate comprehensive report
    const report = generateMarketReport(results);
    
    // Display results
    console.log('\n📈 MARKET ANALYSIS RESULTS');
    console.log('=' .repeat(50));
    console.log(`\n📋 Summary: ${report.summary}\n`);
    
    console.log('🔍 Key Findings:');
    report.keyFindings.forEach((finding, index) => {
      console.log(`   ${index + 1}. ${finding}`);
    });
    
    console.log(`\n⚠️  Risk Assessment: ${report.riskAssessment}\n`);
    
    console.log('💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    // Detailed analysis for each symbol
    console.log('\n📊 DETAILED SYMBOL ANALYSIS');
    console.log('=' .repeat(50));
    
    for (const result of results) {
      console.log(`\n🏢 ${result.symbol}`);
      console.log(`   Overall Correlation: ${(result.overallCorrelation * 100).toFixed(1)}%`);
      console.log(`   Predictive Accuracy: ${result.predictiveAccuracy.toFixed(1)}%`);
      console.log(`   Volatility Increase: ${result.riskMetrics.volatilityIncrease.toFixed(1)}%`);
      console.log(`   Max Drawdown: ${result.riskMetrics.maxDrawdown.toFixed(1)}%`);
      console.log(`   Sharpe Ratio: ${result.riskMetrics.sharpeRatio.toFixed(2)}`);
      
      // Show top 3 most impactful events
      const topEvents = result.eventImpacts
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
        .slice(0, 3);
      
      if (topEvents.length > 0) {
        console.log('   Top Impactful Events:');
        topEvents.forEach((impact, index) => {
          console.log(`     ${index + 1}. ${impact.event.name}: ${(impact.correlation * 100).toFixed(1)}% correlation`);
        });
      }
      
      // Show future predictions
      if (result.futureEventPredictions.length > 0) {
        console.log('   Future Event Predictions:');
        result.futureEventPredictions.forEach((prediction, index) => {
          console.log(`     ${index + 1}. ${prediction.eventType}: ${prediction.probability}% probability, ${prediction.expectedImpact.toFixed(1)}% expected impact`);
        });
      }
    }
    
    // Demonstrate Bayesian updating
    console.log('\n🧠 BAYESIAN UPDATE DEMO');
    console.log('=' .repeat(50));
    
    if (results.length > 0 && results[0].futureEventPredictions.length > 0) {
      const prediction = results[0].futureEventPredictions[0];
      console.log(`\nOriginal Prediction for ${results[0].symbol}:`);
      console.log(`   Event: ${prediction.eventType}`);
      console.log(`   Probability: ${prediction.probability}%`);
      console.log(`   Expected Impact: ${prediction.expectedImpact.toFixed(1)}%`);
      
      // Simulate new evidence (positive analyst sentiment)
      const updatedPrediction = updateEventPrediction(prediction, {
        type: 'analyst_revision',
        strength: 0.8, // Strong evidence
        supports: true // Supports the prediction
      });
      
      console.log(`\nAfter Bayesian Update (positive analyst sentiment):`);
      console.log(`   Updated Probability: ${updatedPrediction.probability.toFixed(1)}%`);
      console.log(`   Prior: ${updatedPrediction.bayesianUpdate.prior}%`);
      console.log(`   Posterior: ${updatedPrediction.bayesianUpdate.posterior.toFixed(1)}%`);
      console.log(`   Likelihood: ${updatedPrediction.bayesianUpdate.likelihood.toFixed(2)}`);
    }
    
  } catch (error) {
    console.error('❌ Error running market analysis:', error);
    
    // Show demo with mock data if API fails
    console.log('\n📝 Running with mock data for demonstration...');
    await runMockDataDemo();
  }
}

/**
 * Demo with mock data when APIs are not available
 */
async function runMockDataDemo() {
  console.log('\n🎭 MOCK DATA DEMONSTRATION');
  console.log('=' .repeat(50));
  
  // This would show how the analysis works with sample data
  const mockResults = [
    {
      symbol: 'AAPL',
      overallCorrelation: 0.35,
      predictiveAccuracy: 72.5,
      riskMetrics: {
        volatilityIncrease: 18.2,
        maxDrawdown: 12.5,
        sharpeRatio: 1.15
      },
      eventImpacts: [],
      futureEventPredictions: [
        {
          eventType: 'earnings_release',
          probability: 100,
          expectedImpact: 4.2,
          confidenceInterval: { lower: 2.1, upper: 6.3 },
          timeHorizon: 30,
          basedOnHistoricalPattern: true
        }
      ]
    }
  ];
  
  const mockReport = generateMarketReport(mockResults);
  
  console.log(`\n📋 Mock Summary: ${mockReport.summary}`);
  console.log('\n🔍 Mock Key Findings:');
  mockReport.keyFindings.forEach((finding, index) => {
    console.log(`   ${index + 1}. ${finding}`);
  });
  
  console.log('\n💡 This demonstrates the type of insights you would get with real data!');
}

/**
 * Run the demo
 */
if (require.main === module) {
  runMarketAnalysisDemo()
    .then(() => console.log('\n✅ Demo completed!'))
    .catch(error => console.error('❌ Demo failed:', error));
}