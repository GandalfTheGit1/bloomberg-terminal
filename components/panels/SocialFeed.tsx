"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, LayoutGrid, Podcast, Youtube, Newspaper, Twitter, RefreshCw, Zap, AlertCircle } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { SocialPost, SentimentType, SocialSource } from "@/types/models"
import { Button } from "@/components/ui/button"
import { createN8NClient, N8NError } from "@/lib/n8nClient"

// Initialize n8n client
const n8nClient = createN8NClient(true); // Set to false in production

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
    setSocialPosts,
    setSentimentAggregate,
    getSelectedCompany,
    addEvent,
    addNotification,
    ui 
  } = useAppStore();
  
  const [filter, setFilter] = useState<"all" | "bullish" | "bearish" | "neutral">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessingTime, setLastProcessingTime] = useState<Date | null>(null);
  const [processedPostsCount, setProcessedPostsCount] = useState(0);
  
  const selectedCompany = getSelectedCompany();
  
  // Process social posts through n8n
  const processSocialPosts = useCallback(async (posts: SocialPost[]) => {
    if (!posts.length || !selectedCompany) return;
    
    setIsProcessing(true);
    
    try {
      // Send posts to n8n for sentiment analysis
      const analysisResult = await n8nClient.analyzeSocialSentiment({
        posts: posts.map(post => ({
          id: post.id,
          source: post.source,
          author: post.author,
          authorBio: '', // Could be enhanced with actual bio data
          content: post.content,
          timestamp: post.timestamp.toISOString(),
          followers: 0, // Could be enhanced with actual follower data
          likes: 0,
          retweets: 0,
          url: `https://${post.source}.com/post/${post.id}`
        })),
        symbol: selectedCompany.symbol || selectedCompany.id,
        analysisType: 'classification'
      });
      
      // Update posts with n8n classification results
      if (analysisResult.classifiedPosts) {
        const updatedPosts = analysisResult.classifiedPosts.map((classifiedPost: any) => {
          const originalPost = posts.find(p => p.id === classifiedPost.id);
          if (!originalPost) return null;
          
          return {
            ...originalPost,
            sentiment: classifiedPost.sentiment as SentimentType,
            confidence: Math.round(classifiedPost.sentimentConfidence * 100),
            authorType: classifiedPost.authorType || 'retail',
            isEventDetection: classifiedPost.isEventDetection || false,
            influenceScore: Math.round(classifiedPost.influenceScore || 10),
            // Add n8n processing metadata
            processedAt: new Date(),
            sentimentScores: classifiedPost.sentimentScores
          };
        }).filter(Boolean) as SocialPost[];
        
        setSocialPosts(updatedPosts);
        setProcessedPostsCount(updatedPosts.length);
      }
      
      // Update sentiment aggregate
      if (analysisResult.sentimentAggregate) {
        setSentimentAggregate({
          symbol: selectedCompany.symbol || selectedCompany.id,
          timeRange: {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            end: new Date()
          },
          bullishCount: analysisResult.sentimentAggregate.summary?.bullishCount || 0,
          bearishCount: analysisResult.sentimentAggregate.summary?.bearishCount || 0,
          neutralCount: analysisResult.sentimentAggregate.summary?.neutralCount || 0,
          uniqueAuthors: analysisResult.sentimentAggregate.summary?.uniqueAuthors || 0,
          influenceWeightedScore: analysisResult.sentimentAggregate.metrics?.influenceWeightedScore || 0,
          topPosts: analysisResult.sentimentAggregate.topPosts || []
        });
      }
      
      // Process potential events from social sentiment
      if (analysisResult.detectedEvents && analysisResult.detectedEvents.length > 0) {
        let eventsAdded = 0;
        
        for (const eventData of analysisResult.detectedEvents) {
          const event = {
            ...eventData,
            createdAt: new Date(eventData.createdAt),
            updatedAt: new Date(eventData.updatedAt),
            timingWindow: {
              start: new Date(eventData.timingWindow.start),
              end: new Date(eventData.timingWindow.end),
              expectedDate: new Date(eventData.timingWindow.expectedDate)
            },
            updateHistory: eventData.updateHistory || []
          };
          
          addEvent(event);
          eventsAdded++;
        }
        
        if (eventsAdded > 0) {
          addNotification({
            type: 'info',
            title: 'Social Events Detected',
            message: `Generated ${eventsAdded} events from social sentiment analysis`
          });
        }
      }
      
      // Show executive posts notification
      if (analysisResult.executivePosts && analysisResult.executivePosts.length > 0) {
        addNotification({
          type: 'warning',
          title: 'Executive Posts Detected',
          message: `Found ${analysisResult.executivePosts.length} posts from executives or employees`
        });
      }
      
      setLastProcessingTime(new Date());
      
    } catch (error) {
      console.error('Social sentiment processing error:', error);
      
      let errorMessage = 'Failed to process social sentiment data. Please try again.';
      
      if (error instanceof N8NError) {
        if (error.statusCode === 408) {
          errorMessage = 'Social processing timed out. Too many posts to analyze.';
        } else if (error.statusCode && error.statusCode >= 500) {
          errorMessage = 'Social sentiment service is temporarily unavailable.';
        }
      }
      
      addNotification({
        type: 'error',
        title: 'Processing Failed',
        message: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedCompany, setSocialPosts, setSentimentAggregate, addEvent, addNotification]);
  
  // Generate mock social posts and process them
  const generateAndProcessMockPosts = useCallback(async () => {
    if (!selectedCompany) return;
    
    // Generate mock posts
    const mockPosts: SocialPost[] = Array.from({ length: 10 }, (_, i) => ({
      id: `post-${Date.now()}-${i}`,
      source: Math.random() > 0.5 ? 'twitter' : 'reddit',
      author: `@User${Math.floor(Math.random() * 1000)}`,
      authorType: Math.random() > 0.9 ? 'executive' : Math.random() > 0.8 ? 'analyst' : 'retail',
      content: [
        `Bullish on ${selectedCompany.symbol || selectedCompany.name}! Strong fundamentals and great leadership.`,
        `Concerned about ${selectedCompany.symbol || selectedCompany.name} margins. Competition is heating up.`,
        `${selectedCompany.symbol || selectedCompany.name} earnings call was impressive. Revenue growth accelerating.`,
        `Market volatility affecting ${selectedCompany.symbol || selectedCompany.name}. Time to reassess position.`,
        `Breaking: ${selectedCompany.symbol || selectedCompany.name} announces new product launch next quarter.`,
        `${selectedCompany.symbol || selectedCompany.name} management guidance seems conservative. Upside potential.`,
        `Inventory buildup at ${selectedCompany.symbol || selectedCompany.name} could signal demand issues.`,
        `${selectedCompany.symbol || selectedCompany.name} partnership announcement could be game-changing.`
      ][Math.floor(Math.random() * 8)],
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
      sentiment: 'neutral', // Will be classified by n8n
      confidence: 50, // Will be updated by n8n
      isEventDetection: false, // Will be determined by n8n
      influenceScore: 10, // Will be calculated by n8n
      linkedSymbols: [selectedCompany.symbol || selectedCompany.id]
    }));
    
    // Process through n8n
    await processSocialPosts(mockPosts);
  }, [selectedCompany, processSocialPosts]);
  
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
  
  // Simulate real-time updates with n8n processing
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving new social posts and processing them
      if (Math.random() > 0.9 && selectedCompany && !isProcessing) { // 10% chance every 5 seconds
        generateAndProcessMockPosts();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [generateAndProcessMockPosts, selectedCompany, isProcessing]);
  
  const handleRefresh = async () => {
    if (!selectedCompany) {
      addNotification({
        type: 'warning',
        title: 'No Company Selected',
        message: 'Please select a company to refresh social data'
      });
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      // Generate and process new mock posts
      await generateAndProcessMockPosts();
      
      addNotification({
        type: 'success',
        title: 'Social Feed Refreshed',
        message: 'Latest social sentiment data processed'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh social data'
      });
    } finally {
      setIsRefreshing(false);
    }
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
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Social Feed</h3>
          {isProcessing && (
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[9px] text-muted-foreground">Processing...</span>
            </div>
          )}
          {processedPostsCount > 0 && !isProcessing && (
            <span className="text-[9px] text-green-400">
              {processedPostsCount} processed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastProcessingTime && (
            <span className="text-[8px] text-muted-foreground">
              Last: {lastProcessingTime.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isProcessing || !selectedCompany}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
          >
            <RefreshCw className={cn("h-3 w-3", (isRefreshing || isProcessing) && "animate-spin")} />
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
        {!selectedCompany ? (
          <div className="text-center py-10 text-slate-500 text-[11px] space-y-2">
            <AlertCircle className="h-8 w-8 mx-auto text-slate-600" />
            <p>No company selected</p>
            <p className="text-[10px]">Select a company to view social sentiment</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-[11px] space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-4 w-4" />
              <span>No social posts available</span>
            </div>
            <p className="text-[10px]">
              {filter === "all" ? "Click refresh to load social data" : `No ${filter} opinions found`}
            </p>
            {!isProcessing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-[10px] h-6 px-2 mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Load Social Data
              </Button>
            )}
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
                  
                  {/* N8N processed badge */}
                  {(post as any).processedAt && (
                    <span className="text-[8px] uppercase font-bold px-1 rounded bg-primary/20 text-primary">
                      AI
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