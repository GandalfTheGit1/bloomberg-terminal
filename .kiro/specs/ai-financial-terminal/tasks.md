# Implementation Plan: AI Financial Causal Terminal

## Overview

This implementation plan breaks down the AI Financial Causal Terminal into discrete, incremental coding tasks. The system will be built using Next.js (latest version) with TypeScript for the frontend, and Node.js/TypeScript for backend services with optional n8n workflow integration. Each task builds on previous work, with property-based tests integrated throughout to validate correctness early.

## Tasks

- [x] 1. Project setup and core infrastructure
  - Initialize Next.js project with TypeScript and App Router
  - Install and configure Shadcn/ui with TailwindCSS
  - Set up custom design tokens (bullish green, bearish red, neutral amber)
  - Set up project structure: components/, lib/, types/, app/
  - Install core dependencies: React Flow, Recharts, @supabase/supabase-js, fast-check
  - Configure TypeScript with strict mode
  - Set up ESLint and Prettier
  - Initialize Supabase project and get credentials
  - Commit and push: `git add . && git commit -m "feat: initial project setup with Next.js, Shadcn/ui, and Supabase" && git push`
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6, 13.7_

- [x] 2. Core data models and types
  - [x] 2.1 Define TypeScript interfaces for Event, EventGraph, FinancialMetrics, SocialPost models
    - Create types/models.ts with all core interfaces
    - Include Event with probability, timing window, impact estimates
    - Include EventGraph with nodes and edges
    - Include FinancialMetrics with all KPIs
    - Include SocialPost with sentiment classification
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 12.1, 12.3_

  - [x] 2.2 Write property test for Event model structure
    - **Property 4: Event Structural Completeness**
    - **Validates: Requirements 1.5, 1.6, 12.3**

  - [x] 2.3 Write property test for probability bounds
    - **Property 1: Event Probability Bounds**
    - **Validates: Requirements 1.2**
  
  - Commit and push: `git add . && git commit -m "feat: add core data models and property tests" && git push`

- [x] 3. Bayesian update engine and UI component parsing
  - [x] 3.1 Implement Bayesian probability update function
    - Create lib/bayesian.ts with updateProbability function
    - Implement P(H|E) = P(E|H) × P(H) / P(E)
    - Handle edge cases (zero probabilities, invalid inputs)
    - Return both prior and posterior probabilities
    - _Requirements: 1.4, 9.6_

  - [x] 3.2 Write property test for Bayesian update correctness
    - **Property 3: Bayesian Update Correctness**
    - **Validates: Requirements 1.4**

  - [x] 3.3 Write unit tests for edge cases
    - Test zero prior probability
    - Test likelihood of 1.0
    - Test invalid inputs (negative probabilities)
    - _Requirements: 1.4_

  - [x] 3.4 Parse and integrate causal terminal dashboard UI components
    - Extract and adapt components from v0-causal-terminal-dashboard/
    - Migrate DashboardHeader, ForecastedEvents, SocialFeed, CausalChart, ChatPanel, IndustryLookback components
    - Convert to match project structure and design system (Shadcn/ui + TailwindCSS)
    - Integrate resizable panel layout from v0 dashboard
    - Adapt color scheme and styling to match AI Financial Terminal design tokens
    - Update component imports and dependencies
    - _Requirements: 2.2, 2.7, 3.1, 4.1, 6.1, 7.1, 11.1_
  
  - Commit and push: `git add . && git commit -m "feat: implement Bayesian update engine with tests and parse causal terminal UI" && git push`

- [x] 3.5. UI Component State Integration
  - [x] 3.5.1 Create global state management with Zustand
    - Create lib/store.ts with Zustand store
    - Define state interfaces for events, company data, UI state
    - Implement actions for updating events, filters, selected company
    - Add panel size persistence state
    - _Requirements: 11.4, 12.1_

  - [x] 3.5.2 Create mock data providers
    - Create lib/mockData.ts with comprehensive mock datasets
    - Generate realistic event data with probabilities and timing
    - Create mock financial metrics data
    - Generate mock social sentiment data
    - Create mock industry and competitor data
    - _Requirements: 1.1, 1.2, 1.3, 5.8, 8.2_

  - [x] 3.5.3 Connect ForecastedEvents component to state
    - Update ForecastedEvents to use Zustand store
    - Implement event filtering and sorting logic
    - Add click handlers for event selection
    - Connect to mock data provider
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [x] 3.5.4 Connect SocialFeed component to state
    - Update SocialFeed to use Zustand store
    - Implement sentiment filtering logic
    - Connect to mock social data
    - Add real-time update simulation
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 3.5.5 Connect CausalChart component to state
    - Update CausalChart to use Zustand store
    - Implement event node click handlers
    - Connect chart data to selected company
    - Add event tooltip data from store
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.5.6 Connect ChatPanel to n8n AI agent integration
    - Create lib/n8nClient.ts for n8n webhook communication
    - Implement chat message handling with n8n workflows
    - Add typing indicators and response streaming
    - Connect chat context to current events and company data
    - _Requirements: 4.1, 4.2, 4.3, 16.2, 16.3_

  - [x] 3.5.7 Connect DashboardHeader to state
    - Update DashboardHeader to use Zustand store
    - Implement company search functionality
    - Connect stock price and metrics to selected company
    - Add notification system integration
    - _Requirements: 2.2, 13.1_

  - [x] 3.5.8 Connect IndustryLookback to state
    - Update IndustryLookback to use Zustand store
    - Connect to industry and competitor data
    - Implement industry switching logic
    - Add competitor comparison functionality
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - Commit and push: `git add . && git commit -m "feat: integrate UI components with state management and mock data" && git push`

- [ ] 4. Expected Value calculation
  - [ ] 4.1 Implement Expected Value calculation function
    - Create lib/calculations.ts with calculateExpectedValue function
    - Implement EV = probability × impact
    - Handle multiple impact types (revenue, margin, marketCap, stockPrice)
    - _Requirements: 1.3, 9.2_

  - [ ] 4.2 Write property test for EV calculation
    - **Property 2: Expected Value Calculation**
    - **Validates: Requirements 1.3, 9.2**
  
  - Commit and push: `git add . && git commit -m "feat: implement Expected Value calculation with tests" && git push`

- [ ] 4.5. Financial Analysis Panel Implementation
  - [ ] 4.5.1 Create FinancialAnalysisPanel component
    - Create components/panels/FinancialAnalysisPanel.tsx
    - Implement tab system (Financial Snapshot, Financial Stress, Earnings Quality, Cycle & Demand)
    - Create MetricCard sub-component with trend indicators
    - Add industry-aware metric selection logic
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.8, 5.9_

  - [ ] 4.5.2 Implement Financial Snapshot tab
    - Create 2×4 KPI grid with industry-aware metrics
    - Display Cash runway, Net Debt/EBITDA, FCF margin, Gross margin
    - Add Inventory growth vs revenue, Capex/Revenue, ROIC vs WACC, SBC % Revenue
    - Implement trend indicators (↑ ↓ →) and status colors
    - _Requirements: 5.5, 5.8_

  - [ ] 4.5.3 Implement Financial Stress tab
    - Create debt maturity timeline visualization
    - Add liquidity buffer gauge component
    - Display credit lines available vs used
    - Highlight refinancing cliffs and dilution risk zones
    - _Requirements: 5.10, 5.11_

  - [ ] 4.5.4 Implement Earnings Quality tab
    - Create Net Income vs Operating Cash Flow comparison
    - Display accruals ratio and one-off expenses frequency
    - Add capitalized costs trend visualization
    - _Requirements: 5.13_

  - [ ] 4.5.5 Implement Cycle & Demand tab
    - Display Inventory days (DIO) and Backlog/Book-to-Bill
    - Add Revenue vs inventory delta visualization
    - Show Customer concentration percentage
    - _Requirements: 5.16_

  - [ ] 4.5.6 Connect Financial Analysis Panel to main layout
    - Update app/page.tsx to include FinancialAnalysisPanel
    - Position panel centrally below chart and above industry section
    - Connect to Zustand store for financial data
    - _Requirements: 5.1_

  - [ ] 4.5.7 Implement metric tooltips and click handlers
    - Create MetricTooltip component with explanations
    - Add click handlers to open detailed sub-panels
    - Link metrics to related events in Event Graph
    - _Requirements: 5.6, 5.7_

  - Commit and push: `git add . && git commit -m "feat: implement Financial Analysis Panel with all tabs" && git push`

- [ ] 5. Event Graph management
  - [ ] 5.1 Implement graph data structure and acyclicity validation
    - Create lib/graph.ts with EventGraph class
    - Implement addNode, addEdge, removeNode, removeEdge methods
    - Implement isAcyclic function using DFS
    - Prevent adding edges that would create cycles
    - _Requirements: 2.1, 12.2, 12.5_

  - [ ] 5.2 Write property test for graph acyclicity
    - **Property 5: Graph Acyclicity**
    - **Validates: Requirements 2.1, 12.5**

  - [ ] 5.3 Write unit tests for graph operations
    - Test adding nodes and edges
    - Test cycle detection
    - Test edge removal
    - _Requirements: 12.2, 12.5_
  
  - Commit and push: `git add . && git commit -m "feat: implement Event Graph management with acyclicity validation" && git push`

- [ ] 5.5. N8N AI Agent Integration
  - [ ] 5.5.1 Create n8n workflow templates
    - Create n8n-workflows/ai-chat-agent.json
    - Design workflow for processing chat messages and generating responses
    - Include context injection from current events and company data
    - Add response formatting and event reference linking
    - _Requirements: 4.3, 16.8_

  - [ ] 5.5.2 Create n8n financial analysis workflow
    - Create n8n-workflows/financial-analysis-agent.json
    - Design workflow for analyzing financial metrics
    - Include threshold detection and anomaly identification
    - Add automatic event generation from financial data
    - _Requirements: 5.19, 5.20, 5.21, 16.8_

  - [ ] 5.5.3 Create n8n social sentiment workflow
    - Create n8n-workflows/social-sentiment-agent.json
    - Design workflow for processing social media data
    - Include sentiment classification and aggregation
    - Add executive post identification logic
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 16.8_

  - [ ] 5.5.4 Implement n8n webhook client
    - Create lib/n8nClient.ts with webhook communication
    - Add authentication and error handling
    - Implement request/response formatting
    - Add retry logic and timeout handling
    - _Requirements: 16.2, 16.3, 16.5_

  - [ ] 5.5.5 Connect ChatPanel to n8n AI agent
    - Update ChatPanel to use n8n webhook for message processing
    - Implement context injection (current company, events, metrics)
    - Add response streaming and typing indicators
    - Handle event reference linking in responses
    - _Requirements: 4.3, 4.6, 16.2_

  - [ ] 5.5.6 Connect Financial Analysis Panel to n8n
    - Update FinancialAnalysisPanel to trigger n8n workflows
    - Send financial metrics to n8n for analysis
    - Receive and process generated events from n8n
    - Update UI with auto-generated events
    - _Requirements: 5.19, 5.20, 5.21, 5.23_

  - [ ] 5.5.7 Connect Social Feed to n8n processing
    - Update SocialFeed to send data to n8n for processing
    - Receive classified and aggregated sentiment data
    - Update UI with processed social sentiment
    - Handle executive post identification
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - Commit and push: `git add . && git commit -m "feat: integrate n8n AI agents with UI components" && git push`

- [ ] 6. Checkpoint - Core logic validation
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 7. Resizable panel system
  - [ ] 7.1 Implement resizable layout hook
    - Create hooks/useResizableLayout.ts
    - Implement drag-to-resize logic
    - Enforce minimum/maximum size constraints
    - Persist sizes to localStorage
    - Provide resetLayout function
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ] 7.2 Write property test for resize constraints
    - **Property 29: Panel Resize Constraints**
    - **Validates: Requirements 11.3**

  - [ ] 7.3 Write property test for space conservation
    - **Property 31: Layout Space Conservation**
    - **Validates: Requirements 11.6**

  - [ ] 7.4 Write property test for size persistence
    - **Property 30: Panel Size Persistence**
    - **Validates: Requirements 11.4**

  - [ ] 7.5 Write unit tests for resize interactions
    - Test drag events update dimensions
    - Test reset layout restores defaults
    - Test localStorage save/restore
    - _Requirements: 11.1, 11.2, 11.4, 11.5_
  
  - Commit and push: `git add . && git commit -m "feat: implement resizable panel system with persistence" && git push`

- [ ] 8. Central Panel - Price chart and event visualization
  - [ ] 8.1 Create CentralPanel component with price chart
    - Create components/panels/CentralPanel.tsx
    - Integrate Recharts for TradingView-style price visualization
    - Display historical price data on left side
    - Implement timeline axis
    - _Requirements: 2.2, 2.7_

  - [ ] 8.2 Add event node rendering to timeline
    - Create components/ui/EventNode.tsx
    - Render circular SVG nodes with probability rings
    - Position events according to timing windows
    - Implement color coding (green/red/amber) based on impact direction
    - _Requirements: 2.3, 2.4, 2.8, 2.9_

  - [ ] 8.3 Write property test for event positioning
    - **Property 7: Event Positioning by Timing**
    - **Validates: Requirements 2.8**

  - [ ] 8.4 Write property test for color mapping
    - **Property 6: Event Node Color Mapping**
    - **Validates: Requirements 2.3**

  - [ ] 8.5 Add event graph edges (causal connections)
    - Create components/ui/EventEdge.tsx
    - Render lines connecting events
    - Display causal strength visually (line thickness or opacity)
    - _Requirements: 2.4_

  - [ ] 8.6 Implement hover tooltips for events
    - Create components/ui/EventTooltip.tsx
    - Display drivers, sources, and Expected_Value on hover
    - _Requirements: 2.5_

  - [ ] 8.7 Write property test for tooltip completeness
    - **Property 8: Tooltip Data Completeness**
    - **Validates: Requirements 2.5**

  - [ ] 8.8 Implement click handler to expand event details
    - Handle click events on EventNode
    - Update Right Panel state with selected event
    - _Requirements: 2.6_
  
  - Commit and push: `git add . && git commit -m "feat: implement Central Panel with price chart and event visualization" && git push`

- [ ] 9. Left Panel - Future events list
  - [ ] 9.1 Create LeftPanel component with event list
    - Create components/panels/LeftPanel.tsx
    - Create components/ui/EventListItem.tsx
    - Display probability, expected impact, confidence level for each event
    - _Requirements: 3.1, 3.2_

  - [ ] 9.2 Write property test for event display fields
    - **Property 11: Event Display Fields**
    - **Validates: Requirements 3.2**

  - [ ] 9.3 Implement priority-based sorting
    - Create lib/priorityScore.ts to calculate priority
    - Sort events by priority score (probability × impact × temporal proximity)
    - _Requirements: 3.5_

  - [ ] 9.4 Write property test for priority ordering
    - **Property 9: Event List Priority Ordering**
    - **Validates: Requirements 3.5**

  - [ ] 9.5 Implement event filtering
    - Create components/ui/FilterBar.tsx
    - Add filters for time horizon, event type, signal dominance
    - Apply filters to event list
    - _Requirements: 3.3, 3.4_

  - [ ] 9.6 Write property test for filter correctness
    - **Property 10: Event Filtering Correctness**
    - **Validates: Requirements 3.4**
  
  - Commit and push: `git add . && git commit -m "feat: implement Left Panel with event list, filtering, and sorting" && git push`

- [ ] 10. Checkpoint - UI panels rendering correctly
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 11. Right Panel - AI Chat interface
  - [ ] 11.1 Create RightPanel component with chat UI
    - Create components/panels/RightPanel.tsx
    - Create components/ui/ChatMessage.tsx
    - Create components/ui/ChatInput.tsx
    - Display default company summary on load
    - Implement message list with scroll
    - _Requirements: 4.1, 4.2_

  - [ ] 11.2 Implement quick action buttons
    - Create components/ui/QuickActionButtons.tsx
    - Add buttons: Summarize, Scenario+, Bear Case, Bull Case
    - Wire buttons to chat message generation
    - _Requirements: 4.5_

  - [ ] 11.3 Implement event detail modal
    - Create components/ui/EventDetailModal.tsx
    - Display structured text, Event_Graph links, source data, action buttons
    - Open modal when event clicked from Central Panel
    - _Requirements: 4.4_

  - [ ] 11.4 Write property test for modal completeness
    - **Property 12: Modal Content Completeness**
    - **Validates: Requirements 4.4**

  - [ ] 11.5 Implement event reference linking in chat
    - Parse chat responses for event references
    - Generate clickable links to Event_Graph nodes
    - _Requirements: 4.6_

  - [ ] 11.6 Write property test for event linking
    - **Property 13: Event Reference Linking**
    - **Validates: Requirements 4.6**
  
  - Commit and push: `git add . && git commit -m "feat: implement Right Panel with AI chat interface and event details" && git push`

- [ ] 12. Financial Analysis Panel
  - [ ] 12.1 Create FinancialAnalysisPanel component with tab system
    - Create components/panels/FinancialAnalysisPanel.tsx
    - Create components/ui/TabContainer.tsx
    - Create components/ui/MetricCard.tsx
    - Implement tabs: Financial Snapshot, Financial Stress, Earnings Quality, Cycle & Demand
    - Position panel centrally below chart
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 12.2 Implement Financial Snapshot tab with 2×4 KPI grid
    - Display 8 industry-aware metrics: Cash runway, Net Debt/EBITDA, FCF margin, Gross margin, Inventory growth vs revenue, Capex/Revenue, ROIC vs WACC, SBC % Revenue
    - Show value, trend indicator (↑ ↓ →), status color (green/amber/red)
    - _Requirements: 5.5, 5.8_

  - [ ] 12.3 Implement industry-aware metric selection
    - Create lib/industryMetrics.ts with metric mappings by industry
    - Adapt displayed metrics based on company industry
    - _Requirements: 5.9_

  - [ ] 12.4 Write property test for industry-aware metrics
    - **Property 14: Industry-Aware Metrics**
    - **Validates: Requirements 5.9**

  - [ ] 12.4 Implement metric tooltips and click handlers
    - Create components/ui/MetricTooltip.tsx
    - Show explanation and historical thresholds on hover
    - Open detailed sub-panel and link to events on click
    - _Requirements: 5.6, 5.7_

  - [ ] 12.5 Implement Financial Stress tab
    - Display debt maturity timeline (horizontal bar by year)
    - Display liquidity buffer gauge
    - Display credit lines available vs used
    - Highlight refinancing cliffs and dilution risk zones
    - _Requirements: 5.10, 5.11_

  - [ ] 12.6 Implement Earnings Quality tab
    - Display Net Income vs Operating Cash Flow comparison
    - Display accruals ratio, one-off expenses frequency, capitalized costs trend
    - _Requirements: 5.13_

  - [ ] 12.7 Implement Cycle & Demand tab
    - Display Inventory days (DIO), Backlog/Book-to-Bill, Revenue vs inventory delta, Customer concentration %
    - _Requirements: 5.16_
  
  - Commit and push: `git add . && git commit -m "feat: implement Financial Analysis Panel with all tabs" && git push`

- [ ] 13. Automatic event generation from financial metrics
  - [ ] 13.1 Implement threshold crossing detection
    - Create lib/anomalyDetection.ts
    - Implement checkThresholdCrossing function
    - Compare metrics against industry thresholds
    - Generate event when threshold crossed
    - _Requirements: 5.12, 5.19_

  - [ ] 13.2 Write property test for threshold-based event generation
    - **Property 15: Threshold-Based Event Generation**
    - **Validates: Requirements 5.19**

  - [ ] 13.3 Implement pattern divergence detection
    - Implement checkPatternDivergence function
    - Compare current metrics to historical patterns
    - Generate event when divergence detected
    - _Requirements: 5.20_

  - [ ] 13.4 Write property test for pattern divergence events
    - **Property 16: Pattern Divergence Event Generation**
    - **Validates: Requirements 5.20**

  - [ ] 13.5 Implement guidance conflict detection
    - Implement checkGuidanceConflict function
    - Compare metrics to management guidance
    - Generate event when conflict detected
    - _Requirements: 5.21_

  - [ ] 13.6 Write property test for guidance conflict events
    - **Property 17: Guidance Conflict Event Generation**
    - **Validates: Requirements 5.21**

  - [ ] 13.7 Ensure auto-generated events have complete data
    - Assign probability, timing delay, impact estimates to all auto-generated events
    - _Requirements: 5.22_

  - [ ] 13.8 Write property test for auto-generated event completeness
    - **Property 18: Auto-Generated Event Completeness**
    - **Validates: Requirements 5.22**

  - [ ] 13.9 Implement event propagation across UI
    - Ensure auto-generated events appear in Central Panel, Left Panel, and AI chat context
    - _Requirements: 5.23_

  - [ ] 13.10 Write property test for event propagation
    - **Property 19: Event Propagation Across UI**
    - **Validates: Requirements 5.23**
  
  - Commit and push: `git add . && git commit -m "feat: implement automatic event generation from financial metrics" && git push`

- [ ] 14. Checkpoint - Financial analysis and event generation working
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 15. Industry Panel
  - [ ] 15.1 Create IndustryPanel component
    - Create components/panels/IndustryPanel.tsx
    - Create components/ui/IndustrySelector.tsx
    - Create components/ui/CompetitorCard.tsx
    - Display current industry, key competitors, relevant customers
    - Position below Financial Analysis Panel
    - _Requirements: 6.1, 6.2_

  - [ ] 15.2 Implement industry switching
    - Create horizontal selector for switching industries
    - Update panel content when industry changes
    - _Requirements: 6.4, 6.5_

  - [ ] 15.3 Implement competitor comparison cards
    - Display comparative metrics across competitors
    - _Requirements: 6.3_
  
  - Commit and push: `git add . && git commit -m "feat: implement Industry Panel with competitor comparisons" && git push`

- [ ] 15.5. Industry Panel Integration
  - [ ] 15.5.1 Create IndustryPanel component
    - Create components/panels/IndustryPanel.tsx
    - Create IndustrySelector and CompetitorCard sub-components
    - Implement industry switching functionality
    - Add competitor comparison cards
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 15.5.2 Connect IndustryPanel to state
    - Update IndustryPanel to use Zustand store
    - Connect to industry and competitor mock data
    - Implement industry change handlers
    - Update Financial Analysis Panel when industry changes
    - _Requirements: 6.4, 6.5_

  - [ ] 15.5.3 Integrate IndustryPanel with main layout
    - Update app/page.tsx to include IndustryPanel
    - Position below Financial Analysis Panel
    - Ensure proper responsive behavior
    - _Requirements: 6.1_

  - Commit and push: `git add . && git commit -m "feat: integrate Industry Panel with state management" && git push`

- [ ] 16. Macro Events Ribbon
  - [ ] 16.1 Create MacroEventsRibbon component
    - Create components/panels/MacroEventsRibbon.tsx
    - Create components/ui/MacroEventCard.tsx
    - Display fixed horizontal ribbon at bottom
    - Show upcoming macro events with date, consensus, expected deviation
    - _Requirements: 7.1, 7.2_

  - [ ] 16.2 Write property test for macro event display fields
    - **Property 20: Macro Event Display Fields**
    - **Validates: Requirements 7.2**

  - [ ] 16.3 Implement category filters
    - Create components/ui/CategoryFilter.tsx
    - Add quick filters by event category
    - _Requirements: 7.3_

  - [ ] 16.4 Implement macro event overlay on chart
    - Handle event selection from Ribbon
    - Overlay selected events on Central Panel chart
    - _Requirements: 7.4_

  - [ ] 16.5 Implement real-time ribbon updates
    - Update ribbon as new macro events are scheduled
    - _Requirements: 7.5_
  
  - Commit and push: `git add . && git commit -m "feat: implement Macro Events Ribbon with filters" && git push`

- [ ] 16.5. Macro Events Ribbon Integration
  - [ ] 16.5.1 Create MacroEventsRibbon component
    - Create components/panels/MacroEventsRibbon.tsx
    - Create MacroEventCard and CategoryFilter sub-components
    - Implement horizontal scrolling ribbon layout
    - Add category filter functionality
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 16.5.2 Connect MacroEventsRibbon to state
    - Update MacroEventsRibbon to use Zustand store
    - Connect to mock macro events data
    - Implement event selection and overlay logic
    - Add real-time updates for new macro events
    - _Requirements: 7.4, 7.5_

  - [ ] 16.5.3 Integrate MacroEventsRibbon with CausalChart
    - Update CausalChart to display selected macro events
    - Implement event overlay visualization on chart
    - Add interaction between ribbon selection and chart display
    - _Requirements: 7.4_

  - [ ] 16.5.4 Add MacroEventsRibbon to main layout
    - Update app/page.tsx to include MacroEventsRibbon
    - Position as fixed ribbon at bottom of screen
    - Ensure proper z-index and responsive behavior
    - _Requirements: 7.1_

  - Commit and push: `git add . && git commit -m "feat: integrate Macro Events Ribbon with chart and state" && git push`

- [ ] 17. Social sentiment integration
  - [ ] 17.1 Implement social post classification
    - Create lib/socialSentiment.ts
    - Implement classifyPost function (Bullish/Bearish/Neutral)
    - Ensure all posts receive exactly one classification
    - _Requirements: 8.2_

  - [ ] 17.2 Write property test for post classification
    - **Property 21: Social Post Classification**
    - **Validates: Requirements 8.2**

  - [ ] 17.3 Implement sentiment aggregation
    - Implement aggregateSentiment function
    - Calculate post count, unique author count, influence-weighted score
    - _Requirements: 8.3_

  - [ ] 17.4 Write property test for sentiment aggregation
    - **Property 22: Social Sentiment Aggregation**
    - **Validates: Requirements 8.3**

  - [ ] 17.5 Implement post type distinction
    - Classify posts as opinion vs event detection
    - _Requirements: 8.4_

  - [ ] 17.6 Write property test for post type distinction
    - **Property 23: Social Post Type Distinction**
    - **Validates: Requirements 8.4**

  - [ ] 17.7 Implement executive post identification
    - Identify and flag posts from executives and employees
    - _Requirements: 8.5_

  - [ ] 17.8 Write property test for executive identification
    - **Property 24: Executive Post Identification**
    - **Validates: Requirements 8.5**
  
  - Commit and push: `git add . && git commit -m "feat: implement social sentiment integration with classification" && git push`

- [ ] 18. Probabilistic display requirements
  - [ ] 18.1 Ensure probability display universality
    - Verify all events show explicit probability values in UI
    - _Requirements: 9.1_

  - [ ] 18.2 Write property test for probability display
    - **Property 25: Probability Display Universality**
    - **Validates: Requirements 9.1**

  - [ ] 18.3 Implement deterministic prediction prevention
    - Ensure no UI elements show deterministic price predictions
    - Only show events, timing, and impacts
    - _Requirements: 9.3, 9.4_

  - [ ] 18.4 Write property test for no deterministic predictions
    - **Property 26: No Deterministic Price Predictions**
    - **Validates: Requirements 9.3, 9.4**

  - [ ] 18.5 Implement confidence information display
    - Show confidence intervals or levels for all probability estimates
    - _Requirements: 9.5_

  - [ ] 18.6 Write property test for confidence display
    - **Property 27: Confidence Information Display**
    - **Validates: Requirements 9.5**

  - [ ] 18.7 Implement Bayesian update history display
    - Show prior and posterior probabilities for updated events
    - _Requirements: 9.6_

  - [ ] 18.8 Write property test for update history display
    - **Property 28: Bayesian Update History Display**
    - **Validates: Requirements 9.6**

  - [ ] 18.9 Write property tests for UI component state management
    - **Property 36: UI State Consistency**
    - Test that UI state changes propagate correctly across all panels
    - **Validates: Requirements 11.1, 11.2**

  - [ ] 18.10 Write property tests for n8n integration
    - **Property 37: N8N Response Consistency**
    - Test that n8n webhook responses are properly formatted and handled
    - **Validates: Requirements 16.2, 16.3**

  - [ ] 18.11 Write property tests for real-time updates
    - **Property 38: Real-time Update Consistency**
    - Test that real-time updates maintain data consistency across panels
    - **Validates: Requirements 13.1, 13.2**

  - [ ] 18.12 Write property tests for Financial Analysis Panel
    - **Property 39: Financial Metric Validation**
    - Test that financial metrics are correctly calculated and displayed
    - **Validates: Requirements 5.8, 5.9**

  - [ ] 18.13 Write property tests for Macro Events Ribbon
    - **Property 40: Macro Event Display Consistency**
    - Test that macro events are correctly filtered and displayed
    - **Validates: Requirements 7.2, 7.3**
  
  - Commit and push: `git add . && git commit -m "feat: implement probabilistic display requirements" && git push`

- [ ] 19. Checkpoint - All UI components complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 20. Backend API setup
  - [ ] 20.1 Set up Next.js API routes structure
    - Create app/api/ directory structure
    - Set up route handlers for events, graph, financial, social, chat
    - Configure CORS and authentication middleware
    - _Requirements: 13.5_

  - [ ] 20.2 Implement Event Predictor API endpoints
    - Create app/api/events/predict/route.ts
    - Create app/api/events/[eventId]/route.ts
    - Implement event prediction logic
    - _Requirements: 1.1_

  - [ ] 20.3 Implement Bayesian Update API endpoint
    - Create app/api/events/[eventId]/update/route.ts
    - Wire to Bayesian update engine from task 3.1
    - Return prior and posterior probabilities
    - _Requirements: 1.4_

  - [ ] 20.4 Implement Graph Manager API endpoints
    - Create app/api/graph/add-edge/route.ts
    - Create app/api/graph/[companyId]/route.ts
    - Create app/api/graph/validate/route.ts
    - Wire to graph management from task 5.1
    - _Requirements: 12.2, 12.5_

  - [ ] 20.5 Write property test for graph edge storage
    - **Property 32: Event Graph Edge Storage**
    - **Validates: Requirements 12.2**

  - [ ] 20.6 Implement Financial Anomaly API endpoints
    - Create app/api/financial/analyze/route.ts
    - Create app/api/financial/thresholds/[industry]/route.ts
    - Wire to anomaly detection from task 13
    - _Requirements: 5.19, 5.20, 5.21_

  - [ ] 20.7 Implement Social Sentiment API endpoints
    - Create app/api/social/ingest/route.ts
    - Create app/api/social/sentiment/[symbol]/route.ts
    - Wire to social sentiment logic from task 17
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [ ] 20.8 Implement AI Chat API endpoints
    - Create app/api/chat/message/route.ts
    - Create app/api/chat/scenario/route.ts
    - Integrate with OpenAI or Anthropic API
    - _Requirements: 4.3_
  
  - Commit and push: `git add . && git commit -m "feat: implement backend API routes" && git push`

- [ ] 21. Database setup and models
  - [ ] 21.1 Set up Supabase database schema
    - Create Supabase tables for events, companies, financial_metrics, social_posts
    - Set up indexes for frequently queried fields
    - Create database functions for complex queries (graph traversal, priority scoring)
    - Implement Row Level Security (RLS) policies
    - _Requirements: 12.1_

  - [ ] 21.2 Implement event storage with update history
    - Create events table with all required fields
    - Create probability_updates table for history
    - Implement Supabase queries for event retrieval and updates
    - Set up RLS policies for event access
    - _Requirements: 12.3, 12.4_

  - [ ] 21.3 Write property test for probability update history
    - **Property 33: Probability Update History**
    - **Validates: Requirements 12.4**

  - [ ] 21.4 Implement graph storage
    - Create event_graph_nodes and event_graph_edges tables
    - Implement queries for graph operations
    - Create database function for cycle detection
    - _Requirements: 12.2_

  - [ ] 21.5 Implement event query functions
    - Create Supabase queries for events by type, time horizon, impact magnitude
    - Implement filtering and sorting using PostgREST
    - Use database indexes for performance
    - _Requirements: 12.6_

  - [ ] 21.6 Write property test for event query correctness
    - **Property 34: Event Query Correctness**
    - **Validates: Requirements 12.6**

  - [ ] 21.7 Set up Supabase Auth
    - Configure authentication providers (email, OAuth)
    - Set up user roles and permissions
    - Implement RLS policies based on user roles
    - _Requirements: 13.1, 13.2, 13.3_
  
  - Commit and push: `git add . && git commit -m "feat: set up Supabase database schema and auth" && git push`

- [ ] 22. Real-time Supabase integration
  - [ ] 22.1 Set up Supabase Realtime client
    - Create lib/supabase.ts with Supabase client configuration
    - Implement connection handling and authentication
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ] 22.2 Implement event update subscriptions
    - Subscribe to events table changes using Supabase Realtime
    - Implement channel-based subscriptions (per company)
    - Handle INSERT, UPDATE, DELETE events
    - _Requirements: 13.1, 13.2_

  - [ ] 22.3 Implement client-side Realtime hooks
    - Create hooks/useSupabaseRealtime.ts
    - Handle connection, reconnection, and disconnection
    - Update UI state on received messages
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ] 22.4 Implement connection status indicator
    - Monitor Supabase Realtime connection status
    - Display connection status indicator in UI
    - Handle offline/online transitions gracefully
    - _Requirements: 13.4_
  
  - Commit and push: `git add . && git commit -m "feat: implement Supabase Realtime integration" && git push`

- [ ] 22.5. Real-time UI Integration
  - [ ] 22.5.1 Connect UI components to Supabase Realtime
    - Update ForecastedEvents to subscribe to event changes
    - Update SocialFeed to receive real-time social data
    - Update CausalChart to reflect real-time event updates
    - Update ChatPanel to receive real-time AI responses
    - _Requirements: 13.1, 13.2, 13.4_

  - [ ] 22.5.2 Implement optimistic updates
    - Add optimistic UI updates for user interactions
    - Handle rollback on server errors
    - Show loading states during updates
    - _Requirements: 13.5_

  - [ ] 22.5.3 Add real-time connection status
    - Update DashboardHeader with connection indicator
    - Show offline/online status
    - Handle reconnection gracefully
    - _Requirements: 13.4_

  - [ ] 22.5.4 Implement real-time event propagation
    - Ensure auto-generated events appear across all panels
    - Update Central Panel, Left Panel, and AI chat context
    - Maintain consistency across UI components
    - _Requirements: 5.23, 13.1, 13.2_

  - Commit and push: `git add . && git commit -m "feat: integrate real-time updates across all UI components" && git push`

- [ ] 23. HTML to JSX component migration
  - [ ] 23.1 Convert existing HTML template to JSX
    - Parse index.html and convert to JSX syntax
    - Replace HTML attributes with JSX equivalents (class → className, etc.)
    - _Requirements: 15.1_

  - [ ] 23.2 Write property test for JSX validity
    - **Property 35: HTML to JSX Validity**
    - **Validates: Requirements 15.1**

  - [ ] 23.3 Extract reusable sub-components
    - Identify and extract: EventNode, MetricCard, TooltipWrapper, TabContainer, ChatMessage
    - Create components in components/ui/ directory
    - _Requirements: 15.4_

  - [ ] 23.4 Implement TypeScript prop interfaces
    - Define prop types for all components
    - Use TypeScript interfaces for type safety
    - _Requirements: 15.6_

  - [ ] 23.5 Convert inline styles to Shadcn/ui components and Tailwind classes
    - Replace custom UI elements with Shadcn/ui components (Button, Card, Badge, Dialog, Tabs, Tooltip)
    - Use Tailwind utility classes for custom styling
    - Maintain visual design from original template
    - Extend Shadcn/ui theme with custom financial colors
    - _Requirements: 15.7, 15.8_

  - [ ] 23.6 Organize components in directory structure
    - Structure: components/panels/, components/ui/, components/charts/
    - _Requirements: 15.10_

  - [ ] 23.7 Verify all interactions work in JSX
    - Test hover, click, filter interactions
    - Ensure functionality matches original HTML
    - _Requirements: 15.9_
  
  - Commit and push: `git add . && git commit -m "feat: migrate HTML to JSX with Shadcn/ui components" && git push`

- [ ] 24. Checkpoint - Backend and migration complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 25. n8n workflow integration (optional alternative)
  - [ ] 25.1 Create n8n workflow templates
    - Create workflow JSON files for: Social Sentiment Pipeline, Bayesian Update Pipeline, Financial Anomaly Detection
    - Document workflow structure and nodes
    - _Requirements: 16.8_

  - [ ] 25.2 Implement webhook endpoints for n8n
    - Create API endpoints that n8n workflows can call
    - Ensure endpoints match traditional backend API contract
    - _Requirements: 16.2, 16.3, 16.5_

  - [ ] 25.3 Set up message queue for n8n integration
    - Configure Supabase as event source for n8n
    - Enable n8n workflows to write to Supabase
    - Use Supabase Realtime to trigger n8n workflows
    - _Requirements: 16.10_

  - [ ] 25.4 Document n8n deployment and configuration
    - Create deployment guide for n8n instance
    - Document authentication setup
    - Provide example workflow configurations
    - _Requirements: 16.1, 16.4, 16.6, 16.7_
  
  - Commit and push: `git add . && git commit -m "feat: add n8n workflow integration (optional)" && git push`

- [ ] 26. Integration and wiring
  - [ ] 26.1 Wire all panels together in main layout
    - Create app/page.tsx with ResizableLayout
    - Integrate all panels: Central, Left, Right, Financial Analysis, Industry, Ribbon
    - Implement panel communication via shared state
    - _Requirements: 11.1, 11.2_

  - [ ] 26.2 Implement global state management
    - Set up Context API or Zustand for global state
    - Manage: selected company, active filters, panel sizes, selected event
    - _Requirements: 11.4_

  - [ ] 26.3 Connect frontend to Supabase
    - Implement Supabase client functions
    - Wire UI interactions to Supabase queries
    - Handle loading and error states
    - Implement optimistic updates
    - _Requirements: 13.5_

  - [ ] 26.4 Implement data flow for auto-generated events
    - Connect Financial Analysis Panel anomaly detection to event creation
    - Ensure events propagate to all panels
    - Test end-to-end flow
    - _Requirements: 5.23_

  - [ ] 26.5 Implement event click flow
    - Connect Central Panel event clicks to Right Panel detail display
    - Connect Left Panel event clicks to Central Panel highlighting
    - _Requirements: 2.6_
  
  - Commit and push: `git add . && git commit -m "feat: wire all panels together and implement global state" && git push`

- [ ] 26.5. Comprehensive State Management Integration
  - [ ] 26.5.1 Implement advanced Zustand store features
    - Add state persistence with localStorage
    - Implement state hydration and dehydration
    - Add state middleware for logging and debugging
    - Create state selectors for performance optimization
    - _Requirements: 11.4, 13.5_

  - [ ] 26.5.2 Create comprehensive mock data system
    - Expand lib/mockData.ts with realistic datasets
    - Add time-series data for financial metrics
    - Create dynamic event generation system
    - Add realistic social sentiment data streams
    - Implement mock API responses with delays
    - _Requirements: 1.1, 1.2, 1.3, 5.8, 8.2_

  - [ ] 26.5.3 Implement data flow orchestration
    - Create lib/dataFlow.ts for coordinating updates
    - Implement event propagation across all panels
    - Add data validation and error handling
    - Create update batching for performance
    - _Requirements: 5.23, 13.1, 13.2_

  - [ ] 26.5.4 Add advanced UI interactions
    - Implement event click flow between panels
    - Add drag-and-drop for event organization
    - Create advanced filtering and search
    - Add keyboard shortcuts for power users
    - _Requirements: 2.6, 3.4, 3.5_

  - [ ] 26.5.5 Implement panel communication system
    - Create event bus for inter-panel communication
    - Add panel state synchronization
    - Implement cross-panel data sharing
    - Add panel-specific loading states
    - _Requirements: 11.1, 11.2_

  - [ ] 26.5.6 Create comprehensive error handling
    - Add error boundaries for each panel
    - Implement graceful degradation
    - Add user-friendly error messages
    - Create error recovery mechanisms
    - _Requirements: 13.4, 13.5_

  - Commit and push: `git add . && git commit -m "feat: implement comprehensive state management and data flow" && git push`

- [ ] 27. Error handling and edge cases
  - [ ] 27.1 Implement frontend error boundaries
    - Add React Error Boundaries around major components
    - Implement fallback UI for errors
    - _Requirements: 13.4, 13.5_

  - [ ] 27.2 Implement API error handling
    - Add try-catch blocks to all API calls
    - Display toast notifications for errors
    - Implement retry logic with exponential backoff
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ] 27.3 Implement Supabase Realtime reconnection logic
    - Handle disconnection gracefully
    - Resubscribe to channels on reconnection
    - Fetch missed updates after reconnection
    - _Requirements: 13.4, 13.5_

  - [ ] 27.4 Implement input validation
    - Validate all user inputs before API calls
    - Display inline error messages
    - Prevent invalid operations (e.g., creating cycles in graph)
    - _Requirements: 12.5_
  
  - Commit and push: `git add . && git commit -m "feat: implement error handling and edge cases" && git push`

- [ ] 28. Performance optimization
  - [ ] 28.1 Implement code splitting and lazy loading
    - Use Next.js dynamic imports for heavy components
    - Lazy load chart libraries
    - _Requirements: 13.6_

  - [ ] 28.2 Optimize chart rendering
    - Implement virtualization for large event lists
    - Use React.memo for expensive components
    - Debounce filter changes
    - _Requirements: 13.5_

  - [ ] 28.3 Implement caching strategy
    - Cache API responses with SWR or React Query
    - Implement stale-while-revalidate pattern
    - _Requirements: 13.1, 13.2_
  
  - Commit and push: `git add . && git commit -m "feat: implement performance optimizations" && git push`

- [ ] 29. Testing and validation
  - [ ] 29.1 Run all property-based tests
    - Execute all 35 property tests with 100+ iterations each
    - Verify all properties hold
    - Fix any failures

  - [ ] 29.2 Run all unit tests
    - Execute all unit tests
    - Verify edge cases and error conditions
    - Achieve >80% code coverage

  - [ ] 29.3 Run integration tests
    - Test Next.js API endpoints
    - Test Supabase queries and RLS policies
    - Test Supabase Realtime subscriptions
    - Test end-to-end flows

  - [ ] 29.4 Manual testing of UI interactions
    - Test all hover, click, drag interactions
    - Test panel resizing and persistence
    - Test filter and sort functionality
    - Verify visual design matches requirements
    - Test Shadcn/ui component interactions
  
  - Commit and push: `git add . && git commit -m "test: complete all testing and validation" && git push`

- [ ] 30. Documentation and deployment
  - [ ] 30.1 Create README with setup instructions
    - Document installation steps
    - Document environment variables
    - Document development workflow

  - [ ] 30.2 Create API documentation
    - Document all API endpoints
    - Provide example requests/responses
    - Document authentication

  - [ ] 30.3 Deploy to production
    - Deploy frontend to Vercel or similar
    - Supabase is already hosted (configure production environment)
    - Set up Supabase production project
    - Configure environment variables for Supabase
    - Set up custom domain and SSL
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ] 30.4 Set up monitoring and alerting
    - Configure error tracking (Sentry)
    - Set up performance monitoring
    - Monitor Supabase usage and performance
    - Configure alerts for critical issues
    - Set up Supabase database backups
  
  - Commit and push: `git add . && git commit -m "docs: add documentation and complete deployment setup" && git push`

- [ ] 31. Final checkpoint - System complete
  - Ensure all tests pass, verify all requirements met, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive coverage from the start
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (40 properties total)
- Unit tests validate specific examples and edge cases
- The system uses Next.js (latest) with TypeScript for frontend
- UI components use Shadcn/ui with TailwindCSS
- Database and real-time functionality powered by Supabase
- Backend can be implemented with Next.js API routes or n8n workflows
- All panels are resizable with persistent preferences
- Real-time updates via Supabase Realtime
- Financial Analysis Panel automatically generates events from anomalies
- N8N AI agents handle chat interactions, financial analysis, and social sentiment processing
- Zustand provides global state management with persistence
- Mock data system provides realistic testing environment
- Minimum 100 iterations per property test for thorough validation
- UI components are fully integrated with state management and real-time updates
