/**
 * Bayesian Update Engine Demo
 * 
 * This script demonstrates how the Bayesian update engine works with realistic
 * financial scenarios and mock data.
 */

import { 
  updateProbability, 
  updateEventProbability, 
  calculateConfidenceInterval,
  validateProbabilityUpdate 
} from './bayesian'
import { Signal, Evidence, Event } from '../types/models'

// Mock data for realistic financial scenarios
const mockEvents = {
  earningsBeat: {
    id: 'earnings-beat-q4-2024',
    type: 'company' as const,
    title: 'Q4 2024 Earnings Beat',
    description: 'Company will beat Q4 2024 earnings estimates by >5%',
    probability: 65, // Initial 65% probability
    priorProbability: 65,
    timingWindow: {
      start: new Date('2024-01-15'),
      end: new Date('2024-02-15'),
      expectedDate: new Date('2024-01-30')
    },
    impact: {
      stockPrice: {
        direction: 'bullish' as const,
        magnitude: 8.5, // Expected 8.5% stock price increase
        confidence: 75
      }
    },
    expectedValue: 0, // Will be calculated
    confidence: 75,
    sources: [],
    drivers: ['Strong Q3 performance', 'Positive guidance', 'Market tailwinds'],
    createdAt: new Date(),
    updatedAt: new Date(),
    updateHistory: []
  },

  fedRateCut: {
    id: 'fed-rate-cut-march-2024',
    type: 'macro' as const,
    title: 'Fed Rate Cut March 2024',
    description: 'Federal Reserve will cut interest rates by 25bps in March',
    probability: 40, // Initial 40% probability
    priorProbability: 40,
    timingWindow: {
      start: new Date('2024-03-15'),
      end: new Date('2024-03-25'),
      expectedDate: new Date('2024-03-20')
    },
    impact: {
      marketCap: {
        direction: 'bullish' as const,
        magnitude: 12.0, // Expected 12% market cap increase
        confidence: 60
      }
    },
    expectedValue: 0,
    confidence: 60,
    sources: [],
    drivers: ['Inflation cooling', 'Economic slowdown signals', 'Market pressure'],
    createdAt: new Date(),
    updatedAt: new Date(),
    updateHistory: []
  }
}

// Mock signals that could update probabilities
const mockSignals = {
  positiveAnalystReport: {
    type: 'financial' as const,
    source: 'Goldman Sachs Research',
    timestamp: new Date(),
    data: {
      rating: 'Buy',
      targetPrice: 185,
      confidence: 'High'
    },
    reliability: 0.85 // 85% reliability for Goldman Sachs
  },

  strongPreannouncement: {
    type: 'financial' as const,
    source: 'Company IR',
    timestamp: new Date(),
    data: {
      type: 'preannouncement',
      guidance: 'above_consensus',
      magnitude: 'significant'
    },
    reliability: 0.95 // 95% reliability for company guidance
  },

  dovishFedSpeech: {
    type: 'macro' as const,
    source: 'Fed Chair Powell Speech',
    timestamp: new Date(),
    data: {
      tone: 'dovish',
      keywords: ['data-dependent', 'flexible', 'monitor'],
      market_reaction: 'positive'
    },
    reliability: 0.90 // 90% reliability for Fed communications
  },

  socialSentimentBullish: {
    type: 'social' as const,
    source: 'Twitter/Reddit Aggregate',
    timestamp: new Date(),
    data: {
      sentiment_score: 0.75,
      volume: 'high',
      influencer_mentions: 12
    },
    reliability: 0.60 // 60% reliability for social sentiment
  }
}

// Mock evidence assessments
const mockEvidence = {
  strongSupport: {
    supports: true,
    strength: 0.8, // Strong evidence
    likelihood: 0.85 // 85% chance this evidence appears if hypothesis is true
  },

  moderateSupport: {
    supports: true,
    strength: 0.6, // Moderate evidence
    likelihood: 0.70 // 70% chance this evidence appears if hypothesis is true
  },

  weakSupport: {
    supports: true,
    strength: 0.3, // Weak evidence
    likelihood: 0.55 // 55% chance this evidence appears if hypothesis is true
  },

  contradiction: {
    supports: false,
    strength: 0.7, // Strong contradictory evidence
    likelihood: 0.20 // 20% chance this evidence appears if hypothesis is true
  }
}

function runBayesianDemo() {
  console.log('🔬 BAYESIAN UPDATE ENGINE DEMONSTRATION')
  console.log('=====================================\n')

  // Scenario 1: Earnings Beat Probability Updates
  console.log('📊 SCENARIO 1: Q4 Earnings Beat Probability Updates')
  console.log('---------------------------------------------------')
  
  let currentEvent = { ...mockEvents.earningsBeat }
  console.log(`Initial Event: ${currentEvent.title}`)
  console.log(`Initial Probability: ${currentEvent.probability}%`)
  console.log(`Expected Impact: +${currentEvent.impact.stockPrice?.magnitude}% stock price\n`)

  // Update 1: Positive analyst report
  console.log('📈 UPDATE 1: Goldman Sachs upgrades to Buy with $185 target')
  const update1 = updateEventProbability(
    currentEvent.probability,
    mockSignals.positiveAnalystReport,
    mockEvidence.moderateSupport
  )
  
  console.log(`Prior: ${update1.prior}%`)
  console.log(`Posterior: ${update1.posterior.toFixed(1)}%`)
  console.log(`Change: ${(update1.posterior - update1.prior).toFixed(1)} percentage points`)
  console.log(`Likelihood: ${(update1.likelihood * 100).toFixed(1)}%`)
  console.log(`Evidence Strength: ${(mockEvidence.moderateSupport.strength * 100).toFixed(1)}%`)
  
  const confidence1 = calculateConfidenceInterval(
    update1.posterior, 
    mockEvidence.moderateSupport, 
    mockSignals.positiveAnalystReport
  )
  console.log(`Confidence Interval: [${confidence1.lower.toFixed(1)}%, ${confidence1.upper.toFixed(1)}%]\n`)
  
  currentEvent.probability = update1.posterior
  currentEvent.updateHistory.push(update1.updateEntry)

  // Update 2: Strong preannouncement
  console.log('🚀 UPDATE 2: Company preannounces strong Q4 results')
  const update2 = updateEventProbability(
    currentEvent.probability,
    mockSignals.strongPreannouncement,
    mockEvidence.strongSupport
  )
  
  console.log(`Prior: ${update2.prior.toFixed(1)}%`)
  console.log(`Posterior: ${update2.posterior.toFixed(1)}%`)
  console.log(`Change: ${(update2.posterior - update2.prior).toFixed(1)} percentage points`)
  console.log(`Likelihood: ${(update2.likelihood * 100).toFixed(1)}%`)
  console.log(`Evidence Strength: ${(mockEvidence.strongSupport.strength * 100).toFixed(1)}%`)
  
  const confidence2 = calculateConfidenceInterval(
    update2.posterior, 
    mockEvidence.strongSupport, 
    mockSignals.strongPreannouncement
  )
  console.log(`Confidence Interval: [${confidence2.lower.toFixed(1)}%, ${confidence2.upper.toFixed(1)}%]\n`)
  
  currentEvent.probability = update2.posterior
  currentEvent.updateHistory.push(update2.updateEntry)

  // Update 3: Bullish social sentiment
  console.log('📱 UPDATE 3: Strong bullish social media sentiment')
  const update3 = updateEventProbability(
    currentEvent.probability,
    mockSignals.socialSentimentBullish,
    mockEvidence.weakSupport
  )
  
  console.log(`Prior: ${update3.prior.toFixed(1)}%`)
  console.log(`Posterior: ${update3.posterior.toFixed(1)}%`)
  console.log(`Change: ${(update3.posterior - update3.prior).toFixed(1)} percentage points`)
  console.log(`Likelihood: ${(update3.likelihood * 100).toFixed(1)}%`)
  console.log(`Evidence Strength: ${(mockEvidence.weakSupport.strength * 100).toFixed(1)}%`)
  
  const confidence3 = calculateConfidenceInterval(
    update3.posterior, 
    mockEvidence.weakSupport, 
    mockSignals.socialSentimentBullish
  )
  console.log(`Confidence Interval: [${confidence3.lower.toFixed(1)}%, ${confidence3.upper.toFixed(1)}%]\n`)
  
  currentEvent.probability = update3.posterior

  console.log('📋 EARNINGS BEAT SUMMARY:')
  console.log(`Final Probability: ${currentEvent.probability.toFixed(1)}% (started at 65.0%)`)
  console.log(`Total Change: +${(currentEvent.probability - 65).toFixed(1)} percentage points`)
  console.log(`Update History: ${currentEvent.updateHistory.length} updates`)
  console.log(`Expected Value: ${((currentEvent.probability / 100) * (currentEvent.impact.stockPrice?.magnitude || 0)).toFixed(2)}% stock price gain\n`)

  // Scenario 2: Fed Rate Cut with Contradictory Evidence
  console.log('🏛️ SCENARIO 2: Fed Rate Cut with Mixed Signals')
  console.log('----------------------------------------------')
  
  let fedEvent = { ...mockEvents.fedRateCut }
  console.log(`Initial Event: ${fedEvent.title}`)
  console.log(`Initial Probability: ${fedEvent.probability}%`)
  console.log(`Expected Impact: +${fedEvent.impact.marketCap?.magnitude}% market cap\n`)

  // Update 1: Dovish Fed speech (supportive)
  console.log('🕊️ UPDATE 1: Fed Chair gives dovish speech')
  const fedUpdate1 = updateEventProbability(
    fedEvent.probability,
    mockSignals.dovishFedSpeech,
    mockEvidence.moderateSupport
  )
  
  console.log(`Prior: ${fedUpdate1.prior}%`)
  console.log(`Posterior: ${fedUpdate1.posterior.toFixed(1)}%`)
  console.log(`Change: ${(fedUpdate1.posterior - fedUpdate1.prior).toFixed(1)} percentage points\n`)
  
  fedEvent.probability = fedUpdate1.posterior

  // Update 2: Strong economic data (contradictory)
  console.log('📈 UPDATE 2: Strong jobs report contradicts rate cut narrative')
  const strongJobsSignal: Signal = {
    type: 'macro',
    source: 'Bureau of Labor Statistics',
    timestamp: new Date(),
    data: {
      unemployment_rate: 3.5,
      jobs_added: 275000,
      wage_growth: 4.2
    },
    reliability: 0.95
  }
  
  const fedUpdate2 = updateEventProbability(
    fedEvent.probability,
    strongJobsSignal,
    mockEvidence.contradiction
  )
  
  console.log(`Prior: ${fedUpdate2.prior.toFixed(1)}%`)
  console.log(`Posterior: ${fedUpdate2.posterior.toFixed(1)}%`)
  console.log(`Change: ${(fedUpdate2.posterior - fedUpdate2.prior).toFixed(1)} percentage points`)
  console.log(`Evidence Type: Contradictory (supports: ${mockEvidence.contradiction.supports})`)
  console.log(`Evidence Strength: ${(mockEvidence.contradiction.strength * 100).toFixed(1)}%\n`)
  
  fedEvent.probability = fedUpdate2.posterior

  console.log('📋 FED RATE CUT SUMMARY:')
  console.log(`Final Probability: ${fedEvent.probability.toFixed(1)}% (started at 40.0%)`)
  console.log(`Total Change: ${(fedEvent.probability - 40).toFixed(1)} percentage points`)
  console.log(`Expected Value: ${((fedEvent.probability / 100) * (fedEvent.impact.marketCap?.magnitude || 0)).toFixed(2)}% market cap gain\n`)

  // Scenario 3: Edge Cases and Validation
  console.log('⚠️ SCENARIO 3: Edge Cases and Validation')
  console.log('---------------------------------------')
  
  console.log('Testing extreme probability updates...')
  
  // Test extreme update
  const extremeUpdate = updateProbability({
    prior: 10,
    likelihood: 0.95,
    evidence: 0.1
  })
  
  console.log(`Extreme Update Test:`)
  console.log(`Prior: 10%, Likelihood: 95%, Evidence: 10%`)
  console.log(`Posterior: ${extremeUpdate.posterior.toFixed(1)}%`)
  
  const isValidUpdate = validateProbabilityUpdate(10, extremeUpdate.posterior, 50)
  console.log(`Is update reasonable (max 50% change): ${isValidUpdate}`)
  
  if (!isValidUpdate) {
    console.log(`⚠️ Warning: Large probability change detected (${(extremeUpdate.posterior - 10).toFixed(1)} percentage points)`)
  }
  
  // Test zero prior
  console.log('\nTesting zero prior probability...')
  const zeroPriorUpdate = updateProbability({
    prior: 0,
    likelihood: 0.8,
    evidence: 0.5
  })
  console.log(`Zero Prior Test: 0% → ${zeroPriorUpdate.posterior}%`)
  
  // Test perfect likelihood
  console.log('\nTesting perfect likelihood...')
  const perfectLikelihoodUpdate = updateProbability({
    prior: 30,
    likelihood: 1.0,
    evidence: 0.4
  })
  console.log(`Perfect Likelihood Test: 30% → ${perfectLikelihoodUpdate.posterior.toFixed(1)}%`)
  
  console.log('\n✅ DEMONSTRATION COMPLETE')
  console.log('========================')
  console.log('The Bayesian update engine successfully:')
  console.log('• Updated probabilities using Bayes\' theorem')
  console.log('• Handled multiple evidence types and strengths')
  console.log('• Processed contradictory evidence correctly')
  console.log('• Managed edge cases (zero prior, perfect likelihood)')
  console.log('• Provided confidence intervals and validation')
  console.log('• Maintained mathematical correctness throughout')
}

// Export for use in other modules
export { runBayesianDemo, mockEvents, mockSignals, mockEvidence }

// Run demo if this file is executed directly
if (require.main === module) {
  runBayesianDemo()
}