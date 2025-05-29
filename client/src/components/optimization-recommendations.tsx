import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, TrendingDown, Clock, Zap } from "lucide-react";
import type { OptimizationRecommendation } from "@shared/schema";

interface OptimizationRecommendationsProps {
  data: OptimizationRecommendation[];
  isLoading: boolean;
}

export function OptimizationRecommendations({ data, isLoading }: OptimizationRecommendationsProps) {
  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Cost Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return null;
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "right_size": return <TrendingDown className="h-5 w-5" />;
      case "scale_down": return <TrendingDown className="h-5 w-5" />;
      case "schedule": return <Clock className="h-5 w-5" />;
      case "spot_instance": return <Zap className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case "right_size": return "bg-blue-100 text-blue-600";
      case "scale_down": return "bg-green-100 text-green-600";
      case "schedule": return "bg-purple-100 text-purple-600";
      case "spot_instance": return "bg-yellow-100 text-yellow-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={colors[riskLevel as keyof typeof colors] || "bg-slate-100 text-slate-800"}>
        {riskLevel} risk
      </Badge>
    );
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Cost Optimization Recommendations</CardTitle>
          <Button>Apply All Recommendations</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((recommendation) => (
            <div key={recommendation.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getRecommendationColor(recommendation.type)}`}>
                    {getRecommendationIcon(recommendation.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{recommendation.title}</h4>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">
                  Save ${recommendation.potential_savings}/month
                </span>
              </div>
              <p className="text-sm text-slate-700 mb-3">{recommendation.description}</p>
              <div className="flex items-center justify-between">
                {getRiskBadge(recommendation.risk_level)}
                <Button variant="outline" size="sm" className="text-primary hover:text-primary/80">
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
