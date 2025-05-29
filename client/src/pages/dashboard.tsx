import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CostOverviewCards } from "@/components/cost-overview-cards";
import { CostTrendChart } from "@/components/cost-trend-chart";
import { NamespaceCostBreakdown } from "@/components/namespace-cost-breakdown";
import { WorkloadCostTable } from "@/components/workload-cost-table";
import { AlertsSection } from "@/components/alerts-section";
import { OptimizationRecommendations } from "@/components/optimization-recommendations";
import { MonitoringOverviewCards } from "@/components/monitoring-overview-cards";
import { WorkloadMonitoringTable } from "@/components/workload-monitoring-table";
import { MetricTrendsChart } from "@/components/metric-trends-chart";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, User, RefreshCw, Download, DollarSign, Activity } from "lucide-react";
import type { DashboardFilters } from "@shared/schema";

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: "Last 7 Days",
    clusters: ["production-cluster"],
    namespaces: ["production", "monitoring"],
    workloadTypes: ["Deployment", "StatefulSet"],
  });

  // Fetch cost overview
  const { data: costOverview, isLoading: isLoadingOverview, refetch: refetchOverview } = useQuery({
    queryKey: ["/api/cost-overview", filters],
    enabled: true,
  });

  // Fetch namespace costs
  const { data: namespaceCosts, isLoading: isLoadingNamespaces, refetch: refetchNamespaces } = useQuery({
    queryKey: ["/api/namespace-costs", filters],
    enabled: true,
  });

  // Fetch cost trend
  const { data: costTrend, isLoading: isLoadingTrend, refetch: refetchTrend } = useQuery({
    queryKey: ["/api/cost-trend", filters],
    enabled: true,
  });

  // Fetch workload costs
  const { data: workloadCosts, isLoading: isLoadingWorkloads, refetch: refetchWorkloads } = useQuery({
    queryKey: ["/api/workload-costs", filters],
    enabled: true,
  });

  // Fetch alerts
  const { data: alerts, isLoading: isLoadingAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ["/api/alerts", { resolved: false }],
    enabled: true,
  });

  // Fetch optimization recommendations
  const { data: recommendations, isLoading: isLoadingRecommendations, refetch: refetchRecommendations } = useQuery({
    queryKey: ["/api/recommendations"],
    enabled: true,
  });

  // Fetch monitoring data
  const { data: monitoringOverview, isLoading: isLoadingMonitoringOverview, refetch: refetchMonitoringOverview } = useQuery({
    queryKey: ["/api/cluster-monitoring-overview", filters],
    enabled: true,
  });

  const { data: workloadMonitoring, isLoading: isLoadingWorkloadMonitoring, refetch: refetchWorkloadMonitoring } = useQuery({
    queryKey: ["/api/workload-monitoring", filters],
    enabled: true,
  });

  const { data: metricTrends, isLoading: isLoadingMetricTrends, refetch: refetchMetricTrends } = useQuery({
    queryKey: ["/api/metric-trends", filters],
    enabled: true,
  });

  const { data: monitoringAlerts, isLoading: isLoadingMonitoringAlerts, refetch: refetchMonitoringAlerts } = useQuery({
    queryKey: ["/api/monitoring-alerts", { resolved: false }],
    enabled: true,
  });

  const handleRefresh = () => {
    refetchOverview();
    refetchNamespaces();
    refetchTrend();
    refetchWorkloads();
    refetchAlerts();
    refetchRecommendations();
  };

  const handleExport = () => {
    // Create CSV export of current data
    console.log("Exporting dashboard data...");
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-cloud text-primary-foreground text-sm"></i>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">EKS Cost Monitor</h1>
                  <p className="text-sm text-slate-500">AWS Cost Analytics Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {alerts && alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
                )}
              </Button>
              
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">Sarah Chen</p>
                  <p className="text-xs text-slate-500">DevOps Engineer</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <FiltersSidebar filters={filters} onFiltersChange={setFilters} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Control Panel */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-slate-900">Dashboard Overview</h2>
                <span className="text-sm text-slate-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={handleExport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          {alerts && alerts.length > 0 && (
            <AlertsSection alerts={alerts} isLoading={isLoadingAlerts} />
          )}

          {/* Cost Overview Cards */}
          <CostOverviewCards 
            data={costOverview} 
            isLoading={isLoadingOverview} 
          />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CostTrendChart 
              data={costTrend || []} 
              isLoading={isLoadingTrend} 
            />
            <NamespaceCostBreakdown 
              data={namespaceCosts || []} 
              isLoading={isLoadingNamespaces} 
            />
          </div>

          {/* Workload Cost Table */}
          <WorkloadCostTable 
            data={workloadCosts || []} 
            isLoading={isLoadingWorkloads} 
          />

          {/* Optimization Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <OptimizationRecommendations 
              data={recommendations} 
              isLoading={isLoadingRecommendations} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
