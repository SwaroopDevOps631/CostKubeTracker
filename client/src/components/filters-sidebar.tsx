import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Settings, Filter } from "lucide-react";
import type { DashboardFilters, Cluster, Namespace } from "@shared/schema";

interface FiltersSidebarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const { data: clusters } = useQuery<Cluster[]>({
    queryKey: ["/api/clusters"],
  });

  const { data: namespaces } = useQuery<Namespace[]>({
    queryKey: ["/api/namespaces"],
  });

  const timeRangeOptions = [
    "Last 24 Hours",
    "Last 7 Days",
    "Last 30 Days",
    "Last 3 Months",
    "Custom Range",
  ];

  const workloadTypeOptions = [
    "Deployment",
    "StatefulSet",
    "DaemonSet",
    "Job",
    "CronJob",
  ];

  const handleTimeRangeChange = (value: string) => {
    onFiltersChange({ ...filters, timeRange: value });
  };

  const handleClusterToggle = (clusterName: string, checked: boolean) => {
    const updatedClusters = checked
      ? [...filters.clusters, clusterName]
      : filters.clusters.filter(c => c !== clusterName);
    onFiltersChange({ ...filters, clusters: updatedClusters });
  };

  const handleNamespaceToggle = (namespaceName: string, checked: boolean) => {
    const updatedNamespaces = checked
      ? [...filters.namespaces, namespaceName]
      : filters.namespaces.filter(n => n !== namespaceName);
    onFiltersChange({ ...filters, namespaces: updatedNamespaces });
  };

  const handleWorkloadTypeToggle = (workloadType: string, checked: boolean) => {
    const updatedTypes = checked
      ? [...filters.workloadTypes, workloadType]
      : filters.workloadTypes.filter(t => t !== workloadType);
    onFiltersChange({ ...filters, workloadTypes: updatedTypes });
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Filters & Controls</h2>
        </div>
        
        {/* Time Range Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Time Range</label>
          <Select value={filters.timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cluster Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">EKS Clusters</label>
          <div className="space-y-2">
            {clusters?.map((cluster) => (
              <div key={cluster.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cluster-${cluster.id}`}
                  checked={filters.clusters.includes(cluster.name)}
                  onCheckedChange={(checked) => 
                    handleClusterToggle(cluster.name, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`cluster-${cluster.id}`}
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  {cluster.name}
                </label>
              </div>
            )) || (
              <div className="text-sm text-slate-500">No clusters available</div>
            )}
          </div>
        </div>

        {/* Namespace Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Namespaces</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {namespaces?.map((namespace) => (
              <div key={namespace.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`namespace-${namespace.id}`}
                  checked={filters.namespaces.includes(namespace.name)}
                  onCheckedChange={(checked) => 
                    handleNamespaceToggle(namespace.name, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`namespace-${namespace.id}`}
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  {namespace.name}
                </label>
              </div>
            )) || (
              <div className="text-sm text-slate-500">No namespaces available</div>
            )}
          </div>
        </div>

        {/* Workload Type Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Workload Types</label>
          <div className="space-y-2">
            {workloadTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`workload-${type}`}
                  checked={filters.workloadTypes.includes(type)}
                  onCheckedChange={(checked) => 
                    handleWorkloadTypeToggle(type, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`workload-${type}`}
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Navigation</h3>
        <ul className="space-y-2">
          <li>
            <Button variant="secondary" className="w-full justify-start">
              <i className="fas fa-chart-line w-5 h-5 mr-3"></i>
              Overview
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <i className="fas fa-server w-5 h-5 mr-3"></i>
              Clusters
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <i className="fas fa-cubes w-5 h-5 mr-3"></i>
              Workloads
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <i className="fas fa-exclamation-triangle w-5 h-5 mr-3"></i>
              Alerts
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <i className="fas fa-file-export w-5 h-5 mr-3"></i>
              Reports
            </Button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
