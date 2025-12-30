// Core data models for AI Financial Causal Terminal
// Based on design document specifications

export type EventType = "macro" | "industry" | "company";
export type ImpactDirection = "bullish" | "bearish" | "neutral";
export type SentimentType = "bullish" | "bearish" | "neutral";
export type SocialSource = "twitter" | "reddit";
export type AuthorType = "executive" | "employee" | "analyst" | "retail";
export type SignalType = "market_data" | "social" | "financial" | "news" | "macro";
export type CausalEdgeType = "causes" | "influences" | "correlates";

// Time range interface
export interface TimeRange {
  start: Date;
  end: Date;
}

// Timing window for events
export interface TimingWindow {
  start: Date;
  end: Date;
  expectedDate: Date;
}

// Impact estimate for events
export interface ImpactEstimate {
  direction: ImpactDirection;
  magnitude: number; // percentage or absolute value
  confidence: number; // 0-100
}

// Source information for events
export interface Source {
  type: SignalType;
  url?: string;
  timestamp: Date;
  reliability: number; // 0-1
}

// Signal data for Bayesian updates
export interface Signal {
  type: SignalType;
  source: string;
  timestamp: Date;
  data: any;
  reliability: number; // 0-1
}

// Evidence for Bayesian calculations
export interface Evidence {
  supports: boolean; // true if supports event, false if contradicts
  strength: number; // 0-1, how strongly it supports/contradicts
  likelihood: number; // P(E|H) - probability of evidence given hypothesis
}

// Probability update history
export interface ProbabilityUpdate {
  timestamp: Date;
  prior: number;
  posterior: number;
  signal: Signal;
  evidence: Evidence;
}

// Core Event model
export interface Event {
  id: string;
  type: EventType;
  title: string;
  description: string;
  probability: number; // 0-100
  priorProbability: number;
  timingWindow: TimingWindow;
  impact: {
    revenue?: ImpactEstimate;
    margin?: ImpactEstimate;
    marketCap?: ImpactEstimate;
    stockPrice?: ImpactEstimate;
  };
  expectedValue: number; // probability × impact
  confidence: number; // 0-100
  sources: Source[];
  drivers: string[];
  createdAt: Date;
  updatedAt: Date;
  updateHistory: ProbabilityUpdate[];
}

// Causal edge in event graph
export interface CausalEdge {
  from: string; // event ID
  to: string; // event ID or asset ID
  strength: number; // 0-1, causal influence strength
  type: CausalEdgeType;
}

// Event Graph model
export interface EventGraph {
  companyId: string;
  nodes: Event[];
  edges: CausalEdge[];
  lastUpdated: Date;
}

// Debt maturity schedule
export interface DebtMaturitySchedule {
  [year: string]: number; // year -> amount due
}

// Financial Metrics model
export interface FinancialMetrics {
  companyId: string;
  timestamp: Date;
  // Financial Snapshot metrics
  cashRunwayMonths: number;
  netDebtToEBITDA: number;
  freeCashFlowMargin: number;
  grossMargin: number;
  inventoryGrowthVsRevenue: number;
  capexToRevenue: number;
  roicVsWACC: number;
  sbcPercentRevenue: number;
  // Financial Stress metrics
  debtMaturity: DebtMaturitySchedule;
  liquidityBuffer: number;
  creditLinesAvailable: number;
  creditLinesUsed: number;
  // Earnings Quality metrics
  netIncomeVsOCF: number;
  accrualsRatio: number;
  oneOffExpensesFrequency: number;
  capitalizedCostsTrend: number;
  // Cycle & Demand metrics
  inventoryDays: number;
  backlogBookToBill: number;
  revenueVsInventoryDelta: number;
  customerConcentration: number;
}

// Social Post model
export interface SocialPost {
  id: string;
  source: SocialSource;
  author: string;
  authorType: AuthorType;
  content: string;
  timestamp: Date;
  sentiment: SentimentType;
  confidence: number; // 0-100
  isEventDetection: boolean;
  influenceScore: number;
  linkedSymbols: string[];
}

// Social Sentiment Aggregate
export interface SentimentAggregate {
  symbol: string;
  timeRange: TimeRange;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  uniqueAuthors: number;
  influenceWeightedScore: number; // -100 to +100
  topPosts: SocialPost[];
}

// Panel size configuration
export interface PanelSizes {
  centralPanel: { width: number; height: number };
  leftPanel: { width: number };
  rightPanel: { width: number };
  financialAnalysisPanel: { height: number };
  industryPanel: { height: number };
}

// Chat message interface
export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  linkedEvents?: string[]; // event IDs referenced in the message
}

// Quick action types for chat
export type QuickAction = "summarize" | "scenario_plus" | "bear_case" | "bull_case";

// Event filters for Left Panel
export interface EventFilters {
  timeHorizon?: TimeRange;
  eventTypes?: EventType[];
  signalDominance?: ("hard" | "soft")[];
}

// Macro event filters for Ribbon
export interface MacroEventFilters {
  categories?: string[];
}

// Macro event model
export interface MacroEvent {
  id: string;
  title: string;
  date: Date;
  consensus?: number;
  expectedDeviation?: number;
  category: string;
  impact: ImpactEstimate;
}

// Industry and company context
export interface Industry {
  id: string;
  name: string;
  thresholds: IndustryThresholds;
}

export interface Company {
  id: string;
  name: string;
  symbol: string;
  industry: string;
  marketCap: number;
}

// Industry-specific thresholds for financial metrics
export interface IndustryThresholds {
  cashRunwayMonths: { green: number; amber: number; red: number };
  netDebtToEBITDA: { green: number; amber: number; red: number };
  freeCashFlowMargin: { green: number; amber: number; red: number };
  grossMargin: { green: number; amber: number; red: number };
  inventoryGrowthVsRevenue: { green: number; amber: number; red: number };
  capexToRevenue: { green: number; amber: number; red: number };
  roicVsWACC: { green: number; amber: number; red: number };
  sbcPercentRevenue: { green: number; amber: number; red: number };
}

// Anomaly detection result
export interface Anomaly {
  metric: string;
  type: "threshold_crossing" | "pattern_divergence" | "guidance_conflict";
  severity: "low" | "medium" | "high";
  description: string;
  generatedEvent?: Event;
}

// Price point for chart data
export interface PricePoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Chat context for AI interactions
export interface ChatContext {
  companyId: string;
  selectedEvent?: Event;
  recentEvents: Event[];
  financialMetrics: FinancialMetrics;
  eventGraph: EventGraph;
}