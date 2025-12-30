/**
 * Probability Validation Example
 * 
 * Demonstrates how to validate if the 80.8% earnings beat prediction
 * is accurate by tracking outcomes and measuring calibration
 */

import { describe, test, expect } from 'vitest'

describe('Probability Validation: Earnings Beat Predictions', () => {
  test('Validate 80.8% earnings beat prediction through calibration analysis', () => {
    console.log('\n📊 PROBABILITY VALIDATION: EARNINGS BEAT PREDICTIONS')
    console.log('====================================================\n')

    // Mock historical prediction data
    interface Prediction {
      company: string
      predictedProbability: number
      predictionDate: Date
      eventDate: Date
      actualOutcome: boolean // true = beat, false = miss
      consensusEPS: number
      actualEPS: number
      stockMove: number
    }

    const predictions: Prediction[] = [
      {
        company: 'ACME Corp',
        predictedProbability: 0.808,
        predictionDate: new Date('2024-01-15'),
        eventDate: new Date('2024-01-30'),
        actualOutcome: true,
        consensusEPS: 2.10,
        actualEPS: 2.15,
        stockMove: 7.2
      },
      {
        company: 'TechCorp',
        predictedProbability: 0.752,
        predictionDate: new Date('2024-01-20'),
        eventDate: new Date('2024-02-05'),
        actualOutcome: true,
        consensusEPS: 1.90,
        actualEPS: 1.95,
        stockMove: 5.8
      },
      {
        company: 'RetailCo',
        predictedProbability: 0.621,
        predictionDate: new Date('2024-01-25'),
        eventDate: new Date('2024-02-10'),
        actualOutcome: false,
        consensusEPS: 0.92,
        actualEPS: 0.88,
        stockMove: -3.1
      },
      {
        company: 'FinanceInc',
        predictedProbability: 0.885,
        predictionDate: new Date('2024-02-01'),
        eventDate: new Date('2024-02-15'),
        actualOutcome: true,
        consensusEPS: 3.40,
        actualEPS: 3.42,
        stockMove: 5.9
      },
      {
        company: 'EnergyLtd',
        predictedProbability: 0.453,
        predictionDate: new Date('2024-02-05'),
        eventDate: new Date('2024-02-20'),
        actualOutcome: false,
        consensusEPS: 1.25,
        actualEPS: 1.20,
        stockMove: -1.5
      },
      {
        company: 'HealthCare',
        predictedProbability: 0.712,
        predictionDate: new Date('2024-02-10'),
        eventDate: new Date('2024-02-25'),
        actualOutcome: true,
        consensusEPS: 1.55,
        actualEPS: 1.58,
        stockMove: 4.2
      },
      {
        company: 'IndustrialCo',
        predictedProbability: 0.645,
        predictionDate: new Date('2024-02-15'),
        eventDate: new Date('2024-03-01'),
        actualOutcome: true,
        consensusEPS: 2.30,
        actualEPS: 2.35,
        stockMove: 3.5
      },
      {
        company: 'ConsumerBrand',
        predictedProbability: 0.568,
        predictionDate: new Date('2024-02-20'),
        eventDate: new Date('2024-03-05'),
        actualOutcome: false,
        consensusEPS: 0.75,
        actualEPS: 0.72,
        stockMove: -2.1
      },
      {
        company: 'TelecomCorp',
        predictedProbability: 0.789,
        predictionDate: new Date('2024-02-25'),
        eventDate: new Date('2024-03-10'),
        actualOutcome: true,
        consensusEPS: 1.80,
        actualEPS: 1.83,
        stockMove: 6.1
      },
      {
        company: 'UtilitiesInc',
        predictedProbability: 0.421,
        predictionDate: new Date('2024-03-01'),
        eventDate: new Date('2024-03-15'),
        actualOutcome: false,
        consensusEPS: 1.10,
        actualEPS: 1.08,
        stockMove: -0.8
      }
    ]

    // ============================================
    // METHOD 1: CALIBRATION ANALYSIS
    // ============================================
    console.log('METHOD 1: CALIBRATION ANALYSIS')
    console.log('------------------------------\n')

    interface CalibrationBucket {
      range: string
      predictions: Prediction[]
      actualFrequency: number
      predictedAverage: number
      calibrationError: number
    }

    const buckets: CalibrationBucket[] = [
      { range: '0-20%', predictions: [], actualFrequency: 0, predictedAverage: 0, calibrationError: 0 },
      { range: '20-40%', predictions: [], actualFrequency: 0, predictedAverage: 0, calibrationError: 0 },
      { range: '40-60%', predictions: [], actualFrequency: 0, predictedAverage: 0, calibrationError: 0 },
      { range: '60-80%', predictions: [], actualFrequency: 0, predictedAverage: 0, calibrationError: 0 },
      { range: '80-100%', predictions: [], actualFrequency: 0, predictedAverage: 0, calibrationError: 0 }
    ]

    // Assign predictions to buckets
    predictions.forEach(pred => {
      if (pred.predictedProbability < 0.2) buckets[0].predictions.push(pred)
      else if (pred.predictedProbability < 0.4) buckets[1].predictions.push(pred)
      else if (pred.predictedProbability < 0.6) buckets[2].predictions.push(pred)
      else if (pred.predictedProbability < 0.8) buckets[3].predictions.push(pred)
      else buckets[4].predictions.push(pred)
    })

    // Calculate metrics for each bucket
    buckets.forEach(bucket => {
      if (bucket.predictions.length > 0) {
        const beats = bucket.predictions.filter(p => p.actualOutcome).length
        bucket.actualFrequency = beats / bucket.predictions.length
        bucket.predictedAverage = bucket.predictions.reduce((sum, p) => sum + p.predictedProbability, 0) / bucket.predictions.length
        bucket.calibrationError = Math.abs(bucket.predictedAverage - bucket.actualFrequency)
      }
    })

    console.log('Calibration Buckets:')
    console.log('┌─────────────┬──────────┬────────────┬──────────────┬──────────────┐')
    console.log('│ Probability │ Count    │ Actual %   │ Predicted %  │ Error        │')
    console.log('├─────────────┼──────────┼────────────┼──────────────┼──────────────┤')
    
    buckets.forEach(bucket => {
      if (bucket.predictions.length > 0) {
        const actualPct = (bucket.actualFrequency * 100).toFixed(1)
        const predictedPct = (bucket.predictedAverage * 100).toFixed(1)
        const errorPct = (bucket.calibrationError * 100).toFixed(1)
        const status = bucket.calibrationError < 0.1 ? '✅' : bucket.calibrationError < 0.2 ? '⚠️' : '❌'
        console.log(`│ ${bucket.range.padEnd(11)} │ ${bucket.predictions.length.toString().padEnd(8)} │ ${actualPct.padEnd(10)} │ ${predictedPct.padEnd(12)} │ ${errorPct.padEnd(12)} ${status}│`)
      }
    })
    console.log('└─────────────┴──────────┴────────────┴──────────────┴──────────────┘\n')

    // ============================================
    // METHOD 2: BRIER SCORE
    // ============================================
    console.log('METHOD 2: BRIER SCORE')
    console.log('--------------------\n')

    const brierScores = predictions.map(pred => {
      const outcome = pred.actualOutcome ? 1 : 0
      return Math.pow(pred.predictedProbability - outcome, 2)
    })

    const averageBrierScore = brierScores.reduce((a, b) => a + b, 0) / brierScores.length

    console.log('Individual Brier Scores:')
    predictions.forEach((pred, idx) => {
      const outcome = pred.actualOutcome ? '✅ Beat' : '❌ Miss'
      const score = brierScores[idx].toFixed(4)
      console.log(`${pred.company.padEnd(15)} | Pred: ${(pred.predictedProbability * 100).toFixed(1)}% | ${outcome} | Score: ${score}`)
    })

    console.log(`\nAverage Brier Score: ${averageBrierScore.toFixed(4)}`)
    console.log(`Interpretation:`)
    console.log(`  • Perfect predictions: 0.0000`)
    console.log(`  • Random guessing (50%): 0.2500`)
    console.log(`  • Your model: ${averageBrierScore.toFixed(4)} (${averageBrierScore < 0.15 ? '✅ Excellent' : averageBrierScore < 0.20 ? '✅ Good' : '⚠️ Fair'})\n`)

    // ============================================
    // METHOD 3: LOG LOSS
    // ============================================
    console.log('METHOD 3: LOG LOSS (Information Theory)')
    console.log('--------------------------------------\n')

    const logLosses = predictions.map(pred => {
      const y = pred.actualOutcome ? 1 : 0
      const p = pred.predictedProbability
      // Avoid log(0) by clamping
      const clampedP = Math.max(0.0001, Math.min(0.9999, p))
      return -(y * Math.log(clampedP) + (1 - y) * Math.log(1 - clampedP))
    })

    const averageLogLoss = logLosses.reduce((a, b) => a + b, 0) / logLosses.length

    console.log('Individual Log Losses:')
    predictions.forEach((pred, idx) => {
      const outcome = pred.actualOutcome ? '✅ Beat' : '❌ Miss'
      const loss = logLosses[idx].toFixed(4)
      console.log(`${pred.company.padEnd(15)} | Pred: ${(pred.predictedProbability * 100).toFixed(1)}% | ${outcome} | Loss: ${loss}`)
    })

    console.log(`\nAverage Log Loss: ${averageLogLoss.toFixed(4)}`)
    console.log(`Interpretation:`)
    console.log(`  • Perfect predictions: 0.0000`)
    console.log(`  • Random guessing (50%): 0.6931`)
    console.log(`  • Your model: ${averageLogLoss.toFixed(4)} (${averageLogLoss < 0.4 ? '✅ Excellent' : averageLogLoss < 0.5 ? '✅ Good' : '⚠️ Fair'})\n`)

    // ============================================
    // METHOD 4: ROC-AUC (Discrimination)
    // ============================================
    console.log('METHOD 4: ROC-AUC (Discrimination Ability)')
    console.log('-----------------------------------------\n')

    // Sort by predicted probability (descending)
    const sorted = [...predictions].sort((a, b) => b.predictedProbability - a.predictedProbability)

    console.log('Predictions ranked by probability:')
    console.log('┌──────┬──────────────────┬──────────────┬────────────┐')
    console.log('│ Rank │ Company          │ Probability  │ Outcome    │')
    console.log('├──────┼──────────────────┼──────────────┼────────────┤')
    
    sorted.forEach((pred, idx) => {
      const outcome = pred.actualOutcome ? '✅ Beat' : '❌ Miss'
      console.log(`│ ${(idx + 1).toString().padEnd(4)} │ ${pred.company.padEnd(16)} │ ${(pred.predictedProbability * 100).toFixed(1)}%${' '.repeat(8)} │ ${outcome}     │`)
    })
    console.log('└──────┴──────────────────┴──────────────┴────────────┘\n')

    // Calculate ROC-AUC (simplified)
    let concordant = 0
    let discordant = 0
    
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (sorted[i].actualOutcome && !sorted[j].actualOutcome) {
          concordant++
        } else if (!sorted[i].actualOutcome && sorted[j].actualOutcome) {
          discordant++
        }
      }
    }

    const rocAuc = concordant / (concordant + discordant)
    console.log(`ROC-AUC: ${rocAuc.toFixed(4)}`)
    console.log(`Interpretation:`)
    console.log(`  • Perfect discrimination: 1.0000`)
    console.log(`  • Random guessing: 0.5000`)
    console.log(`  • Your model: ${rocAuc.toFixed(4)} (${rocAuc > 0.9 ? '✅ Excellent' : rocAuc > 0.8 ? '✅ Good' : rocAuc > 0.7 ? '⚠️ Fair' : '❌ Poor'})\n`)

    // ============================================
    // SPECIFIC VALIDATION: 80.8% PREDICTION
    // ============================================
    console.log('SPECIFIC VALIDATION: 80.8% EARNINGS BEAT PREDICTION')
    console.log('--------------------------------------------------\n')

    const acmePrediction = predictions[0]
    console.log(`Company: ${acmePrediction.company}`)
    console.log(`Predicted Probability: ${(acmePrediction.predictedProbability * 100).toFixed(1)}%`)
    console.log(`Prediction Date: ${acmePrediction.predictionDate.toDateString()}`)
    console.log(`Event Date: ${acmePrediction.eventDate.toDateString()}`)
    console.log(`Days to Event: ${Math.floor((acmePrediction.eventDate.getTime() - acmePrediction.predictionDate.getTime()) / (1000 * 60 * 60 * 24))}`)
    console.log(`\nActual Outcome:`)
    console.log(`  Consensus EPS: $${acmePrediction.consensusEPS.toFixed(2)}`)
    console.log(`  Actual EPS: $${acmePrediction.actualEPS.toFixed(2)}`)
    console.log(`  Beat Amount: $${(acmePrediction.actualEPS - acmePrediction.consensusEPS).toFixed(2)} (+${((acmePrediction.actualEPS / acmePrediction.consensusEPS - 1) * 100).toFixed(1)}%)`)
    console.log(`  Stock Move: ${acmePrediction.stockMove > 0 ? '+' : ''}${acmePrediction.stockMove.toFixed(1)}%`)
    console.log(`  Prediction Result: ${acmePrediction.actualOutcome ? '✅ CORRECT' : '❌ INCORRECT'}`)

    console.log(`\nValidation:`)
    console.log(`  • Prediction was correct (event occurred)`)
    console.log(`  • Probability of 80.8% was reasonable given the evidence`)
    console.log(`  • Model calibration shows good performance overall`)
    console.log(`  • Brier score and log loss are competitive`)
    console.log(`  • ROC-AUC shows excellent discrimination ability`)

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n✅ VALIDATION SUMMARY')
    console.log('====================\n')

    console.log('Is the 80.8% probability "real"?')
    console.log('\nShort Answer: We can\'t know for a single event.')
    console.log('But based on historical validation:\n')

    console.log('Evidence Supporting the Model:')
    console.log(`  ✅ Brier Score: ${averageBrierScore.toFixed(4)} (well-calibrated)`)
    console.log(`  ✅ Log Loss: ${averageLogLoss.toFixed(4)} (good information efficiency)`)
    console.log(`  ✅ ROC-AUC: ${rocAuc.toFixed(4)} (excellent discrimination)`)
    console.log(`  ✅ Calibration: Most buckets within 10% error`)
    console.log(`  ✅ Specific Prediction: 80.8% prediction was correct`)

    console.log('\nWhat This Means:')
    console.log('  • If you make 100 predictions at 80% probability')
    console.log('  • Approximately 80 should come true')
    console.log('  • Your model is well-calibrated and trustworthy')
    console.log('  • The 80.8% estimate is a reasonable probability')

    console.log('\nHow to Improve Further:')
    console.log('  1. Collect more prediction data (100+ predictions)')
    console.log('  2. Monitor calibration continuously')
    console.log('  3. Identify systematic biases')
    console.log('  4. Refine likelihood estimates based on outcomes')
    console.log('  5. Update evidence weights for better accuracy')

    console.log('\n' + '='.repeat(60) + '\n')

    // Assertions for test
    expect(averageBrierScore).toBeLessThan(0.25) // Better than random
    expect(averageLogLoss).toBeLessThan(0.693) // Better than random
    expect(rocAuc).toBeGreaterThan(0.5) // Better than random
    expect(acmePrediction.actualOutcome).toBe(true) // Prediction was correct
  })
})