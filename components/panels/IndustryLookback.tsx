"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Building2, Users, DollarSign, Target } from "lucide-react"

type EntityType = "competitor" | "client"

interface Entity {
  name: string
  ticker?: string
  price: number
  change: number
  type: EntityType
  isPrivate?: boolean
}

interface FinancialData {
  revenue: string
  growth: string
  marketShare: string
  valuation: string
}

interface MarketingData {
  customerBase: string
  brandValue: string
  adSpend: string
  socialReach: string
}

interface Product {
  id: string
  name: string
  entities: Entity[]
  financial: FinancialData
  marketing: MarketingData
}

const industryData: Product[] = [
  {
    id: "semiconductors",
    name: "Semiconductors",
    financial: {
      revenue: "$550B",
      growth: "+12.5% YoY",
      marketShare: "28% Global",
      valuation: "$2.1T",
    },
    marketing: {
      customerBase: "450K+ Enterprise",
      brandValue: "$180B",
      adSpend: "$8.2B/yr",
      socialReach: "125M followers",
    },
    entities: [
      { name: "AMD", ticker: "AMD", price: 142.35, change: 2.4, type: "competitor" },
      { name: "Intel", ticker: "INTC", price: 45.23, change: -1.2, type: "competitor" },
      { name: "Qualcomm", ticker: "QCOM", price: 189.45, change: 0.8, type: "competitor" },
      { name: "Samsung Foundry", isPrivate: true, price: 0, change: 3.2, type: "competitor" },
      { name: "TSMC", ticker: "TSM", price: 98.67, change: 1.5, type: "client" },
      { name: "Apple", ticker: "AAPL", price: 175.4, change: 1.2, type: "client" },
      { name: "Microsoft", ticker: "MSFT", price: 378.91, change: 0.5, type: "client" },
      { name: "SpaceX Starlink", isPrivate: true, price: 0, change: 5.8, type: "client" },
    ],
  },
  {
    id: "cloud",
    name: "Cloud Services",
    financial: {
      revenue: "$312B",
      growth: "+18.3% YoY",
      marketShare: "32% Global",
      valuation: "$1.8T",
    },
    marketing: {
      customerBase: "280K+ Enterprise",
      brandValue: "$245B",
      adSpend: "$12.5B/yr",
      socialReach: "180M followers",
    },
    entities: [
      { name: "AWS", ticker: "AMZN", price: 142.35, change: 0.9, type: "competitor" },
      { name: "Microsoft Azure", ticker: "MSFT", price: 378.91, change: 0.5, type: "competitor" },
      { name: "Google Cloud", ticker: "GOOGL", price: 139.67, change: 0.3, type: "competitor" },
      { name: "DigitalOcean", ticker: "DOCN", price: 42.15, change: -0.8, type: "competitor" },
      { name: "Salesforce", ticker: "CRM", price: 256.78, change: -0.4, type: "client" },
      { name: "Adobe", ticker: "ADBE", price: 567.89, change: 1.8, type: "client" },
      { name: "Stripe", isPrivate: true, price: 0, change: 7.2, type: "client" },
    ],
  },
  {
    id: "automotive",
    name: "Automotive",
    financial: {
      revenue: "$2.8T",
      growth: "+8.7% YoY",
      marketShare: "15% EV Market",
      valuation: "$1.2T",
    },
    marketing: {
      customerBase: "95M+ Customers",
      brandValue: "$420B",
      adSpend: "$45B/yr",
      socialReach: "320M followers",
    },
    entities: [
      { name: "Tesla", ticker: "TSLA", price: 248.5, change: -2.1, type: "competitor" },
      { name: "Rivian", ticker: "RIVN", price: 18.32, change: -3.5, type: "competitor" },
      { name: "Lucid Motors", ticker: "LCID", price: 3.45, change: -1.8, type: "competitor" },
      { name: "Ford", ticker: "F", price: 12.45, change: 0.6, type: "client" },
      { name: "GM", ticker: "GM", price: 38.9, change: 1.1, type: "client" },
      { name: "Toyota", ticker: "TM", price: 178.23, change: 0.8, type: "client" },
      { name: "BYD Auto", isPrivate: true, price: 0, change: 4.5, type: "client" },
    ],
  },
]

export function IndustryLookback() {
  const [selectedProduct, setSelectedProduct] = useState(industryData[0].id)

  const currentProduct = industryData.find((p) => p.id === selectedProduct) || industryData[0]
  const competitors = currentProduct.entities.filter((e) => e.type === "competitor")
  const clients = currentProduct.entities.filter((e) => e.type === "client")

  return (
    <div className="border-t border-terminal-border bg-terminal-panel/95 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-2 border-b border-terminal-border/50">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Industry Look-Back</h3>
        <div className="flex gap-1">
          {industryData.map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product.id)}
              className={`px-3 py-1 text-[10px] font-medium rounded transition-colors ${
                selectedProduct === product.id
                  ? "text-white bg-slate-700 border border-terminal-border"
                  : "text-slate-500 hover:text-white hover:bg-slate-800"
              }`}
            >
              {product.name}
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
            {competitors.map((entity, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50 hover:bg-terminal-bg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-white">{entity.name}</span>
                    {entity.isPrivate ? (
                      <span className="text-[9px] text-purple-400 font-mono">Private</span>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-mono">{entity.ticker}</span>
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
                {!entity.isPrivate && (
                  <span className="text-[10px] font-mono text-slate-300">${entity.price.toFixed(2)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Clients Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="size-3.5 text-bullish" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Clients</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {clients.map((entity, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50 hover:bg-terminal-bg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-white">{entity.name}</span>
                    {entity.isPrivate ? (
                      <span className="text-[9px] text-purple-400 font-mono">Private</span>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-mono">{entity.ticker}</span>
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
                {!entity.isPrivate && (
                  <span className="text-[10px] font-mono text-slate-300">${entity.price.toFixed(2)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

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
              <span className="text-sm font-mono text-white font-semibold">{currentProduct.financial.revenue}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Growth</span>
              <span className="text-sm font-mono text-bullish font-semibold">{currentProduct.financial.growth}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Market Share</span>
              <span className="text-sm font-mono text-white font-semibold">{currentProduct.financial.marketShare}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Valuation</span>
              <span className="text-sm font-mono text-white font-semibold">{currentProduct.financial.valuation}</span>
            </div>
          </div>
        </div>

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
                {currentProduct.marketing.customerBase}
              </span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Brand Value</span>
              <span className="text-sm font-mono text-white font-semibold">{currentProduct.marketing.brandValue}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Ad Spend</span>
              <span className="text-sm font-mono text-white font-semibold">{currentProduct.marketing.adSpend}</span>
            </div>
            <div className="flex flex-col gap-1 py-2 px-2.5 rounded bg-terminal-bg/50">
              <span className="text-[9px] text-slate-500 uppercase">Social Reach</span>
              <span className="text-sm font-mono text-white font-semibold">{currentProduct.marketing.socialReach}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}