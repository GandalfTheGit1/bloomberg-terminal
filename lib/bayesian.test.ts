import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { 
  updateProbability, 
  updateEventProbability, 
  calculateConfidenceInterval,
  validateProbabilityUpdate,
  handleEdgeCases,
  BayesianUpdateInput 
} from './bayesian'
import { Signal, Evidence } from '../types/models'

// Generators for property-based testing
const validPriorArb = fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true })
const validLikelihoodArb = fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true })
const validEvidenceArb = fc.float({ min: Math.fround(0.001), max: Math.fround(1), noNaN: true }) // Avoid zero to prevent division issues

const bayesianInputArb: fc.Arbitrary<BayesianUpdateInput> = fc.record({
  prior: validPriorArb,
  likelihood: validLikelihoodArb,
  evidence: validEvidenceArb
})

const signalArb: fc.Arbitrary<Signal> = fc.record({
  type: fc.constantFrom('market_data', 'social', 'financial', 'news', 'macro'),
  source: fc.string({ minLength: 1 }),
  timestamp: fc.date(),
  data: fc.anything(),
  reliability: fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true })
})

const evidenceArb: fc.Arbitrary<Evidence> = fc.record({
  supports: fc.boolean(),
  strength: fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
  likelihood: fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true })
})

describe('Bayesian Update Engine Property Tests', () => {
  test('Property 3: Bayesian Update Correctness - Feature: ai-financial-terminal, Property 3: Bayesian Update Correctness', () => {
    // **Validates: Requirements 1.4**
    fc.assert(
      fc.property(bayesianInputArb, (input: BayesianUpdateInput) => {
        const result = updateProbability(input)
        
        // Verify Bayes' theorem: P(H|E) = P(E|H) × P(H) / P(E)
        const priorProb = input.prior / 100
        const expectedPosteriorProb = (input.likelihood * priorProb) / input.evidence
        const expectedPosterior = Math.max(0, Math.min(100, expectedPosteriorProb * 100))
        
        // Allow for small floating point differences
        const tolerance = 0.0001
        expect(Math.abs(result.posterior - expectedPosterior)).toBeLessThan(tolerance)
        
        // Verify result structure
        expect(result.prior).toBe(input.prior)
        expect(result.likelihood).toBe(input.likelihood)
        expect(result.evidence).toBe(input.evidence)
        
        // Verify posterior is within valid bounds
        expect(result.posterior).toBeGreaterThanOrEqual(0)
        expect(result.posterior).toBeLessThanOrEqual(100)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property: Posterior probability bounds are always valid', () => {
    fc.assert(
      fc.property(bayesianInputArb, (input: BayesianUpdateInput) => {
        const result = updateProbability(input)
        
        // Posterior must always be between 0 and 100
        expect(result.posterior).toBeGreaterThanOrEqual(0)
        expect(result.posterior).toBeLessThanOrEqual(100)
        expect(Number.isFinite(result.posterior)).toBe(true)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property: Prior probability is preserved in result', () => {
    fc.assert(
      fc.property(bayesianInputArb, (input: BayesianUpdateInput) => {
        const result = updateProbability(input)
        
        // Prior should be unchanged in the result
        expect(result.prior).toBe(input.prior)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property: Extreme likelihood values produce expected results', () => {
    fc.assert(
      fc.property(
        validPriorArb,
        validEvidenceArb,
        (prior: number, evidence: number) => {
          // Test likelihood = 0 (evidence never occurs given hypothesis)
          const resultZero = updateProbability({ prior, likelihood: 0, evidence })
          expect(resultZero.posterior).toBe(0)
          
          // Test likelihood = 1 (evidence always occurs given hypothesis)
          const resultOne = updateProbability({ prior, likelihood: 1, evidence })
          const expectedPosterior = Math.min(100, (prior / 100) / evidence * 100)
          expect(Math.abs(resultOne.posterior - expectedPosterior)).toBeLessThan(0.0001)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property: Event probability update creates valid history entry', () => {
    fc.assert(
      fc.property(
        validPriorArb,
        signalArb,
        evidenceArb,
        (currentProbability: number, signal: Signal, evidence: Evidence) => {
          const result = updateEventProbability(currentProbability, signal, evidence)
          
          // Verify update entry structure
          expect(result.updateEntry).toBeDefined()
          expect(result.updateEntry.prior).toBe(result.prior)
          expect(result.updateEntry.posterior).toBe(result.posterior)
          expect(result.updateEntry.signal).toBe(signal)
          expect(result.updateEntry.evidence).toBe(evidence)
          expect(result.updateEntry.timestamp).toBeInstanceOf(Date)
          
          // Verify posterior is within bounds
          expect(result.posterior).toBeGreaterThanOrEqual(0)
          expect(result.posterior).toBeLessThanOrEqual(100)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property: Confidence intervals are properly bounded', () => {
    fc.assert(
      fc.property(
        validPriorArb,
        evidenceArb,
        signalArb,
        (probability: number, evidence: Evidence, signal: Signal) => {
          const interval = calculateConfidenceInterval(probability, evidence, signal)
          
          // Lower bound should be <= probability <= upper bound
          expect(interval.lower).toBeLessThanOrEqual(probability)
          expect(interval.upper).toBeGreaterThanOrEqual(probability)
          
          // Bounds should be within [0, 100]
          expect(interval.lower).toBeGreaterThanOrEqual(0)
          expect(interval.upper).toBeLessThanOrEqual(100)
          
          // Lower should be <= upper
          expect(interval.lower).toBeLessThanOrEqual(interval.upper)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property: Probability update validation works correctly', () => {
    fc.assert(
      fc.property(
        validPriorArb,
        validPriorArb,
        fc.float({ min: Math.fround(1), max: Math.fround(100) }),
        (prior: number, posterior: number, maxChange: number) => {
          const isValid = validateProbabilityUpdate(prior, posterior, maxChange)
          const actualChange = Math.abs(posterior - prior)
          
          // Validation result should match actual change vs max change
          expect(isValid).toBe(actualChange <= maxChange)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Bayesian Update Engine Unit Tests', () => {
  test('handles zero prior probability correctly', () => {
    const result = updateProbability({
      prior: 0,
      likelihood: 0.8,
      evidence: 0.5
    })
    
    // With zero prior, posterior should be zero
    expect(result.posterior).toBe(0)
    expect(result.prior).toBe(0)
  })

  test('handles likelihood of 1.0 correctly', () => {
    const result = updateProbability({
      prior: 50,
      likelihood: 1.0,
      evidence: 0.6
    })
    
    // P(H|E) = 1.0 × 0.5 / 0.6 = 0.833... ≈ 83.33%
    expect(result.posterior).toBeCloseTo(83.33, 1)
  })

  test('throws error for invalid prior probability', () => {
    expect(() => updateProbability({
      prior: -10,
      likelihood: 0.5,
      evidence: 0.3
    })).toThrow('Prior probability must be between 0 and 100')

    expect(() => updateProbability({
      prior: 150,
      likelihood: 0.5,
      evidence: 0.3
    })).toThrow('Prior probability must be between 0 and 100')
  })

  test('throws error for invalid likelihood', () => {
    expect(() => updateProbability({
      prior: 50,
      likelihood: -0.1,
      evidence: 0.3
    })).toThrow('Likelihood must be between 0 and 1')

    expect(() => updateProbability({
      prior: 50,
      likelihood: 1.5,
      evidence: 0.3
    })).toThrow('Likelihood must be between 0 and 1')
  })

  test('throws error for invalid evidence probability', () => {
    expect(() => updateProbability({
      prior: 50,
      likelihood: 0.5,
      evidence: 0
    })).toThrow('Evidence probability must be between 0 (exclusive) and 1 (inclusive)')

    expect(() => updateProbability({
      prior: 50,
      likelihood: 0.5,
      evidence: 1.5
    })).toThrow('Evidence probability must be between 0 (exclusive) and 1 (inclusive)')
  })

  test('handles NaN inputs correctly', () => {
    expect(() => updateProbability({
      prior: NaN,
      likelihood: 0.5,
      evidence: 0.3
    })).toThrow('Prior must be a valid number')

    expect(() => updateProbability({
      prior: 50,
      likelihood: NaN,
      evidence: 0.3
    })).toThrow('Likelihood must be a valid number')

    expect(() => updateProbability({
      prior: 50,
      likelihood: 0.5,
      evidence: NaN
    })).toThrow('Evidence must be a valid number')
  })

  test('edge case handling adjusts very small evidence values', () => {
    const input = {
      prior: 50,
      likelihood: 0.5,
      evidence: 0.0001 // Very small evidence
    }
    
    const adjusted = handleEdgeCases(input)
    expect(adjusted.evidence).toBeGreaterThanOrEqual(0.001)
  })

  test('realistic Bayesian update scenario', () => {
    // Scenario: 60% chance of earnings beat, new positive analyst report
    const result = updateProbability({
      prior: 60, // 60% prior probability
      likelihood: 0.8, // 80% chance analyst report is positive given earnings beat
      evidence: 0.5 // 50% base rate of positive analyst reports
    })
    
    // Expected: P(H|E) = 0.8 × 0.6 / 0.5 = 0.96 = 96%
    expect(result.posterior).toBeCloseTo(96, 0)
    expect(result.prior).toBe(60)
  })
})