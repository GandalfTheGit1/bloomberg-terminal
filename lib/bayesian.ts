/**
 * Bayesian Update Engine for AI Financial Causal Terminal
 * 
 * Implements Bayes' theorem: P(H|E) = P(E|H) × P(H) / P(E)
 * Where:
 * - P(H|E) = Posterior probability (what we want to calculate)
 * - P(E|H) = Likelihood (probability of evidence given hypothesis)
 * - P(H) = Prior probability (current event probability)
 * - P(E) = Evidence probability (marginal likelihood)
 */

import { Signal, Evidence, ProbabilityUpdate } from '../types/models'

export interface BayesianUpdateInput {
  prior: number // Current probability (0-100)
  likelihood: number // P(E|H) - probability of evidence given hypothesis (0-1)
  evidence: number // P(E) - marginal likelihood (0-1)
}

export interface BayesianUpdateResult {
  prior: number
  posterior: number
  likelihood: number
  evidence: number
  confidenceInterval?: {
    lower: number
    upper: number
  }
}

/**
 * Core Bayesian update function implementing Bayes' theorem
 * 
 * @param input - Prior probability, likelihood, and evidence
 * @returns Updated probability with prior and posterior values
 * @throws Error for invalid inputs
 */
export function updateProbability(input: BayesianUpdateInput): BayesianUpdateResult {
  const { prior, likelihood, evidence } = input

  // Input validation
  if (typeof prior !== 'number' || isNaN(prior)) {
    throw new Error('Prior must be a valid number')
  }
  if (prior < 0 || prior > 100) {
    throw new Error('Prior probability must be between 0 and 100')
  }
  if (typeof likelihood !== 'number' || isNaN(likelihood)) {
    throw new Error('Likelihood must be a valid number')
  }
  if (likelihood < 0 || likelihood > 1) {
    throw new Error('Likelihood must be between 0 and 1')
  }
  if (typeof evidence !== 'number' || isNaN(evidence)) {
    throw new Error('Evidence must be a valid number')
  }
  if (evidence <= 0 || evidence > 1) {
    throw new Error('Evidence probability must be between 0 (exclusive) and 1 (inclusive)')
  }

  // Convert prior from percentage to probability (0-1)
  const priorProb = prior / 100

  // Apply Bayes' theorem: P(H|E) = P(E|H) × P(H) / P(E)
  const posteriorProb = (likelihood * priorProb) / evidence

  // Ensure posterior is within valid bounds (0-1)
  const clampedPosterior = Math.max(0, Math.min(1, posteriorProb))

  // Convert back to percentage (0-100)
  const posterior = clampedPosterior * 100

  return {
    prior,
    posterior,
    likelihood,
    evidence
  }
}

/**
 * Update event probability with new signal and evidence
 * 
 * @param eventId - ID of the event to update
 * @param signal - New signal data
 * @param evidence - Evidence assessment for the signal
 * @returns Probability update result with history entry
 */
export function updateEventProbability(
  currentProbability: number,
  signal: Signal,
  evidence: Evidence
): BayesianUpdateResult & { updateEntry: ProbabilityUpdate } {
  // Calculate marginal likelihood P(E) based on evidence strength and reliability
  // This is a simplified calculation - in practice, this would be more sophisticated
  const baseEvidence = 0.5 // Base rate for evidence occurrence
  const adjustedEvidence = baseEvidence + (evidence.strength * signal.reliability * 0.3)
  const clampedEvidence = Math.max(0.01, Math.min(1, adjustedEvidence))

  // Perform Bayesian update
  const result = updateProbability({
    prior: currentProbability,
    likelihood: evidence.likelihood,
    evidence: clampedEvidence
  })

  // Create update history entry
  const updateEntry: ProbabilityUpdate = {
    timestamp: new Date(),
    prior: result.prior,
    posterior: result.posterior,
    signal,
    evidence
  }

  return {
    ...result,
    updateEntry
  }
}

/**
 * Calculate confidence interval for probability estimate
 * Uses a simplified approach based on evidence strength and reliability
 * 
 * @param probability - Current probability estimate (0-100)
 * @param evidence - Evidence used for the estimate
 * @param signal - Signal reliability
 * @returns Confidence interval bounds
 */
export function calculateConfidenceInterval(
  probability: number,
  evidence: Evidence,
  signal: Signal
): { lower: number; upper: number } {
  // Calculate uncertainty based on evidence strength and signal reliability
  const uncertainty = (1 - evidence.strength) * (1 - signal.reliability) * 20 // Max 20% uncertainty
  
  const lower = Math.max(0, probability - uncertainty)
  const upper = Math.min(100, probability + uncertainty)
  
  return { lower, upper }
}

/**
 * Validate that a probability update is reasonable
 * Prevents extreme updates that might indicate data quality issues
 * 
 * @param prior - Previous probability
 * @param posterior - New probability
 * @param maxChange - Maximum allowed change (default 50%)
 * @returns True if update is reasonable
 */
export function validateProbabilityUpdate(
  prior: number,
  posterior: number,
  maxChange: number = 50
): boolean {
  const change = Math.abs(posterior - prior)
  return change <= maxChange
}

/**
 * Handle edge cases in Bayesian updates
 * 
 * @param input - Bayesian update input
 * @returns Adjusted input or throws error for invalid cases
 */
export function handleEdgeCases(input: BayesianUpdateInput): BayesianUpdateInput {
  let { prior, likelihood, evidence } = input

  // Handle zero prior probability
  if (prior === 0) {
    // If prior is 0, posterior will be 0 regardless of evidence
    // This is mathematically correct but might not be desired in practice
    console.warn('Prior probability is 0 - posterior will also be 0')
  }

  // Handle likelihood of 1.0 (certainty)
  if (likelihood === 1.0) {
    // This means the evidence perfectly predicts the hypothesis
    console.warn('Likelihood is 1.0 - this indicates perfect prediction')
  }

  // Handle very small evidence probability
  if (evidence < 0.001) {
    console.warn('Evidence probability is very small - this may cause numerical instability')
    evidence = Math.max(0.001, evidence) // Prevent division by very small numbers
  }

  return { prior, likelihood, evidence }
}