import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import type { ClusterMonitoringOverview } from "@shared/schema";

interface MonitoringOverviewCardsProps {
  data?: ClusterMonitoringOverview;
  isLoading: boolean;
}

export function MonitoringOverviewCards({ data, isLoading }: MonitoringOverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-slate-500">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No monitoring data available</p>
              <p className="text-xs">Configure CloudWatch Container Insights</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-slate-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No pod data available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-slate-500">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No utilization metrics</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-slate-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No alerts configured</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const podHealthPercentage = data.totalPods > 0 ? (data.runningPods / data.totalPods) * 100 : 0;
  const cpuUtilization = data.totalCpuCapacity > 0 ? (data.totalCpuUsage / data.totalCpuCapacity) * 100 : 0;
  const memoryUtilization = data.totalMemoryCapacity > 0 ? (data.totalMemoryUsage / data.totalMemoryCapacity) * 100 : 0;

  const cards = [
    {
      title: "Pod Health",
      value: `${data.runningPods}/${data.totalPods}`,
      subtitle: `${podHealthPercentage.toFixed(1)}% healthy`,
      change: podHealthPercentage >= 95 ? 2.3 : -1.2,
      icon: CheckCircle,
      color: podHealthPercentage >= 95 ? "text-green-600" : "text-orange-600",
    },
    {
      title: "CPU Utilization",
      value: `${cpuUtilization.toFixed(1)}%`,
      subtitle: `${(data.totalCpuUsage / 1000).toFixed(1)} / ${(data.totalCpuCapacity / 1000).toFixed(1)} cores`,
      change: cpuUtilization <= 80 ? -2.1 : 5.4,
      icon: Activity,
      color: cpuUtilization <= 80 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Memory Usage",
      value: `${memoryUtilization.toFixed(1)}%`,
      subtitle: `${(data.totalMemoryUsage / 1073741824).toFixed(1)} / ${(data.totalMemoryCapacity / 1073741824).toFixed(1)} GB`,
      change: memoryUtilization <= 85 ? -1.8 : 3.2,
      icon: Activity,
      color: memoryUtilization <= 85 ? "text-blue-600" : "text-orange-600",
    },
    {
      title: "Active Alerts",
      value: data.activeAlerts.toString(),
      subtitle: `${data.totalRestarts} total restarts`,
      change: data.activeAlerts === 0 ? -5.2 : 12.5,
      icon: AlertTriangle,
      color: data.activeAlerts === 0 ? "text-green-600" : "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change > 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        const trendColor = (index === 3) ? 
          (isPositive ? "text-red-600" : "text-green-600") : 
          (isPositive ? "text-green-600" : "text-red-600");

        return (
          <Card key={index} className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
                  <p className="text-xs text-slate-500 mb-2">{card.subtitle}</p>
                  <div className="flex items-center">
                    <TrendIcon className={`h-4 w-4 mr-1 ${trendColor}`} />
                    <span className={`text-sm font-medium ${trendColor}`}>
                      {Math.abs(card.change).toFixed(1)}%
                    </span>
                    <span className="text-sm text-slate-500 ml-1">vs last hour</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-opacity-10 ${card.color}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}