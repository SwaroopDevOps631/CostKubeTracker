import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Cpu, MemoryStick, Network } from "lucide-react";
import type { MetricTrendData } from "@shared/schema";

interface MetricTrendsChartProps {
  data: MetricTrendData[];
  isLoading: boolean;
}

export function MetricTrendsChart({ data, isLoading }: MetricTrendsChartProps) {
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
          labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
          datasets: [
            {
              label: 'CPU Usage (%)',
              data: data.map(d => d.cpuUsage),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: false,
              borderWidth: 2,
            },
            {
              label: 'Memory Usage (%)',
              data: data.map(d => d.memoryUsage),
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: false,
              borderWidth: 2,
            },
            {
              label: 'Pod Count',
              data: data.map(d => d.podCount),
              borderColor: 'rgb(245, 158, 11)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              tension: 0.4,
              fill: false,
              borderWidth: 2,
              yAxisID: 'y1',
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time'
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Usage (%)'
              },
              min: 0,
              max: 100,
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Pod Count'
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
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
          <CardTitle className="text-lg font-semibold">Resource Utilization Trends</CardTitle>
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
          <CardTitle className="text-lg font-semibold">Resource Utilization Trends</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">1H</Button>
            <Button variant="ghost" size="sm">6H</Button>
            <Button variant="ghost" size="sm">24H</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg font-medium">No metric trends available</p>
              <p className="text-sm">Resource utilization trends will appear here when CloudWatch Container Insights is configured</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentMetrics = data[data.length - 1];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Resource Utilization Trends</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
            1H
          </Button>
          <Button variant="ghost" size="sm">6H</Button>
          <Button variant="ghost" size="sm">24H</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-sm font-medium">CPU</div>
              <div className="text-xs text-slate-500">{currentMetrics.cpuUsage}%</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MemoryStick className="h-4 w-4 text-green-600" />
            <div>
              <div className="text-sm font-medium">Memory</div>
              <div className="text-xs text-slate-500">{currentMetrics.memoryUsage}%</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-yellow-600" />
            <div>
              <div className="text-sm font-medium">Pods</div>
              <div className="text-xs text-slate-500">{currentMetrics.podCount}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Network className="h-4 w-4 text-purple-600" />
            <div>
              <div className="text-sm font-medium">Network</div>
              <div className="text-xs text-slate-500">
                {(currentMetrics.networkRx / 1024 / 1024).toFixed(1)}MB/s
              </div>
            </div>
          </div>
        </div>
        <div className="h-80">
          <canvas ref={canvasRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}