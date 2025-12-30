// Core type definitions for AI Financial Causal Terminal
// This file will be populated with data models in subsequent tasks

export type EventType = "macro" | "industry" | "company";
export type ImpactDirection = "bullish" | "bearish" | "neutral";
export type SentimentType = "bullish" | "bearish" | "neutral";

// Placeholder interfaces - will be fully defined in task 2
export interface Event {
  id: string;
  type: EventType;
  // Additional fields to be added
}

export interface EventGraph {
  companyId: string;
  nodes: Event[];
  // Additional fields to be added
}

export interface FinancialMetrics {
  companyId: string;
  timestamp: Date;
  // Additional fields to be added
}

export interface SocialPost {
  id: string;
  source: "twitter" | "reddit";
  // Additional fields to be added
}
