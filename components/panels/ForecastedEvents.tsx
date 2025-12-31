"use client"

import { TrendingUp, AlertTriangle, Scale, Handshake, Filter, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore, useFilteredEvents } from "@/lib/store"
import { Event, EventType, ImpactDirection } from "@/types/models"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"

// Map event types to icons
const getEventIcon = (event: Event) => {
  if (event.type === 'macro') return Scale;
  if (event.type === 'industry') return AlertTriangle;
  
  // For company events, determine icon based on impact direction
  const impacts = Object.values(event.impact).filter(Boolean);
  if (impacts.length === 0) return Handshake;
  
  const avgDirection = impacts.reduce((acc, impact) => {
    if (impact!.direction === 'bullish') return acc + 1;
    if (impact!.direction === 'bearish') return acc - 1;
    return acc;
  }, 0);
  
  if (avgDirection > 0) return TrendingUp;
  if (avgDirection < 0) return AlertTriangle;
  return Handshake;
};

// Get event type color
const getEventTypeColor = (event: Event): 'bullish' | 'bearish' | 'neutral' => {
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

// Format date for display
const formatEventDate = (date: Date): string => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Past';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function ForecastedEvents() {
  const filteredEvents = useFilteredEvents();
  const { 
    setSelectedEvent, 
    eventFilters, 
    updateEventFilters,
    getPriorityScore,
    ui 
  } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sort events by priority score and apply search filter
  const sortedAndFilteredEvents = useMemo(() => {
    let events = [...filteredEvents];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.drivers.some(driver => driver.toLowerCase().includes(search))
      );
    }
    
    // Sort by priority score (highest first)
    events.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
    
    return events;
  }, [filteredEvents, searchTerm, getPriorityScore]);
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event.id);
  };
  
  const handleFilterToggle = (eventType: EventType) => {
    const currentTypes = eventFilters.eventTypes || [];
    const newTypes = currentTypes.includes(eventType)
      ? currentTypes.filter(t => t !== eventType)
      : [...currentTypes, eventType];
    
    updateEventFilters({ eventTypes: newTypes });
  };

  return (
    <div className="flex flex-col h-full bg-terminal-panel">
      <div className="h-10 border-b border-terminal-border flex items-center px-3 bg-[oklch(0.12_0.01_250)]">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Forecasted Events</h3>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
          >
            <Filter className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="border-b border-terminal-border bg-[oklch(0.11_0.01_250)]">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-7 text-xs bg-terminal-bg border-terminal-border"
            />
          </div>
        </div>
        
        {showFilters && (
          <div className="px-2 pb-2">
            <div className="flex gap-1">
              {(['macro', 'industry', 'company'] as EventType[]).map((type) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterToggle(type)}
                  className={cn(
                    "h-6 px-2 text-[10px] uppercase tracking-wider",
                    eventFilters.eventTypes?.includes(type)
                      ? "bg-slate-600 text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sortedAndFilteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-500 text-xs">
            No events match current filters
          </div>
        ) : (
          sortedAndFilteredEvents.map((event) => {
            const Icon = getEventIcon(event);
            const eventType = getEventTypeColor(event);
            const colorClass = {
              bullish: "text-bullish",
              bearish: "text-bearish",
              neutral: "text-neutral",
            }[eventType];
            
            const isSelected = ui.selectedEventId === event.id;
            const priorityScore = getPriorityScore(event);

            return (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={cn(
                  "group flex flex-col gap-2 bg-terminal-bg hover:bg-[oklch(0.14_0.01_250)] border border-terminal-border hover:border-slate-600 rounded-lg p-3 cursor-pointer transition-all",
                  event.probability < 30 && "opacity-70 hover:opacity-100",
                  isSelected && "border-slate-500 bg-[oklch(0.14_0.01_250)]"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("size-[18px]", colorClass)} />
                    <span className="text-xs font-bold text-white">{event.title}</span>
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider",
                      event.type === 'macro' && "bg-blue-900/30 text-blue-300",
                      event.type === 'industry' && "bg-purple-900/30 text-purple-300",
                      event.type === 'company' && "bg-green-900/30 text-green-300"
                    )}>
                      {event.type}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatEventDate(new Date(event.timingWindow.expectedDate))}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-500 uppercase">Probability</span>
                      <span className={cn("text-xs font-mono font-bold", colorClass)}>
                        {Math.round(event.probability)}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-500 uppercase">Confidence</span>
                      <span className="text-xs font-mono text-slate-300">
                        {Math.round(event.confidence)}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-500 uppercase">Priority</span>
                      <span className="text-xs font-mono text-slate-300">
                        {priorityScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full", {
                        "bg-bullish": eventType === "bullish",
                        "bg-bearish": eventType === "bearish",
                        "bg-neutral": eventType === "neutral",
                      })}
                      style={{ width: `${event.probability}%` }}
                    />
                  </div>
                </div>
                
                {event.description && (
                  <p className="text-[11px] text-slate-400 leading-tight mt-1">
                    {event.description}
                  </p>
                )}
                
                {/* Expected Value */}
                {event.expectedValue > 0 && (
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-700/50">
                    <span className="text-[10px] text-slate-500 uppercase">Expected Value</span>
                    <span className={cn("text-xs font-mono font-bold", colorClass)}>
                      {event.expectedValue.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}