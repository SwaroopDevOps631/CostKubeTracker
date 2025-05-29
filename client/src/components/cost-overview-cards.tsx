import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, Server, Calculator, BarChart3 } from "lucide-react";
import type { CostOverviewMetrics } from "@shared/schema";

interface CostOverviewCardsProps {
  data?: CostOverviewMetrics;
  isLoading: boolean;
}

export function CostOverviewCards({ data, isLoading }: CostOverviewCardsProps) {
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
              <DollarSign className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No cost data available</p>
              <p className="text-xs">Configure AWS Cost Explorer API</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-slate-500">
              <Server className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No pod data available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-slate-500">
              <Calculator className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No metrics available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-slate-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No efficiency data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Cost (7d)",
      value: `$${data.totalCost.toFixed(2)}`,
      change: data.totalChange,
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Active Pods",
      value: data.activePods.toString(),
      change: data.podsChange,
      icon: Server,
      color: "text-green-600",
    },
    {
      title: "Avg Cost/Pod",
      value: `$${data.costPerPod.toFixed(2)}`,
      change: data.perPodChange,
      icon: Calculator,
      color: "text-blue-600",
    },
    {
      title: "Efficiency Score",
      value: `${data.efficiencyScore.toFixed(0)}%`,
      change: data.efficiencyScore - 85, // Assuming 85% baseline
      icon: BarChart3,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change > 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        const trendColor = isPositive ? "text-red-600" : "text-green-600";

        return (
          <Card key={index} className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendIcon className={`h-4 w-4 mr-1 ${trendColor}`} />
                    <span className={`text-sm font-medium ${trendColor}`}>
                      {Math.abs(card.change).toFixed(1)}%
                    </span>
                    <span className="text-sm text-slate-500 ml-1">vs last week</span>
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
