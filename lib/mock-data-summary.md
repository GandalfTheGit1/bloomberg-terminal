# Bayesian Update Engine - Mock Data Summary

## Overview
This document summarizes the mock data and scenarios used to demonstrate the Bayesian update engine in practice.

## Mock Financial Events

### 1. Q4 Earnings Beat Event
- **Initial Probability**: 65%
- **Description**: Company will beat Q4 2024 earnings estimates by >5%
- **Expected Impact**: +8.5% stock price increase
- **Event Type**: Company-specific

### 2. Fed Rate Cut Event
- **Initial Probability**: 40%
- **Description**: Federal Reserve will cut interest rates by 25bps in March
- **Expected Impact**: +12.0% market cap increase
- **Event Type**: Macro economic

## Mock Signals (Data Sources)

### 1. Goldman Sachs Analyst Report
- **Type**: Financial
- **Reliability**: 85%
- **Data**: Buy rating, $185 target price, High confidence

### 2. Company Preannouncement
- **Type**: Financial  
- **Reliability**: 95%
- **Data**: Above consensus guidance, significant magnitude

### 3. Fed Chair Speech
- **Type**: Macro
- **Reliability**: 90%
- **Data**: Dovish tone, data-dependent keywords, positive market reaction

### 4. Social Media Sentiment
- **Type**: Social
- **Reliability**: 60%
- **Data**: 75% sentiment score, high volume, 12 influencer mentions

### 5. Strong Jobs Report
- **Type**: Macro
- **Reliability**: 95%
- **Data**: 3.5% unemployment, 275K jobs added, 4.2% wage growth

## Mock Evidence Assessments

### Strong Support Evidence
- **Supports**: True
- **Strength**: 80%
- **Likelihood**: 85% (chance evidence appears if hypothesis is true)

### Moderate Support Evidence
- **Supports**: True
- **Strength**: 60%
- **Likelihood**: 70%

### Weak Support Evidence
- **Supports**: True
- **Strength**: 30%
- **Likelihood**: 55%

### Contradictory Evidence
- **Supports**: False
- **Strength**: 70%
- **Likelihood**: 20% (low chance evidence appears if hypothesis is true)

## Demonstration Results

### Scenario 1: Earnings Beat Updates
1. **Goldman Sachs Upgrade**: 65% → 69.7% (+4.7 points)
2. **Company Preannouncement**: 69.7% → 81.4% (+11.7 points)
3. **Social Sentiment**: 81.4% → 80.8% (-0.6 points)
4. **Final Result**: 80.8% probability (+15.8 points total)
5. **Expected Value**: 6.87% stock price gain

### Scenario 2: Fed Rate Cut Updates
1. **Dovish Fed Speech**: 40% → 42.3% (+2.3 points)
2. **Strong Jobs Report**: 42.3% → 12.1% (-30.2 points)
3. **Final Result**: 12.1% probability (-27.9 points total)
4. **Expected Value**: 1.45% market cap gain

### Scenario 3: Edge Cases
- **Extreme Update**: 10% → 95% (