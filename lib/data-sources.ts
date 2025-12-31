/**
 * Real Data Sources for Economic Events and Stock Market Analysis
 */

import { EconomicEvent, StockMovement } from './economic-analysis';

// API Configuration
const API_KEYS = {
  ALPHA_VANTAGE: process.env.ALPHA_VANTAGE_API_KEY || 'demo',
  FRED: process.env.FRED_API_KEY || 'demo',
  YAHOO_FINANCE: 'free' // Yahoo Finance doesn't require API key for basic data
};

/**
 * Fetch economic events from FRED (Federal Reserve Economic Data)
 */
export async function fetchFREDEconomicData(
  series: string,
  startDate: string,
  endDate: string
): Promise<EconomicEvent[]> {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${API_KEYS.FRED}&file_type=json&observation_start=${startDate}&observation_end=${endDate}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return data.observations?.map((obs: any, index: number) => ({
      id: `fred_${series}_${index}`,
      type: mapFREDSeriesToEventType(series),
      name: `${series} Release`,
      date: new Date(obs.date),
      actualValue: parseFloat(obs.value),
      previousValue: index > 0 ? parseFloat(data.observations[index - 1].value) : undefined,
      surprise: index > 0 ? 
        (parseFloat(obs.value) - parseFloat(data.observations[index - 1].value)) / parseFloat(data.observations[index - 1].value) : 0,
      importance: 'high',
      affectedSectors: getAffectedSectors(series),
      source: 'FRED'
    })) || [];
  } catch (error) {
    console.error('Error fetching FRED data:', error);
    return [];
  }
}

/**
 * Fetch stock price data from Alpha Vantage
 */
export async function fetchStockData(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<StockMovement[]> {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEYS.ALPHA_VANTAGE}&outputsize=full`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      throw new Error('No time series data found');
    }
    
    return Object.entries(timeSeries)
      .filter(([date]) => date >= startDate && date <= endDate)
      .map(([date, prices]: [string, any]) => {
        const open = parseFloat(prices['1. open']);
        const close = parseFloat(prices['4. close']);
        const high = parseFloat(prices['2. high']);
        const low = parseFloat(prices['3. low']);
        const volume = parseInt(prices['5. volume']);
        
        return {
          symbol,
          date: new Date(date),
          openPrice: open,
          closePrice: close,
          highPrice: high,
          lowPrice: low,
          volume,
          percentChange: ((close - open) / open) * 100,
          volatility: ((high - low) / open) * 100
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return [];
  }
}

/**
 * Fetch earnings calendar from Alpha Vantage
 */
export async function fetchEarningsCalendar(
  symbol?: string
): Promise<EconomicEvent[]> {
  const url = symbol 
    ? `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&symbol=${symbol}&apikey=${API_KEYS.ALPHA_VANTAGE}`
    : `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&apikey=${API_KEYS.ALPHA_VANTAGE}`;
  
  try {
    const response = await fetch(url);
    const csvText = await response.text();
    
    // Parse CSV data (Alpha Vantage returns CSV for earnings calendar)
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        const values = line.split(',');
        const reportDate = new Date(values[2]);
        
        return {
          id: `earnings_${values[0]}_${index}`,
          type: 'earnings_release' as const,
          name: `${values[1]} Earnings Release`,
          date: reportDate,
          expectedValue: values[3] ? parseFloat(values[3]) : undefined,
          actualValue: values[4] ? parseFloat(values[4]) : undefined,
          surprise: values[3] && values[4] ? 
            (parseFloat(values[4]) - parseFloat(values[3])) / Math.abs(parseFloat(values[3])) : undefined,
          importance: 'high',
          affectedSectors: [getCompanySector(values[0])],
          source: 'Alpha Vantage'
        };
      });
  } catch (error) {
    console.error('Error fetching earnings calendar:', error);
    return [];
  }
}

/**
 * Fetch economic calendar events (Fed meetings, GDP releases, etc.)
 */
export async function fetchEconomicCalendar(
  startDate: string,
  endDate: string
): Promise<EconomicEvent[]> {
  // This would typically use a premium API like Bloomberg or Refinitiv
  // For demo purposes, we'll create some sample events
  const events: EconomicEvent[] = [
    {
      id: 'fed_meeting_2024_01',
      type: 'fed_meeting',
      name: 'Federal Reserve FOMC Meeting',
      date: new Date('2024-01-31'),
      expectedValue: 5.25, // Expected fed funds rate
      actualValue: 5.50,
      surprise: (5.50 - 5.25) / 5.25,
      importance: 'high',
      affectedSectors: ['financials', 'real_estate', 'utilities'],
      source: 'Federal Reserve'
    },
    {
      id: 'gdp_q4_2023',
      type: 'gdp_report',
      name: 'Q4 2023 GDP Report',
      date: new Date('2024-01-25'),
      expectedValue: 2.1, // Expected GDP growth %
      actualValue: 3.3,
      surprise: (3.3 - 2.1) / 2.1,
      importance: 'high',
      affectedSectors: ['all'],
      source: 'Bureau of Economic Analysis'
    }
  ];
  
  return events.filter(event => 
    event.date >= new Date(startDate) && event.date <= new Date(endDate)
  );
}

/**
 * Helper function to map FRED series to event types
 */
function mapFREDSeriesToEventType(series: string): EconomicEvent['type'] {
  const mapping: Record<string, EconomicEvent['type']> = {
    'GDP': 'gdp_report',
    'UNRATE': 'employment_report',
    'CPIAUCSL': 'inflation_data',
    'FEDFUNDS': 'fed_meeting'
  };
  
  return mapping[series] || 'inflation_data';
}

/**
 * Helper function to get affected sectors by FRED series
 */
function getAffectedSectors(series: string): string[] {
  const sectorMapping: Record<string, string[]> = {
    'GDP': ['all'],
    'UNRATE': ['consumer_discretionary', 'industrials'],
    'CPIAUCSL': ['consumer_staples', 'energy'],
    'FEDFUNDS': ['financials', 'real_estate', 'utilities']
  };
  
  return sectorMapping[series] || ['all'];
}

/**
 * Helper function to get company sector (simplified)
 */
function getCompanySector(symbol: string): string {
  const sectorMapping: Record<string, string> = {
    'AAPL': 'technology',
    'MSFT': 'technology',
    'GOOGL': 'technology',
    'TSLA': 'consumer_discretionary',
    'JPM': 'financials',
    'JNJ': 'healthcare',
    'XOM': 'energy'
  };
  
  return sectorMapping[symbol] || 'unknown';
}

/**
 * Comprehensive data fetcher that combines multiple sources
 */
export async function fetchComprehensiveMarketData(
  symbols: string[],
  startDate: string,
  endDate: string
): Promise<{
  economicEvents: EconomicEvent[];
  stockData: Record<string, StockMovement[]>;
}> {
  try {

    // Fetch economic events from multiple sources
    const [fredGDP, fredUnemployment, fredInflation, earnings, economicCalendar] = await Promise.all([
      fetchFREDEconomicData('GDP', startDate, endDate),
      fetchFREDEconomicData('UNRATE', startDate, endDate),
      fetchFREDEconomicData('CPIAUCSL', startDate, endDate),
      fetchEarningsCalendar(),
      fetchEconomicCalendar(startDate, endDate)
    ]);
    
    const economicEvents = [
      ...fredGDP,
      ...fredUnemployment,
      ...fredInflation,
      ...earnings,
      ...economicCalendar
    ].filter(event => 
      event.date >= new Date(startDate) && event.date <= new Date(endDate)
    );
    
    // Fetch stock data for all symbols
    const stockDataPromises = symbols.map(symbol => 
      fetchStockData(symbol, startDate, endDate)
    );
    
    const stockDataArrays = await Promise.all(stockDataPromises);
    const stockData = symbols.reduce((acc, symbol, index) => {
      acc[symbol] = stockDataArrays[index];
      return acc;
    }, {} as Record<string, StockMovement[]>);
    
    return {
      economicEvents,
      stockData
    };
  } catch (error) {
    console.error('Error fetching comprehensive market data:', error);
    return {
      economicEvents: [],
      stockData: {}
    };
  }
}