"use client"

import { useState, useMemo } from "react"
import { Play, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IndustryLookback } from "@/components/panels/IndustryLookback"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { Event, PricePoint } from "@/types/models"

const timeRanges = [
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
]

// Event node component for rendering events on the chart
interface EventNodeProps {
  event: Event;
  position: { x: string; y: string };
  onClick: (event: Event) => void;
  isSelected: boolean;
}

function EventNode({ event, position, onClick, isSelected }: EventNodeProps) {
  // Determine event color based on impact direction
  const getEventColor = (event: Event) => {
    const impacts = Object.values(event.impact).filter(Boolean);
    if (impacts.length === 0) return 'neutral';
    
    const avgDirection = impacts.reduce((acc, impact) => {
      if (impact!.direction === 'bullish') return acc + 1;
      if (impact!.direction === 'bearish') return acc - 1;
      return acc;
    }, 0);
    
    if (avgDirection > 0) return 'bullish';
    if (avgDirection < 0) return 'bearish';
    return 'neutral';
  };

  const eventColor = getEventColor(event);
  const colorClass = {
    bullish: "text-bullish",
    bearish: "text-bearish", 
    neutral: "text-neutral"
  }[eventColor];

  const bgColorClass = {
    bullish: "group-hover:bg-bullish",
    bearish: "group-hover:bg-bearish",
    neutral: "group-hover:bg-neutral"
  }[eventColor];

  // Get event abbreviation
  const getEventAbbreviation = (title: string) => {
    const words = title.split(' ');
    if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  };

  return (
    <div 
      className={cn(
        "absolute group cursor-pointer pointer-events-auto",
        isSelected && "z-20"
      )}
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
      onClick={() => onClick(event)}
    >
      <div className="relative size-12 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-800"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            className={cn(colorClass, "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]")}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeDasharray={`${event.probability}, 100`}
            strokeWidth="2"
          />
        </svg>
        <div className={cn(
          "size-8 bg-terminal-panel rounded-full border border-terminal-border flex items-center justify-center text-[9px] font-bold text-white group-hover:text-black transition-colors shadow-lg",
          bgColorClass,
          isSelected && "ring-2 ring-white/50"
        )}>
          {getEventAbbreviation(event.title)}
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
        <div className="bg-terminal-panel border border-terminal-border rounded-lg p-3 shadow-xl min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">{event.title}</span>
            <span className={cn("text-[10px] font-mono font-bold", colorClass)}>
              {Math.round(event.probability)}%
            </span>
          </div>
          <div className="space-y-1 text-[10px] text-slate-400">
            <div>Expected Value: <span className="text-white">{event.expectedValue.toFixed(2)}</span></div>
            <div>Confidence: <span className="text-white">{Math.round(event.confidence)}%</span></div>
            <div>Type: <span className="text-white capitalize">{event.type}</span></div>
            {event.drivers.length > 0 && (
              <div>Drivers: <span className="text-white">{event.drivers.slice(0, 2).join(', ')}</span></div>
            )}
          </div>
          {event.description && (
            <p className="text-[10px] text-slate-400 mt-2 leading-tight">
              {event.description.substring(0, 100)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CausalChart() {
  const { 
    events, 
    priceData, 
    setSelectedEvent, 
    ui,
    getSelectedCompany 
  } = useAppStore();
  
  const [selectedRange, setSelectedRange] = useState("1d");
  const [chartType, setChartType] = useState<"causal" | "candles">("causal");
  
  const selectedCompany = getSelectedCompany();
  
  // Filter events for the selected company and future events
  const relevantEvents = useMemo(() => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.timingWindow.expectedDate);
      return eventDate > now; // Only show future events
    }).slice(0, 10); // Limit to 10 events for performance
  }, [events]);
  
  // Generate candlestick data from price data
  const candlestickData = useMemo(() => {
    if (priceData.length === 0) return [];
    
    // Take last 20 data points and convert to chart coordinates
    const recentData = priceData.slice(-20);
    return recentData.map((point, index) => ({
      x: (index / recentData.length) * 60, // Scale to 60% of chart width (historical area)
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close
    }));
  }, [priceData]);
  
  // Calculate event positions on the chart
  const eventPositions = useMemo(() => {
    const now = new Date();
    const maxFutureTime = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
    
    return relevantEvents.map(event => {
      const eventDate = new Date(event.timingWindow.expectedDate);
      const timeDiff = eventDate.getTime() - now.getTime();
      
      // Position events in the future area (60% to 95% of chart width)
      const xPercent = 60 + (Math.min(timeDiff, maxFutureTime) / maxFutureTime) * 35;
      
      // Vary Y position based on event type and impact
      let yPercent = 40; // Default middle position
      
      if (event.type === 'macro') yPercent = 20;
      else if (event.type === 'industry') yPercent = 40;
      else if (event.type === 'company') yPercent = 60;
      
      // Adjust based on impact direction
      const impacts = Object.values(event.impact).filter(Boolean);
      if (impacts.length > 0) {
        const avgDirection = impacts.reduce((acc, impact) => {
          if (impact!.direction === 'bullish') return acc - 10;
          if (impact!.direction === 'bearish') return acc + 10;
          return acc;
        }, 0) / impacts.length;
        yPercent += avgDirection;
      }
      
      return {
        event,
        position: {
          x: `${Math.min(Math.max(xPercent, 62), 95)}%`,
          y: `${Math.min(Math.max(yPercent, 15), 85)}%`
        }
      };
    });
  }, [relevantEvents]);
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event.id);
  };
  
  const handleRunSimulation = () => {
    // TODO: Implement simulation logic
    console.log('Running simulation for events:', relevantEvents.map(e => e.title));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-terminal-bg relative">
      {/* Chart Controls */}
      <div className="h-10 border-b border-terminal-border flex items-center justify-between px-4 bg-terminal-bg/50 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex bg-terminal-panel rounded p-0.5 border border-terminal-border">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`px-3 py-0.5 text-[11px] font-medium rounded transition-colors ${
                  selectedRange === range.value
                    ? "text-white bg-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-terminal-border" />

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={() => setChartType("causal")}
              className={cn(
                "flex items-center gap-1 cursor-pointer transition-colors",
                chartType === "causal" ? "text-primary" : "hover:text-white",
              )}
            >
              <TrendingUp className="size-4" />
              Causal
            </button>
            <button
              onClick={() => setChartType("candles")}
              className={cn(
                "flex items-center gap-1 cursor-pointer transition-colors",
                chartType === "candles" ? "text-primary" : "hover:text-white",
              )}
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Candles
            </button>
          </div>
          
          {/* Company indicator */}
          {selectedCompany && (
            <div className="text-xs text-slate-400">
              <span className="text-white font-mono">${selectedCompany.symbol}</span>
              <span className="ml-2">{selectedCompany.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400">
            Events: <span className="text-white">{relevantEvents.length}</span>
          </div>
          <Button
            size="sm"
            onClick={handleRunSimulation}
            className="flex items-center gap-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-3 py-1 h-7 text-xs font-medium"
          >
            <Play className="size-3" />
            Run Simulation
          </Button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative bg-grid-pattern overflow-hidden">
        {/* Today Line */}
        <div className="absolute top-0 bottom-0 left-[60%] border-l border-dashed border-primary/40 z-10 flex flex-col items-center pt-2">
          <span className="bg-terminal-bg text-primary border border-primary/30 px-2 py-0.5 text-[10px] rounded-full font-mono">
            TODAY
          </span>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradientBullish" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.16 162)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="oklch(0.65 0.16 162)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradientBearish" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.58 0.22 25)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="oklch(0.58 0.22 25)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {chartType === "candles" ? (
            <g>
              {candlestickData.map((candle, i) => {
                const isGreen = candle.close > candle.open
                const color = isGreen ? "oklch(0.65 0.16 162)" : "oklch(0.58 0.22 25)"
                const xPos = `${candle.x}%`
                const yScale = 400 / 50 // Scale to fit in viewport
                const high = 400 - candle.high * yScale + 100
                const low = 400 - candle.low * yScale + 100
                const open = 400 - candle.open * yScale + 100
                const close = 400 - candle.close * yScale + 100
                const bodyTop = Math.min(open, close)
                const bodyHeight = Math.abs(close - open)

                return (
                  <g key={i}>
                    {/* Wick */}
                    <line x1={xPos} y1={high} x2={xPos} y2={low} stroke={color} strokeWidth="1" opacity="0.8" />
                    {/* Body */}
                    <rect
                      x={`calc(${xPos} - 1.5%)`}
                      y={bodyTop}
                      width="3%"
                      height={Math.max(bodyHeight, 2)}
                      fill={color}
                      opacity="0.9"
                    />
                  </g>
                )
              })}
            </g>
          ) : (
            <>
              {/* Historical Price Line */}
              <path
                d="M 0,250 L 40,240 L 80,260 L 120,230 L 160,245 L 200,210 L 240,220 L 280,180 L 320,195 L 360,170 L 400,180 L 440,160 L 480,175 L 520,150 L 560,165 L 600,140 L 60%,140"
                fill="none"
                stroke="oklch(0.66 0 0)"
                strokeWidth="1.5"
              />
              {/* Bullish Forecast */}
              <path
                d="M 60%,140 Q 70%,120 85%,80"
                fill="none"
                stroke="oklch(0.65 0.16 162)"
                strokeDasharray="4 2"
                strokeWidth="2"
              />
              <path d="M 60%,140 L 85%,80 L 85%,600 L 60%,600 Z" fill="url(#gradientBullish)" opacity="0.5" />

              {/* Bearish Forecast */}
              <path
                d="M 60%,140 Q 65%,160 80%,240"
                fill="none"
                stroke="oklch(0.58 0.22 25)"
                strokeDasharray="4 4"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* Neutral Forecast */}
              <path
                d="M 60%,140 Q 70%,140 90%,150"
                fill="none"
                stroke="oklch(0.72 0.15 65)"
                strokeDasharray="2 2"
                strokeWidth="1"
                opacity="0.4"
              />
            </>
          )}
        </svg>

        {/* Event Nodes - only show in causal mode */}
        {chartType === "causal" && (
          <div className="absolute inset-0 z-10">
            {eventPositions.map(({ event, position }) => (
              <EventNode
                key={event.id}
                event={event}
                position={position}
                onClick={handleEventClick}
                isSelected={ui.selectedEventId === event.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Industry Lookback Component */}
      <IndustryLookback />
    </div>
  )
}