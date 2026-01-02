"use client"

import { Send, Sparkles, TrendingUp, TrendingDown, BarChart3, Zap } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { createN8NClient, N8NError } from "@/lib/n8nClient"
import { ChatMessage, QuickAction } from "@/types/models"
import { Button } from "@/components/ui/button"

// Initialize n8n client (using mock in development)
const n8nClient = createN8NClient(true); // Set to false in production

export function ChatPanel() {
  const { 
    chatMessages, 
    addChatMessage, 
    setChatMessages,
    getChatContext,
    getSelectedEvent,
    ui,
    addNotification
  } = useAppStore();
  
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatContext = getChatContext();
  const selectedEvent = getSelectedEvent();
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  // Initialize with welcome message if no messages exist
  useEffect(() => {
    if (chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Welcome to AI Financial Terminal. I'm your AI-powered financial assistant, designed to help you navigate complex market predictions with precision.

Our platform uses advanced causal inference models to forecast market events, analyze portfolio risk, and surface actionable insights from real-time data streams. Ask me anything about your investments, market trends, or the probability models driving our forecasts.

How can I assist you today?`,
        timestamp: new Date(),
        isUser: false
      };
      
      addChatMessage(welcomeMessage);
    }
  }, [chatMessages.length, addChatMessage]);
  
  // Generate default company summary when context changes
  useEffect(() => {
    if (chatContext && chatMessages.length === 1) {
      handleQuickAction('summarize');
    }
  }, [chatContext]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Enhanced context injection for n8n
  const buildEnhancedContext = () => {
    if (!chatContext) return null;
    
    return {
      ...chatContext,
      // Add current UI state for better context
      selectedEventId: selectedEvent?.id,
      currentTimestamp: new Date().toISOString(),
      // Add recent financial metrics if available
      recentMetrics: chatContext.financialMetrics ? {
        ...chatContext.financialMetrics,
        lastUpdated: new Date().toISOString()
      } : undefined,
      // Add event graph summary
      eventGraphSummary: chatContext.eventGraph ? {
        nodeCount: chatContext.eventGraph.nodes.length,
        edgeCount: chatContext.eventGraph.edges.length,
        highProbabilityEvents: chatContext.eventGraph.nodes
          .filter(event => event.probability > 70)
          .map(event => ({ id: event.id, title: event.title, probability: event.probability }))
      } : undefined
    };
  };
  
  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: message.trim(),
      timestamp: new Date(),
      isUser: true
    };
    
    addChatMessage(userMessage);
    setMessage("");
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      const enhancedContext = buildEnhancedContext();
      if (!enhancedContext) {
        throw new Error('No company context available. Please select a company first.');
      }
      
      // Add more detailed conversation history for better context
      const conversationHistory = chatMessages.slice(-10).map(msg => ({
        ...msg,
        // Add metadata for better AI understanding
        metadata: {
          hasLinkedEvents: msg.linkedEvents && msg.linkedEvents.length > 0,
          eventCount: msg.linkedEvents?.length || 0,
          messageLength: msg.content.length
        }
      }));
      
      const response = await n8nClient.sendChatMessage({
        message: userMessage.content,
        context: enhancedContext,
        conversationHistory,
        requestType: 'question'
      });
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: response.response,
        timestamp: new Date(),
        isUser: false,
        linkedEvents: response.linkedEvents,
        // Add response metadata
        metadata: {
          confidence: response.confidence,
          sources: response.sources,
          suggestedActions: response.suggestedActions
        }
      };
      
      addChatMessage(aiMessage);
      
      // Show notification for high-confidence responses with linked events
      if (response.confidence && response.confidence > 85 && response.linkedEvents?.length > 0) {
        addNotification({
          type: 'info',
          title: 'High Confidence Response',
          message: `AI identified ${response.linkedEvents.length} related events with ${Math.round(response.confidence)}% confidence`
        });
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = 'I apologize, but I encountered an error processing your request. Please try again.';
      
      if (error instanceof N8NError) {
        if (error.statusCode === 408) {
          errorMessage = 'The request timed out. Please try again with a simpler question.';
        } else if (error.statusCode && error.statusCode >= 500) {
          errorMessage = 'The AI service is temporarily unavailable. Please try again in a moment.';
        }
      }
      
      const errorChatMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: errorMessage,
        timestamp: new Date(),
        isUser: false
      };
      
      addChatMessage(errorChatMessage);
      
      addNotification({
        type: 'error',
        title: 'Chat Error',
        message: 'Failed to get AI response'
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };
  
  const handleQuickAction = async (action: QuickAction) => {
    if (isLoading) return;
    
    const enhancedContext = buildEnhancedContext();
    if (!enhancedContext) {
      addNotification({
        type: 'warning',
        title: 'No Context',
        message: 'Please select a company first'
      });
      return;
    }
    
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      let response;
      let actionMessage = '';
      
      switch (action) {
        case 'summarize':
          response = await n8nClient.generateSummary(enhancedContext);
          actionMessage = 'Generate company summary';
          break;
        case 'scenario_plus':
          response = await n8nClient.generateScenario('custom', enhancedContext);
          actionMessage = 'Generate scenario analysis';
          break;
        case 'bear_case':
          response = await n8nClient.generateScenario('bear', enhancedContext);
          actionMessage = 'Generate bear case scenario';
          break;
        case 'bull_case':
          response = await n8nClient.generateScenario('bull', enhancedContext);
          actionMessage = 'Generate bull case scenario';
          break;
      }
      
      // Add user action message
      const userMessage: ChatMessage = {
        id: `action-${Date.now()}`,
        content: actionMessage,
        timestamp: new Date(),
        isUser: true
      };
      addChatMessage(userMessage);
      
      // Add AI response with enhanced metadata
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: response.response,
        timestamp: new Date(),
        isUser: false,
        linkedEvents: response.linkedEvents,
        metadata: {
          actionType: action,
          confidence: response.confidence,
          sources: response.sources,
          suggestedActions: response.suggestedActions
        }
      };
      addChatMessage(aiMessage);
      
    } catch (error) {
      console.error('Quick action error:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'I encountered an error processing that request. Please try again.',
        timestamp: new Date(),
        isUser: false
      };
      addChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };
  
  const formatMessageContent = (content: string, linkedEvents?: string[]) => {
    // Simple event linking - in production, this would be more sophisticated
    let formattedContent = content;
    
    if (linkedEvents && linkedEvents.length > 0) {
      linkedEvents.forEach(eventId => {
        const eventPattern = new RegExp(`\\b${eventId}\\b`, 'gi');
        formattedContent = formattedContent.replace(
          eventPattern, 
          `<span class="text-primary cursor-pointer hover:underline" data-event-id="${eventId}">${eventId}</span>`
        );
      });
    }
    
    return formattedContent;
  };
  
  const handleEventLinkClick = (eventId: string) => {
    // Navigate to or highlight the event in the graph
    const { setSelectedEvent } = useAppStore.getState();
    
    // Find the event in the current context
    const event = chatContext?.eventGraph?.nodes.find(e => e.id === eventId);
    
    if (event) {
      // Select the event in the store
      setSelectedEvent(event.id);
      
      // Add notification
      addNotification({
        type: 'info',
        title: 'Event Selected',
        message: `Navigated to event: ${event.title}`
      });
      
      console.log('Navigated to event:', eventId, event);
    } else {
      console.warn('Event not found:', eventId);
      addNotification({
        type: 'warning',
        title: 'Event Not Found',
        message: `Could not locate event: ${eventId}`
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-terminal-panel">
      <div className="h-10 border-b border-terminal-border flex items-center justify-between px-3 bg-[oklch(0.12_0.01_250)] shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Terminal Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(
            "size-1.5 rounded-full",
            ui.connectionStatus === 'connected' ? "bg-bullish animate-pulse" :
            ui.connectionStatus === 'reconnecting' ? "bg-neutral animate-pulse" :
            "bg-bearish"
          )} />
          <span className="text-[10px] text-slate-500 capitalize">
            {ui.connectionStatus}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b border-terminal-border bg-[oklch(0.11_0.01_250)] p-2">
        <div className="flex gap-1 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickAction('summarize')}
            disabled={isLoading || !chatContext}
            className="h-6 px-2 text-[10px] text-slate-400 hover:text-white"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Summarize
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickAction('scenario_plus')}
            disabled={isLoading || !chatContext}
            className="h-6 px-2 text-[10px] text-slate-400 hover:text-white"
          >
            <Zap className="h-3 w-3 mr-1" />
            Scenario+
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickAction('bear_case')}
            disabled={isLoading || !chatContext}
            className="h-6 px-2 text-[10px] text-bearish hover:text-red-300"
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            Bear Case
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickAction('bull_case')}
            disabled={isLoading || !chatContext}
            className="h-6 px-2 text-[10px] text-bullish hover:text-green-300"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Bull Case
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex flex-col gap-1.5 w-full", msg.isUser ? "items-end" : "items-start")}
          >
            <div className="flex items-center gap-2">
              {!msg.isUser && (
                <div className="size-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="size-3 text-primary" />
                </div>
              )}
              <span className="text-[10px] text-slate-500">
                {msg.isUser ? "You" : "AI Assistant"}
              </span>
              <span className="text-[9px] text-slate-600">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div
              className={cn(
                "w-full rounded-lg px-4 py-3 text-sm leading-relaxed",
                msg.isUser
                  ? "bg-primary/10 border border-primary/20 text-white"
                  : "bg-terminal-bg text-slate-300",
              )}
            >
              {msg.content.split("\n").map((line, i) => (
                <p 
                  key={i} 
                  className={i > 0 ? "mt-2" : ""}
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessageContent(line, msg.linkedEvents) 
                  }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    const eventId = target.getAttribute('data-event-id');
                    if (eventId) {
                      handleEventLinkClick(eventId);
                    }
                  }}
                />
              ))}
              
              {/* Show linked events and metadata */}
              {(msg.linkedEvents && msg.linkedEvents.length > 0) || msg.metadata && (
                <div className="mt-3 pt-2 border-t border-slate-700/50 space-y-2">
                  {/* Linked Events */}
                  {msg.linkedEvents && msg.linkedEvents.length > 0 && (
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1">Related Events:</div>
                      <div className="flex flex-wrap gap-1">
                        {msg.linkedEvents.map(eventId => (
                          <span
                            key={eventId}
                            onClick={() => handleEventLinkClick(eventId)}
                            className="text-[9px] px-2 py-1 bg-primary/20 text-primary rounded cursor-pointer hover:bg-primary/30 transition-colors"
                          >
                            {eventId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* AI Response Metadata */}
                  {msg.metadata && !msg.isUser && (
                    <div className="space-y-1">
                      {msg.metadata.confidence && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Confidence:</span>
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${msg.metadata.confidence}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-400">
                              {Math.round(msg.metadata.confidence)}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {msg.metadata.sources && msg.metadata.sources.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-500">Sources: </span>
                          <span className="text-[9px] text-slate-400">
                            {msg.metadata.sources.join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {msg.metadata.actionType && (
                        <div>
                          <span className="text-[10px] text-slate-500">Action: </span>
                          <span className="text-[9px] text-primary capitalize">
                            {msg.metadata.actionType.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="size-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="size-3 text-primary" />
            </div>
            <div className="bg-terminal-bg rounded-lg px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="size-1 bg-slate-400 rounded-full animate-bounce" />
                <div className="size-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="size-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-terminal-border bg-terminal-bg/50 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading || !chatContext}
            placeholder={
              !chatContext 
                ? "Select a company to start chatting..." 
                : "Ask about markets, forecasts, or portfolio insights..."
            }
            className="flex-1 bg-terminal-panel border border-terminal-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !message.trim() || !chatContext}
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg px-3 py-2 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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