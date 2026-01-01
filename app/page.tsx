"use client"

import { useEffect } from "react"
import { DashboardHeader } from "@/components/panels/DashboardHeader"
import { ForecastedEvents } from "@/components/panels/ForecastedEvents"
import { SocialFeed } from "@/components/panels/SocialFeed"
import { CausalChart } from "@/components/panels/CausalChart"
import { ChatPanel } from "@/components/panels/ChatPanel"
import { IndustryLookback } from "@/components/panels/IndustryLookback"
import FinancialAnalysisPanel from "@/components/panels/FinancialAnalysisPanel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { useAppStore } from "@/lib/store"
import { generateAllMockData } from "@/lib/mockData"

export default function DashboardPage() {
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
    setSelectedIndustry
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
    
    // Select Apple as default company and technology industry
    setSelectedCompany('AAPL');
    setSelectedIndustry('technology');
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
    setSelectedIndustry
  ]);

  return (
    <div className="h-screen flex flex-col overflow-hidden dark">
      <DashboardHeader />
      <div className="flex-1 min-h-0">
        {/* Main layout with resizable panels */}
        <ResizablePanelGroup orientation="vertical">
          {/* Top section: Left, Central Chart, Right panels */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ResizablePanelGroup orientation="horizontal">
              {/* Left Panel: Event & Social Feed */}
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <ResizablePanelGroup orientation="vertical">
                  {/* Forecasted Events - top half */}
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <ForecastedEvents />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  {/* Social Feed - bottom half */}
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <SocialFeed />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Central Panel: Chart */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <CausalChart />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Right Panel: Chat */}
              <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
                <ChatPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Financial Analysis Panel - positioned centrally below chart */}
          <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
            <FinancialAnalysisPanel className="h-full" />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Industry Panel - positioned below financial analysis */}
          <ResizablePanel defaultSize={25} minSize={10} maxSize={30}>
            <IndustryLookback />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
