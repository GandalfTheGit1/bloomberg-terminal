"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, LayoutGrid, Podcast, Youtube, Newspaper, Twitter } from "lucide-react"

interface SocialPost {
  id: string
  platform: "twitter" | "reddit" | "podcast" | "youtube" | "news"
  username: string
  time: string
  content: string
  sentiment: "bull" | "bear"
  title?: string
}

const socialPosts: SocialPost[] = [
  {
    id: "1",
    platform: "twitter",
    username: "@StockGenius",
    time: "2h ago",
    sentiment: "bull",
    content:
      "Looks like $AAPL is gearing up for a big earnings beat! Supply chain data is looking strong. #Apple #Stocks",
  },
  {
    id: "2",
    platform: "youtube",
    username: "Finance Alpha",
    time: "3h ago",
    sentiment: "bull",
    title: "Why Apple Stock Will Hit $200 Before Year End",
    content: "Breaking down the technical analysis and fundamental catalysts that could drive AAPL to new highs.",
  },
  {
    id: "3",
    platform: "podcast",
    username: "The Market Edge",
    time: "4h ago",
    sentiment: "bull",
    title: "Tech Earnings Preview: Apple's Path to Growth",
    content: "Deep dive into Apple's Q3 earnings expectations with industry analysts predicting strong iPhone sales.",
  },
  {
    id: "4",
    platform: "news",
    username: "Bloomberg",
    time: "5h ago",
    sentiment: "bear",
    title: "Apple Faces Supply Chain Disruptions in Asia",
    content:
      "Typhoon warnings in Taiwan could impact semiconductor production, potentially affecting Apple's manufacturing timeline.",
  },
  {
    id: "5",
    platform: "reddit",
    username: "r/WallStreetBets",
    time: "5h ago",
    sentiment: "bull",
    content: "$AAPL earnings are next week, loading up on calls. Probability of beat is 85% - easy money. YOLO!",
  },
  {
    id: "6",
    platform: "twitter",
    username: "@BearishAlpha",
    time: "6h ago",
    sentiment: "bear",
    content: "Macro environment is shifting. Seeing significant distribution in big tech. Caution on $AAPL. #Bearish",
  },
]

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

export function SocialFeed() {
  const [filter, setFilter] = useState<"all" | "bull" | "bear">("all")

  const filteredPosts = socialPosts.filter((post) => (filter === "all" ? true : post.sentiment === filter))

  return (
    <div className="flex flex-col h-full bg-terminal-panel">
      <div className="h-10 border-b border-terminal-border flex items-center justify-between px-3 bg-[oklch(0.12_0.01_250)]">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Social Feed</h3>
        <div className="flex bg-terminal-bg border border-terminal-border rounded-md p-0.5">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "p-1 rounded transition-colors",
              filter === "all" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300",
            )}
            title="All Opinions"
          >
            <LayoutGrid size={12} />
          </button>
          <button
            onClick={() => setFilter("bull")}
            className={cn(
              "p-1 rounded transition-colors",
              filter === "bull" ? "bg-green-950 text-green-400" : "text-slate-500 hover:text-green-400",
            )}
            title="Bulls Only"
          >
            <TrendingUp size={12} />
          </button>
          <button
            onClick={() => setFilter("bear")}
            className={cn(
              "p-1 rounded transition-colors",
              filter === "bear" ? "bg-red-950 text-red-400" : "text-slate-500 hover:text-red-400",
            )}
            title="Bears Only"
          >
            <TrendingDown size={12} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredPosts.map((post) => {
          const PlatformIcon = platformIcons[post.platform]
          return (
            <div
              key={post.id}
              className={cn(
                "flex flex-col gap-1.5 bg-terminal-bg hover:bg-[oklch(0.14_0.01_250)] border rounded-lg p-3 cursor-pointer transition-all",
                post.sentiment === "bull"
                  ? "border-green-900/30 hover:border-green-600/50"
                  : "border-red-900/30 hover:border-red-600/50",
              )}
            >
              <div className="flex items-center gap-2">
                <PlatformIcon className={cn("size-3.5", platformColors[post.platform])} />
                <span className={cn("text-[10px] font-bold", platformColors[post.platform])}>{post.username}</span>
                {filter === "all" && (
                  <span
                    className={cn(
                      "text-[8px] uppercase font-bold px-1 rounded",
                      post.sentiment === "bull" ? "bg-green-950 text-green-400" : "bg-red-950 text-red-400",
                    )}
                  >
                    {post.sentiment}
                  </span>
                )}
                <span className="text-[10px] text-slate-500 ml-auto">{post.time}</span>
              </div>
              {post.title && <h4 className="text-xs font-semibold text-white leading-tight">{post.title}</h4>}
              <p className="text-[11px] text-slate-300 leading-tight">{post.content}</p>
            </div>
          )
        })}
        {filteredPosts.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-[11px]">No {filter}ish opinions found.</div>
        )}
      </div>
    </div>
  )
}