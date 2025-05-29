import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import type { NamespaceCostData } from "@shared/schema";

interface NamespaceCostBreakdownProps {
  data: NamespaceCostData[];
  isLoading: boolean;
}

export function NamespaceCostBreakdown({ data, isLoading }: NamespaceCostBreakdownProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Cost by Namespace</CardTitle>
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Cost by Namespace</CardTitle>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <div className="text-4xl mb-4">🏗️</div>
              <p className="text-lg font-medium">No namespace cost data available</p>
              <p className="text-sm">Namespace cost breakdown will appear here when data is available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const colors = [
    "bg-primary",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-blue-500",
  ];

  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Cost by Namespace</CardTitle>
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = totalCost > 0 ? (item.cost / totalCost) * 100 : 0;
            const colorClass = colors[index % colors.length];

            return (
              <div key={item.namespace}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                    <span className="text-sm font-medium text-slate-700">{item.namespace}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">${item.cost.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
