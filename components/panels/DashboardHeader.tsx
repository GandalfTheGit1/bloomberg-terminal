"use client"

import { Search, Bell, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

export function DashboardHeader() {
  return (
    <header className="h-12 border-b border-terminal-border bg-terminal-panel flex items-center justify-between px-4 shrink-0 z-20">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded bg-primary/20 flex items-center justify-center">
            <div className="size-3 rounded-full bg-primary" />
          </div>
          <h1 className="text-sm font-bold tracking-wide uppercase text-slate-200">AI Financial Terminal</h1>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search Ticker (e.g. AAPL, NVDA)..."
            defaultValue="AAPL"
            className="bg-terminal-bg border-terminal-border text-white text-xs w-64 pl-9 h-8 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-white">AAPL</span>
          <span className="text-slate-400 text-xs">Apple Inc.</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-bold tracking-tight">$175.40</span>
          <span className="flex items-center gap-0.5 text-bullish font-mono text-xs font-medium bg-bullish/10 px-1.5 py-0.5 rounded">
            <TrendingUp className="size-3" />
            1.2%
          </span>
        </div>

        <div className="h-4 w-px bg-terminal-border" />

        <div className="flex gap-4 text-xs text-slate-400">
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Vol</span>
            <span className="font-mono text-slate-300">52.4M</span>
          </div>
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Mkt Cap</span>
            <span className="font-mono text-slate-300">2.7T</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-slate-400 hover:text-white transition-colors relative focus:outline-none">
              <Bell className="size-5" />
              <span className="absolute top-0 right-0 size-2 bg-primary rounded-full border-2 border-terminal-panel" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-terminal-panel border-terminal-border text-white" align="end">
            <div className="p-3 border-b border-terminal-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</h4>
            </div>
            <ScrollArea className="h-64">
              <div className="divide-y divide-terminal-border">
                {[
                  { title: "Price Alert: AAPL", desc: "Crossed above $175.50 threshold", time: "2m ago", type: "bull" },
                  {
                    title: "New Forecast",
                    desc: "Earnings probability updated for NVDA",
                    time: "15m ago",
                    type: "info",
                  },
                  {
                    title: "Volatility Warning",
                    desc: "High skew detected in tech sector",
                    time: "1h ago",
                    type: "bear",
                  },
                ].map((n, i) => (
                  <div key={i} className="p-3 hover:bg-terminal-bg/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{n.desc}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="size-7 cursor-pointer border border-transparent hover:border-primary/50 transition-all">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback className="bg-slate-700 text-white text-xs font-bold">JD</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-terminal-panel border-terminal-border text-white" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-xs">John Doe</span>
                <span className="text-[10px] text-slate-500 font-normal">john@aiterminal.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-terminal-border" />
            <DropdownMenuItem className="text-xs hover:bg-terminal-bg focus:bg-terminal-bg cursor-pointer">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs hover:bg-terminal-bg focus:bg-terminal-bg cursor-pointer">
              API Keys
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs hover:bg-terminal-bg focus:bg-terminal-bg cursor-pointer">
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-terminal-border" />
            <DropdownMenuItem className="text-xs text-red-400 hover:bg-red-950/20 focus:bg-red-950/20 cursor-pointer">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}