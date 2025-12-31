"use client"

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { generateAllMockData } from '@/lib/mockData';
import { DashboardHeader } from '@/components/panels/DashboardHeader';
import { ForecastedEvents } from '@/components/panels/ForecastedEvents';
import { SocialFeed } from '@/components/panels/SocialFeed';
import { CausalChart } from '@/components/panels/CausalChart';
import { ChatPanel } from '@/components/panels/ChatPanel';

export default function DemoPage() {
  const { 
    setCompanies, 
    setIndustries, 
    setEvents, 
    setEventGraph,
    setFinancialMetrics,
    setSocialPosts,
    setSentimentAggregate,
    setMacroEvents,
    setPriceData,
    setSelectedCompany,
    setConnectionStatus
  } = useAppStore();

  // Initialize with mock data
  useEffect(() => {
    const mockData = generateAllMockData();
    
    setCompanies(mockData.companies);
    setIndustries(mockData.industries);
    setEvents(mockData.events);
    setEventGraph(mockData.eventGraph);
    setFinancialMetrics(mockData.financialMetrics);
    setSocialPosts(mockData.socialPosts);
    setSentimentAggregate(mockData.sentimentAggregate);
    setMacroEvents(mockData.macroEvents);
    setPriceData(mockData.priceData);
    
    // Select Apple as default company
    setSelectedCompany('AAPL');
    
    // Set connection status to connected
    setConnectionStatus('connected');
  }, [
    setCompanies, 
    setIndustries, 
    setEvents, 
    setEventGraph,
    setFinancialMetrics,
    setSocialPosts,
    setSentimentAggregate,
    setMacroEvents,
    setPriceData,
    setSelectedCompany,
    setConnectionStatus
  ]);

  return (
    <div className="h-screen flex flex-col bg-terminal-bg text-white">
      {/* Header */}
      <DashboardHeader />
      
      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel */}
        <div className="w-80 border-r border-terminal-border">
          <ForecastedEvents />
        </div>
        
        {/* Center Panel */}
        <div className="flex-1 flex flex-col">
          <CausalChart />
        </div>
        
        {/* Right Panel */}
        <div className="w-96 border-l border-terminal-border flex flex-col">
          <div className="flex-1">
            <ChatPanel />
          </div>
          <div className="h-80 border-t border-terminal-border">
            <SocialFeed />
          </div>
        </div>
      </div>
    </div>
  );
}