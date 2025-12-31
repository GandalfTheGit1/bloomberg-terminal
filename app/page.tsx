"use client"

import { DashboardHeader } from "@/components/panels/DashboardHeader"
import { ForecastedEvents } from "@/components/panels/ForecastedEvents"
import { SocialFeed } from "@/components/panels/SocialFeed"
import { CausalChart } from "@/components/panels/CausalChart"
import { ChatPanel } from "@/components/panels/ChatPanel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export default function DashboardPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden dark">
      <DashboardHeader />
      <div className="flex-1 min-h-0">
        {/* Restructured layout with resizable panels */}
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

          {/* Middle Panel: Chart */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <CausalChart />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel: Chat */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <ChatPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
