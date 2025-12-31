# Real Data Setup Guide

This guide explains how to set up real data sources for economic event analysis and stock market correlation studies.

## 🔑 API Keys Required

### 1. Alpha Vantage (Stock Data & Earnings)
- **Free Tier**: 25 API calls per day
- **Paid Plans**: Starting at $50/month for 1,200 calls/day
- **Sign up**: https://www.alphavantage.co/support/#api-key
- **What you get**: Stock prices, earnings calendar, financial statements

```bash
# Add to your .env file
ALPHA_VANTAGE_API_KEY=your_key_here
```

### 2. FRED (Federal Reserve Economic Data)
- **Free**: Unlimited API calls
- **Sign up**: https://fred.stlouisfed.org/docs/api/api_key.html
- **What you get**: GDP, unemployment, inflation, interest rates, 800k+ economic time series

```bash
# Add to your .env file
FRED_API_KEY=your_key_here
```

### 3. Yahoo Finance (Alternative - No API Key Required)
- **Free**: Basic stock data
- **Limitations**: Rate limited, no official API
- **What you get**: Stock prices, basic financial data

## 📊 Data Sources Overview

### Economic Events
| Source | Data Type | Cost | API Calls/Day | Best For |
|--------|-----------|------|---------------|----------|
| FRED | Economic indicators | Free | Unlimited | Macro events (GDP, inflation, employment) |
| Alpha Vantage | Earnings calendar | Free/Paid | 25/1200+ | Corporate earnings |
| Yahoo Finance | Basic financials | Free | Rate limited | Stock prices |
| Bloomberg Terminal | Professional data | $2000+/month | Unlimited | Professional trading |
| Refinitiv | Real-time events | $1000+/month | Unlimited | Institutional analysis |

### Stock Market Data
| Source | Data Type | Cost | Delay | Best For |
|--------|-----------|------|-------|----------|
| Alpha Vantage | Daily/Intraday | Free/Paid | Real-time* | Individual analysis |
| Yahoo Finance | Daily | Free | 15-20 min | Basic analysis |
| IEX Cloud | Real-time | Paid | Real-time | Professional apps |
| Polygon.io | Real-time | Paid | Real-time | High-frequency analysis |

*Real-time with paid plans

## 🚀 Quick Start

### 1. Set up environment variables
```bash
# Create .env file in project root
cp .env.local.example .env.local

# Add your API keys
echo "ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key" >> .env.local
echo "FRED_API_KEY=your_fred_key" >> .env.local
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the market analysis demo
```bash
npm run demo:market-analysis
```

## 📈 Example Analysis Scenarios

### Scenario 1: Fed Meeting Impact Analysis
```typescript
// Analyze how Fed meetings affect bank stocks
const symbols = ['JPM', 'BAC', 'WFC', 'C'];
const results = await analyzeMarketImpact(symbols, '2023-01-01', '2024-01-31', {
  eventTimeWindow: 3, // 3 days before/after Fed meetings
  minCorrelationThreshold: 0.15,
  includeVolatilityAnalysis: true
});
```

### Scenario 2: Earnings Season Analysis
```typescript
// Analyze earnings impact on tech stocks
const symbols = ['AAPL', 'MSFT', 'GOOGL', 'META'];
const results = await analyzeMarketImpact(symbols, '2023-01-01', '2024-01-31', {
  eventTimeWindow: 2, // 2 days before/after earnings
  minCorrelationThreshold: 0.2,
  includeVolatilityAnalysis: true
});
```

### Scenario 3: Inflation Impact Analysis
```typescript
// Analyze how CPI releases affect different sectors
const symbols = ['XLF', 'XLE', 'XLK', 'XLY']; // Sector ETFs
const results = await analyzeMarketImpact(symbols, '2023-01-01', '2024-01-31', {
  eventTimeWindow: 1, // 1 day before/after CPI
  minCorrelationThreshold: 0.1,
  includeVolatilityAnalysis: true
});
```

## 🔍 Advanced Analysis Features

### 1. Event Correlation Matrix
```typescript
import { calculateEventCorrelationMatrix } from '../lib/advanced-analysis';

const correlationMatrix = calculateEventCorrelationMatrix(analysisResults);
// Shows which events tend to occur together and amplify effects
```

### 2. Sector Impact Analysis
```typescript
import { analyzeSectorImpact } from '../lib/sector-analysis';

const sectorImpacts = await analyzeSectorImpact([
  'XLF', // Financials
  'XLK', // Technology  
  'XLE', // Energy
  'XLV', // Healthcare
], economicEvents);
```

### 3. Volatility Clustering
```typescript
import { detectVolatilityClusters } from '../lib/volatility-analysis';

const clusters = detectVolatilityClusters(stockData, economicEvents);
// Identifies periods of high volatility around events
```

## 📊 Data Quality & Validation

### 1. Data Completeness Check
```typescript
import { validateDataCompleteness } from '../lib/data-validation';

const validation = validateDataCompleteness(stockData, economicEvents);
console.log(`Data completeness: ${validation.completeness}%`);
```

### 2. Outlier Detection
```typescript
import { detectOutliers } from '../lib/statistical-analysis';

const outliers = detectOutliers(stockMovements);
// Identifies unusual price movements that might skew analysis
```

### 3. Statistical Significance Testing
```typescript
import { performSignificanceTests } from '../lib/statistical-tests';

const tests = performSignificanceTests(correlationResults);
// Validates that correlations are statistically significant
```

## 🎯 Real-World Use Cases

### 1. Risk Management
- **Pre-event positioning**: Reduce position sizes before high-impact events
- **Volatility forecasting**: Predict volatility spikes around events
- **Correlation breakdown**: Identify when normal correlations break down

### 2. Trading Strategies
- **Event-driven trading**: Trade based on event probabilities and expected impacts
- **Mean reversion**: Identify oversold/overbought conditions after events
- **Momentum strategies**: Ride trends that emerge from events

### 3. Portfolio Management
- **Diversification**: Understand how events affect different assets
- **Hedging**: Use negatively correlated assets during events
- **Timing**: Optimize entry/exit timing around events

## 🔧 Troubleshooting

### Common Issues

1. **API Rate Limits**
   ```bash
   Error: API call frequency exceeded
   Solution: Implement request throttling or upgrade to paid plan
   ```

2. **Missing Data**
   ```bash
   Warning: No data found for symbol XYZ
   Solution: Check symbol validity and date ranges
   ```

3. **Network Timeouts**
   ```bash
   Error: Request timeout
   Solution: Implement retry logic with exponential backoff
   ```

### Performance Optimization

1. **Batch API Calls**
   ```typescript
   // Instead of individual calls, batch multiple symbols
   const batchResults = await Promise.all(
     symbols.map(symbol => fetchStockData(symbol, startDate, endDate))
   );
   ```

2. **Cache Results**
   ```typescript
   // Cache expensive API calls
   const cache = new Map();
   if (cache.has(cacheKey)) {
     return cache.get(cacheKey);
   }
   ```

3. **Parallel Processing**
   ```typescript
   // Process multiple symbols in parallel
   const results = await Promise.allSettled(
     symbols.map(symbol => analyzeSymbol(symbol))
   );
   ```

## 📚 Further Reading

- [FRED API Documentation](https://fred.stlouisfed.org/docs/api/)
- [Alpha Vantage API Documentation](https://www.alphavantage.co/documentation/)
- [Statistical Significance in Finance](https://www.investopedia.com/terms/s/statistical-significance.asp)
- [Event Study Methodology](https://en.wikipedia.org/wiki/Event_study)
- [Bayesian Statistics in Finance](https://www.quantstart.com/articles/Bayesian-Statistics-A-Beginners-Guide/)

## 🤝 Contributing

Want to add more data sources or analysis methods? Check out our [Contributing Guide](CONTRIBUTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.