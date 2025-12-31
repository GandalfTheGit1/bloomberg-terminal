"use client"

import { TrendingUp, AlertTriangle, Scale, Handshake } from "lucide-react"
import { cn } from "@/lib/utils"

interface ForecastEvent {
  id: string
  title: string
  date: string
  probability: number
  description: string
  type: "bullish" | "bearish" | "neutral"
  icon: typeof TrendingUp
}

const forecastEvents: ForecastEvent[] = [
  {
    id: "1",
    title: "Q3 Earnings Beat",
    date: "Oct 24",
    probability: 85,
    description: "Consensus estimates trailing AI-adjusted revenue models.",
    type: "bullish",
    icon: TrendingUp,
  },
  {
    id: "2",
    title: "Supply Chain Delay",
    date: "Nov 02",
    probability: 62,
    description: "Typhoon impact on Taiwan semi-conductor logistics.",
    type: "bearish",
    icon: AlertTriangle,
  },
  {
    id: "3",
    title: "Fed Rate Decision",
    date: "Nov 15",
    probability: 95,
    description: "Market priced in pause. Statement language key.",
    type: "neutral",
    icon: Scale,
  },
  {
    id: "4",
    title: "Strategic M&A",
    date: "Dec 10",
    probability: 25,
    description: "Low probability acquisition speculation.",
    type: "bullish",
    icon: Handshake,
  },
]

export function ForecastedEvents() {
  return (
    <div className="flex flex-col h-full bg-terminal-panel">
      <div className="h-10 border-b border-terminal-border flex items-center px-3 bg-[oklch(0.12_0.01_250)]">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Forecasted Events</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {forecastEvents.map((event) => {
          const Icon = event.icon
          const colorClass = {
            bullish: "text-bullish",
            bearish: "text-bearish",
            neutral: "text-neutral",
          }[event.type]

          return (
            <div
              key={event.id}
              className={cn(
                "group flex flex-col gap-2 bg-terminal-bg hover:bg-[oklch(0.14_0.01_250)] border border-terminal-border hover:border-slate-600 rounded-lg p-3 cursor-pointer transition-all",
                event.probability < 30 && "opacity-70 hover:opacity-100",
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Icon className={cn("size-[18px]", colorClass)} />
                  <span className="text-xs font-bold text-white">{event.title}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{event.date}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500 uppercase">Probability</span>
                  <span className={cn("text-xs font-mono font-bold", colorClass)}>{event.probability}%</span>
                </div>
                <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full", {
                      "bg-bullish": event.type === "bullish",
                      "bg-bearish": event.type === "bearish",
                      "bg-neutral": event.type === "neutral",
                    })}
                    style={{ width: `${event.probability}%` }}
                  />
                </div>
              </div>
              {event.description && (
                <p className="text-[11px] text-slate-400 leading-tight mt-1">{event.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}