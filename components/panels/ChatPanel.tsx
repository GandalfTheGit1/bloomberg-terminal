"use client"

import { Send, Sparkles } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatPanel() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to AI Financial Terminal. I'm your AI-powered financial assistant, designed to help you navigate complex market predictions with precision.\n\nOur platform uses advanced causal inference models to forecast market events, analyze portfolio risk, and surface actionable insights from real-time data streams. Ask me anything about your investments, market trends, or the probability models driving our forecasts.\n\nHow can I assist you today?",
      timestamp: new Date(),
    },
  ])

  const handleSend = () => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm analyzing your query using our causal models. This is a demo response. In production, I would provide detailed insights based on real-time market data and probabilistic forecasting.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  return (
    <div className="h-full flex flex-col bg-terminal-panel">
      <div className="h-10 border-b border-terminal-border flex items-center justify-between px-3 bg-[oklch(0.12_0.01_250)] shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Terminal Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-1.5 rounded-full bg-bullish animate-pulse" />
          <span className="text-[10px] text-slate-500">Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex flex-col gap-1.5 w-full", msg.role === "user" ? "items-end" : "items-start")}
          >
            <div className="flex items-center gap-2">
              {msg.role === "assistant" && (
                <div className="size-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="size-3 text-primary" />
                </div>
              )}
              <span className="text-[10px] text-slate-500">{msg.role === "assistant" ? "AI Assistant" : "You"}</span>
            </div>
            <div
              className={cn(
                "w-full rounded-lg px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary/10 border border-primary/20 text-white"
                  : "bg-terminal-bg text-slate-300",
              )}
            >
              {msg.content.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-2" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-terminal-border bg-terminal-bg/50 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about markets, forecasts, or portfolio insights..."
            className="flex-1 bg-terminal-panel border border-terminal-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
          <button
            onClick={handleSend}
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg px-3 py-2 transition-colors flex items-center gap-2"
          >
            <Send className="size-4" />
            <span className="text-xs font-medium">Send</span>
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-2 px-1">
          Powered by causal inference models and real-time market data
        </p>
      </div>
    </div>
  )
}