/**
 * Expected Value Calculations for AI Financial Causal Terminal
 * 
 * Implements EV = probability × impact for various impact types
 * Handles multiple impact types: revenue, margin, marketCap, stockPrice
 */

import { Event, ImpactEstimate } from '../types/models'

export interface ExpectedValueInput {
  probability: number // 0-100
  impact: ImpactEstimate
}

export interface ExpectedValueResult {
  expectedValue: number
  impactType: string
  probability: number
  impact: ImpactEstimate
}

export interface MultiImpactExpectedValueResult {
  totalExpectedValue: number
  impactBreakdown: {
    revenue?: ExpectedValueResult
    margin?: ExpectedValueResult
    marketCap?: ExpectedValueResult
    stockPrice?: ExpectedValueResult
  }
}

/**
 * Calculate Expected Value for a single impact type
 * EV = probability × impact magnitude
 * 
 * @param input - Probability and impact estimate
 * @returns Expected value calculation result
 * @throws Error for invalid inputs
 */
export function calculateExpectedValue(input: ExpectedValueInput): ExpectedValueResult {
  const { probability, impact } = input

  // Input validation
  if (typeof probability !== 'number' || isNaN(probability)) {
    throw new Error('Probability must be a valid number')
  }
  if (probability < 0 || probability > 100) {
    throw new Error('Probability must be between 0 and 100')
  }
  if (!impact || typeof impact.magnitude !== 'number' || isNaN(impact.magnitude)) {
    throw new Error('Impact magnitude must be a valid number')
  }
  if (typeof impact.confidence !== 'number' || impact.confidence < 0 || impact.confidence > 100) {
    throw new Error('Impact confidence must be between 0 and 100')
  }

  // Convert probability from percentage to decimal (0-1)
  const probabilityDecimal = probability / 100

  // Calculate expected value: EV = P × Impact
  // Apply direction multiplier: bullish = positive, bearish = negative, neutral = 0
  let directionMultiplier: number
  switch (impact.direction) {
    case 'bullish':
      directionMultiplier = 1
      break
    case 'bearish':
      directionMultiplier = -1
      break
    case 'neutral':
      directionMultiplier = 0
      break
    default:
      throw new Error(`Invalid impact direction: ${impact.direction}`)
  }

  // Calculate expected value with direction
  const expectedValue = probabilityDecimal * impact.magnitude * directionMultiplier

  return {
    expectedValue,
    impactType: 'single',
    probability,
    impact
  }
}

/**
 * Calculate Expected Value for an event with multiple impact types
 * Handles revenue, margin, marketCap, and stockPrice impacts
 * 
 * @param event - Event with multiple impact estimates
 * @returns Multi-impact expected value result
 */
export function calculateMultiImpactExpectedValue(event: Event): MultiImpactExpectedValueResult {
  const impactBreakdown: MultiImpactExpectedValueResult['impactBreakdown'] = {}
  let totalExpectedValue = 0

  // Calculate EV for each impact type present
  if (event.impact.revenue) {
    const result = calculateExpectedValue({
      probability: event.probability,
      impact: event.impact.revenue
    })
    impactBreakdown.revenue = { ...result, impactType: 'revenue' }
    totalExpectedValue += result.expectedValue
  }

  if (event.impact.margin) {
    const result = calculateExpectedValue({
      probability: event.probability,
      impact: event.impact.margin
    })
    impactBreakdown.margin = { ...result, impactType: 'margin' }
    totalExpectedValue += result.expectedValue
  }

  if (event.impact.marketCap) {
    const result = calculateExpectedValue({
      probability: event.probability,
      impact: event.impact.marketCap
    })
    impactBreakdown.marketCap = { ...result, impactType: 'marketCap' }
    totalExpectedValue += result.expectedValue
  }

  if (event.impact.stockPrice) {
    const result = calculateExpectedValue({
      probability: event.probability,
      impact: event.impact.stockPrice
    })
    impactBreakdown.stockPrice = { ...result, impactType: 'stockPrice' }
    totalExpectedValue += result.expectedValue
  }

  return {
    totalExpectedValue,
    impactBreakdown
  }
}

/**
 * Update event's expected value based on current probability and impacts
 * This function should be called whenever an event's probability is updated
 * 
 * @param event - Event to update
 * @returns Updated event with new expected value
 */
export function updateEventExpectedValue(event: Event): Event {
  const result = calculateMultiImpactExpectedValue(event)
  
  return {
    ...event,
    expectedValue: result.totalExpectedValue,
    updatedAt: new Date()
  }
}

/**
 * Calculate confidence-adjusted expected value
 * Adjusts EV based on the confidence level of impact estimates
 * 
 * @param input - Probability and impact with confidence
 * @returns Confidence-adjusted expected value
 */
export function calculateConfidenceAdjustedExpectedValue(input: ExpectedValueInput): ExpectedValueResult {
  const baseResult = calculateExpectedValue(input)
  
  // Adjust expected value by confidence level (0-100 becomes 0-1 multiplier)
  const confidenceMultiplier = input.impact.confidence / 100
  const adjustedExpectedValue = baseResult.expectedValue * confidenceMultiplier
  
  return {
    ...baseResult,
    expectedValue: adjustedExpectedValue
  }
}

/**
 * Calculate portfolio-level expected value for multiple events
 * Useful for analyzing the combined impact of multiple events
 * 
 * @param events - Array of events to analyze
 * @returns Portfolio expected value breakdown
 */
export function calculatePortfolioExpectedValue(events: Event[]): {
  totalExpectedValue: number
  eventBreakdown: Array<{
    eventId: string
    eventTitle: string
    expectedValue: number
    contribution: number // percentage contribution to total
  }>
} {
  let totalExpectedValue = 0
  const eventBreakdown = events.map(event => {
    const result = calculateMultiImpactExpectedValue(event)
    totalExpectedValue += result.totalExpectedValue
    
    return {
      eventId: event.id,
      eventTitle: event.title,
      expectedValue: result.totalExpectedValue,
      contribution: 0 // Will be calculated after total is known
    }
  })

  // Calculate contribution percentages
  eventBreakdown.forEach(item => {
    item.contribution = totalExpectedValue !== 0 
      ? (item.expectedValue / totalExpectedValue) * 100 
      : 0
  })

  return {
    totalExpectedValue,
    eventBreakdown
  }
}

/**
 * Validate expected value calculation inputs
 * Ensures all inputs are reasonable and within expected ranges
 * 
 * @param probability - Event probability (0-100)
 * @param impact - Impact estimate
 * @returns True if inputs are valid
 */
export function validateExpectedValueInputs(probability: number, impact: ImpactEstimate): boolean {
  try {
    // Use the main calculation function to validate
    calculateExpectedValue({ probability, impact })
    return true
  } catch (error) {
    console.warn('Expected value input validation failed:', error)
    return false
  }
}

/**
 * Format expected value for display in UI
 * Handles different magnitude scales and provides appropriate formatting
 * 
 * @param expectedValue - Calculated expected value
 * @param impactType - Type of impact (revenue, margin, etc.)
 * @returns Formatted string for display
 */
export function formatExpectedValueForDisplay(
  expectedValue: number, 
  impactType: string
): string {
  const absValue = Math.abs(expectedValue)
  const sign = expectedValue >= 0 ? '+' : '-'
  
  // Format based on magnitude and type
  if (impactType === 'marketCap' || impactType === 'revenue') {
    // Large monetary values
    if (absValue >= 1e9) {
      return `${sign}$${(absValue / 1e9).toFixed(1)}B`
    } else if (absValue >= 1e6) {
      return `${sign}$${(absValue / 1e6).toFixed(1)}M`
    } else if (absValue >= 1e3) {
      return `${sign}$${(absValue / 1e3).toFixed(1)}K`
    } else {
      return `${sign}$${absValue.toFixed(0)}`
    }
  } else if (impactType === 'margin' || impactType === 'stockPrice') {
    // Percentage or price values
    return `${sign}${absValue.toFixed(2)}%`
  } else {
    // Generic formatting
    return `${sign}${absValue.toFixed(2)}`
  }
}