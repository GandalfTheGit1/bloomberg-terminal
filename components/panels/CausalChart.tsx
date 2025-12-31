"use client"

import { useState } from "react"
import { Play, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IndustryLookback } from "@/components/panels/IndustryLookback"
import { cn } from "@/lib/utils"

const timeRanges = [
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
]

const candlestickData = [
  { x: 5, open: 245, high: 252, low: 243, close: 248 },
  { x: 10, open: 248, high: 255, low: 246, close: 251 },
  { x: 15, open: 251, high: 254, low: 248, close: 249 },
  { x: 20, open: 249, high: 256, low: 247, close: 254 },
  { x: 25, open: 254, high: 258, low: 251, close: 252 },
  { x: 30, open: 252, high: 260, low: 250, close: 258 },
  { x: 35, open: 258, high: 262, low: 255, close: 256 },
  { x: 40, open: 256, high: 264, low: 254, close: 262 },
  { x: 45, open: 262, high: 268, low: 260, close: 265 },
  { x: 50, open: 265, high: 270, low: 263, close: 267 },
  { x: 55, open: 267, high: 272, low: 264, close: 269 },
  { x: 58, open: 269, high: 273, low: 266, close: 270 },
]

export function CausalChart() {
  const [selectedRange, setSelectedRange] = useState("1d")
  const [chartType, setChartType] = useState<"causal" | "candles">("causal")

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
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
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

        {/* Chart Annotations - only show in causal mode */}
        {chartType === "causal" && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Earnings Miss */}
            <div className="absolute left-[10%] top-[60%] text-[10px] text-slate-500 font-mono">Earnings Miss</div>
            {/* Product Demo */}
            <div className="absolute left-[40%] top-[45%] text-[10px] text-slate-500 font-mono">Product Demo</div>

            {/* Q3 Earnings Event Circle */}
            <div className="absolute left-[72%] top-[25%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer pointer-events-auto">
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
                    className="text-bullish drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="85, 100"
                    strokeWidth="2"
                  />
                </svg>
                <div className="size-8 bg-terminal-panel rounded-full border border-terminal-border flex items-center justify-center text-[10px] font-bold text-white group-hover:bg-bullish group-hover:text-black transition-colors shadow-lg">
                  Q3
                </div>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-terminal-panel border border-terminal-border rounded-lg p-2 shadow-xl min-w-[180px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Q3 Earnings Beat</span>
                    <span className="text-[10px] text-bullish font-mono">85%</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Expected impact: +$8-12</p>
                </div>
              </div>
            </div>

            {/* Supply Chain Event Circle */}
            <div className="absolute left-[80%] top-[60%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer pointer-events-auto">
              <div className="relative size-10 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    className="text-bearish drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="62, 100"
                    strokeWidth="2"
                  />
                </svg>
                <div className="size-7 bg-terminal-panel rounded-full border border-terminal-border flex items-center justify-center text-[10px] font-bold text-white group-hover:bg-bearish group-hover:text-black transition-colors shadow-lg">
                  SC
                </div>
              </div>
            </div>

            {/* Fed Rate Decision Circle */}
            <div className="absolute left-[90%] top-[40%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer pointer-events-auto">
              <div className="relative size-10 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    className="text-neutral drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="95, 100"
                    strokeWidth="2"
                  />
                </svg>
                <div className="size-7 bg-terminal-panel rounded-full border border-terminal-border flex items-center justify-center text-[9px] font-bold text-white group-hover:bg-neutral group-hover:text-black transition-colors shadow-lg">
                  FED
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Industry Lookback Component */}
      <IndustryLookback />
    </div>
  )
}