"use client"

import { useState, useMemo } from "react"
import { TrendingUp, TrendingDown, Building2, Users, DollarSign, Target } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { Company } from "@/types/models"

interface CompetitorData extends Company {
  change: number;
  isPrivate?: boolean;
}

interface IndustryMetrics {
  revenue: string;
  growth: string;
  marketShare: string;
  valuation: string;
  customerBase: string;
  brandValue: string;
  adSpend: string;
  socialReach: string;
}

// Mock industry metrics data - in production this would come from the store or API
const industryMetricsData: Record<string, IndustryMetrics> = {
  technology: {
    revenue: "$550B",
    growth: "+12.5% YoY",
    marketShare: "28% Global",
    valuation: "$2.1T",
    customerBase: "450K+ Enterprise",
    brandValue: "$180B",
    adSpend: "$8.2B/yr",
    socialReach: "125M followers"
  },
  automotive: {
    revenue: "$2.8T",
    growth: "+8.7% YoY",
    marketShare: "15% EV Market",
    valuation: "$1.2T",
    customerBase: "95M+ Customers",
    brandValue: "$420B",
    adSpend: "$45B/yr",
    socialReach: "320M followers"
  },
  financial: {
    revenue: "$1.2T",
    growth: "+6.3% YoY",
    marketShare: "22% Global",
    valuation: "$850B",
    customerBase: "2.5B+ Customers",
    brandValue: "$320B",
    adSpend: "$25B/yr",
    socialReach: "200M followers"
  }
};

// Mock competitor data - in production this would be dynamic
const mockCompetitorData: Record<string, CompetitorData[]> = {
  technology: [
    { id: 'MSFT', name: 'Microsoft Corporation', symbol: 'MSFT', industry: 'technology', marketCap: 2800000000000, change: 0.5 },
    { id: 'GOOGL', name: 'Alphabet Inc.', symbol: 'GOOGL', industry: 'technology', marketCap: 1700000000000, change: 0.3 },
    { id: 'META', name: 'Meta Platforms Inc.', symbol: 'META', industry: 'technology', marketCap: 800000000000, change: -0.8 },
    { id: 'AMZN', name: 'Amazon.com Inc.', symbol: 'AMZN', industry: 'technology', marketCap: 1500000000000, change: 0.9 }
  ],
  automotive: [
    { id: 'F', name: 'Ford Motor Company', symbol: 'F', industry: 'automotive', marketCap: 50000000000, change: 0.6 },
    { id: 'GM', name: 'General Motors Company', symbol: 'GM', industry: 'automotive', marketCap: 60000000000, change: 1.1 },
    { id: 'TM', name: 'Toyota Motor Corporation', symbol: 'TM', industry: 'automotive', marketCap: 250000000000, change: 0.8 },
    { id: 'RIVN', name: 'Rivian Automotive Inc.', symbol: 'RIVN', industry: 'automotive', marketCap: 15000000000, change: -3.5 }
  ],
  financial: [
    { id: 'BAC', name: 'Bank of America Corporation', symbol: 'BAC', industry: 'financial', marketCap: 300000000000, change: 0.4 },
    { id: 'WFC', name: 'Wells Fargo & Company', symbol: 'WFC', industry: 'financial', marketCap: 200000000000, change: -0.2 },
    { id: 'GS', name: 'Goldman Sachs Group Inc.', symbol: 'GS', industry: 'financial', marketCap: 120000000000, change: 1.3 },
    { id: 'MS', name: 'Morgan Stanley', symbol: 'MS', industry: 'financial', marketCap: 150000000000, change: 0.7 }
  ]
};

export function IndustryLookback() {
  const { 
    industries, 
    companies,
    getSelectedCompany,
    getSelectedIndustry,
    setSelectedIndustry
  } = useAppStore();
  
  const selectedCompany = getSelectedCompany();
  const selectedIndustry = getSelectedIndustry();
  
  // Default to the selected company's industry or first available industry
  const currentIndustryId = selectedIndustry?.id || selectedCompany?.industry || industries[0]?.id || 'technology';
  const currentIndustry = industries.find(i => i.id === currentIndustryId) || industries[0];
  
  // Get industry metrics
  const industryMetrics = industryMetricsData[currentIndustryId] || industryMetricsData.technology;
  
  // Get competitors and clients for the current industry
  const { competitors, clients } = useMemo(() => {
    const industryCompanies = companies.filter(c => c.industry === currentIndustryId);
    const mockCompetitors = mockCompetitorData[currentIndustryId] || [];
    
    // Separate current company from competitors
    const competitors = mockCompetitors.filter(c => c.id !== selectedCompany?.id);
    
    // For clients, we'll use a subset of companies from other industries
    // In production, this would be based on actual business relationships
    const otherIndustryCompanies = companies.filter(c => c.industry !== currentIndustryId);
    const clients = otherIndustryCompanies.slice(0, 4).map(company => ({
      ...company,
      change: (Math.random() - 0.5) * 6 // Random change for demo
    }));
    
    return { competitors, clients };
  }, [companies, currentIndustryId, selectedCompany]);
  
  const handleIndustryChange = (industryId: string) => {
    setSelectedIndustry(industryId);
  };
  
  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap}`;
  };

  return (
    <div className="border-t border-terminal-border bg-terminal-panel/95 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-2 border-b border-terminal-border/50">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Industry Look-Back</h3>
        <div className="flex gap-1">
          {industries.map((industry) => (
            <button
              key={industry.id}
              onClick={() => handleIndustryChange(industry.id)}
              className={`px-3 py-1 text-[10px] font-medium rounded transition-colors ${
                currentIndustryId === industry.id
                  ? "text-white bg-slate-700 border border-terminal-border"
                  : "text-slate-500 hover:text-white hover:bg-slate-800"
              }`}
            >
              {industry.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Competitors Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="size-3.5 text-bearish" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Competitors</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {competitors.length > 0 ? competitors.map((entity) => (
              <div
                key={entity.id}
                className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50 hover:bg-terminal-bg transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-white">{entity.name.split(' ')[0]}</span>
                    {entity.isPrivate ? (
                      <span className="text-[9px] text-purple-400 font-mono">Private</span>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-mono">{entity.symbol}</span>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-0.5 text-[9px] font-mono ${
                      entity.change >= 0 ? "text-bullish" : "text-bearish"
                    }`}
                  >
                    {entity.change >= 0 ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
                    <span>
                      {entity.change >= 0 ? "+" : ""}
                      {entity.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-300">
                  {formatMarketCap(entity.marketCap)}
                </span>
              </div>
            )) : (
              <div className="col-span-4 text-center text-slate-500 text-xs py-4">
                No competitor data available
              </div>
            )}
          </div>
        </div>

        {/* Clients Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="size-3.5 text-bullish" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Key Partners</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {clients.length > 0 ? clients.map((entity) => (
              <div
                key={entity.id}
                className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50 hover:bg-terminal-bg transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-white">{entity.name.split(' ')[0]}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{entity.symbol}</span>
                  </div>
                  <div
                    className={`flex items-center gap-0.5 text-[9px] font-mono ${
                      entity.change >= 0 ? "text-bullish" : "text-bearish"
                    }`}
                  >
                    {entity.change >= 0 ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
                    <span>
                      {entity.change >= 0 ? "+" : ""}
                      {entity.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-300">
                  {formatMarketCap(entity.marketCap)}
                </span>
              </div>
            )) : (
              <div className="col-span-4 text-center text-slate-500 text-xs py-4">
                No partner data available
              </div>
            )}
          </div>
        </div>

        {/* Financial Overview */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="size-3.5 text-blue-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Financial Overview
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Revenue</span>
              <span className="text-sm font-mono text-white font-semibold">{industryMetrics.revenue}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Growth</span>
              <span className="text-sm font-mono text-bullish font-semibold">{industryMetrics.growth}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Market Share</span>
              <span className="text-sm font-mono text-white font-semibold">{industryMetrics.marketShare}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Valuation</span>
              <span className="text-sm font-mono text-white font-semibold">{industryMetrics.valuation}</span>
            </div>
          </div>
        </div>

        {/* Marketing Insights */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="size-3.5 text-purple-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Marketing Insights
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Customer Base</span>
              <span className="text-sm font-mono text-white font-semibold">
                {industryMetrics.customerBase}
              </span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Brand Value</span>
              <span className="text-sm font-mono text-white font-semibold">{industryMetrics.brandValue}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Ad Spend</span>
              <span className="text-sm font-mono text-white font-semibold">{industryMetrics.adSpend}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Social Reach</span>
              <span className="text-sm font-mono text-white font-semibold">{industryMetrics.socialReach}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}