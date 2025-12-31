"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, LayoutGrid, Podcast, Youtube, Newspaper, Twitter, RefreshCw } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { SocialPost, SentimentType, SocialSource } from "@/types/models"
import { Button } from "@/components/ui/button"

const platformIcons = {
  twitter: Twitter,
  reddit: LayoutGrid,
  podcast: Podcast,
  youtube: Youtube,
  news: Newspaper,
}

const platformColors = {
  twitter: "text-blue-400",
  reddit: "text-orange-500",
  podcast: "text-purple-400",
  youtube: "text-red-500",
  news: "text-slate-400",
}

// Format time ago
const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// Get author type color
const getAuthorTypeColor = (authorType: string): string => {
  switch (authorType) {
    case 'executive': return 'text-yellow-400';
    case 'employee': return 'text-blue-400';
    case 'analyst': return 'text-purple-400';
    default: return 'text-slate-400';
  }
};

export function SocialFeed() {
  const { 
    socialPosts, 
    sentimentAggregate, 
    addSocialPost,
    ui 
  } = useAppStore();
  
  const [filter, setFilter] = useState<"all" | "bullish" | "bearish" | "neutral">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter posts based on selected company and sentiment
  const filteredPosts = useMemo(() => {
    let posts = [...socialPosts];
    
    // Filter by sentiment
    if (filter !== "all") {
      posts = posts.filter(post => post.sentiment === filter);
    }
    
    // Sort by timestamp (newest first)
    posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Limit to recent posts (last 50)
    return posts.slice(0, 50);
  }, [socialPosts, filter]);
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving new social posts
      if (Math.random() > 0.8) { // 20% chance every 5 seconds
        const mockPost: SocialPost = {
          id: `post-${Date.now()}`,
          source: Math.random() > 0.5 ? 'twitter' : 'reddit',
          author: `@User${Math.floor(Math.random() * 1000)}`,
          authorType: 'retail',
          content: `New market insight about current events - ${Math.random() > 0.5 ? 'bullish' : 'bearish'} sentiment`,
          timestamp: new Date(),
          sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
          confidence: Math.floor(Math.random() * 40) + 60,
          isEventDetection: Math.random() > 0.8,
          influenceScore: Math.floor(Math.random() * 50) + 10,
          linkedSymbols: ['AAPL'] // Default to Apple for demo
        };
        
        addSocialPost(mockPost);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [addSocialPost]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };
  
  // Get sentiment counts for display
  const sentimentCounts = useMemo(() => {
    const counts = { bullish: 0, bearish: 0, neutral: 0 };
    filteredPosts.forEach(post => {
      counts[post.sentiment]++;
    });
    return counts;
  }, [filteredPosts]);

  return (
    <div className="flex flex-col h-full bg-terminal-panel">
      <div className="h-10 border-b border-terminal-border flex items-center justify-between px-3 bg-[oklch(0.12_0.01_250)]">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Social Feed</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          </Button>
          <div className="flex bg-terminal-bg border border-terminal-border rounded-md p-0.5">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "p-1 rounded transition-colors text-[10px] px-2",
                filter === "all" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300",
              )}
              title="All Opinions"
            >
              All
            </button>
            <button
              onClick={() => setFilter("bullish")}
              className={cn(
                "p-1 rounded transition-colors",
                filter === "bullish" ? "bg-green-950 text-green-400" : "text-slate-500 hover:text-green-400",
              )}
              title="Bulls Only"
            >
              <TrendingUp size={12} />
            </button>
            <button
              onClick={() => setFilter("bearish")}
              className={cn(
                "p-1 rounded transition-colors",
                filter === "bearish" ? "bg-red-950 text-red-400" : "text-slate-500 hover:text-red-400",
              )}
              title="Bears Only"
            >
              <TrendingDown size={12} />
            </button>
            <button
              onClick={() => setFilter("neutral")}
              className={cn(
                "p-1 rounded transition-colors",
                filter === "neutral" ? "bg-amber-950 text-amber-400" : "text-slate-500 hover:text-amber-400",
              )}
              title="Neutral Only"
            >
              <LayoutGrid size={12} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Sentiment Summary */}
      {sentimentAggregate && (
        <div className="border-b border-terminal-border bg-[oklch(0.11_0.01_250)] p-2">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 uppercase tracking-wider">Sentiment</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400">
                  Bull: {sentimentAggregate.bullishCount}
                </span>
                <span className="text-red-400">
                  Bear: {sentimentAggregate.bearishCount}
                </span>
                <span className="text-amber-400">
                  Neutral: {sentimentAggregate.neutralCount}
                </span>
              </div>
            </div>
            <div className="text-slate-400">
              Score: <span className={cn(
                "font-mono font-bold",
                sentimentAggregate.influenceWeightedScore > 0 ? "text-green-400" : 
                sentimentAggregate.influenceWeightedScore < 0 ? "text-red-400" : "text-amber-400"
              )}>
                {sentimentAggregate.influenceWeightedScore > 0 ? '+' : ''}{sentimentAggregate.influenceWeightedScore}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-[11px]">
            {filter === "all" ? "No social posts available" : `No ${filter} opinions found`}
          </div>
        ) : (
          filteredPosts.map((post) => {
            // Map social source to platform icon
            const platformKey = post.source === 'twitter' ? 'twitter' : 'reddit';
            const PlatformIcon = platformIcons[platformKey];
            
            return (
              <div
                key={post.id}
                className={cn(
                  "flex flex-col gap-1.5 bg-terminal-bg hover:bg-[oklch(0.14_0.01_250)] border rounded-lg p-3 cursor-pointer transition-all",
                  post.sentiment === "bullish"
                    ? "border-green-900/30 hover:border-green-600/50"
                    : post.sentiment === "bearish"
                    ? "border-red-900/30 hover:border-red-600/50"
                    : "border-amber-900/30 hover:border-amber-600/50",
                )}
              >
                <div className="flex items-center gap-2">
                  <PlatformIcon className={cn("size-3.5", platformColors[platformKey])} />
                  <span className={cn(
                    "text-[10px] font-bold", 
                    getAuthorTypeColor(post.authorType)
                  )}>
                    {post.author}
                  </span>
                  
                  {/* Author type badge */}
                  {post.authorType !== 'retail' && (
                    <span className={cn(
                      "text-[8px] uppercase font-bold px-1 rounded",
                      post.authorType === 'executive' ? "bg-yellow-950 text-yellow-400" :
                      post.authorType === 'employee' ? "bg-blue-950 text-blue-400" :
                      "bg-purple-950 text-purple-400"
                    )}>
                      {post.authorType}
                    </span>
                  )}
                  
                  {/* Event detection badge */}
                  {post.isEventDetection && (
                    <span className="text-[8px] uppercase font-bold px-1 rounded bg-orange-950 text-orange-400">
                      Event
                    </span>
                  )}
                  
                  {/* Sentiment badge */}
                  {filter === "all" && (
                    <span
                      className={cn(
                        "text-[8px] uppercase font-bold px-1 rounded",
                        post.sentiment === "bullish" ? "bg-green-950 text-green-400" : 
                        post.sentiment === "bearish" ? "bg-red-950 text-red-400" :
                        "bg-amber-950 text-amber-400",
                      )}
                    >
                      {post.sentiment}
                    </span>
                  )}
                  
                  <span className="text-[10px] text-slate-500 ml-auto">
                    {formatTimeAgo(new Date(post.timestamp))}
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-300 leading-tight">{post.content}</p>
                
                {/* Post metadata */}
                <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1">
                  <div className="flex items-center gap-2">
                    <span>Confidence: {Math.round(post.confidence)}%</span>
                    <span>Influence: {post.influenceScore}</span>
                  </div>
                  {post.linkedSymbols.length > 0 && (
                    <div className="flex items-center gap-1">
                      {post.linkedSymbols.map(symbol => (
                        <span key={symbol} className="text-blue-400 font-mono">
                          ${symbol}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}