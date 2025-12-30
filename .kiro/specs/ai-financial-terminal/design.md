# Design Document: AI Financial Causal Terminal

## Overview

The AI Financial Causal Terminal is a predictive financial intelligence system that forecasts future events impacting stock prices using causal models, probabilistic reasoning, and graph-based analysis. Unlike traditional terminals focused on historical visualization, this system predicts events, assigns explicit probabilities, estimates timing and economic impact, and enables interactive reasoning with AI.

The system is built on Next.js (latest version) with TypeScript, featuring a modular component architecture that converts an existing HTML template into reusable JSX components. The backend supports both traditional API services and n8n workflow automation for flexible data pipeline implementation.

### Key Capabilities

- **Event Prediction**: Generate future events (macro, industry, company-specific) with explicit probabilities
- **Causal Graph Visualization**: Display events as a DAG showing causal relationships and propagation
- **Bayesian Updating**: Dynamically adjust probabilities as new signals arrive
- **Financial Analysis**: Automatically detect anomalies in financial metrics and generate events
- **Social Sentiment Integration**: Incorporate Twitter/X and Reddit data as probabilistic signals
- **Interactive AI Chat**: Enable counterfactual reasoning and scenario exploration
- **Resizable Panels**: Fully customizable workspace layout with persistent preferences

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Central Panel│  │  Left Panel  │  │ Right Panel  │      │
│  │ Chart+Events │  │Future Events │  │   AI Chat    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌────────────────────────────────────────────────────┐     │
│  │      Financial Analysis Panel (Center)             │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Industry Panel (Below Financial)           │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Macro Events Ribbon (Fixed Bottom)         │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Event Predictor│  │Bayesian Engine│ │Social Analyzer│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Financial Detector│ │Graph Manager│  │  AI Service  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│         Alternative: n8n Workflows for Data Pipelines        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Event Store │  │  Graph Store │  │ Market Data  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │Social Data DB│  │Financial DB  │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js (latest version) with App Router
- React Server Components + Client Components
- TypeScript for type safety
- Shadcn/ui components with TailwindCSS
- Recharts for chart visualization
- React Flow for graph visualization
- Supabase Realtime for real-time updates

**Backend:**
- Supabase (PostgreSQL + Realtime + Auth + Storage)
- Next.js API routes for custom logic
- n8n for workflow automation (alternative implementation)
- Supabase Edge Functions for serverless compute
- Supabase Realtime for WebSocket functionality

**APIs & Integrations:**
- Twitter/X API for social sentiment
- Reddit API for social sentiment
- Market data providers (Alpha Vantage, Polygon.io, etc.)
- OpenAI or Anthropic for AI chat
- Supabase Client SDK for database operations
- Supabase Realtime for live updates


## Components and Interfaces

### Frontend Components

#### 1. Central Panel Component (`CentralPanel.tsx`)

**Purpose**: Display unified price chart with historical data and future event predictions.

**Props:**
```typescript
interface CentralPanelProps {
  priceData: PricePoint[];
  events: Event[];
  timeRange: TimeRange;
  onEventClick: (eventId: string) => void;
  onEventHover: (eventId: string | null) => void;
}
```

**Sub-components:**
- `PriceChart`: TradingView-style historical price visualization
- `EventNode`: Circular SVG node with probability ring
- `EventEdge`: Line connecting events in causal graph
- `TimelineAxis`: X-axis showing time progression

**Key Behaviors:**
- Render historical price data on the left
- Overlay future events on the right side of timeline
- Display causal connections between events as lines
- Handle hover to show tooltips
- Handle click to expand event details in Right Panel

#### 2. Left Panel Component (`LeftPanel.tsx`)

**Purpose**: Display prioritized list of future events with filtering.

**Props:**
```typescript
interface LeftPanelProps {
  events: Event[];
  filters: EventFilters;
  onFilterChange: (filters: EventFilters) => void;
  onEventSelect: (eventId: string) => void;
}
```

**Sub-components:**
- `EventListItem`: Individual event card showing probability, impact, confidence
- `FilterBar`: Time horizon, event type, signal dominance filters
- `PriorityIndicator`: Visual indicator of event priority

**Key Behaviors:**
- Sort events by priority score
- Apply filters to event list
- Highlight selected event
- Update in real-time as new events are generated

#### 3. Right Panel Component (`RightPanel.tsx`)

**Purpose**: Interactive AI chat interface with event detail expansion.

**Props:**
```typescript
interface RightPanelProps {
  messages: ChatMessage[];
  selectedEvent: Event | null;
  onSendMessage: (message: string) => void;
  onQuickAction: (action: QuickAction) => void;
}
```

**Sub-components:**
- `ChatMessage`: Individual message bubble
- `EventDetailModal`: Expanded event information
- `QuickActionButtons`: Summarize, Scenario+, Bear Case, Bull Case
- `ChatInput`: Text input with send button

**Key Behaviors:**
- Display default company summary on load
- Handle user questions and AI responses
- Expand event details when clicked from Central Panel
- Generate clickable links to Event Graph nodes
- Execute quick actions (scenarios, summaries)

#### 4. Financial Analysis Panel Component (`FinancialAnalysisPanel.tsx`)

**Purpose**: Display financial metrics with automatic anomaly detection and event generation.

**Props:**
```typescript
interface FinancialAnalysisPanelProps {
  companyId: string;
  financialData: FinancialMetrics;
  industryThresholds: IndustryThresholds;
  onMetricClick: (metric: string) => void;
  onEventGenerated: (event: Event) => void;
}
```

**Sub-components:**
- `MetricCard`: Individual KPI with value, trend, status color
- `TabContainer`: Financial Snapshot, Financial Stress, Earnings Quality, Cycle & Demand
- `MetricTooltip`: Explanation of metric significance
- `ThresholdIndicator`: Visual indicator when thresholds are crossed

**Key Behaviors:**
- Display 2×4 grid of industry-aware KPIs
- Monitor metrics for threshold crossings
- Automatically generate events when anomalies detected
- Link metrics to related events in Event Graph
- Adapt displayed metrics based on industry


#### 5. Industry Panel Component (`IndustryPanel.tsx`)

**Purpose**: Display industry context and competitor comparisons.

**Props:**
```typescript
interface IndustryPanelProps {
  industry: Industry;
  competitors: Company[];
  onIndustryChange: (industryId: string) => void;
}
```

**Sub-components:**
- `IndustrySelector`: Horizontal selector for switching industries
- `CompetitorCard`: Comparative metrics for each competitor
- `CustomerList`: Key customers for the company

**Key Behaviors:**
- Display current industry classification
- Show competitor comparisons
- Allow industry switching
- Update when Financial Analysis Panel generates industry-related events

#### 6. Macro Events Ribbon Component (`MacroEventsRibbon.tsx`)

**Purpose**: Fixed bottom bar showing upcoming global macro events.

**Props:**
```typescript
interface MacroEventsRibbonProps {
  macroEvents: MacroEvent[];
  filters: MacroEventFilters;
  onEventSelect: (eventId: string) => void;
  onFilterChange: (filters: MacroEventFilters) => void;
}
```

**Sub-components:**
- `MacroEventCard`: Date, consensus, expected deviation
- `CategoryFilter`: Quick filters by event category

**Key Behaviors:**
- Display upcoming macro events horizontally
- Filter by category
- Overlay selected events on Central Panel chart
- Update in real-time as events are scheduled

#### 7. Resizable Panel System (`ResizableLayout.tsx`)

**Purpose**: Manage panel resizing and layout persistence.

**Props:**
```typescript
interface ResizableLayoutProps {
  children: React.ReactNode;
  defaultSizes: PanelSizes;
  onSizeChange: (sizes: PanelSizes) => void;
}
```

**Key Behaviors:**
- Enable drag-to-resize on panel borders
- Enforce minimum/maximum size constraints
- Persist sizes to localStorage
- Provide "Reset Layout" functionality
- Adjust adjacent panels when one is resized

### Backend Services

#### 1. Event Predictor Service

**Purpose**: Generate future event predictions based on available data.

**API Endpoints:**
```typescript
POST /api/events/predict
Request: { companyId: string, dataContext: DataContext }
Response: { events: Event[] }

GET /api/events/:eventId
Response: { event: Event }
```

**Key Functions:**
- Analyze market data, financial metrics, social sentiment
- Categorize events as macro, industry, or company-specific
- Assign initial probabilities using historical patterns
- Estimate timing windows and impacts
- Store events in Event Store

**n8n Alternative:**
- Workflow: "Event Prediction Pipeline"
- Triggers: Scheduled (hourly) or webhook (on-demand)
- Nodes: HTTP Request (data fetch) → Function (analysis) → HTTP Request (store events)

#### 2. Bayesian Update Engine

**Purpose**: Update event probabilities as new signals arrive.

**API Endpoints:**
```typescript
POST /api/events/:eventId/update
Request: { signal: Signal, evidence: Evidence }
Response: { updatedEvent: Event, prior: number, posterior: number }
```

**Key Functions:**
- Implement Bayes' theorem: P(H|E) = P(E|H) × P(H) / P(E)
- Calculate likelihood based on signal type
- Update event probability
- Record update history
- Trigger UI updates via WebSocket

**n8n Alternative:**
- Workflow: "Bayesian Update Pipeline"
- Triggers: Webhook (new signal)
- Nodes: Function (Bayes calculation) → HTTP Request (update event) → WebSocket (notify frontend)


#### 3. Social Sentiment Analyzer

**Purpose**: Ingest and analyze social media data from Twitter/X and Reddit.

**API Endpoints:**
```typescript
POST /api/social/ingest
Request: { source: 'twitter' | 'reddit', data: SocialPost[] }
Response: { processed: number, events: Event[] }

GET /api/social/sentiment/:symbol
Response: { sentiment: SentimentAggregate }
```

**Key Functions:**
- Classify posts as Bullish, Bearish, or Neutral
- Aggregate metrics: post count, unique authors, influence score
- Distinguish opinion vs event detection posts
- Identify executive/employee posts
- Generate events from high-confidence social signals

**n8n Alternative:**
- Workflow: "Social Sentiment Pipeline"
- Triggers: Scheduled (every 5 minutes)
- Nodes: Twitter API → Function (classify) → PostgreSQL (store) → HTTP Request (generate events)

#### 4. Financial Anomaly Detector

**Purpose**: Monitor financial metrics and automatically generate events when anomalies detected.

**API Endpoints:**
```typescript
POST /api/financial/analyze
Request: { companyId: string, metrics: FinancialMetrics }
Response: { anomalies: Anomaly[], generatedEvents: Event[] }

GET /api/financial/thresholds/:industry
Response: { thresholds: IndustryThresholds }
```

**Key Functions:**
- Compare metrics against industry thresholds
- Detect divergence from historical patterns
- Identify conflicts with management guidance
- Generate events with probability, timing, impact
- Propagate events to Central Panel, Left Panel, and AI Chat

**n8n Alternative:**
- Workflow: "Financial Anomaly Detection"
- Triggers: Webhook (new financial data)
- Nodes: Function (threshold check) → Function (pattern analysis) → HTTP Request (create events)

#### 5. Graph Manager Service

**Purpose**: Manage Event Graph structure and ensure DAG integrity.

**API Endpoints:**
```typescript
POST /api/graph/add-edge
Request: { fromEventId: string, toEventId: string, causalStrength: number }
Response: { success: boolean, graph: EventGraph }

GET /api/graph/:companyId
Response: { graph: EventGraph }

POST /api/graph/validate
Request: { graph: EventGraph }
Response: { isAcyclic: boolean, cycles: string[][] }
```

**Key Functions:**
- Add/remove nodes and edges
- Validate graph remains acyclic
- Calculate causal paths between events
- Optimize graph layout for visualization
- Store graph structure in Graph Store

#### 6. AI Chat Service

**Purpose**: Handle interactive chat with counterfactual reasoning.

**API Endpoints:**
```typescript
POST /api/chat/message
Request: { message: string, context: ChatContext }
Response: { response: string, linkedEvents: string[] }

POST /api/chat/scenario
Request: { scenarioType: 'bull' | 'bear' | 'custom', parameters: any }
Response: { analysis: string, impactedEvents: Event[] }
```

**Key Functions:**
- Generate company state summaries
- Answer "what if" questions
- Perform counterfactual analysis
- Link responses to Event Graph nodes
- Execute quick actions (Summarize, Scenario+, Bear/Bull Case)


## Data Models

### Event Model

```typescript
interface Event {
  id: string;
  type: 'macro' | 'industry' | 'company';
  title: string;
  description: string;
  probability: number; // 0-100
  priorProbability: number;
  timingWindow: {
    start: Date;
    end: Date;
    expectedDate: Date;
  };
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

interface ImpactEstimate {
  direction: 'bullish' | 'bearish' | 'neutral';
  magnitude: number; // percentage or absolute value
  confidence: number;
}

interface ProbabilityUpdate {
  timestamp: Date;
  prior: number;
  posterior: number;
  signal: Signal;
  evidence: Evidence;
}

interface Source {
  type: 'market_data' | 'social' | 'financial' | 'news';
  url?: string;
  timestamp: Date;
  reliability: number;
}
```

### Event Graph Model

```typescript
interface EventGraph {
  companyId: string;
  nodes: Event[];
  edges: CausalEdge[];
  lastUpdated: Date;
}

interface CausalEdge {
  from: string; // event ID
  to: string; // event ID or asset ID
  strength: number; // 0-1, causal influence strength
  type: 'causes' | 'influences' | 'correlates';
}
```

### Financial Metrics Model

```typescript
interface FinancialMetrics {
  companyId: string;
  timestamp: Date;
  cashRunwayMonths: number;
  netDebtToEBITDA: number;
  freeCashFlowMargin: number;
  grossMargin: number;
  inventoryGrowthVsRevenue: number;
  capexToRevenue: number;
  roicVsWACC: number;
  sbcPercentRevenue: number;
  // Stress metrics
  debtMaturity: DebtMaturitySchedule;
  liquidityBuffer: number;
  creditLinesAvailable: number;
  creditLinesUsed: number;
  // Earnings quality
  netIncomeVsOCF: number;
  accrualsRatio: number;
  oneOffExpensesFrequency: number;
  capitalizedCostsTrend: number;
  // Cycle & demand
  inventoryDays: number;
  backlogBookToBill: number;
  revenueVsInventoryDelta: number;
  customerConcentration: number;
}

interface DebtMaturitySchedule {
  [year: string]: number; // year -> amount due
}
```

### Social Sentiment Model

```typescript
interface SocialPost {
  id: string;
  source: 'twitter' | 'reddit';
  author: string;
  authorType: 'executive' | 'employee' | 'analyst' | 'retail';
  content: string;
  timestamp: Date;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  isEventDetection: boolean;
  influenceScore: number;
  linkedSymbols: string[];
}

interface SentimentAggregate {
  symbol: string;
  timeRange: TimeRange;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  uniqueAuthors: number;
  influenceWeightedScore: number; // -100 to +100
  topPosts: SocialPost[];
}
```

### Signal and Evidence Models

```typescript
interface Signal {
  type: 'market_data' | 'social' | 'financial' | 'news' | 'macro';
  source: string;
  timestamp: Date;
  data: any;
  reliability: number; // 0-1
}

interface Evidence {
  supports: boolean; // true if supports event, false if contradicts
  strength: number; // 0-1, how strongly it supports/contradicts
  likelihood: number; // P(E|H) - probability of evidence given hypothesis
}
```

### Panel Size Model

```typescript
interface PanelSizes {
  centralPanel: { width: number; height: number };
  leftPanel: { width: number };
  rightPanel: { width: number };
  financialAnalysisPanel: { height: number };
  industryPanel: { height: number };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Event Probability Bounds

*For any* event generated by the system, the probability value must be between 0 and 100 (inclusive).

**Validates: Requirements 1.2**

### Property 2: Expected Value Calculation

*For any* event with a defined probability and impact, the Expected_Value must equal probability × impact magnitude.

**Validates: Requirements 1.3, 9.2**

### Property 3: Bayesian Update Correctness

*For any* event receiving a new signal, the posterior probability calculated using Bayesian updating must satisfy: P(H|E) = P(E|H) × P(H) / P(E), where P(H) is the prior, P(E|H) is the likelihood, and P(E) is the evidence probability.

**Validates: Requirements 1.4**

### Property 4: Event Structural Completeness

*For any* event in the system, it must contain: an ID, type (macro/industry/company), probability, timing window, and at least one impact estimate.

**Validates: Requirements 1.5, 1.6, 12.3**

### Property 5: Graph Acyclicity

*For any* Event Graph, there must be no cycles—following edges from any node must never return to that same node.

**Validates: Requirements 2.1, 12.5**

### Property 6: Event Node Color Mapping

*For any* event node being rendered, the color must be: green if impact direction is bullish, red if bearish, and amber if neutral.

**Validates: Requirements 2.3**

### Property 7: Event Positioning by Timing

*For any* event displayed on the timeline, its position must correspond to its timing window's expected date.

**Validates: Requirements 2.8**

### Property 8: Tooltip Data Completeness

*For any* event node tooltip, it must contain: drivers list, sources list, and Expected_Value.

**Validates: Requirements 2.5**

### Property 9: Event List Priority Ordering

*For any* list of events in the Left Panel, events must be ordered by priority score (combining probability, impact magnitude, and temporal proximity) in descending order.

**Validates: Requirements 3.5**

### Property 10: Event Filtering Correctness

*For any* set of filter criteria applied to events, the filtered list must contain only events that match all active filter conditions (time horizon, event type, signal dominance).

**Validates: Requirements 3.4**

### Property 11: Event Display Fields

*For any* event displayed in the Left Panel, it must show: probability, expected impact, and confidence level.

**Validates: Requirements 3.2**

### Property 12: Modal Content Completeness

*For any* event detail modal opened from the chat, it must contain: structured text, links to Event_Graph nodes, source data, and action buttons.

**Validates: Requirements 4.4**

### Property 13: Event Reference Linking

*For any* AI chat response that references an event, the response must include a clickable link to the corresponding Event_Graph node.

**Validates: Requirements 4.6**

### Property 14: Industry-Aware Metrics

*For any* company in a given industry, the Financial Analysis Panel must display metrics appropriate for that industry classification.

**Validates: Requirements 5.9**

### Property 15: Threshold-Based Event Generation

*For any* financial metric that crosses its industry-defined threshold, the system must automatically generate a future event with probability, timing, and impact estimates.

**Validates: Requirements 5.19**

### Property 16: Pattern Divergence Event Generation

*For any* financial metric that diverges from its historical pattern by more than a defined threshold, the system must automatically generate a future event.

**Validates: Requirements 5.20**

### Property 17: Guidance Conflict Event Generation

*For any* financial metric that conflicts with management guidance, the system must automatically generate a future event.

**Validates: Requirements 5.21**

### Property 18: Auto-Generated Event Completeness

*For any* automatically generated event from the Financial Analysis Panel, it must have: probability, expected timing delay, and impact estimates (revenue, margin, or price).

**Validates: Requirements 5.22**

### Property 19: Event Propagation Across UI

*For any* automatically generated event, it must appear in: the Central Panel timeline, the Left Panel events list, and the AI chat context.

**Validates: Requirements 5.23**

### Property 20: Macro Event Display Fields

*For any* macro event in the Ribbon, it must display: date, consensus estimate, and expected deviation.

**Validates: Requirements 7.2**

### Property 21: Social Post Classification

*For any* social media post processed by the system, it must be classified as exactly one of: Bullish, Bearish, or Neutral.

**Validates: Requirements 8.2**

### Property 22: Social Sentiment Aggregation

*For any* social sentiment aggregate, it must include: post count, unique author count, and influence-weighted score.

**Validates: Requirements 8.3**

### Property 23: Social Post Type Distinction

*For any* social media post, the system must classify it as either an opinion post or an event detection post.

**Validates: Requirements 8.4**

### Property 24: Executive Post Identification

*For any* social media post from an executive or relevant employee, the system must identify and flag it separately from other posts.

**Validates: Requirements 8.5**

### Property 25: Probability Display Universality

*For any* predicted event displayed in the UI, its probability value must be explicitly visible.

**Validates: Requirements 9.1**

### Property 26: No Deterministic Price Predictions

*For any* prediction displayed in the UI, it must not show deterministic price values—only events, timing, and impacts.

**Validates: Requirements 9.3, 9.4**

### Property 27: Confidence Information Display

*For any* probability estimate displayed, the system must also show confidence intervals or confidence levels.

**Validates: Requirements 9.5**

### Property 28: Bayesian Update History Display

*For any* event that has undergone Bayesian updating, the system must display both the prior and posterior probabilities.

**Validates: Requirements 9.6**

### Property 29: Panel Resize Constraints

*For any* panel being resized, its dimensions must remain within the defined minimum and maximum size constraints.

**Validates: Requirements 11.3**

### Property 30: Panel Size Persistence

*For any* panel size change, the new dimensions must be saved to browser localStorage and restored on next session.

**Validates: Requirements 11.4**

### Property 31: Layout Space Conservation

*For any* panel resize operation, the total space occupied by all panels must remain constant (resizing one panel adjusts adjacent panels proportionally).

**Validates: Requirements 11.6**

### Property 32: Event Graph Edge Storage

*For any* causal relationship between events, it must be stored as an edge in the Event_Graph with a from node, to node, and causal strength value.

**Validates: Requirements 12.2**

### Property 33: Probability Update History

*For any* event that receives probability updates, the system must maintain a historical record of all updates including timestamp, prior, posterior, signal, and evidence.

**Validates: Requirements 12.4**

### Property 34: Event Query Correctness

*For any* query for events by criteria (type, time horizon, impact magnitude), the results must contain only events matching all specified criteria.

**Validates: Requirements 12.6**

### Property 35: HTML to JSX Validity

*For any* HTML element converted to JSX, the resulting JSX must be syntactically valid and renderable by React.

**Validates: Requirements 15.1**


## Error Handling

### Frontend Error Handling

**Network Errors:**
- Display toast notifications for failed API calls
- Implement retry logic with exponential backoff
- Show "offline" indicator when WebSocket disconnects
- Cache last known good state for graceful degradation

**Data Validation Errors:**
- Validate all user inputs before sending to backend
- Display inline error messages for invalid filter selections
- Prevent invalid panel resize operations (below minimum, above maximum)
- Show warning when Event Graph would create a cycle

**Rendering Errors:**
- Implement React Error Boundaries around major components
- Fallback to simplified view if chart rendering fails
- Log errors to monitoring service (e.g., Sentry)
- Display user-friendly error messages instead of stack traces

**Real-time Update Errors:**
- Handle WebSocket reconnection automatically
- Queue updates during disconnection and replay on reconnect
- Show staleness indicator if data hasn't updated in expected timeframe
- Implement heartbeat mechanism to detect connection issues

### Backend Error Handling

**API Errors:**
- Return standardized error responses with error codes and messages
- Implement rate limiting to prevent abuse
- Validate all request payloads against schemas
- Return 4xx for client errors, 5xx for server errors

**Data Processing Errors:**
- Wrap Bayesian calculations in try-catch to handle edge cases (division by zero, invalid probabilities)
- Validate Event Graph for cycles before accepting new edges
- Handle missing or malformed data from external APIs gracefully
- Log all errors with context for debugging

**External API Errors:**
- Implement circuit breaker pattern for unreliable external APIs
- Cache responses to reduce dependency on external services
- Provide fallback data sources when primary source fails
- Set timeouts for all external API calls

**Database Errors:**
- Implement connection pooling with retry logic
- Handle transaction failures with rollback
- Validate data integrity before writes
- Monitor database health and alert on issues

### n8n Workflow Error Handling

**Workflow Failures:**
- Configure error workflows to handle failures
- Send alerts to monitoring channels (Slack, email)
- Implement retry logic for transient failures
- Log all workflow executions for audit trail

**Data Quality Issues:**
- Validate data at each workflow step
- Skip invalid records and log them for review
- Implement data quality checks before processing
- Alert when data quality drops below threshold


## Testing Strategy

### Dual Testing Approach

The system requires both unit testing and property-based testing for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing

**Framework Selection:**
- **Frontend (TypeScript)**: fast-check library
- **Backend (Node.js)**: fast-check library
- **Backend (Python)**: Hypothesis library

**Configuration:**
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `Feature: ai-financial-terminal, Property {number}: {property_text}`

**Property Test Examples:**

```typescript
// Property 1: Event Probability Bounds
// Feature: ai-financial-terminal, Property 1: Event Probability Bounds
test('all generated events have probability between 0 and 100', () => {
  fc.assert(
    fc.property(
      fc.record({
        type: fc.constantFrom('macro', 'industry', 'company'),
        impact: fc.float({ min: -100, max: 100 }),
        // ... other event fields
      }),
      (eventData) => {
        const event = generateEvent(eventData);
        return event.probability >= 0 && event.probability <= 100;
      }
    ),
    { numRuns: 100 }
  );
});

// Property 2: Expected Value Calculation
// Feature: ai-financial-terminal, Property 2: Expected Value Calculation
test('expected value equals probability times impact', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0, max: 100 }), // probability
      fc.float({ min: -1000, max: 1000 }), // impact
      (probability, impact) => {
        const event = createEvent({ probability, impact: { revenue: { magnitude: impact } } });
        const expectedEV = (probability / 100) * impact;
        return Math.abs(event.expectedValue - expectedEV) < 0.01; // floating point tolerance
      }
    ),
    { numRuns: 100 }
  );
});

// Property 5: Graph Acyclicity
// Feature: ai-financial-terminal, Property 5: Graph Acyclicity
test('event graph never contains cycles', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({ from: fc.string(), to: fc.string() })), // random edges
      (edges) => {
        const graph = buildGraph(edges);
        return isAcyclic(graph);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing

**Focus Areas:**
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, null/undefined)
- Error conditions (invalid data, network failures)
- Integration points between components
- UI interactions (clicks, hovers, filters)

**Unit Test Examples:**

```typescript
// Example: Default chat summary on load
test('Right Panel displays default summary on load', () => {
  render(<RightPanel messages={[]} selectedEvent={null} />);
  expect(screen.getByText(/company state/i)).toBeInTheDocument();
});

// Example: Reset layout functionality
test('Reset Layout button restores default panel sizes', () => {
  const { result } = renderHook(() => useResizableLayout());
  act(() => result.current.resizePanel('leftPanel', 500));
  act(() => result.current.resetLayout());
  expect(result.current.sizes.leftPanel.width).toBe(DEFAULT_SIZES.leftPanel.width);
});

// Edge case: Empty event list
test('Left Panel handles empty event list gracefully', () => {
  render(<LeftPanel events={[]} filters={{}} />);
  expect(screen.getByText(/no events/i)).toBeInTheDocument();
});

// Error condition: Invalid probability update
test('Bayesian update rejects invalid likelihood values', () => {
  expect(() => {
    updateProbability({ prior: 0.5, likelihood: -0.1, evidence: 0.3 });
  }).toThrow('Likelihood must be between 0 and 1');
});
```

### Integration Testing

**Key Integration Points:**
- Frontend ↔ Backend API communication
- WebSocket real-time updates
- n8n workflows ↔ Backend services
- External APIs (Twitter, Reddit, market data)
- Database operations

**Integration Test Examples:**

```typescript
// Test: Event generation propagates to all UI panels
test('generated event appears in Central Panel, Left Panel, and Chat', async () => {
  const event = await generateFinancialEvent({ metricType: 'cashRunway', threshold: 6 });
  
  // Check Central Panel
  expect(screen.getByTestId(`event-node-${event.id}`)).toBeInTheDocument();
  
  // Check Left Panel
  expect(screen.getByTestId(`event-list-item-${event.id}`)).toBeInTheDocument();
  
  // Check Chat context
  expect(screen.getByText(new RegExp(event.title))).toBeInTheDocument();
});

// Test: WebSocket updates trigger UI refresh
test('WebSocket event update refreshes probability display', async () => {
  const { rerender } = render(<CentralPanel events={[mockEvent]} />);
  
  // Simulate WebSocket update
  act(() => {
    mockWebSocket.emit('event-updated', { ...mockEvent, probability: 75 });
  });
  
  await waitFor(() => {
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
```

### End-to-End Testing

**Framework**: Playwright or Cypress

**Test Scenarios:**
- User loads terminal and sees default company summary
- User filters events by time horizon and sees filtered list
- User clicks event node and sees detail in Right Panel
- User resizes panel and size persists after refresh
- User asks AI question and receives response with event links
- Financial metric crosses threshold and event is auto-generated

### Performance Testing

**Metrics to Monitor:**
- Time to first render (< 2 seconds)
- Event Graph rendering with 100+ nodes (< 1 second)
- Real-time update latency (< 500ms from WebSocket to UI)
- Panel resize responsiveness (60 FPS)
- API response times (< 200ms for most endpoints)

**Load Testing:**
- Simulate 100 concurrent users
- Test WebSocket connection limits
- Verify database query performance under load
- Test n8n workflow throughput


## Implementation Recommendations

### Frontend Implementation

**Component Architecture:**
- Use React Server Components for static content (industry data, initial state)
- Use Client Components for interactive elements (charts, chat, resizable panels)
- Implement custom hooks for shared logic (useEventFilters, useResizableLayout, useBayesianUpdate)
- Use Context API for global state (selected company, active filters, panel sizes)
- Consider Zustand or Jotai for more complex state management if needed

**Styling Approach:**
- Use Shadcn/ui component library for UI primitives (buttons, cards, dialogs, tabs, tooltips)
- Use Tailwind CSS for utility-first styling
- Create custom design tokens for colors (bullish green, bearish red, neutral amber)
- Use CSS Grid for main layout structure
- Implement CSS custom properties for dynamic theming
- Extend Shadcn/ui components with custom variants for financial data visualization

**Chart Visualization:**
- Use Recharts for price charts (React-friendly)
- Use React Flow for Event Graph visualization (built for DAGs)
- Implement custom SVG components for event nodes with probability rings
- Use Shadcn/ui Card and Badge components for metric displays
- Optimize rendering with React.memo and useMemo for large datasets

**Real-time Updates:**
- Use Supabase Realtime for real-time event updates
- Subscribe to database changes using Supabase channels
- Implement optimistic UI updates for better perceived performance
- Use SWR or React Query for data fetching and caching
- Implement debouncing for filter changes to reduce API calls

**Accessibility:**
- Ensure all interactive elements are keyboard accessible
- Provide ARIA labels for screen readers
- Use semantic HTML elements
- Ensure sufficient color contrast (especially important for dark mode)
- Provide text alternatives for visual information (probability rings, colors)

### Backend Implementation

**Supabase Architecture:**
- Use Supabase PostgreSQL for all structured data storage
- Implement Row Level Security (RLS) policies for data access control
- Use Supabase Auth for user authentication and authorization
- Use Supabase Realtime for WebSocket functionality (replaces Socket.io)
- Use Supabase Edge Functions for serverless compute when needed
- Use Supabase Storage for any file storage needs

**Database Design:**
- Use PostgreSQL for structured data (events, companies, users)
- Create indexes on frequently queried fields (event type, company_id, timestamp)
- Use PostgreSQL triggers for automatic timestamp updates
- Implement database functions for complex queries (graph traversal, priority scoring)
- Use Supabase's built-in time-series capabilities for historical data
- Use JSONB columns for flexible schema fields (impact estimates, metadata)

**API Design:**
- Use Next.js API routes for custom business logic
- Use Supabase Client SDK for direct database operations from frontend (with RLS)
- Use Supabase PostgREST API for standard CRUD operations
- Implement Supabase Edge Functions for compute-intensive operations
- Use GraphQL via Supabase if complex queries are needed
- Implement pagination for large result sets
- Version APIs (/api/v1/) for backward compatibility

**Authentication & Authorization:**
- Use Supabase Auth for authentication (email, OAuth, magic links)
- Implement Row Level Security (RLS) policies in PostgreSQL
- Use Supabase JWT tokens for API authentication
- Implement role-based access control (RBAC) using Supabase Auth roles
- Use HTTPS for all communications
- Implement rate limiting using Supabase Edge Functions or middleware

### n8n Integration

**Workflow Design:**
- Create modular workflows that can be composed
- Use sub-workflows for reusable logic
- Implement error handling workflows
- Use webhook triggers for real-time processing
- Use scheduled triggers for batch processing

**Data Flow:**
- External API → n8n → Supabase Database → Supabase Realtime → Frontend
- Frontend → Supabase Client SDK → PostgreSQL (with RLS)
- Frontend → Next.js API Route → Supabase → External Service

**Example Workflows:**

1. **Social Sentiment Pipeline:**
   - Trigger: Schedule (every 5 minutes)
   - Nodes: Twitter API → Classify Sentiment → Aggregate → Supabase Insert → Supabase Realtime (auto-broadcast)

2. **Bayesian Update Pipeline:**
   - Trigger: Webhook (new signal)
   - Nodes: Fetch Event from Supabase → Calculate Posterior → Update Supabase → Realtime Broadcast

3. **Financial Anomaly Detection:**
   - Trigger: Webhook (new financial data)
   - Nodes: Fetch Thresholds from Supabase → Compare Metrics → Generate Events → Insert to Supabase → Realtime Notify

**n8n Best Practices:**
- Use environment variables for configuration
- Implement retry logic for external API calls
- Log all workflow executions
- Monitor workflow performance
- Version control workflow JSON files

### Deployment

**Frontend Deployment:**
- Deploy to Vercel (optimized for Next.js) or Netlify
- Use CDN for static assets
- Implement edge caching for API routes
- Use environment variables for Supabase credentials
- Implement CI/CD with GitHub Actions

**Backend Deployment:**
- Supabase is fully managed (no deployment needed)
- Deploy n8n on dedicated server, container, or use n8n Cloud
- Use Supabase Edge Functions for serverless compute
- Implement backup strategy for Supabase database
- Monitor Supabase usage and performance metrics

### Monitoring and Observability

**Logging:**
- Use structured logging (JSON format)
- Log all API requests and responses
- Log all probability updates with context
- Use centralized logging (ELK stack, Datadog, CloudWatch)

**Metrics:**
- Track API response times
- Monitor WebSocket connection count
- Track event generation rate
- Monitor database query performance
- Track n8n workflow success/failure rates

**Alerting:**
- Alert on high error rates
- Alert on slow API responses
- Alert on WebSocket disconnections
- Alert on n8n workflow failures
- Alert on database connection issues

**Tracing:**
- Implement distributed tracing (Jaeger, Zipkin)
- Trace requests across services
- Identify performance bottlenecks
- Debug complex issues across system boundaries


## Risks and Limitations

### Technical Risks

**1. Real-time Performance at Scale**
- **Risk**: With hundreds of events and frequent updates, the Event Graph visualization may become slow
- **Mitigation**: Implement virtualization for large graphs, use WebGL for rendering, implement level-of-detail rendering
- **Limitation**: May need to limit visible events to most relevant ones

**2. Bayesian Update Accuracy**
- **Risk**: Incorrect likelihood estimation can lead to poor probability updates
- **Mitigation**: Use historical data to calibrate likelihoods, implement confidence intervals, allow manual adjustments
- **Limitation**: Probabilities are estimates, not guarantees

**3. External API Reliability**
- **Risk**: Twitter/Reddit APIs may have rate limits, downtime, or policy changes
- **Mitigation**: Implement caching, use multiple data sources, implement circuit breakers
- **Limitation**: Social sentiment data may be incomplete or delayed

**4. Graph Complexity Management**
- **Risk**: Causal graphs can become too complex to visualize effectively
- **Mitigation**: Implement graph simplification algorithms, allow filtering by causal strength, use hierarchical layouts
- **Limitation**: May need to hide weak causal connections

**5. WebSocket Connection Stability**
- **Risk**: WebSocket connections may drop, especially on mobile or unstable networks
- **Mitigation**: Implement automatic reconnection, queue updates during disconnection, use heartbeat mechanism
- **Limitation**: Brief periods of stale data during reconnection

### Data Quality Risks

**1. Social Sentiment Noise**
- **Risk**: Social media contains spam, bots, and low-quality content
- **Mitigation**: Implement bot detection, weight by author credibility, filter by engagement metrics
- **Limitation**: Some noise will always remain in social signals

**2. Financial Data Accuracy**
- **Risk**: Financial data may be delayed, restated, or incorrect
- **Mitigation**: Use multiple data sources, implement data validation, show data freshness timestamps
- **Limitation**: Historical data may be revised after initial display

**3. Event Prediction Accuracy**
- **Risk**: Predicted events may not occur, or may occur with different timing/impact
- **Mitigation**: Track prediction accuracy over time, adjust models based on outcomes, display confidence levels
- **Limitation**: Predictions are probabilistic, not deterministic

**4. Causal Relationship Validity**
- **Risk**: Inferred causal relationships may be spurious correlations
- **Mitigation**: Use domain knowledge to validate relationships, require minimum evidence threshold, allow manual review
- **Limitation**: Some relationships may be correlational rather than causal

### Business Risks

**1. Regulatory Compliance**
- **Risk**: Financial predictions may be subject to regulatory scrutiny
- **Mitigation**: Include disclaimers, ensure predictions are clearly probabilistic, consult legal counsel
- **Limitation**: May need to restrict certain features in regulated markets

**2. Data Privacy**
- **Risk**: Handling user data and financial information requires strict privacy controls
- **Mitigation**: Implement encryption, follow GDPR/CCPA guidelines, minimize data collection
- **Limitation**: Some features may be limited by privacy requirements

**3. Market Impact**
- **Risk**: If widely used, the system's predictions could become self-fulfilling
- **Mitigation**: Diversify prediction models, avoid publishing predictions publicly, implement access controls
- **Limitation**: Cannot prevent all market impact if system becomes popular

**4. Liability for Incorrect Predictions**
- **Risk**: Users may make financial decisions based on predictions and suffer losses
- **Mitigation**: Clear disclaimers, emphasize probabilistic nature, require user acknowledgment
- **Limitation**: Cannot eliminate all liability risk

### Scalability Limitations

**1. User Concurrency**
- **Risk**: System may struggle with thousands of concurrent users
- **Mitigation**: Implement horizontal scaling, use CDN, optimize database queries, implement caching
- **Limitation**: May need to implement usage tiers or rate limiting

**2. Data Volume**
- **Risk**: Historical data and event history can grow very large
- **Mitigation**: Implement data archiving, use time-series database, implement data retention policies
- **Limitation**: Very old data may be archived and not immediately accessible

**3. Computation Intensity**
- **Risk**: Bayesian updates and graph calculations can be computationally expensive
- **Mitigation**: Use background jobs for heavy computation, implement result caching, optimize algorithms
- **Limitation**: Some updates may be delayed during high load

### User Experience Limitations

**1. Complexity for New Users**
- **Risk**: The system is complex and may overwhelm new users
- **Mitigation**: Implement onboarding tutorial, provide contextual help, offer simplified view mode
- **Limitation**: Requires significant learning curve

**2. Mobile Experience**
- **Risk**: Complex visualizations may not work well on mobile devices
- **Mitigation**: Implement responsive design, create mobile-optimized views, prioritize most important information
- **Limitation**: Full feature set may only be available on desktop

**3. Information Overload**
- **Risk**: Too many events and signals can overwhelm users
- **Mitigation**: Implement smart filtering, prioritize high-impact events, allow customization
- **Limitation**: Users must actively manage information flow

### Mitigation Priority

**High Priority:**
1. Implement robust error handling and fallbacks
2. Ensure Bayesian update correctness through extensive testing
3. Implement graph acyclicity validation
4. Add clear disclaimers about probabilistic nature of predictions
5. Implement data validation at all system boundaries

**Medium Priority:**
1. Optimize rendering performance for large graphs
2. Implement comprehensive monitoring and alerting
3. Create user onboarding and documentation
4. Implement data archiving strategy
5. Add mobile-responsive design

**Low Priority:**
1. Implement advanced graph simplification algorithms
2. Add machine learning for improved predictions
3. Create public API for third-party integrations
4. Implement multi-language support
5. Add advanced customization options

