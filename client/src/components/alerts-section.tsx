import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import type { Alert } from "@shared/schema";

interface AlertsSectionProps {
  alerts: Alert[];
  isLoading: boolean;
}

export function AlertsSection({ alerts, isLoading }: AlertsSectionProps) {
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Cost Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alerts.length) {
    return null;
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "cost_spike": return <AlertTriangle className="h-5 w-5" />;
      case "optimization": return <Info className="h-5 w-5" />;
      case "budget_exceeded": return <AlertTriangle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-red-200 bg-red-50";
      case "high": return "border-orange-200 bg-orange-50";
      case "medium": return "border-yellow-200 bg-yellow-50";
      case "low": return "border-blue-200 bg-blue-50";
      default: return "border-slate-200 bg-slate-50";
    }
  };

  const getAlertIconColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-blue-600";
      default: return "text-slate-600";
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800",
    };
    
    return (
      <Badge className={colors[severity as keyof typeof colors] || "bg-slate-100 text-slate-800"}>
        {severity}
      </Badge>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Cost Alerts & Notifications</CardTitle>
          <Button variant="outline" size="sm">
            Configure Alerts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`flex items-start space-x-3 p-4 rounded-lg border ${getAlertColor(alert.severity)}`}>
              <div className={`${getAlertIconColor(alert.severity)} mt-0.5`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-semibold text-slate-900">{alert.title}</h4>
                  {getSeverityBadge(alert.severity)}
                </div>
                <p className="text-sm text-slate-700 mb-2">{alert.message}</p>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-500">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                  {alert.threshold_value && alert.current_value && (
                    <span className="text-xs font-medium text-slate-600">
                      Threshold: ${alert.threshold_value} | Current: ${alert.current_value}
                    </span>
                  )}
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View Details
                  </Button>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
