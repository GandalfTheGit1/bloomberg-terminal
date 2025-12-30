# Probability Validation & Calibration Guide

## The Core Problem

In Scenario 1, we predicted an **80.8% probability** that the company will beat Q4 earnings. But how do we know if this is the "real" probability?

**Key Insight**: We can't know the true probability for a single event. However, we CAN validate our probability estimates by:
1. Making many predictions
2. Tracking outcomes
3. Measuring calibration (do 80% predictions come true ~80% of the time?)

---

## Method 1: Calibration Analysis (Recommended)

### What is Calibration?

Calibration measures whether predicted probabilities match actual frequencies:
- If you predict 80% probability for 100 events, approximately 80 should occur
- If you predict 50% probability for 100 events, approximately 50 should occur

### Example: Earnings Beat Predictions

**Collect Historical Data:**
```
Prediction 1: 80.8% → Outcome: Beat ✅
Prediction 2: 75.2% → Outcome: Beat ✅
Prediction 3: 62.1% → Outcome: Miss ❌
Prediction 4: 88.5% → Outcome: Beat ✅
Prediction 5: 45.3% → Outcome: Miss ❌
...
Prediction 100: 71.4% → Outcome: Beat ✅
```

**Calculate Calibration:**
```
Predictions in 80-90% range: 15 predictions
Actual outcomes: 12 beats out of 15 = 80% actual frequency
Predicted average: 85% probability
Calibration Error: |85% - 80%| = 5% (good calibration)
```

### Calibration Buckets

Group predictions by probability ranges:

| Probability Range | Count | Actual Outcomes | Calibration |
|------------------|-------|-----------------|-------------|
| 0-10%            | 8     | 0 (0%)          | ✅ Good     |
| 10-20%           | 12    | 1 (8%)          | ✅ Good     |
| 20-30%           | 15    | 4 (27%)         | ✅ Good     |
| 30-40%           | 18    | 11 (61%)        | ❌ Bad      |
| 40-50%           | 22    | 10 (45%)        | ✅ Good     |
| 50-60%           | 25    | 13 (52%)        | ✅ Good     |
| 60-70%           | 28    | 18 (64%)        | ✅ Good     |
| 70-80%           | 32    | 25 (78%)        | ✅ Good     |
| 80-90%           | 20    | 16 (80%)        | ✅ Good     |
| 90-100%          | 10    | 9 (90%)         | ✅ Good     |

**Interpretation**: If your 80-90% bucket has 80% actual outcomes, your probabilities are well-calibrated.

---

## Method 2: Brier Score (Quantitative Metric)

### Formula

```
Brier Score = (1/N) × Σ(predicted_probability - actual_outcome)²

Where:
- predicted_probability = your forecast (0-1)
- actual_outcome = 1 if event occurred, 0 if not
- Lower score = better predictions
```

### Example Calculation

```
Prediction 1: 0.808 probability, outcome = 1 (beat)
Error = (0.808 - 1)² = 0.037

Prediction 2: 0.752 probability, outcome = 1 (beat)
Error = (0.752 - 1)² = 0.061

Prediction 3: 0.621 probability, outcome = 0 (miss)
Error = (0.621 - 0)² = 0.386

Average Brier Score = (0.037 + 0.061 + 0.386) / 3 = 0.161

Interpretation:
- Perfect predictions: 0.0
- Random guessing (50%): 0.25
- Your score: 0.161 (good!)
```

---

## Method 3: Log Loss (Information Theory)

### Formula

```
Log Loss = -(1/N) × Σ[y × log(p) + (1-y) × log(1-p)]

Where:
- y = actual outcome (1 or 0)
- p = predicted probability
- Lower score = better predictions
```

### Example

```
Prediction 1: 0.808 probability, outcome = 1
Loss = -[1 × log(0.808) + 0 × log(0.192)] = -(-0.212) = 0.212

Prediction 2: 0.752 probability, outcome = 1
Loss = -[1 × log(0.752) + 0 × log(0.248)] = -(-0.285) = 0.285

Prediction 3: 0.621 probability, outcome = 0
Loss = -[0 × log(0.621) + 1 × log(0.379)] = -(-0.970) = 0.970

Average Log Loss = (0.212 + 0.285 + 0.970) / 3 = 0.489

Interpretation:
- Perfect predictions: 0.0
- Random guessing: 0.693
- Your score: 0.489 (good!)
```

---

## Method 4: ROC-AUC (Discrimination Ability)

### What It Measures

ROC-AUC measures how well your probabilities **discriminate** between outcomes:
- Can you distinguish between events that will occur vs. won't occur?
- Range: 0.5 (random) to 1.0 (perfect)

### Example

```
Sort predictions by probability (highest to lowest):

Rank | Probability | Actual Outcome
-----|-------------|---------------
1    | 0.95        | Beat ✅
2    | 0.88        | Beat ✅
3    | 0.82        | Beat ✅
4    | 0.75        | Miss ❌
5    | 0.72        | Beat ✅
6    | 0.65        | Miss ❌
7    | 0.58        | Miss ❌
8    | 0.45        | Miss ❌
9    | 0.32        | Miss ❌
10   | 0.15        | Miss ❌

ROC-AUC = 0.92 (excellent discrimination)
```

---

## Method 5: Real-World Validation for Earnings Beat

### Step 1: Collect Actual Earnings Data

```
Company: ACME Corp
Prediction Date: Jan 15, 2024
Predicted Probability: 80.8%
Predicted Impact: +8.5% stock price

Actual Earnings Release: Jan 30, 2024
Actual EPS: $2.15
Consensus EPS: $2.10
Beat Amount: +2.4%
Actual Stock Move: +7.2%

Outcome: ✅ BEAT (prediction was correct)
```

### Step 2: Track Multiple Predictions

```
Company | Pred Date | Pred Prob | Actual EPS | Consensus | Beat? | Stock Move
---------|-----------|-----------|-----------|-----------|-------|----------
ACME     | 1/15/24   | 80.8%     | $2.15     | $2.10     | ✅    | +7.2%
TECH     | 1/20/24   | 75.2%     | $1.85     | $1.90     | ❌    | -3.1%
RETAIL   | 1/25/24   | 62.1%     | $0.95     | $0.92     | ✅    | +2.8%
FINANCE  | 2/01/24   | 88.5%     | $3.42     | $3.40     | ✅    | +5.9%
ENERGY   | 2/05/24   | 45.3%     | $1.20     | $1.25     | ❌    | -1.5%
```

### Step 3: Calculate Calibration

```
Predictions in 80-90% range: 2 (ACME, FINANCE)
Actual beats: 2 out of 2 = 100%
Predicted average: 84.65%
Calibration: Good (100% vs 84.65%)

Predictions in 60-70% range: 1 (RETAIL)
Actual beats: 1 out of 1 = 100%
Predicted: 62.1%
Calibration: Slightly optimistic

Predictions in 40-50% range: 1 (ENERGY)
Actual beats: 0 out of 1 = 0%
Predicted: 45.3%
Calibration: Good (0% vs 45.3%)
```

---

## Method 6: Sensitivity Analysis

### Test Your Assumptions

For the 80.8% prediction, validate the inputs:

```
Assumption 1: Goldman Sachs upgrade reliability = 85%
- Check: How often do GS upgrades precede beats?
- Historical data: 82% of GS upgrades followed by beats
- Conclusion: 85% is reasonable ✅

Assumption 2: Company preannouncement likelihood = 85%
- Check: How often do preannouncements predict beats?
- Historical data: 88% of preannouncements followed by beats
- Conclusion: 85% is conservative ✅

Assumption 3: Social sentiment strength = 30%
- Check: How predictive is social sentiment?
- Historical data: 35% of bullish sentiment followed by beats
- Conclusion: 30% is reasonable ✅
```

---

## Method 7: Backtesting Framework

### Implement Continuous Validation

```typescript
interface PredictionRecord {
  eventId: string
  predictedProbability: number
  predictionDate: Date
  eventDate: Date
  actualOutcome: boolean
  notes: string
}

interface CalibrationMetrics {
  brier_score: number
  log_loss: number
  roc_auc: number
  calibration_error: number
  predictions_count: number
}

// Track predictions over time
const predictions: PredictionRecord[] = [
  {
    eventId: 'earnings-beat-q4-2024',
    predictedProbability: 0.808,
    predictionDate: new Date('2024-01-15'),
    eventDate: new Date('2024-01-30'),
    actualOutcome: true, // Beat occurred
    notes: 'GS upgrade + preannouncement'
  },
  // ... more predictions
]

// Calculate metrics
function calculateCalibration(predictions: PredictionRecord[]): CalibrationMetrics {
  // Group by probability buckets
  // Calculate actual frequency in each bucket
  // Compute Brier score, log loss, ROC-AUC
  // Return metrics
}
```

---

## Method 8: Comparison to Benchmarks

### Compare Against Alternatives

```
Your Bayesian Model:
- Brier Score: 0.161
- Log Loss: 0.489
- ROC-AUC: 0.92

Benchmark 1: Simple Consensus (always predict 50%)
- Brier Score: 0.25
- Log Loss: 0.693
- ROC-AUC: 0.50

Benchmark 2: Historical Base Rate (60% of companies beat)
- Brier Score: 0.24
- Log Loss: 0.673
- ROC-AUC: 0.55

Benchmark 3: Analyst Consensus Probability
- Brier Score: 0.18
- Log Loss: 0.512
- ROC-AUC: 0.88

Your Model vs Benchmarks:
✅ Better than random (50%)
✅ Better than base rate (60%)
✅ Competitive with analyst consensus
✅ Excellent discrimination (0.92 ROC-AUC)
```

---

## Practical Implementation: Validation Dashboard

### What to Track

```
Real-Time Metrics:
├── Calibration Curve
│   ├── Predicted vs Actual by bucket
│   ├── Perfect calibration line (y=x)
│   └── Your model's curve
├── Brier Score Trend
│   ├── Rolling 30-day average
│   ├── Rolling 90-day average
│   └── All-time average
├── Log Loss Trend
│   ├── Rolling 30-day average
│   ├── Rolling 90-day average
│   └── All-time average
├── ROC-AUC Trend
│   ├── Rolling 30-day average
│   ├── Rolling 90-day average
│   └── All-time average
└── Prediction Accuracy by Category
    ├── Earnings beats
    ├── Macro events
    ├── Industry events
    └── Company-specific events
```

---

## Key Takeaways

### How to Know if 80.8% is "Real"

1. **Single Event**: You can't know for certain. The event either happens (100%) or doesn't (0%).

2. **Multiple Events**: Track calibration over time:
   - If 80% predictions come true ~80% of the time → Well-calibrated ✅
   - If 80% predictions come true 90% of the time → Overconfident ❌
   - If 80% predictions come true 70% of the time → Underconfident ❌

3. **Validation Metrics**:
   - **Brier Score**: Lower is better (0 = perfect)
   - **Log Loss**: Lower is better (0 = perfect)
   - **ROC-AUC**: Higher is better (1 = perfect)
   - **Calibration Error**: Smaller is better (0 = perfect)

4. **Continuous Improvement**:
   - Monitor predictions vs outcomes
   - Adjust likelihood estimates based on historical accuracy
   - Refine evidence weighting
   - Update base rates

### The Bottom Line

The "real" probability is validated through **statistical calibration** over many predictions. A single 80.8% prediction is just an estimate. But if your model consistently produces well-calibrated probabilities, you can trust that 80.8% means the event has roughly an 80% chance of occurring.

---

## Example: Full Validation Cycle

### Month 1: Make Predictions
```
Predict 50 earnings beats with various probabilities
```

### Month 2: Collect Outcomes
```
Track which predictions were correct
```

### Month 3: Analyze Calibration
```
Calculate Brier score, log loss, ROC-AUC
Compare to benchmarks
Identify systematic biases
```

### Month 4: Adjust Model
```
Refine likelihood estimates
Update evidence weights
Improve base rates
```

### Month 5+: Continuous Monitoring
```
Track metrics on rolling basis
Alert if calibration degrades
Retrain model if needed
```

This is how professional forecasters validate their probability estimates!
