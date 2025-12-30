import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { Event, EventType, ImpactDirection, TimingWindow, ImpactEstimate, Source, ProbabilityUpdate } from './models'

// Generators for property-based testing
const eventTypeArb = fc.constantFrom('macro', 'industry', 'company') as fc.Arbitrary<EventType>
const impactDirectionArb = fc.constantFrom('bullish', 'bearish', 'neutral') as fc.Arbitrary<ImpactDirection>

const timingWindowArb: fc.Arbitrary<TimingWindow> = fc.record({
  start: fc.date(),
  end: fc.date(),
  expectedDate: fc.date(),
})

const impactEstimateArb: fc.Arbitrary<ImpactEstimate> = fc.record({
  direction: impactDirectionArb,
  magnitude: fc.float({ min: -1000, max: 1000 }),
  confidence: fc.integer({ min: 0, max: 100 }),
})

const sourceArb: fc.Arbitrary<Source> = fc.record({
  type: fc.constantFrom('market_data', 'social', 'financial', 'news', 'macro'),
  url: fc.option(fc.webUrl()),
  timestamp: fc.date(),
  reliability: fc.float({ min: 0, max: 1 }),
})

const probabilityUpdateArb: fc.Arbitrary<ProbabilityUpdate> = fc.record({
  timestamp: fc.date(),
  prior: fc.float({ min: 0, max: 100 }),
  posterior: fc.float({ min: 0, max: 100 }),
  signal: fc.record({
    type: fc.constantFrom('market_data', 'social', 'financial', 'news', 'macro'),
    source: fc.string(),
    timestamp: fc.date(),
    data: fc.anything(),
    reliability: fc.float({ min: 0, max: 1 }),
  }),
  evidence: fc.record({
    supports: fc.boolean(),
    strength: fc.float({ min: 0, max: 1 }),
    likelihood: fc.float({ min: 0, max: 1 }),
  }),
})

const eventArb: fc.Arbitrary<Event> = fc.record({
  id: fc.uuid(),
  type: eventTypeArb,
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  probability: fc.float({ min: 0, max: 100 }),
  priorProbability: fc.float({ min: 0, max: 100 }),
  timingWindow: timingWindowArb,
  impact: fc.record({
    revenue: fc.option(impactEstimateArb),
    margin: fc.option(impactEstimateArb),
    marketCap: fc.option(impactEstimateArb),
    stockPrice: fc.option(impactEstimateArb),
  }),
  expectedValue: fc.float({ min: -10000, max: 10000 }),
  confidence: fc.integer({ min: 0, max: 100 }),
  sources: fc.array(sourceArb, { minLength: 0, maxLength: 10 }),
  drivers: fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
  updateHistory: fc.array(probabilityUpdateArb, { minLength: 0, maxLength: 20 }),
})

describe('Event Model Property Tests', () => {
  test('Property 4: Event Structural Completeness - Feature: ai-financial-terminal, Property 4: Event Structural Completeness', () => {
    // **Validates: Requirements 1.5, 1.6, 12.3**
    fc.assert(
      fc.property(eventArb, (event: Event) => {
        // Every event must have required structural fields
        expect(event.id).toBeDefined()
        expect(typeof event.id).toBe('string')
        expect(event.id.length).toBeGreaterThan(0)
        
        expect(event.type).toBeDefined()
        expect(['macro', 'industry', 'company']).toContain(event.type)
        
        expect(event.probability).toBeDefined()
        expect(typeof event.probability).toBe('number')
        
        expect(event.timingWindow).toBeDefined()
        expect(event.timingWindow.start).toBeInstanceOf(Date)
        expect(event.timingWindow.end).toBeInstanceOf(Date)
        expect(event.timingWindow.expectedDate).toBeInstanceOf(Date)
        
        // Must have at least one impact estimate
        const hasImpact = event.impact.revenue || 
                         event.impact.margin || 
                         event.impact.marketCap || 
                         event.impact.stockPrice
        expect(hasImpact).toBeTruthy()
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 1: Event Probability Bounds - Feature: ai-financial-terminal, Property 1: Event Probability Bounds', () => {
    // **Validates: Requirements 1.2**
    fc.assert(
      fc.property(eventArb, (event: Event) => {
        // Every event probability must be between 0 and 100 (inclusive)
        expect(event.probability).toBeGreaterThanOrEqual(0)
        expect(event.probability).toBeLessThanOrEqual(100)
        
        // Prior probability must also be within bounds
        expect(event.priorProbability).toBeGreaterThanOrEqual(0)
        expect(event.priorProbability).toBeLessThanOrEqual(100)
        
        // All probability updates in history must be within bounds
        event.updateHistory.forEach(update => {
          expect(update.prior).toBeGreaterThanOrEqual(0)
          expect(update.prior).toBeLessThanOrEqual(100)
          expect(update.posterior).toBeGreaterThanOrEqual(0)
          expect(update.posterior).toBeLessThanOrEqual(100)
        })
        
        return true
      }),
      { numRuns: 100 }
    )
  })
})