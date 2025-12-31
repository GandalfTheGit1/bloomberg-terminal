import { ChatContext, ChatMessage } from '@/types/models';

// N8N webhook configuration
interface N8NConfig {
  baseUrl: string;
  webhookEndpoints: {
    chat: string;
    financialAnalysis: string;
    socialSentiment: string;
  };
  timeout: number;
  retryAttempts: number;
}

// Default configuration - can be overridden via environment variables
const defaultConfig: N8NConfig = {
  baseUrl: process.env.NEXT_PUBLIC_N8N_BASE_URL || 'http://localhost:5678',
  webhookEndpoints: {
    chat: '/webhook/ai-chat-agent',
    financialAnalysis: '/webhook/financial-analysis-agent',
    socialSentiment: '/webhook/social-sentiment-agent'
  },
  timeout: 30000, // 30 seconds
  retryAttempts: 3
};

// Request/Response interfaces
export interface ChatRequest {
  message: string;
  context: ChatContext;
  conversationHistory: ChatMessage[];
  requestType: 'question' | 'scenario' | 'summary';
  scenarioType?: 'bull' | 'bear' | 'custom';
}

export interface ChatResponse {
  response: string;
  linkedEvents: string[];
  confidence: number;
  sources: string[];
  suggestedActions: string[];
}

export interface FinancialAnalysisRequest {
  companyId: string;
  metrics: any;
  industryThresholds: any;
  analysisType: 'anomaly_detection' | 'threshold_check' | 'pattern_analysis';
}

export interface FinancialAnalysisResponse {
  anomalies: any[];
  generatedEvents: any[];
  insights: string[];
  recommendations: string[];
}

export interface SocialSentimentRequest {
  posts: any[];
  symbol: string;
  analysisType: 'classification' | 'aggregation' | 'event_detection';
}

export interface SocialSentimentResponse {
  classifiedPosts: any[];
  sentimentAggregate: any;
  detectedEvents: any[];
  executivePosts: any[];
}

// Error types
export class N8NError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'N8NError';
  }
}

export class N8NTimeoutError extends N8NError {
  constructor(endpoint: string) {
    super(`Request to ${endpoint} timed out`, 408, endpoint, true);
    this.name = 'N8NTimeoutError';
  }
}

export class N8NNetworkError extends N8NError {
  constructor(endpoint: string, originalError: Error) {
    super(`Network error for ${endpoint}: ${originalError.message}`, undefined, endpoint, true);
    this.name = 'N8NNetworkError';
  }
}

// Utility function for exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Main N8N client class
export class N8NClient {
  private config: N8NConfig;

  constructor(config?: Partial<N8NConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // Generic webhook request method with retry logic
  private async makeRequest<T>(
    endpoint: string,
    data: any,
    retryCount = 0
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new N8NError(
          `HTTP ${response.status}: ${errorText}`,
          response.status,
          endpoint,
          response.status >= 500 || response.status === 429
        );
      }

      const result = await response.json();
      return result as T;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof N8NError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new N8NTimeoutError(endpoint);
        }
        throw new N8NNetworkError(endpoint, error);
      }

      throw new N8NError(`Unknown error for ${endpoint}`, undefined, endpoint);
    }
  }

  // Retry wrapper with exponential backoff
  private async withRetry<T>(
    operation: () => Promise<T>,
    endpoint: string
  ): Promise<T> {
    let lastError: N8NError;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as N8NError;

        // Don't retry if it's not a retryable error
        if (!lastError.retryable || attempt === this.config.retryAttempts) {
          throw lastError;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        await delay(delayMs);
      }
    }

    throw lastError!;
  }

  // Chat agent methods
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.withRetry(
      () => this.makeRequest<ChatResponse>(
        this.config.webhookEndpoints.chat,
        request
      ),
      'chat'
    );
  }

  async generateScenario(
    scenarioType: 'bull' | 'bear' | 'custom',
    context: ChatContext,
    parameters?: any
  ): Promise<ChatResponse> {
    const request: ChatRequest = {
      message: `Generate ${scenarioType} case scenario`,
      context,
      conversationHistory: [],
      requestType: 'scenario',
      scenarioType
    };

    return this.sendChatMessage(request);
  }

  async generateSummary(context: ChatContext): Promise<ChatResponse> {
    const request: ChatRequest = {
      message: 'Generate company summary',
      context,
      conversationHistory: [],
      requestType: 'summary'
    };

    return this.sendChatMessage(request);
  }

  // Financial analysis agent methods
  async analyzeFinancialMetrics(request: FinancialAnalysisRequest): Promise<FinancialAnalysisResponse> {
    return this.withRetry(
      () => this.makeRequest<FinancialAnalysisResponse>(
        this.config.webhookEndpoints.financialAnalysis,
        request
      ),
      'financial-analysis'
    );
  }

  async detectAnomalies(companyId: string, metrics: any, thresholds: any): Promise<FinancialAnalysisResponse> {
    return this.analyzeFinancialMetrics({
      companyId,
      metrics,
      industryThresholds: thresholds,
      analysisType: 'anomaly_detection'
    });
  }

  // Social sentiment agent methods
  async analyzeSocialSentiment(request: SocialSentimentRequest): Promise<SocialSentimentResponse> {
    return this.withRetry(
      () => this.makeRequest<SocialSentimentResponse>(
        this.config.webhookEndpoints.socialSentiment,
        request
      ),
      'social-sentiment'
    );
  }

  async classifyPosts(posts: any[], symbol: string): Promise<SocialSentimentResponse> {
    return this.analyzeSocialSentiment({
      posts,
      symbol,
      analysisType: 'classification'
    });
  }

  async detectSocialEvents(posts: any[], symbol: string): Promise<SocialSentimentResponse> {
    return this.analyzeSocialSentiment({
      posts,
      symbol,
      analysisType: 'event_detection'
    });
  }

  // Health check method
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; endpoints: Record<string, boolean> }> {
    const endpoints = Object.entries(this.config.webhookEndpoints);
    const results: Record<string, boolean> = {};

    await Promise.allSettled(
      endpoints.map(async ([name, endpoint]) => {
        try {
          await this.makeRequest(endpoint, { healthCheck: true });
          results[name] = true;
        } catch {
          results[name] = false;
        }
      })
    );

    const allHealthy = Object.values(results).every(Boolean);
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      endpoints: results
    };
  }

  // Configuration methods
  updateConfig(newConfig: Partial<N8NConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): N8NConfig {
    return { ...this.config };
  }
}

// Default client instance
export const n8nClient = new N8NClient();

// Mock implementation for development/testing
export class MockN8NClient extends N8NClient {
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    // Simulate API delay
    await delay(1000 + Math.random() * 2000);

    // Generate mock response based on request type
    let response = '';
    const linkedEvents: string[] = [];

    switch (request.requestType) {
      case 'summary':
        response = `Based on current analysis of ${request.context.companyId}, the company shows strong fundamentals with ${request.context.recentEvents.length} recent events impacting outlook. Key metrics indicate positive momentum in revenue growth and margin expansion.`;
        break;
      case 'scenario':
        if (request.scenarioType === 'bull') {
          response = 'In a bullish scenario, strong earnings momentum and favorable market conditions could drive significant upside. Key catalysts include product launches and market expansion.';
        } else if (request.scenarioType === 'bear') {
          response = 'In a bearish scenario, macroeconomic headwinds and competitive pressures could create downside risk. Key concerns include margin compression and demand softening.';
        } else {
          response = 'Custom scenario analysis suggests mixed outlook with both opportunities and risks to monitor closely.';
        }
        break;
      default:
        response = `I understand you're asking about "${request.message}". Based on the current market context and recent events, here's my analysis: The situation appears to be evolving with several key factors to consider.`;
    }

    // Add some linked events if available
    if (request.context.recentEvents.length > 0) {
      linkedEvents.push(...request.context.recentEvents.slice(0, 2).map(e => e.id));
    }

    return {
      response,
      linkedEvents,
      confidence: 75 + Math.random() * 20, // 75-95%
      sources: ['Market Data', 'Financial Metrics', 'Social Sentiment'],
      suggestedActions: ['Monitor key metrics', 'Review event timeline', 'Assess risk factors']
    };
  }

  async analyzeFinancialMetrics(request: FinancialAnalysisRequest): Promise<FinancialAnalysisResponse> {
    await delay(800 + Math.random() * 1200);

    return {
      anomalies: [],
      generatedEvents: [],
      insights: ['Financial metrics within normal ranges', 'No significant anomalies detected'],
      recommendations: ['Continue monitoring key ratios', 'Watch for trend changes']
    };
  }

  async analyzeSocialSentiment(request: SocialSentimentRequest): Promise<SocialSentimentResponse> {
    await delay(600 + Math.random() * 1000);

    return {
      classifiedPosts: request.posts.map(post => ({
        ...post,
        sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
        confidence: 60 + Math.random() * 35
      })),
      sentimentAggregate: {
        bullishCount: Math.floor(Math.random() * 20),
        bearishCount: Math.floor(Math.random() * 15),
        neutralCount: Math.floor(Math.random() * 10),
        influenceWeightedScore: (Math.random() - 0.5) * 100
      },
      detectedEvents: [],
      executivePosts: []
    };
  }
}

// Export the appropriate client based on environment
export const createN8NClient = (useMock = false): N8NClient => {
  if (useMock || process.env.NODE_ENV === 'development') {
    return new MockN8NClient();
  }
  return new N8NClient();
};