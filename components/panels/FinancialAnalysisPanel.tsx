"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { FinancialMetrics, IndustryThresholds } from '@/types/models';

// Trend indicator component
interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  className?: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value, previousValue, className = "" }) => {
  if (!previousValue) {
    return <Minus className={`h-4 w-4 text-muted-foreground ${className}`} />;
  }
  
  if (value > previousValue) {
    return <TrendingUp className={`h-4 w-4 text-green-500 ${className}`} />;
  } else if (value < previousValue) {
    return <TrendingDown className={`h-4 w-4 text-red-500 ${className}`} />;
  } else {
    return <Minus className={`h-4 w-4 text-muted-foreground ${className}`} />;
  }
};

// Status color helper
const getStatusColor = (value: number, thresholds: { green: number; amber: number; red: number }, isInverted = false) => {
  if (isInverted) {
    if (value <= thresholds.green) return 'text-green-500';
    if (value <= thresholds.amber) return 'text-amber-500';
    return 'text-red-500';
  } else {
    if (value >= thresholds.green) return 'text-green-500';
    if (value >= thresholds.amber) return 'text-amber-500';
    return 'text-red-500';
  }
};

// Metric Card component
interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  previousValue?: number;
  thresholds?: { green: number; amber: number; red: number };
  isInverted?: boolean;
  tooltip: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  previousValue,
  thresholds,
  isInverted = false,
  tooltip,
  onClick
}) => {
  const statusColor = thresholds ? getStatusColor(value, thresholds, isInverted) : 'text-foreground';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={`cursor-pointer hover:bg-muted/50 transition-colors ${onClick ? 'hover:shadow-md' : ''}`}
            onClick={onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-mono font-bold ${statusColor}`}>
                      {typeof value === 'number' ? value.toFixed(1) : 'N/A'}{unit}
                    </span>
                    <TrendIndicator value={value} previousValue={previousValue} />
                  </div>
                </div>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Financial Snapshot Tab
interface FinancialSnapshotProps {
  metrics: FinancialMetrics;
  thresholds: IndustryThresholds;
  onMetricClick: (metric: string) => void;
}

const FinancialSnapshot: React.FC<FinancialSnapshotProps> = ({ metrics, thresholds, onMetricClick }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        title="Cash Runway"
        value={metrics.cashRunwayMonths}
        unit=" months"
        thresholds={thresholds.cashRunwayMonths}
        tooltip="Months of cash remaining at current burn rate. Critical for survival."
        onClick={() => onMetricClick('cashRunwayMonths')}
      />
      <MetricCard
        title="Net Debt/EBITDA"
        value={metrics.netDebtToEBITDA}
        unit="x"
        thresholds={thresholds.netDebtToEBITDA}
        isInverted={true}
        tooltip="Debt burden relative to earnings. Lower is better for financial health."
        onClick={() => onMetricClick('netDebtToEBITDA')}
      />
      <MetricCard
        title="FCF Margin"
        value={metrics.freeCashFlowMargin}
        unit="%"
        thresholds={thresholds.freeCashFlowMargin}
        tooltip="Free cash flow as percentage of revenue. Measures cash generation efficiency."
        onClick={() => onMetricClick('freeCashFlowMargin')}
      />
      <MetricCard
        title="Gross Margin"
        value={metrics.grossMargin}
        unit="%"
        thresholds={thresholds.grossMargin}
        tooltip="Revenue minus cost of goods sold. Indicates pricing power and efficiency."
        onClick={() => onMetricClick('grossMargin')}
      />
      <MetricCard
        title="Inventory Growth vs Revenue"
        value={metrics.inventoryGrowthVsRevenue}
        unit="%"
        thresholds={thresholds.inventoryGrowthVsRevenue}
        isInverted={true}
        tooltip="Inventory growth relative to revenue growth. High values may indicate demand issues."
        onClick={() => onMetricClick('inventoryGrowthVsRevenue')}
      />
      <MetricCard
        title="Capex/Revenue"
        value={metrics.capexToRevenue}
        unit="%"
        thresholds={thresholds.capexToRevenue}
        tooltip="Capital expenditure as percentage of revenue. Indicates investment in growth."
        onClick={() => onMetricClick('capexToRevenue')}
      />
      <MetricCard
        title="ROIC vs WACC"
        value={metrics.roicVsWACC}
        unit="%"
        thresholds={thresholds.roicVsWACC}
        tooltip="Return on invested capital vs weighted average cost of capital. Measures value creation."
        onClick={() => onMetricClick('roicVsWACC')}
      />
      <MetricCard
        title="SBC % Revenue"
        value={metrics.sbcPercentRevenue}
        unit="%"
        thresholds={thresholds.sbcPercentRevenue}
        isInverted={true}
        tooltip="Stock-based compensation as percentage of revenue. High values indicate dilution risk."
        onClick={() => onMetricClick('sbcPercentRevenue')}
      />
    </div>
  );
};

// Financial Stress Tab
interface FinancialStressProps {
  metrics: FinancialMetrics;
  onMetricClick: (metric: string) => void;
}

const FinancialStress: React.FC<FinancialStressProps> = ({ metrics, onMetricClick }) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];
  
  return (
    <div className="space-y-6">
      {/* Debt Maturity Timeline */}
      <Card className="cursor-pointer hover:bg-muted/50" onClick={() => onMetricClick('debtMaturity')}>
        <CardHeader>
          <CardTitle className="text-lg">Debt Maturity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {years.map(year => {
              const amount = metrics.debtMaturity[year.toString()] || 0;
              const maxAmount = Math.max(...Object.values(metrics.debtMaturity));
              const width = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
              const isRefinancingCliff = amount > maxAmount * 0.3;
              
              return (
                <div key={year} className="flex items-center space-x-4">
                  <span className="text-sm font-mono w-12">{year}</span>
                  <div className="flex-1 bg-muted rounded-full h-6 relative">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isRefinancingCliff ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${width}%` }}
                    />
                    {isRefinancingCliff && (
                      <AlertTriangle className="absolute right-2 top-1 h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-mono w-20 text-right">
                    ${amount.toFixed(0)}M
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => onMetricClick('liquidityBuffer')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">Liquidity Buffer</p>
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted stroke-current"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`stroke-current ${
                      metrics.liquidityBuffer > 12 ? 'text-green-500' : 
                      metrics.liquidityBuffer > 6 ? 'text-amber-500' : 'text-red-500'
                    }`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${Math.min(metrics.liquidityBuffer * 5, 100)}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{metrics.liquidityBuffer.toFixed(0)}M</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => onMetricClick('creditLines')}>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-4">Credit Lines</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available</span>
                <span className="font-mono">${metrics.creditLinesAvailable.toFixed(0)}M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span className="font-mono">${metrics.creditLinesUsed.toFixed(0)}M</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min((metrics.creditLinesUsed / metrics.creditLinesAvailable) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Utilization</span>
                <span>
                  {((metrics.creditLinesUsed / metrics.creditLinesAvailable) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Earnings Quality Tab
interface EarningsQualityProps {
  metrics: FinancialMetrics;
  onMetricClick: (metric: string) => void;
}

const EarningsQuality: React.FC<EarningsQualityProps> = ({ metrics, onMetricClick }) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className="cursor-pointer hover:bg-muted/50" onClick={() => onMetricClick('netIncomeVsOCF')}>
        <CardHeader>
          <CardTitle className="text-lg">Net Income vs Operating Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Net Income</span>
              <span className="font-mono text-lg">$100M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Operating Cash Flow</span>
              <span className="font-mono text-lg">${(100 * metrics.netIncomeVsOCF).toFixed(0)}M</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Quality Ratio</span>
                <Badge variant={metrics.netIncomeVsOCF > 1.1 ? "default" : metrics.netIncomeVsOCF > 0.9 ? "secondary" : "destructive"}>
                  {metrics.netIncomeVsOCF.toFixed(2)}x
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <MetricCard
          title="Accruals Ratio"
          value={metrics.accrualsRatio}
          unit="%"
          tooltip="High accruals may indicate earnings manipulation. Lower is generally better."
          onClick={() => onMetricClick('accrualsRatio')}
        />
        <MetricCard
          title="One-off Expenses Frequency"
          value={metrics.oneOffExpensesFrequency}
          unit="/yr"
          tooltip="Frequency of one-time charges. High frequency suggests recurring 'non-recurring' items."
          onClick={() => onMetricClick('oneOffExpensesFrequency')}
        />
        <MetricCard
          title="Capitalized Costs Trend"
          value={metrics.capitalizedCostsTrend}
          unit="%"
          tooltip="Trend in capitalizing costs vs expensing. Increasing trend may inflate earnings."
          onClick={() => onMetricClick('capitalizedCostsTrend')}
        />
      </div>
    </div>
  );
};

// Cycle & Demand Tab
interface CycleDemandProps {
  metrics: FinancialMetrics;
  onMetricClick: (metric: string) => void;
}

const CycleDemand: React.FC<CycleDemandProps> = ({ metrics, onMetricClick }) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <MetricCard
          title="Inventory Days (DIO)"
          value={metrics.inventoryDays}
          unit=" days"
          tooltip="Days of inventory on hand. Industry-specific, but trends matter more than absolute values."
          onClick={() => onMetricClick('inventoryDays')}
        />
        <MetricCard
          title="Backlog/Book-to-Bill"
          value={metrics.backlogBookToBill}
          unit="x"
          tooltip="Ratio of new orders to shipments. >1.0 indicates growing demand."
          onClick={() => onMetricClick('backlogBookToBill')}
        />
      </div>

      <div className="space-y-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => onMetricClick('revenueVsInventoryDelta')}>
          <CardHeader>
            <CardTitle className="text-lg">Revenue vs Inventory Delta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Revenue Growth</span>
                <span className="font-mono">15.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Inventory Growth</span>
                <span className="font-mono">{metrics.revenueVsInventoryDelta.toFixed(1)}%</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Delta</span>
                  <Badge variant={Math.abs(metrics.revenueVsInventoryDelta - 15.2) < 5 ? "default" : "destructive"}>
                    {(metrics.revenueVsInventoryDelta - 15.2).toFixed(1)}pp
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <MetricCard
          title="Customer Concentration"
          value={metrics.customerConcentration}
          unit="%"
          tooltip="Percentage of revenue from top 5 customers. High concentration increases risk."
          onClick={() => onMetricClick('customerConcentration')}
        />
      </div>
    </div>
  );
};

// Main FinancialAnalysisPanel component
interface FinancialAnalysisPanelProps {
  className?: string;
}

const FinancialAnalysisPanel: React.FC<FinancialAnalysisPanelProps> = ({ className = "" }) => {
  const { 
    financialMetrics, 
    getSelectedIndustry, 
    addEvent,
    addNotification 
  } = useAppStore();
  
  const selectedIndustry = getSelectedIndustry();
  
  // Mock industry thresholds if not available
  const defaultThresholds: IndustryThresholds = {
    cashRunwayMonths: { green: 18, amber: 12, red: 6 },
    netDebtToEBITDA: { green: 2, amber: 3, red: 4 },
    freeCashFlowMargin: { green: 15, amber: 10, red: 5 },
    grossMargin: { green: 40, amber: 30, red: 20 },
    inventoryGrowthVsRevenue: { green: 5, amber: 15, red: 25 },
    capexToRevenue: { green: 8, amber: 12, red: 20 },
    roicVsWACC: { green: 5, amber: 2, red: 0 },
    sbcPercentRevenue: { green: 5, amber: 10, red: 15 }
  };
  
  const thresholds = selectedIndustry?.thresholds || defaultThresholds;
  
  const handleMetricClick = (metric: string) => {
    addNotification({
      type: 'info',
      title: 'Metric Details',
      message: `Detailed analysis for ${metric} would open here. This would link to related events in the Event Graph.`
    });
  };
  
  if (!financialMetrics) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No financial data available</p>
            <p className="text-sm mt-2">Select a company to view financial analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Financial Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="snapshot" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="snapshot">Financial Snapshot</TabsTrigger>
            <TabsTrigger value="stress">Financial Stress</TabsTrigger>
            <TabsTrigger value="quality">Earnings Quality</TabsTrigger>
            <TabsTrigger value="cycle">Cycle & Demand</TabsTrigger>
          </TabsList>
          
          <TabsContent value="snapshot" className="mt-6">
            <FinancialSnapshot 
              metrics={financialMetrics}
              thresholds={thresholds}
              onMetricClick={handleMetricClick}
            />
          </TabsContent>
          
          <TabsContent value="stress" className="mt-6">
            <FinancialStress 
              metrics={financialMetrics}
              onMetricClick={handleMetricClick}
            />
          </TabsContent>
          
          <TabsContent value="quality" className="mt-6">
            <EarningsQuality 
              metrics={financialMetrics}
              onMetricClick={handleMetricClick}
            />
          </TabsContent>
          
          <TabsContent value="cycle" className="mt-6">
            <CycleDemand 
              metrics={financialMetrics}
              onMetricClick={handleMetricClick}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FinancialAnalysisPanel;