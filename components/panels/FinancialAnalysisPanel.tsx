"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { FinancialMetrics, IndustryThresholds, Event } from '@/types/models';
import { createN8NClient, N8NError } from '@/lib/n8nClient';

// Initialize n8n client
const n8nClient = createN8NClient(true); // Set to false in production

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
        tooltip="Months of cash remaining at current burn rate. Critical for survival. Click to analyze for potential events."
        onClick={() => onMetricClick('cashRunwayMonths')}
      />
      <MetricCard
        title="Net Debt/EBITDA"
        value={metrics.netDebtToEBITDA}
        unit="x"
        thresholds={thresholds.netDebtToEBITDA}
        isInverted={true}
        tooltip="Debt burden relative to earnings. Lower is better for financial health. Click to analyze for potential events."
        onClick={() => onMetricClick('netDebtToEBITDA')}
      />
      <MetricCard
        title="FCF Margin"
        value={metrics.freeCashFlowMargin}
        unit="%"
        thresholds={thresholds.freeCashFlowMargin}
        tooltip="Free cash flow as percentage of revenue. Measures cash generation efficiency. Click to analyze for potential events."
        onClick={() => onMetricClick('freeCashFlowMargin')}
      />
      <MetricCard
        title="Gross Margin"
        value={metrics.grossMargin}
        unit="%"
        thresholds={thresholds.grossMargin}
        tooltip="Revenue minus cost of goods sold. Indicates pricing power and efficiency. Click to analyze for potential events."
        onClick={() => onMetricClick('grossMargin')}
      />
      <MetricCard
        title="Inventory Growth vs Revenue"
        value={metrics.inventoryGrowthVsRevenue}
        unit="%"
        thresholds={thresholds.inventoryGrowthVsRevenue}
        isInverted={true}
        tooltip="Inventory growth relative to revenue growth. High values may indicate demand issues. Click to analyze for potential events."
        onClick={() => onMetricClick('inventoryGrowthVsRevenue')}
      />
      <MetricCard
        title="Capex/Revenue"
        value={metrics.capexToRevenue}
        unit="%"
        thresholds={thresholds.capexToRevenue}
        tooltip="Capital expenditure as percentage of revenue. Indicates investment in growth. Click to analyze for potential events."
        onClick={() => onMetricClick('capexToRevenue')}
      />
      <MetricCard
        title="ROIC vs WACC"
        value={metrics.roicVsWACC}
        unit="%"
        thresholds={thresholds.roicVsWACC}
        tooltip="Return on invested capital vs weighted average cost of capital. Measures value creation. Click to analyze for potential events."
        onClick={() => onMetricClick('roicVsWACC')}
      />
      <MetricCard
        title="SBC % Revenue"
        value={metrics.sbcPercentRevenue}
        unit="%"
        thresholds={thresholds.sbcPercentRevenue}
        isInverted={true}
        tooltip="Stock-based compensation as percentage of revenue. High values indicate dilution risk. Click to analyze for potential events."
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
          tooltip="High accruals may indicate earnings manipulation. Lower is generally better. Click to analyze for potential events."
          onClick={() => onMetricClick('accrualsRatio')}
        />
        <MetricCard
          title="One-off Expenses Frequency"
          value={metrics.oneOffExpensesFrequency}
          unit="/yr"
          tooltip="Frequency of one-time charges. High frequency suggests recurring 'non-recurring' items. Click to analyze for potential events."
          onClick={() => onMetricClick('oneOffExpensesFrequency')}
        />
        <MetricCard
          title="Capitalized Costs Trend"
          value={metrics.capitalizedCostsTrend}
          unit="%"
          tooltip="Trend in capitalizing costs vs expensing. Increasing trend may inflate earnings. Click to analyze for potential events."
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
          tooltip="Days of inventory on hand. Industry-specific, but trends matter more than absolute values. Click to analyze for potential events."
          onClick={() => onMetricClick('inventoryDays')}
        />
        <MetricCard
          title="Backlog/Book-to-Bill"
          value={metrics.backlogBookToBill}
          unit="x"
          tooltip="Ratio of new orders to shipments. >1.0 indicates growing demand. Click to analyze for potential events."
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
          tooltip="Percentage of revenue from top 5 customers. High concentration increases risk. Click to analyze for potential events."
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
    getSelectedCompany,
    addEvent,
    addNotification,
    setLoading
  } = useAppStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
  const [generatedEventsCount, setGeneratedEventsCount] = useState(0);
  
  const selectedIndustry = getSelectedIndustry();
  const selectedCompany = getSelectedCompany();
  
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
  
  // Enhanced metric click handler with n8n integration
  const handleMetricClick = useCallback(async (metric: string) => {
    if (!financialMetrics || !selectedCompany) {
      addNotification({
        type: 'warning',
        title: 'No Data Available',
        message: 'Please select a company with financial data first.'
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Trigger n8n financial analysis for specific metric
      const analysisResult = await n8nClient.analyzeFinancialMetrics({
        companyId: selectedCompany.id,
        metrics: financialMetrics,
        industryThresholds: thresholds,
        analysisType: 'threshold_check'
      });
      
      // Process generated events
      if (analysisResult.generatedEvents && analysisResult.generatedEvents.length > 0) {
        let eventsAdded = 0;
        
        for (const eventData of analysisResult.generatedEvents) {
          // Convert n8n event format to our Event interface
          const event: Event = {
            ...eventData,
            // Ensure all required fields are present
            updateHistory: eventData.updateHistory || [],
            createdAt: new Date(eventData.createdAt),
            updatedAt: new Date(eventData.updatedAt),
            timingWindow: {
              start: new Date(eventData.timingWindow.start),
              end: new Date(eventData.timingWindow.end),
              expectedDate: new Date(eventData.timingWindow.expectedDate)
            }
          };
          
          addEvent(event);
          eventsAdded++;
        }
        
        setGeneratedEventsCount(prev => prev + eventsAdded);
        
        addNotification({
          type: 'success',
          title: 'Events Generated',
          message: `Generated ${eventsAdded} new events from ${metric} analysis`
        });
      }
      
      // Show analysis insights
      if (analysisResult.insights && analysisResult.insights.length > 0) {
        addNotification({
          type: 'info',
          title: `${metric} Analysis`,
          message: analysisResult.insights[0] // Show first insight
        });
      }
      
      setLastAnalysisTime(new Date());
      
    } catch (error) {
      console.error('Financial analysis error:', error);
      
      let errorMessage = 'Failed to analyze financial metrics. Please try again.';
      
      if (error instanceof N8NError) {
        if (error.statusCode === 408) {
          errorMessage = 'Analysis timed out. The financial data may be too complex.';
        } else if (error.statusCode && error.statusCode >= 500) {
          errorMessage = 'Financial analysis service is temporarily unavailable.';
        }
      }
      
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: errorMessage
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [financialMetrics, selectedCompany, thresholds, addEvent, addNotification]);
  
  // Automatic analysis when financial metrics change
  useEffect(() => {
    if (financialMetrics && selectedCompany && !isAnalyzing) {
      // Debounce automatic analysis
      const timeoutId = setTimeout(() => {
        triggerAutomaticAnalysis();
      }, 2000); // 2 second delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [financialMetrics, selectedCompany]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Trigger automatic analysis of all metrics
  const triggerAutomaticAnalysis = useCallback(async () => {
    if (!financialMetrics || !selectedCompany || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setLoading(true);
    
    try {
      // Run comprehensive analysis via n8n
      const analysisResult = await n8nClient.detectAnomalies(
        selectedCompany.id,
        financialMetrics,
        thresholds
      );
      
      // Process all generated events
      if (analysisResult.generatedEvents && analysisResult.generatedEvents.length > 0) {
        let eventsAdded = 0;
        
        for (const eventData of analysisResult.generatedEvents) {
          const event: Event = {
            ...eventData,
            updateHistory: eventData.updateHistory || [],
            createdAt: new Date(eventData.createdAt),
            updatedAt: new Date(eventData.updatedAt),
            timingWindow: {
              start: new Date(eventData.timingWindow.start),
              end: new Date(eventData.timingWindow.end),
              expectedDate: new Date(eventData.timingWindow.expectedDate)
            }
          };
          
          addEvent(event);
          eventsAdded++;
        }
        
        setGeneratedEventsCount(prev => prev + eventsAdded);
        
        if (eventsAdded > 0) {
          addNotification({
            type: 'info',
            title: 'Automatic Analysis Complete',
            message: `Generated ${eventsAdded} events from financial anomaly detection`
          });
        }
      }
      
      setLastAnalysisTime(new Date());
      
    } catch (error) {
      console.error('Automatic analysis error:', error);
      // Don't show error notifications for automatic analysis to avoid spam
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  }, [financialMetrics, selectedCompany, thresholds, isAnalyzing, addEvent, addNotification, setLoading]);
  
  const handleMetricClickLegacy = (metric: string) => {
    // Legacy handler for simple notifications
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Financial Analysis</CardTitle>
          <div className="flex items-center gap-3">
            {/* Analysis Status */}
            <div className="flex items-center gap-2">
              {isAnalyzing && (
                <>
                  <Zap className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm text-muted-foreground">Analyzing...</span>
                </>
              )}
              {lastAnalysisTime && !isAnalyzing && (
                <span className="text-xs text-muted-foreground">
                  Last: {lastAnalysisTime.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {/* Generated Events Counter */}
            {generatedEventsCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {generatedEventsCount} events generated
              </Badge>
            )}
            
            {/* Manual Analysis Trigger */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={triggerAutomaticAnalysis}
                    disabled={isAnalyzing || !financialMetrics || !selectedCompany}
                    className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run financial analysis and generate events</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
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