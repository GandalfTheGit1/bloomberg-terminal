import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { 
  calculateExpectedValue,
  calculateMultiImpactExpectedValue,
  updateEventExpectedValue,
  calculateConfidenceAdjustedExpectedValue,
  calculatePortfolioExpectedValue,
  validateExpectedValueInputs,
  formatExpectedValueForDisplay,
  ExpectedValueInput
} from './calculations'
import { Event, ImpactEstimate, ImpactDirection } from '../types/models'

// Generators for property-based testing
const validProbabilityArb = fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true })
const validMagnitudeArb = fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true })
const validConfidenceArb = fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true })
const impactDirectionArb = fc.constantFrom('bullish', 'bearish', 'neutral') as fc.Arbitrary<ImpactDirection>

const impactEstimateArb: fc.Arbitrary<ImpactEstimate> = fc.record({
  direction: impactDirectionArb,
  magnitude: validMagnitudeArb,
  confidence: validConfidenceArb
})

const expectedValueInputArb: fc.Arbitrary<ExpectedValueInput> = fc.record({
  probability: validProbabilityArb,
  impact: impactEstimateArb
})

const eventArb: fc.Arbitrary<Event> = fc.record({
  id: fc.string({ minLength: 1 }),
  type: fc.constantFrom('macro', 'industry', 'company'),
  title: fc.string({ minLength: 1 }),
  description: fc.string(),
  probability: validProbabilityArb,
  priorProbability: validProbabilityArb,
  timingWindow: fc.record({
    start: fc.date(),
    end: fc.date(),
    expectedDate: fc.date()
  }),
  impact: fc.record({
    revenue: fc.option(impactEstimateArb),
    margin: fc.option(impactEstimateArb),
    marketCap: fc.option(impactEstimateArb),
    stockPrice: fc.option(impactEstimateArb)
  }),
  expectedValue: fc.float(),
  confidence: validConfidenceArb,
  sources: fc.array(fc.record({
    type: fc.constantFrom('market_data', 'social', 'financial', 'news', 'macro'),
    url: fc.option(fc.webUrl()),
    timestamp: fc.date(),
    reliability: fc.float({ min: 0, max: 1 })
  })),
  drivers: fc.array(fc.string()),
  createdAt: fc.date(),
  updatedAt: fc.date(),
  updateHistory: fc.array(fc.record({
    timestamp: fc.date(),
    prior: validProbabilityArb,
    posterior: validProbabilityArb,
    signal: fc.record({
      type: fc.constantFrom('market_data', 'social', 'financial', 'news', 'macro'),
      source: fc.string(),
      timestamp: fc.date(),
      data: fc.anything(),
      reliability: fc.float({ min: 0, max: 1 })
    }),
    evidence: fc.record({
      supports: fc.boolean(),
      strength: fc.float({ min: 0, max: 1 }),
      likelihood: fc.float({ min: 0, max: 1 })
    })
  }))
})

describe('Expected Value Calculation Property Tests', () => {
  test('Property 2: Expected Value Calculation - Feature: ai-financial-terminal, Property 2: Expected Value Calculation', () => {
    // **Validates: Requirements 1.3, 9.2**
    fc.assert(
      fc.property(expectedValueInputArb, (input: ExpectedValueInput) => {
        const result = calculateExpectedValue(input)
        
        // Verify EV = probability × impact formula
        const probabilityDecimal = input.probability / 100
        let expectedEV: number
        
        switch (input.impact.direction) {
          case 'bullish':
            expectedEV = probabilityDecimal * input.impact.magnitude
            break
          case 'bearish':
            expectedEV = probabilityDecimal * input.impact.magnitude * -1
            break
          case 'neutral':
            expectedEV = 0
            break
          default:
            throw new Error(`Invalid direction: ${input.impact.direction}`)
        }
        
        // Allow for small floating point differences
        const tolerance = 0.0001
        expect(Math.abs(result.expectedValue - expectedEV)).toBeLessThan(tolerance)
        
        // Verify result structure
        expect(result.probability).toBe(input.probability)
        expect(result.impact).toBe(input.impact)
        expect(result.impactType).toBe('single')
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property: Expected value respects impact direction', () => {
    fc.assert(
      fc.property(
        validProbabilityArb,
        validMagnitudeArb,
        validConfidenceArb,
        (probability: number, magnitude: number, confidence: number) => {
          // Test bullish direction (positive)
          const bullishResult = calculateExpectedValue({
            probability,
            impact: { direction: 'bullish', magnitude, confidence }
          })
          expect(bullishResult.expectedValue).toBeGreaterThanOrEqual(0)
          
          // Test bearish direction (negative)
          const bearishResult = calculateExpectedValue({
            probability,
            impact: { direction: 'bearish', magnitude, confidence }
          })
          expect(bearishResult.expectedValue).toBeLessThanOrEqual(0)
          
          // Test neutral direction (zero)
          const neutralResult = calculateExpectedValue({
            probability,
            impact: { direction: 'neutral', magnitude, confidence }
          })
          expect(neutralResult.expectedValue).toBe(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property: Expected value scales linearly with probability', () => {
    fc.assert(
      fc.property(
        validMagnitudeArb,
        validConfidenceArb,
        impactDirectionArb,
        (magnitude: number, confidence: number, direction: ImpactDirection) => {
          const impact = { direction, magnitude, confidence }
          
          // Calculate EV at different probabilities
          const ev25 = calculateExpectedValue({ probability: 25, impact })
          const ev50 = calculateExpectedValue({ probability: 50, impact })
          const ev100 = calculateExpectedValue({ probability: 100, impact })
          
          if (direction !== 'neutral') {
            // EV should scale linearly with probability
            const tolerance = 0.0001
            expect(Math.abs(ev50.expectedValue - 2 * ev25.expectedValue)).toBeLessThan(tolerance)
            expect(Math.abs(ev100.expectedValue - 4 * ev25.expectedValue)).toBeLessThan(tolerance)
          } else {
            // Neutral direction should always be zero
            expect(ev25.expectedValue).toBe(0)
            expect(ev50.expectedValue).toBe(0)
            expect(ev100.expectedValue).toBe(0)
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property: Multi-impact expected value is sum of individual impacts', () => {
    fc.assert(
      fc.property(eventArb, (event: Event) => {
        // Ensure event has at least one impact
        if (!event.impact.revenue && !event.impact.margin && !event.impact.marketCap && !event.impact.stockPrice) {
          event.impact.revenue = { direction: 'bullish', magnitude: 10, confidence: 80 }
        }
        
        const result = calculateMultiImpactExpectedValue(event)
        
        // Calculate expected total by summing individual impacts
        let expectedTotal = 0
        
        if (event.impact.revenue) {
          const individual = calculateExpectedValue({ probability: event.probability, impact: event.impact.revenue })
          expectedTotal += individual.expectedValue
        }
        if (event.impact.margin) {
          const individual = calculateExpectedValue({ probability: event.probability, impact: event.impact.margin })
          expectedTotal += individual.expectedValue
        }
        if (event.impact.marketCap) {
          const individual = calculateExpectedValue({ probability: event.probability, impact: event.impact.marketCap })
          expectedTotal += individual.expectedValue
        }
        if (event.impact.stockPrice) {
          const individual = calculateExpectedValue({ probability: event.probability, impact: event.impact.stockPrice })
          expectedTotal += individual.expectedValue
        }
        
        // Allow for small floating point differences
        const tolerance = 0.0001
        expect(Math.abs(result.totalExpectedValue - expectedTotal)).toBeLessThan(tolerance)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property: Confidence adjustment reduces expected value magnitude', () => {
    fc.assert(
      fc.property(expectedValueInputArb, (input: ExpectedValueInput) => {
        // Skip neutral direction as it's always zero
        if (input.impact.direction === 'neutral') return true
        
        const baseResult = calculateExpectedValue(input)
        const adjustedResult = calculateConfidenceAdjustedExpectedValue(input)
        
        // Adjusted EV magnitude should be <= base EV magnitude
        expect(Math.abs(adjustedResult.expectedValue)).toBeLessThanOrEqual(Math.abs(baseResult.expectedValue))
        
        // If confidence is 100%, adjusted should equal base
        if (input.impact.confidence === 100) {
          const tolerance = 0.0001
          expect(Math.abs(adjustedResult.expectedValue - baseResult.expectedValue)).toBeLessThan(tolerance)
        }
        
        // If confidence is 0%, adjusted should be 0
        if (input.impact.confidence === 0) {
          expect(Math.abs(adjustedResult.expectedValue)).toBe(0)
        }
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property: Portfolio expected value is sum of individual event EVs', () => {
    fc.assert(
      fc.property(
        fc.array(eventArb, { minLength: 1, maxLength: 10 }),
        (events: Event[]) => {
          // Ensure each event has at least one impact
          events.forEach(event => {
            if (!event.impact.revenue && !event.impact.margin && !event.impact.marketCap && !event.impact.stockPrice) {
              event.impact.revenue = { direction: 'bullish', magnitude: 10, confidence: 80 }
            }
          })
          
          const portfolioResult = calculatePortfolioExpectedValue(events)
          
          // Calculate expected total by summing individual event EVs
          let expectedTotal = 0
          events.forEach(event => {
            const eventResult = calculateMultiImpactExpectedValue(event)
            expectedTotal += eventResult.totalExpectedValue
          })
          
          // Allow for small floating point differences
          const tolerance = 0.0001
          expect(Math.abs(portfolioResult.totalExpectedValue - expectedTotal)).toBeLessThan(tolerance)
          
          // Verify breakdown has correct number of events
          expect(portfolioResult.eventBreakdown).toHaveLength(events.length)
          
          // Verify contributions sum to 100% (or 0% if total is 0)
          const totalContribution = portfolioResult.eventBreakdown.reduce((sum, item) => sum + item.contribution, 0)
          if (portfolioResult.totalExpectedValue !== 0) {
            expect(Math.abs(totalContribution - 100)).toBeLessThan(tolerance)
          } else {
            expect(totalContribution).toBe(0)
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property: Input validation correctly identifies valid and invalid inputs', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -100, max: 200 }), // Include invalid probabilities
        fc.record({
          direction: impactDirectionArb,
          magnitude: fc.float({ min: -100, max: 1000 }), // Include negative magnitudes
          confidence: fc.float({ min: -50, max: 150 }) // Include invalid confidence
        }),
        (probability: number, impact: any) => {
          const isValid = validateExpectedValueInputs(probability, impact)
          
          // Determine if inputs should be valid
          const shouldBeValid = (
            probability >= 0 && probability <= 100 &&
            !isNaN(probability) &&
            typeof impact.magnitude === 'number' &&
            !isNaN(impact.magnitude) &&
            impact.confidence >= 0 && impact.confidence <= 100 &&
            ['bullish', 'bearish', 'neutral'].includes(impact.direction)
          )
          
          expect(isValid).toBe(shouldBeValid)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Expected Value Calculation Unit Tests', () => {
  test('calculates expected value correctly for bullish impact', () => {
    const result = calculateExpectedValue({
      probability: 60,
      impact: { direction: 'bullish', magnitude: 100, confidence: 80 }
    })
    
    // EV = 0.6 × 100 = 60
    expect(result.expectedValue).toBe(60)
  })

  test('calculates expected value correctly for bearish impact', () => {
    const result = calculateExpectedValue({
      probability: 40,
      impact: { direction: 'bearish', magnitude: 50, confidence: 90 }
    })
    
    // EV = 0.4 × 50 × -1 = -20
    expect(result.expectedValue).toBe(-20)
  })

  test('calculates expected value correctly for neutral impact', () => {
    const result = calculateExpectedValue({
      probability: 80,
      impact: { direction: 'neutral', magnitude: 200, confidence: 100 }
    })
    
    // EV = 0 (neutral always returns 0)
    expect(result.expectedValue).toBe(0)
  })

  test('throws error for invalid probability', () => {
    expect(() => calculateExpectedValue({
      probability: -10,
      impact: { direction: 'bullish', magnitude: 100, confidence: 80 }
    })).toThrow('Probability must be between 0 and 100')

    expect(() => calculateExpectedValue({
      probability: 150,
      impact: { direction: 'bullish', magnitude: 100, confidence: 80 }
    })).toThrow('Probability must be between 0 and 100')
  })

  test('throws error for invalid impact magnitude', () => {
    expect(() => calculateExpectedValue({
      probability: 50,
      impact: { direction: 'bullish', magnitude: NaN, confidence: 80 }
    })).toThrow('Impact magnitude must be a valid number')
  })

  test('throws error for invalid impact confidence', () => {
    expect(() => calculateExpectedValue({
      probability: 50,
      impact: { direction: 'bullish', magnitude: 100, confidence: -10 }
    })).toThrow('Impact confidence must be between 0 and 100')

    expect(() => calculateExpectedValue({
      probability: 50,
      impact: { direction: 'bullish', magnitude: 100, confidence: 150 }
    })).toThrow('Impact confidence must be between 0 and 100')
  })

  test('throws error for invalid impact direction', () => {
    expect(() => calculateExpectedValue({
      probability: 50,
      impact: { direction: 'invalid' as any, magnitude: 100, confidence: 80 }
    })).toThrow('Invalid impact direction: invalid')
  })

  test('updates event expected value correctly', () => {
    const event: Event = {
      id: 'test-event',
      type: 'company',
      title: 'Test Event',
      description: 'Test description',
      probability: 70,
      priorProbability: 60,
      timingWindow: {
        start: new Date(),
        end: new Date(),
        expectedDate: new Date()
      },
      impact: {
        revenue: { direction: 'bullish', magnitude: 100, confidence: 80 },
        stockPrice: { direction: 'bullish', magnitude: 50, confidence: 90 }
      },
      expectedValue: 0, // Will be updated
      confidence: 85,
      sources: [],
      drivers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      updateHistory: []
    }

    const updatedEvent = updateEventExpectedValue(event)
    
    // Expected: (0.7 × 100) + (0.7 × 50) = 70 + 35 = 105
    expect(updatedEvent.expectedValue).toBe(105)
    expect(updatedEvent.updatedAt).toBeInstanceOf(Date)
  })

  test('formats expected value for display correctly', () => {
    // Test large monetary values
    expect(formatExpectedValueForDisplay(1500000000, 'marketCap')).toBe('+$1.5B')
    expect(formatExpectedValueForDisplay(-2500000, 'revenue')).toBe('-$2.5M')
    expect(formatExpectedValueForDisplay(750000, 'marketCap')).toBe('+$750.0K')
    
    // Test percentage values
    expect(formatExpectedValueForDisplay(15.75, 'margin')).toBe('+15.75%')
    expect(formatExpectedValueForDisplay(-8.25, 'stockPrice')).toBe('-8.25%')
    
    // Test generic formatting
    expect(formatExpectedValueForDisplay(123.456, 'other')).toBe('+123.46')
  })

  test('confidence adjustment works correctly', () => {
    const input = {
      probability: 60,
      impact: { direction: 'bullish' as const, magnitude: 100, confidence: 50 }
    }
    
    const result = calculateConfidenceAdjustedExpectedValue(input)
    
    // Base EV = 60, confidence adjustment = 50% → 60 × 0.5 = 30
    expect(result.expectedValue).toBe(30)
  })
})