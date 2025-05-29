import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import type { CostTrendData } from "@shared/schema";

interface CostTrendChartProps {
  data: CostTrendData[];
  isLoading: boolean;
}

export function CostTrendChart({ data, isLoading }: CostTrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || isLoading || !data.length) return;

    const loadChart = async () => {
      const Chart = (await import('chart.js/auto')).default;
      
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(d => new Date(d.date).toLocaleDateString()),
          datasets: [{
            label: 'Daily Cost',
            data: data.map(d => d.cost),
            borderColor: 'hsl(var(--primary))',
            backgroundColor: 'hsla(var(--primary), 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value;
                }
              }
            }
          }
        }
      });
    };

    loadChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Cost Trend</CardTitle>
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Cost Trend</CardTitle>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <div className="text-4xl mb-4">📈</div>
              <p className="text-lg font-medium">No cost trend data available</p>
              <p className="text-sm">Cost data will appear here when AWS Cost Explorer is configured</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Cost Trend</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
            Daily
          </Button>
          <Button variant="ghost" size="sm">Weekly</Button>
          <Button variant="ghost" size="sm">Monthly</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <canvas ref={canvasRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
