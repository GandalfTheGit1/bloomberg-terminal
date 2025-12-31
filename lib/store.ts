import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Event, 
  EventGraph, 
  FinancialMetrics, 
  SocialPost, 
  SentimentAggregate,
  Company, 
  Industry, 
  MacroEvent,
  ChatMessage,
  EventFilters,
  MacroEventFilters,
  PanelSizes,
  PricePoint,
  ChatContext
} from '../types/models';

// UI State interfaces
export interface UIState {
  selectedCompanyId: string | null;
  selectedEventId: string | null;
  selectedIndustryId: string | null;
  isLoading: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

// Main store state interface
export interface AppState {
  // Core data
  events: Event[];
  eventGraph: EventGraph | null;
  companies: Company[];
  industries: Industry[];
  macroEvents: MacroEvent[];
  financialMetrics: FinancialMetrics | null;
  socialPosts: SocialPost[];
  sentimentAggregate: SentimentAggregate | null;
  priceData: PricePoint[];
  chatMessages: ChatMessage[];
  
  // UI state
  ui: UIState;
  
  // Filters
  eventFilters: EventFilters;
  macroEventFilters: MacroEventFilters;
  
  // Panel sizes (persisted)
  panelSizes: PanelSizes;
  
  // Actions for events
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  removeEvent: (eventId: string) => void;
  
  // Actions for event graph
  setEventGraph: (graph: EventGraph) => void;
  updateEventGraph: (updates: Partial<EventGraph>) => void;
  
  // Actions for companies and industries
  setCompanies: (companies: Company[]) => void;
  setIndustries: (industries: Industry[]) => void;
  setSelectedCompany: (companyId: string | null) => void;
  setSelectedIndustry: (industryId: string | null) => void;
  
  // Actions for macro events
  setMacroEvents: (events: MacroEvent[]) => void;
  addMacroEvent: (event: MacroEvent) => void;
  
  // Actions for financial metrics
  setFinancialMetrics: (metrics: FinancialMetrics) => void;
  updateFinancialMetrics: (updates: Partial<FinancialMetrics>) => void;
  
  // Actions for social data
  setSocialPosts: (posts: SocialPost[]) => void;
  addSocialPost: (post: SocialPost) => void;
  setSentimentAggregate: (sentiment: SentimentAggregate) => void;
  
  // Actions for price data
  setPriceData: (data: PricePoint[]) => void;
  addPricePoint: (point: PricePoint) => void;
  
  // Actions for chat
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  
  // Actions for UI state
  setSelectedEvent: (eventId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Actions for filters
  setEventFilters: (filters: EventFilters) => void;
  updateEventFilters: (updates: Partial<EventFilters>) => void;
  setMacroEventFilters: (filters: MacroEventFilters) => void;
  updateMacroEventFilters: (updates: Partial<MacroEventFilters>) => void;
  
  // Actions for panel sizes
  setPanelSizes: (sizes: PanelSizes) => void;
  updatePanelSize: (panel: keyof PanelSizes, size: Partial<PanelSizes[keyof PanelSizes]>) => void;
  resetPanelSizes: () => void;
  
  // Computed getters
  getSelectedCompany: () => Company | null;
  getSelectedEvent: () => Event | null;
  getSelectedIndustry: () => Industry | null;
  getFilteredEvents: () => Event[];
  getFilteredMacroEvents: () => MacroEvent[];
  getChatContext: () => ChatContext | null;
  getPriorityScore: (event: Event) => number;
}

// Default panel sizes
const DEFAULT_PANEL_SIZES: PanelSizes = {
  centralPanel: { width: 60, height: 50 },
  leftPanel: { width: 20 },
  rightPanel: { width: 20 },
  financialAnalysisPanel: { height: 25 },
  industryPanel: { height: 15 }
};

// Default UI state
const DEFAULT_UI_STATE: UIState = {
  selectedCompanyId: null,
  selectedEventId: null,
  selectedIndustryId: null,
  isLoading: false,
  connectionStatus: 'disconnected',
  notifications: []
};

// Create the store with persistence for panel sizes
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      events: [],
      eventGraph: null,
      companies: [],
      industries: [],
      macroEvents: [],
      financialMetrics: null,
      socialPosts: [],
      sentimentAggregate: null,
      priceData: [],
      chatMessages: [],
      ui: DEFAULT_UI_STATE,
      eventFilters: {},
      macroEventFilters: {},
      panelSizes: DEFAULT_PANEL_SIZES,
      
      // Event actions
      setEvents: (events) => set({ events }),
      addEvent: (event) => set((state) => ({ 
        events: [...state.events, event] 
      })),
      updateEvent: (eventId, updates) => set((state) => ({
        events: state.events.map(event => 
          event.id === eventId ? { ...event, ...updates } : event
        )
      })),
      removeEvent: (eventId) => set((state) => ({
        events: state.events.filter(event => event.id !== eventId)
      })),
      
      // Event graph actions
      setEventGraph: (graph) => set({ eventGraph: graph }),
      updateEventGraph: (updates) => set((state) => ({
        eventGraph: state.eventGraph ? { ...state.eventGraph, ...updates } : null
      })),
      
      // Company and industry actions
      setCompanies: (companies) => set({ companies }),
      setIndustries: (industries) => set({ industries }),
      setSelectedCompany: (companyId) => set((state) => ({
        ui: { ...state.ui, selectedCompanyId: companyId }
      })),
      setSelectedIndustry: (industryId) => set((state) => ({
        ui: { ...state.ui, selectedIndustryId: industryId }
      })),
      
      // Macro event actions
      setMacroEvents: (events) => set({ macroEvents: events }),
      addMacroEvent: (event) => set((state) => ({
        macroEvents: [...state.macroEvents, event]
      })),
      
      // Financial metrics actions
      setFinancialMetrics: (metrics) => set({ financialMetrics: metrics }),
      updateFinancialMetrics: (updates) => set((state) => ({
        financialMetrics: state.financialMetrics ? 
          { ...state.financialMetrics, ...updates } : null
      })),
      
      // Social data actions
      setSocialPosts: (posts) => set({ socialPosts: posts }),
      addSocialPost: (post) => set((state) => ({
        socialPosts: [...state.socialPosts, post]
      })),
      setSentimentAggregate: (sentiment) => set({ sentimentAggregate: sentiment }),
      
      // Price data actions
      setPriceData: (data) => set({ priceData: data }),
      addPricePoint: (point) => set((state) => ({
        priceData: [...state.priceData, point]
      })),
      
      // Chat actions
      setChatMessages: (messages) => set({ chatMessages: messages }),
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, message]
      })),
      clearChatMessages: () => set({ chatMessages: [] }),
      
      // UI state actions
      setSelectedEvent: (eventId) => set((state) => ({
        ui: { ...state.ui, selectedEventId: eventId }
      })),
      setLoading: (loading) => set((state) => ({
        ui: { ...state.ui, isLoading: loading }
      })),
      setConnectionStatus: (status) => set((state) => ({
        ui: { ...state.ui, connectionStatus: status }
      })),
      addNotification: (notification) => set((state) => ({
        ui: {
          ...state.ui,
          notifications: [
            ...state.ui.notifications,
            {
              ...notification,
              id: `notification-${Date.now()}-${Math.random()}`,
              timestamp: new Date(),
              isRead: false
            }
          ]
        }
      })),
      markNotificationRead: (notificationId) => set((state) => ({
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.map(notification =>
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        }
      })),
      clearNotifications: () => set((state) => ({
        ui: { ...state.ui, notifications: [] }
      })),
      
      // Filter actions
      setEventFilters: (filters) => set({ eventFilters: filters }),
      updateEventFilters: (updates) => set((state) => ({
        eventFilters: { ...state.eventFilters, ...updates }
      })),
      setMacroEventFilters: (filters) => set({ macroEventFilters: filters }),
      updateMacroEventFilters: (updates) => set((state) => ({
        macroEventFilters: { ...state.macroEventFilters, ...updates }
      })),
      
      // Panel size actions
      setPanelSizes: (sizes) => set({ panelSizes: sizes }),
      updatePanelSize: (panel, size) => set((state) => ({
        panelSizes: {
          ...state.panelSizes,
          [panel]: { ...state.panelSizes[panel], ...size }
        }
      })),
      resetPanelSizes: () => set({ panelSizes: DEFAULT_PANEL_SIZES }),
      
      // Computed getters
      getSelectedCompany: () => {
        const state = get();
        return state.companies.find(c => c.id === state.ui.selectedCompanyId) || null;
      },
      
      getSelectedEvent: () => {
        const state = get();
        return state.events.find(e => e.id === state.ui.selectedEventId) || null;
      },
      
      getSelectedIndustry: () => {
        const state = get();
        return state.industries.find(i => i.id === state.ui.selectedIndustryId) || null;
      },
      
      getFilteredEvents: () => {
        const state = get();
        const { events, eventFilters } = state;
        
        return events.filter(event => {
          // Filter by time horizon
          if (eventFilters.timeHorizon) {
            const eventDate = new Date(event.timingWindow.expectedDate);
            if (eventDate < eventFilters.timeHorizon.start || 
                eventDate > eventFilters.timeHorizon.end) {
              return false;
            }
          }
          
          // Filter by event types
          if (eventFilters.eventTypes && eventFilters.eventTypes.length > 0) {
            if (!eventFilters.eventTypes.includes(event.type)) {
              return false;
            }
          }
          
          // Filter by signal dominance (simplified - based on source reliability)
          if (eventFilters.signalDominance && eventFilters.signalDominance.length > 0) {
            const avgReliability = event.sources.reduce((sum, source) => 
              sum + source.reliability, 0) / event.sources.length;
            
            const isHardData = avgReliability > 0.7;
            const isSoftData = avgReliability <= 0.7;
            
            if (eventFilters.signalDominance.includes('hard') && !isHardData) {
              return false;
            }
            if (eventFilters.signalDominance.includes('soft') && !isSoftData) {
              return false;
            }
          }
          
          return true;
        });
      },
      
      getFilteredMacroEvents: () => {
        const state = get();
        const { macroEvents, macroEventFilters } = state;
        
        return macroEvents.filter(event => {
          // Filter by categories
          if (macroEventFilters.categories && macroEventFilters.categories.length > 0) {
            if (!macroEventFilters.categories.includes(event.category)) {
              return false;
            }
          }
          
          return true;
        });
      },
      
      getChatContext: () => {
        const state = get();
        const selectedCompany = state.getSelectedCompany();
        const selectedEvent = state.getSelectedEvent();
        
        if (!selectedCompany || !state.financialMetrics || !state.eventGraph) {
          return null;
        }
        
        return {
          companyId: selectedCompany.id,
          selectedEvent: selectedEvent || undefined,
          recentEvents: state.events
            .filter(e => e.type === 'company')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10),
          financialMetrics: state.financialMetrics,
          eventGraph: state.eventGraph
        };
      },
      
      getPriorityScore: (event: Event) => {
        // Calculate priority score: probability × impact × temporal proximity
        const now = new Date();
        const eventDate = new Date(event.timingWindow.expectedDate);
        const daysUntilEvent = Math.max(1, (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Temporal proximity factor (closer events get higher score)
        const temporalFactor = Math.max(0.1, 1 / Math.log(daysUntilEvent + 1));
        
        // Impact magnitude (use the highest impact across all categories)
        const impacts = Object.values(event.impact).filter(Boolean);
        const maxImpact = impacts.length > 0 
          ? Math.max(...impacts.map(i => Math.abs(i.magnitude))) 
          : 0;
        
        return (event.probability / 100) * maxImpact * temporalFactor;
      }
    }),
    {
      name: 'ai-financial-terminal-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist panel sizes and selected company/industry
      partialize: (state) => ({
        panelSizes: state.panelSizes,
        ui: {
          selectedCompanyId: state.ui.selectedCompanyId,
          selectedIndustryId: state.ui.selectedIndustryId
        }
      })
    }
  )
);

// Selector hooks for better performance
export const useEvents = () => useAppStore((state) => state.events);
export const useSelectedCompany = () => useAppStore((state) => state.getSelectedCompany());
export const useSelectedEvent = () => useAppStore((state) => state.getSelectedEvent());
export const useFilteredEvents = () => useAppStore((state) => state.getFilteredEvents());
export const usePanelSizes = () => useAppStore((state) => state.panelSizes);
export const useUIState = () => useAppStore((state) => state.ui);
export const useChatContext = () => useAppStore((state) => state.getChatContext());