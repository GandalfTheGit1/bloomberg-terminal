"use client"

import { Search, Bell, TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react"
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
import { useAppStore } from "@/lib/store"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const { 
    companies, 
    getSelectedCompany, 
    setSelectedCompany,
    priceData,
    ui,
    markNotificationRead,
    clearNotifications
  } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const selectedCompany = getSelectedCompany();
  
  // Get current price data for selected company
  const currentPrice = useMemo(() => {
    if (priceData.length === 0) return null;
    
    const latest = priceData[priceData.length - 1];
    const previous = priceData.length > 1 ? priceData[priceData.length - 2] : latest;
    
    const change = latest.close - previous.close;
    const changePercent = (change / previous.close) * 100;
    
    return {
      price: latest.close,
      change,
      changePercent,
      volume: latest.volume
    };
  }, [priceData]);
  
  // Filter companies based on search term
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies.slice(0, 5); // Show top 5 by default
    
    const search = searchTerm.toLowerCase();
    return companies.filter(company => 
      company.symbol.toLowerCase().includes(search) ||
      company.name.toLowerCase().includes(search)
    ).slice(0, 10);
  }, [companies, searchTerm]);
  
  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
    setSearchTerm('');
    setIsSearchFocused(false);
  };
  
  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `${(marketCap / 1e6).toFixed(1)}M`;
    return marketCap.toString();
  };
  
  const formatVolume = (volume: number): string => {
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toString();
  };
  
  const unreadNotifications = ui.notifications.filter(n => !n.isRead);

  return (
    <header className="h-12 border-b border-terminal-border bg-terminal-panel flex items-center justify-between px-4 shrink-0 z-20">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded bg-primary/20 flex items-center justify-center">
            <div className="size-3 rounded-full bg-primary" />
          </div>
          <h1 className="text-sm font-bold tracking-wide uppercase text-slate-200">AI Financial Terminal</h1>
        </div>

        {/* Company Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search Ticker (e.g. AAPL, NVDA)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="bg-terminal-bg border-terminal-border text-white text-xs w-64 pl-9 h-8 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-slate-500"
          />
          
          {/* Search Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-terminal-panel border border-terminal-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => handleCompanySelect(company.id)}
                    className="flex items-center justify-between p-3 hover:bg-terminal-bg cursor-pointer border-b border-terminal-border last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white">{company.symbol}</span>
                      <span className="text-xs text-slate-400">{company.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 capitalize">{company.industry}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-xs text-slate-500 text-center">
                  No companies found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Company Info and Price */}
      <div className="flex items-center gap-6 text-sm">
        {selectedCompany ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-white">{selectedCompany.symbol}</span>
              <span className="text-slate-400 text-xs">{selectedCompany.name}</span>
            </div>

            {currentPrice && (
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold tracking-tight">
                  ${currentPrice.price.toFixed(2)}
                </span>
                <span className={cn(
                  "flex items-center gap-0.5 font-mono text-xs font-medium px-1.5 py-0.5 rounded",
                  currentPrice.changePercent >= 0 
                    ? "text-bullish bg-bullish/10" 
                    : "text-bearish bg-bearish/10"
                )}>
                  {currentPrice.changePercent >= 0 ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {currentPrice.changePercent >= 0 ? '+' : ''}{currentPrice.changePercent.toFixed(2)}%
                </span>
              </div>
            )}

            <div className="h-4 w-px bg-terminal-border" />

            <div className="flex gap-4 text-xs text-slate-400">
              <div className="flex flex-col leading-none gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Vol</span>
                <span className="font-mono text-slate-300">
                  {currentPrice ? formatVolume(currentPrice.volume) : '--'}
                </span>
              </div>
              <div className="flex flex-col leading-none gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Mkt Cap</span>
                <span className="font-mono text-slate-300">
                  {formatMarketCap(selectedCompany.marketCap)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-slate-500 text-sm">
            Select a company to view details
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="flex items-center gap-1">
          {ui.connectionStatus === 'connected' ? (
            <Wifi className="size-4 text-bullish" />
          ) : ui.connectionStatus === 'reconnecting' ? (
            <Wifi className="size-4 text-neutral animate-pulse" />
          ) : (
            <WifiOff className="size-4 text-bearish" />
          )}
          <span className="text-[10px] text-slate-500 capitalize">
            {ui.connectionStatus}
          </span>
        </div>
        
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-slate-400 hover:text-white transition-colors relative focus:outline-none">
              <Bell className="size-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 size-4 bg-primary rounded-full border-2 border-terminal-panel flex items-center justify-center">
                  <span className="text-[8px] font-bold text-black">
                    {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                  </span>
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-terminal-panel border-terminal-border text-white" align="end">
            <div className="p-3 border-b border-terminal-border flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</h4>
              {ui.notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-[10px] text-slate-500 hover:text-white"
                >
                  Clear All
                </button>
              )}
            </div>
            <ScrollArea className="h-64">
              {ui.notifications.length > 0 ? (
                <div className="divide-y divide-terminal-border">
                  {ui.notifications.slice(0, 10).map((notification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "p-3 hover:bg-terminal-bg/50 transition-colors cursor-pointer",
                        !notification.isRead && "bg-primary/5"
                      )}
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn(
                          "text-xs font-semibold",
                          notification.type === 'error' && "text-bearish",
                          notification.type === 'success' && "text-bullish",
                          notification.type === 'warning' && "text-neutral"
                        )}>
                          {notification.title}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {notification.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <div className="size-1.5 bg-primary rounded-full mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No notifications
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
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