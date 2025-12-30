# Requirements Document

## Introduction

This document specifies the requirements for an AI Financial Causal Terminal - a predictive financial intelligence system that forecasts future events impacting stock prices using causal models, probabilistic reasoning, and graph-based analysis. Unlike traditional terminals that focus on historical visualization, this system predicts events, assigns explicit probabilities, estimates timing and economic impact, and enables interactive reasoning with AI.

## Glossary

- **System**: The AI Financial Causal Terminal
- **Event**: A future occurrence (macro, industry, or company-specific) that may impact stock prices
- **Event_Graph**: A directed acyclic graph (DAG) representing causal relationships between events and assets
- **Probability**: The likelihood (0-100%) that a predicted event will occur
- **Expected_Value**: The probabilistic economic impact of an event (EV = probability × impact)
- **Impact**: The estimated effect on Revenue, Margin, Market Cap, or Stock Price
- **Timing_Window**: The expected timeframe when an event may occur
- **Signal**: Data input used to update event probabilities (hard data, soft data, social sentiment)
- **Social_Sentiment**: Aggregated opinion data from Twitter/X and Reddit
- **Bayesian_Update**: Dynamic probability adjustment based on new signals
- **User**: A financial professional (hedge fund manager, PM, founder) using the system
- **Central_Panel**: Main visualization area showing price chart and event graph
- **Left_Panel**: Prioritized list of future events
- **Right_Panel**: Interactive AI chat interface
- **Financial_Analysis_Panel**: Interactive financial metrics panel positioned centrally below the chart and above the industry section
- **Industry_Panel**: Industry and company comparison section positioned below the Financial_Analysis_Panel
- **Ribbon**: Fixed bottom bar showing global macro events

## Requirements

### Requirement 1: Event Prediction and Probability Management

**User Story:** As a financial professional, I want the system to predict future events with explicit probabilities, so that I can assess risks and opportunities quantitatively.

#### Acceptance Criteria

1. WHEN the System analyzes available data, THE System SHALL generate predictions for future events in three categories: macro, industry, and company-specific
2. FOR EACH predicted event, THE System SHALL assign an initial probability value between 0% and 100%
3. FOR EACH predicted event, THE System SHALL calculate an Expected_Value based on probability and estimated impact
4. WHEN new Signal data becomes available, THE System SHALL update event probabilities using Bayesian_Update methodology
5. FOR EACH event, THE System SHALL specify a Timing_Window indicating when the event is expected to occur
6. FOR EACH event, THE System SHALL estimate Impact on at least one of: Revenue, Margin, Market Cap, or Stock Price

### Requirement 2: Unified Price Chart and Event Graph

**User Story:** As a user, I want to see predicted events as a natural continuation of the historical price chart, so that I can visualize the complete timeline from past to future in one unified view.

#### Acceptance Criteria

1. THE System SHALL display a unified price chart in the Central_Panel that extends from historical data into future predictions
2. THE System SHALL use TradingView-style visualization for the historical price portion
3. THE System SHALL overlay future events as circular node icons positioned on the timeline according to their Timing_Window
4. WHEN rendering event nodes, THE System SHALL represent each event as a circle with an SVG ring indicating probability percentage
5. WHEN rendering event nodes, THE System SHALL color-code nodes based on Impact direction: green for bullish, red for bearish, amber for neutral
6. THE System SHALL display causal connections between events as lines connecting the circular nodes
7. THE System SHALL ensure the Event_Graph forms a directed acyclic graph (DAG) structure
8. WHEN a user hovers over an event node, THE System SHALL display a tooltip containing: drivers, sources, and Expected_Value
9. WHEN a user clicks an event node, THE System SHALL expand detailed information in the Right_Panel
10. THE System SHALL visually distinguish the historical price section from the future event prediction section using subtle styling

### Requirement 3: Future Events Panel

**User Story:** As a user, I want a prioritized list of future events, so that I can quickly identify the most important upcoming catalysts.

#### Acceptance Criteria

1. THE System SHALL display a prioritized list of future events in the Left_Panel
2. FOR EACH event in the list, THE System SHALL display: probability, expected impact, and confidence level
3. THE System SHALL categorize events by type: macro, industry, and company-specific
4. WHERE the user applies filters, THE System SHALL filter events by: time horizon, event type, and signal dominance (hard/soft data)
5. THE System SHALL order events by a priority score combining probability, impact magnitude, and temporal proximity

### Requirement 4: Interactive AI Chat

**User Story:** As a user, I want to interact with an AI to explore scenarios and ask questions, so that I can deepen my understanding of causal relationships.

#### Acceptance Criteria

1. THE System SHALL provide an interactive chat interface in the Right_Panel
2. WHEN the Right_Panel loads, THE System SHALL display a default summary containing: company state description and causal reasoning explanation
3. WHEN a user asks a "what if" question, THE System SHALL generate counterfactual scenario analysis
4. WHEN a user requests detail on a specific event, THE System SHALL expand information in a modal containing: structured text, links to Event_Graph nodes, source data, and action buttons
5. THE System SHALL provide quick action buttons in chat responses: Summarize, Scenario+, Bear Case, Bull Case
6. WHEN generating responses that reference events, THE System SHALL create clickable links to corresponding Event_Graph nodes

### Requirement 5: Financial Analysis Panel (Interactive UI Component)

**User Story:** As a user, I want an interactive financial analysis panel positioned centrally below the chart, so that I can monitor key financial metrics and automatically detect anomalies that generate future events.

#### Acceptance Criteria

1. THE System SHALL display a Financial Analysis Panel positioned centrally below the price chart and above the Industry_Panel
2. THE System SHALL render the panel in a compact, dense, Bloomberg-style dark mode interface with monospaced numbers
3. WHEN the Financial Analysis Panel loads, THE System SHALL display a Financial Snapshot view as the default
4. THE System SHALL provide three interactive tabs: Financial Snapshot, Financial Stress, and Earnings Quality, and Cycle & Demand
5. FOR EACH financial metric displayed, THE System SHALL show: value, trend indicator (↑ ↓ →), and status color (green/amber/red)
6. WHEN a user hovers over a metric, THE System SHALL display a tooltip explaining why the metric matters and historical thresholds
7. WHEN a user clicks a metric, THE System SHALL open a detailed sub-panel and link to related future events in the Event_Graph

#### Financial Snapshot Tab Acceptance Criteria

8. THE System SHALL display a 2×4 grid of industry-aware financial KPIs including: Cash runway (months), Net Debt/EBITDA, Free Cash Flow margin, Gross margin, Inventory growth vs revenue growth, Capex/Revenue, ROIC vs WACC, and SBC % Revenue
9. THE System SHALL adapt displayed metrics based on the company's industry classification

#### Financial Stress Tab Acceptance Criteria

10. WHEN the Financial Stress tab is selected, THE System SHALL display: debt maturity timeline (horizontal bar by year), liquidity buffer gauge, and credit lines available vs used
11. THE System SHALL highlight refinancing cliffs and dilution risk zones visually
12. WHEN any liquidity metric crosses a red threshold, THE System SHALL automatically generate a "Liquidity Risk" future event on the main timeline with probability, expected timing, and impact on valuation

#### Earnings Quality Tab Acceptance Criteria

13. WHEN the Earnings Quality tab is selected, THE System SHALL display: Net Income vs Operating Cash Flow comparison, accruals ratio, one-off expenses frequency, and capitalized costs trend
14. WHEN earnings quality red flags are detected, THE System SHALL automatically create a "Low Earnings Quality" node in the Event_Graph
15. FOR EACH earnings quality issue, THE System SHALL display a tooltip stating: "Historically, this pattern leads to X outcome in Y% of cases"

#### Cycle & Demand Tab Acceptance Criteria

16. WHEN the Cycle & Demand tab is selected, THE System SHALL display: Inventory days (DIO), Backlog/Book-to-Bill ratio, Revenue vs inventory delta, and Customer concentration percentage
17. WHEN divergence is detected between inventory and revenue trends, THE System SHALL automatically create events such as "Inventory glut risk" or "Demand normalization"
18. THE System SHALL visually link demand-related events to suppliers and competitors in the Event_Graph

#### Automatic Event Generation Acceptance Criteria

19. WHEN a financial metric crosses an industry threshold, THE System SHALL automatically create a future event node
20. WHEN a financial metric diverges from its historical pattern, THE System SHALL automatically create a future event node
21. WHEN a financial metric conflicts with management guidance, THE System SHALL automatically create a future event node
22. FOR EACH automatically generated event, THE System SHALL assign: probability, expected timing delay, and impact estimates (revenue, margin, price)
23. THE System SHALL display automatically generated events in: the main chart timeline, the Left_Panel future events list, and the chat context for AI reasoning
24. THE System SHALL use minimal labels with rich hover information, and SHALL NOT display charts unless they encode change or risk

### Requirement 6: Industry and Company Context

**User Story:** As a user, I want to see industry context and competitor comparisons positioned below the financial analysis, so that I can understand relative positioning.

#### Acceptance Criteria

1. THE System SHALL display industry and company information in the Industry_Panel positioned below the Financial_Analysis_Panel
2. THE System SHALL show: current industry classification, key competitors, and relevant customers
3. THE System SHALL provide comparative cards showing metrics across competitors
4. WHERE the user selects a different industry, THE System SHALL update the Industry_Panel with the new industry context
5. THE System SHALL provide a horizontal selector to switch between different industries

### Requirement 7: Macro Economic Events Ribbon

**User Story:** As a user, I want to see upcoming global macro events, so that I can anticipate market-moving catalysts.

#### Acceptance Criteria

1. THE System SHALL display a fixed horizontal Ribbon at the bottom showing upcoming macro economic events
2. FOR EACH macro event in the Ribbon, THE System SHALL display: date, consensus estimate, and expected deviation
3. THE System SHALL categorize macro events and provide quick filters by category
4. WHEN a user selects a macro event from the Ribbon, THE System SHALL overlay it on the Central_Panel price chart
5. THE System SHALL update the Ribbon in real-time as new macro events are scheduled

### Requirement 8: Social Sentiment Integration

**User Story:** As a user, I want to incorporate social sentiment from Twitter/X and Reddit as signals, so that I can capture qualitative market intelligence.

#### Acceptance Criteria

1. THE System SHALL ingest social sentiment data from Twitter/X and Reddit via APIs
2. WHEN processing social data, THE System SHALL classify each post as: Bullish, Bearish, or Neutral
3. THE System SHALL aggregate social sentiment with metrics: post count, unique author count, and influence-weighted score
4. THE System SHALL distinguish between opinion posts and event detection posts (insider hints, warnings)
5. THE System SHALL identify posts from executives and relevant employees separately
6. WHERE a social event has sufficient validation, THE System SHALL allow promotion to an Event_Graph node with human approval
7. WHEN displaying social sentiment, THE System SHALL show it as a Signal that influences event probabilities, not as deterministic predictions

### Requirement 9: Probabilistic Reasoning Display

**User Story:** As a user, I want to see explicit probabilities and expected values rather than deterministic predictions, so that I can make risk-adjusted decisions.

#### Acceptance Criteria

1. THE System SHALL display probability values explicitly for all predicted events
2. THE System SHALL calculate and display Expected_Value for each event using the formula: EV = probability × impact
3. THE System SHALL NOT display deterministic price predictions
4. WHEN showing predictions, THE System SHALL predict: events, timing, and impacts (not absolute prices)
5. THE System SHALL display confidence intervals or confidence levels for probability estimates
6. WHEN probabilities are updated via Bayesian_Update, THE System SHALL show the prior and posterior probabilities

### Requirement 10: Professional Dark Mode Interface

**User Story:** As a user, I want a professional dark mode interface with clear visual hierarchy, so that I can work efficiently without visual fatigue.

#### Acceptance Criteria

1. THE System SHALL use a dark mode color scheme as the default interface theme
2. THE System SHALL use the following color palette: green for bullish signals, red for bearish signals, amber for neutral signals
3. THE System SHALL use Inter or Inter Mono typography throughout the interface
4. WHEN designing UI elements, THE System SHALL prioritize clarity over aesthetic decoration
5. THE System SHALL implement hover microinteractions that display informative tooltips
6. WHEN a user clicks UI elements, THE System SHALL expand content inline rather than navigating to new pages
7. THE System SHALL minimize visual noise and maintain high information density

### Requirement 11: Resizable Panel System

**User Story:** As a user, I want to resize all panels to customize my workspace layout, so that I can focus on the information most relevant to my analysis.

#### Acceptance Criteria

1. THE System SHALL make all panels resizable: Central_Panel, Left_Panel, Right_Panel, Financial_Analysis_Panel, and Industry_Panel
2. WHEN a user drags a panel border, THE System SHALL resize the panel in real-time with smooth visual feedback
3. THE System SHALL maintain minimum and maximum size constraints for each panel to ensure usability
4. THE System SHALL persist panel sizes in browser local storage so layout preferences are maintained across sessions
5. THE System SHALL provide a "Reset Layout" option to restore default panel sizes
6. THE System SHALL ensure that resizing one panel appropriately adjusts adjacent panels to maintain overall layout integrity
7. THE System SHALL display resize handles visually when hovering over panel borders
8. THE System SHALL NOT allow the Ribbon to be resized (it remains fixed height)

### Requirement 12: Data Model and State Management

**User Story:** As a system architect, I want a well-defined data model for events, graphs, and probabilities, so that the system maintains consistency and enables complex queries.

#### Acceptance Criteria

1. THE System SHALL maintain a data model that includes: events, Event_Graph structure, probabilities, impacts, and timing windows
2. THE System SHALL store causal relationships between events as edges in the Event_Graph DAG
3. WHEN storing event data, THE System SHALL include: event ID, type, description, probability, prior probability, impact estimates, timing window, confidence level, and source signals
4. THE System SHALL maintain historical records of probability updates and Bayesian_Update calculations
5. THE System SHALL ensure the Event_Graph remains acyclic (no circular dependencies)
6. THE System SHALL support queries for: events by type, events by time horizon, events by impact magnitude, and causal paths between events

### Requirement 13: Real-time Data Integration

**User Story:** As a user, I want the system to update in real-time as new data arrives, so that I always have current information.

#### Acceptance Criteria

1. WHEN new market data becomes available, THE System SHALL update relevant visualizations within 5 seconds
2. WHEN new social sentiment data arrives, THE System SHALL process and integrate it within 30 seconds
3. WHEN macro economic data is released, THE System SHALL trigger Bayesian_Update for affected events within 10 seconds
4. THE System SHALL display a visual indicator when data is being updated
5. THE System SHALL maintain UI responsiveness during data updates (no blocking operations)

### Requirement 14: Frontend Technology Stack

**User Story:** As a developer, I want the frontend built with Next.js latest version, so that I can leverage modern React features, server-side rendering, and optimal performance.

#### Acceptance Criteria

1. THE System SHALL use Next.js (latest stable version) as the frontend framework
2. THE System SHALL use React Server Components where appropriate for optimal performance
3. THE System SHALL implement client-side components for interactive elements (charts, graphs, chat interface)
4. THE System SHALL use Next.js App Router for routing and navigation
5. THE System SHALL leverage Next.js API routes for backend communication when needed
6. THE System SHALL implement proper code splitting and lazy loading for optimal bundle size
7. THE System SHALL use TypeScript for type safety across the frontend codebase
8. THE System SHALL implement responsive design that works on desktop displays (primary target: large monitors for professional use)

### Requirement 15: HTML to JSX Component Migration

**User Story:** As a developer, I want to convert the existing HTML template into modular JSX components in Next.js, so that I can maintain a clean, reusable component architecture.

#### Acceptance Criteria

1. THE System SHALL convert all HTML markup from the existing template into JSX syntax compatible with React/Next.js
2. THE System SHALL decompose the UI into modular, reusable components following React best practices
3. THE System SHALL create separate components for: Central Panel (chart + event graph), Left Panel (future events list), Right Panel (AI chat), Financial Analysis Panel (positioned centrally below chart), Industry Panel (positioned below financial analysis), and Bottom Ribbon (macro events)
4. THE System SHALL extract reusable sub-components such as: EventNode, MetricCard, TooltipWrapper, TabContainer, and ChatMessage
5. THE System SHALL use React hooks (useState, useEffect, useContext) for state management within components
6. THE System SHALL implement proper prop typing using TypeScript interfaces for all components
7. THE System SHALL convert inline styles to CSS modules or styled-components/Tailwind CSS classes
8. THE System SHALL maintain the visual design and layout from the original HTML template
9. THE System SHALL ensure all interactive elements (hover, click, filters) work correctly in the JSX implementation
10. THE System SHALL organize components in a logical directory structure (e.g., components/panels/, components/ui/, components/charts/)

### Requirement 16: Backend Architecture with n8n Integration Support

**User Story:** As a system architect, I want a backend architecture that supports both traditional API services and n8n workflow automation, so that I can choose the most appropriate implementation for different data pipelines.

#### Acceptance Criteria

1. THE System SHALL design backend services with clear API contracts that can be implemented via traditional services OR n8n workflows
2. THE System SHALL support n8n as an alternative implementation for: data ingestion pipelines, social sentiment processing, event probability updates, and webhook integrations
3. WHERE n8n is used, THE System SHALL expose standardized REST API endpoints that match the traditional backend API contract
4. THE System SHALL document which backend services can be implemented via n8n workflows
5. THE System SHALL provide webhook endpoints that n8n workflows can call to push processed data
6. THE System SHALL support authentication and authorization for both traditional backend services and n8n workflow endpoints
7. THE System SHALL maintain data consistency regardless of whether services are implemented traditionally or via n8n
8. THE System SHALL provide example n8n workflow templates for common data pipelines: market data ingestion, social sentiment analysis, and Bayesian probability updates
9. WHERE traditional backend services are used, THE System SHALL implement them using a modern stack (Node.js/Python) with clear separation of concerns
10. THE System SHALL use a message queue or event bus (e.g., Redis, RabbitMQ) to decouple data ingestion from processing, enabling both traditional and n8n implementations to coexist
