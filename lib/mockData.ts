import {
  Event,
  EventType,
  ImpactDirection,
  FinancialMetrics,
  SocialPost,
  SentimentAggregate,
  Company,
  Industry,
  MacroEvent,
  PricePoint,
  EventGraph,
  CausalEdge,
  IndustryThresholds,
  DebtMaturitySchedule,
  TimingWindow,
  ImpactEstimate,
  Source,
  SignalType,
  SocialSource,
  AuthorType,
  SentimentType,
  TimeRange
} from '../types/models';

// Utility functions for generating realistic mock data
const randomBetween = (min: number, max: number): number => 
  Math.random() * (max - min) + min;

const randomChoice = <T>(array: T[]): T => 
  array[Math.floor(Math.random() * array.length)];

const randomDate = (start: Date, end: Date): Date => 
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateId = (): string => 
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock companies data
export const mockCompanies: Company[] = [
  {
    id: 'AAPL',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    industry: 'technology',
    marketCap: 3000000000000 // $3T
  },
  {
    id: 'TSLA',
    name: 'Tesla, Inc.',
    symbol: 'TSLA',
    industry: 'automotive',
    marketCap: 800000000000 // $800B
  },
  {
    id: 'NVDA',
    name: 'NVIDIA Corporation',
    symbol: 'NVDA',
    industry: 'technology',
    marketCap: 2000000000000 // $2T
  },
  {
    id: 'JPM',
    name: 'JPMorgan Chase & Co.',
    symbol: 'JPM',
    industry: 'financial',
    marketCap: 500000000000 // $500B
  }
];

// Mock industries with thresholds
export const mockIndustries: Industry[] = [
  {
    id: 'technology',
    name: 'Technology',
    thresholds: {
      cashRunwayMonths: { green: 24, amber: 12, red: 6 },
      netDebtToEBITDA: { green: 1.0, amber: 2.0, red: 3.0 },
      freeCashFlowMargin: { green: 20, amber: 10, red: 5 },
      grossMargin: { green: 60, amber: 40, red: 20 },
      inventoryGrowthVsRevenue: { green: 1.0, amber: 1.5, red: 2.0 },
      capexToRevenue: { green: 5, amber: 10, red: 15 },
      roicVsWACC: { green: 2.0, amber: 1.2, red: 1.0 },
      sbcPercentRevenue: { green: 5, amber: 10, red: 20 }
    }
  },
  {
    id: 'automotive',
    name: 'Automotive',
    thresholds: {
      cashRunwayMonths: { green: 18, amber: 9, red: 4 },
      netDebtToEBITDA: { green: 2.0, amber: 3.0, red: 4.0 },
      freeCashFlowMargin: { green: 8, amber: 4, red: 0 },
      grossMargin: { green: 25, amber: 15, red: 10 },
      inventoryGrowthVsRevenue: { green: 1.2, amber: 1.8, red: 2.5 },
      capexToRevenue: { green: 8, amber: 12, red: 18 },
      roicVsWACC: { green: 1.5, amber: 1.1, red: 0.9 },
      sbcPercentRevenue: { green: 2, amber: 5, red: 10 }
    }
  },
  {
    id: 'financial',
    name: 'Financial Services',
    thresholds: {
      cashRunwayMonths: { green: 36, amber: 18, red: 9 },
      netDebtToEBITDA: { green: 3.0, amber: 5.0, red: 7.0 },
      freeCashFlowMargin: { green: 15, amber: 8, red: 3 },
      grossMargin: { green: 70, amber: 50, red: 30 },
      inventoryGrowthVsRevenue: { green: 0.5, amber: 1.0, red: 1.5 },
      capexToRevenue: { green: 3, amber: 6, red: 10 },
      roicVsWACC: { green: 1.8, amber: 1.3, red: 1.0 },
      sbcPercentRevenue: { green: 8, amber: 15, red: 25 }
    }
  }
];

// Generate realistic timing windows
const generateTimingWindow = (daysFromNow: number, windowSize: number = 30): TimingWindow => {
  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + daysFromNow);
  
  const start = new Date(expectedDate);
  start.setDate(start.getDate() - windowSize / 2);
  
  const end = new Date(expectedDate);
  end.setDate(end.getDate() + windowSize / 2);
  
  return { start, end, expectedDate };
};

// Generate realistic impact estimates
const generateImpactEstimate = (direction?: ImpactDirection): ImpactEstimate => ({
  direction: direction || randomChoice(['bullish', 'bearish', 'neutral'] as ImpactDirection[]),
  magnitude: randomBetween(1, 25), // 1-25% impact
  confidence: randomBetween(60, 95)
});

// Generate realistic sources
const generateSources = (count: number = 3): Source[] => {
  const sourceTypes: SignalType[] = ['market_data', 'social', 'financial', 'news', 'macro'];
  return Array.from({ length: count }, () => ({
    type: randomChoice(sourceTypes),
    url: Math.random() > 0.5 ? `https://example.com/source-${generateId()}` : undefined,
    timestamp: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
    reliability: randomBetween(0.3, 0.95)
  }));
};

// Generate mock events
export const generateMockEvents = (count: number = 20): Event[] => {
  const eventTitles = {
    macro: [
      'Federal Reserve Interest Rate Decision',
      'Inflation Data Release',
      'GDP Growth Report',
      'Employment Numbers',
      'Trade War Escalation',
      'Central Bank Policy Shift'
    ],
    industry: [
      'Semiconductor Shortage Resolution',
      'EV Adoption Acceleration',
      'Cloud Computing Demand Surge',
      'Regulatory Changes in Banking',
      'Supply Chain Normalization',
      'Energy Transition Policies'
    ],
    company: [
      'Quarterly Earnings Beat',
      'Product Launch Delay',
      'CEO Succession Plan',
      'Major Acquisition Announcement',
      'Patent Litigation Settlement',
      'Manufacturing Capacity Expansion'
    ]
  };

  return Array.from({ length: count }, (_, index) => {
    const type = randomChoice(['macro', 'industry', 'company'] as EventType[]);
    const title = randomChoice(eventTitles[type]);
    const probability = randomBetween(15, 85);
    const timingWindow = generateTimingWindow(randomBetween(1, 180));
    
    const impact = {
      revenue: Math.random() > 0.3 ? generateImpactEstimate() : undefined,
      margin: Math.random() > 0.5 ? generateImpactEstimate() : undefined,
      marketCap: Math.random() > 0.2 ? generateImpactEstimate() : undefined,
      stockPrice: Math.random() > 0.1 ? generateImpactEstimate() : undefined
    };
    
    // Calculate expected value (simplified)
    const impacts = Object.values(impact).filter(Boolean);
    const avgImpact = impacts.length > 0 
      ? impacts.reduce((sum, i) => sum + i!.magnitude, 0) / impacts.length 
      : 0;
    const expectedValue = (probability / 100) * avgImpact;

    return {
      id: `event-${index + 1}`,
      type,
      title,
      description: `Detailed analysis of ${title.toLowerCase()} and its potential market impact.`,
      probability,
      priorProbability: probability + randomBetween(-10, 10),
      timingWindow,
      impact,
      expectedValue,
      confidence: randomBetween(65, 90),
      sources: generateSources(),
      drivers: [
        'Market sentiment shift',
        'Regulatory environment',
        'Economic indicators',
        'Company fundamentals'
      ].slice(0, randomBetween(2, 4)),
      createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
      updatedAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
      updateHistory: []
    };
  });
};

// Generate mock financial metrics
export const generateMockFinancialMetrics = (companyId: string): FinancialMetrics => {
  const debtMaturity: DebtMaturitySchedule = {
    '2024': randomBetween(100, 500),
    '2025': randomBetween(200, 800),
    '2026': randomBetween(150, 600),
    '2027': randomBetween(100, 400),
    '2028': randomBetween(50, 300)
  };

  return {
    companyId,
    timestamp: new Date(),
    // Financial Snapshot
    cashRunwayMonths: randomBetween(6, 36),
    netDebtToEBITDA: randomBetween(0.5, 4.0),
    freeCashFlowMargin: randomBetween(-5, 25),
    grossMargin: randomBetween(15, 70),
    inventoryGrowthVsRevenue: randomBetween(0.8, 2.5),
    capexToRevenue: randomBetween(2, 15),
    roicVsWACC: randomBetween(0.8, 2.5),
    sbcPercentRevenue: randomBetween(1, 20),
    // Financial Stress
    debtMaturity,
    liquidityBuffer: randomBetween(500, 5000), // millions
    creditLinesAvailable: randomBetween(1000, 10000), // millions
    creditLinesUsed: randomBetween(100, 3000), // millions
    // Earnings Quality
    netIncomeVsOCF: randomBetween(0.7, 1.3),
    accrualsRatio: randomBetween(-0.1, 0.15),
    oneOffExpensesFrequency: randomBetween(0, 4), // per year
    capitalizedCostsTrend: randomBetween(-10, 20), // percentage change
    // Cycle & Demand
    inventoryDays: randomBetween(30, 120),
    backlogBookToBill: randomBetween(0.8, 1.5),
    revenueVsInventoryDelta: randomBetween(-20, 30),
    customerConcentration: randomBetween(5, 40) // percentage
  };
};

// Generate mock social posts
export const generateMockSocialPosts = (count: number = 50): SocialPost[] => {
  const sampleContent = [
    'Bullish on $AAPL after seeing strong iPhone demand in Asia',
    'Concerned about $TSLA production delays affecting Q4 deliveries',
    'JPM earnings call was impressive, strong guidance for 2024',
    'NVDA AI chip demand seems to be cooling off based on supply chain data',
    'Apple\'s services revenue growth trajectory looks sustainable',
    'Tesla\'s energy business is undervalued by the market',
    'Banking sector headwinds from rising rates are overblown'
  ];

  const authors = [
    'TechAnalyst2024', 'WallStreetPro', 'InvestorJoe', 'MarketMaven',
    'ElonMusk', 'tim_cook', 'jpmorgan_ceo', 'nvda_insider'
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: `post-${index + 1}`,
    source: randomChoice(['twitter', 'reddit'] as SocialSource[]),
    author: randomChoice(authors),
    authorType: randomChoice(['executive', 'employee', 'analyst', 'retail'] as AuthorType[]),
    content: randomChoice(sampleContent),
    timestamp: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
    sentiment: randomChoice(['bullish', 'bearish', 'neutral'] as SentimentType[]),
    confidence: randomBetween(60, 95),
    isEventDetection: Math.random() > 0.7,
    influenceScore: randomBetween(1, 100),
    linkedSymbols: [randomChoice(['AAPL', 'TSLA', 'NVDA', 'JPM'])]
  }));
};

// Generate mock sentiment aggregate
export const generateMockSentimentAggregate = (symbol: string): SentimentAggregate => {
  const posts = generateMockSocialPosts(20).filter(p => p.linkedSymbols.includes(symbol));
  const bullishCount = posts.filter(p => p.sentiment === 'bullish').length;
  const bearishCount = posts.filter(p => p.sentiment === 'bearish').length;
  const neutralCount = posts.filter(p => p.sentiment === 'neutral').length;
  
  return {
    symbol,
    timeRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    bullishCount,
    bearishCount,
    neutralCount,
    uniqueAuthors: new Set(posts.map(p => p.author)).size,
    influenceWeightedScore: randomBetween(-50, 50),
    topPosts: posts.slice(0, 5)
  };
};

// Generate mock macro events
export const generateMockMacroEvents = (count: number = 15): MacroEvent[] => {
  const macroEventTitles = [
    'Federal Reserve Meeting',
    'CPI Inflation Report',
    'Non-Farm Payrolls',
    'GDP Quarterly Report',
    'FOMC Minutes Release',
    'ECB Policy Decision',
    'China PMI Data',
    'Oil Inventory Report',
    'Treasury Auction',
    'Trade Balance Report'
  ];

  const categories = ['monetary_policy', 'economic_data', 'geopolitical', 'commodities'];

  return Array.from({ length: count }, (_, index) => ({
    id: `macro-${index + 1}`,
    title: randomChoice(macroEventTitles),
    date: randomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
    consensus: Math.random() > 0.3 ? randomBetween(-2, 5) : undefined,
    expectedDeviation: Math.random() > 0.5 ? randomBetween(0.1, 1.5) : undefined,
    category: randomChoice(categories),
    impact: generateImpactEstimate()
  }));
};

// Generate mock price data
export const generateMockPriceData = (days: number = 252): PricePoint[] => {
  const startPrice = randomBetween(100, 300);
  const data: PricePoint[] = [];
  let currentPrice = startPrice;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    // Simulate realistic price movement
    const volatility = 0.02; // 2% daily volatility
    const drift = 0.0003; // slight upward drift
    const change = (Math.random() - 0.5) * volatility + drift;
    
    const open = currentPrice;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = randomBetween(1000000, 10000000);
    
    data.push({
      timestamp: date,
      open,
      high,
      low,
      close,
      volume
    });
    
    currentPrice = close;
  }
  
  return data;
};

// Generate mock event graph
export const generateMockEventGraph = (companyId: string, events: Event[]): EventGraph => {
  const edges: CausalEdge[] = [];
  
  // Create some realistic causal relationships
  for (let i = 0; i < events.length - 1; i++) {
    if (Math.random() > 0.7) { // 30% chance of creating an edge
      const fromEvent = events[i];
      const toEvent = events[i + 1];
      
      edges.push({
        from: fromEvent.id,
        to: toEvent.id,
        strength: randomBetween(0.3, 0.9),
        type: randomChoice(['causes', 'influences', 'correlates'])
      });
    }
  }
  
  return {
    companyId,
    nodes: events,
    edges,
    lastUpdated: new Date()
  };
};

// Main mock data generator function
export const generateAllMockData = () => {
  const events = generateMockEvents(25);
  const selectedCompany = mockCompanies[0]; // Default to Apple
  
  return {
    companies: mockCompanies,
    industries: mockIndustries,
    events,
    eventGraph: generateMockEventGraph(selectedCompany.id, events),
    financialMetrics: generateMockFinancialMetrics(selectedCompany.id),
    socialPosts: generateMockSocialPosts(30),
    sentimentAggregate: generateMockSentimentAggregate(selectedCompany.symbol),
    macroEvents: generateMockMacroEvents(12),
    priceData: generateMockPriceData(180)
  };
};

// Utility function to simulate real-time updates
export const simulateRealTimeUpdate = () => {
  const updateTypes = ['new_event', 'probability_update', 'social_post', 'price_update'];
  const updateType = randomChoice(updateTypes);
  
  switch (updateType) {
    case 'new_event':
      return {
        type: 'new_event',
        data: generateMockEvents(1)[0]
      };
    case 'probability_update':
      return {
        type: 'probability_update',
        data: {
          eventId: `event-${Math.floor(Math.random() * 20) + 1}`,
          newProbability: randomBetween(10, 90),
          reason: 'New market data received'
        }
      };
    case 'social_post':
      return {
        type: 'social_post',
        data: generateMockSocialPosts(1)[0]
      };
    case 'price_update':
      return {
        type: 'price_update',
        data: {
          symbol: randomChoice(['AAPL', 'TSLA', 'NVDA', 'JPM']),
          price: randomBetween(100, 400),
          change: randomBetween(-5, 5)
        }
      };
    default:
      return null;
  }
};