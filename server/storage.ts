import { 
  Cluster, InsertCluster,
  Namespace, InsertNamespace,
  Workload, InsertWorkload,
  CostMetric, InsertCostMetric,
  Alert, InsertAlert,
  OptimizationRecommendation, InsertOptimizationRecommendation,
  PodMetric, InsertPodMetric,
  DeploymentEvent, InsertDeploymentEvent,
  MonitoringAlert, InsertMonitoringAlert,
  CostOverviewMetrics,
  NamespaceCostData,
  CostTrendData,
  WorkloadCostData,
  DashboardFilters,
  WorkloadMonitoringData,
  ClusterMonitoringOverview,
  MetricTrendData,
  PodHealthData
} from "@shared/schema";

export interface IStorage {
  // Clusters
  getClusters(): Promise<Cluster[]>;
  getCluster(id: number): Promise<Cluster | undefined>;
  createCluster(cluster: InsertCluster): Promise<Cluster>;

  // Namespaces
  getNamespaces(clusterId?: number): Promise<Namespace[]>;
  getNamespace(id: number): Promise<Namespace | undefined>;
  createNamespace(namespace: InsertNamespace): Promise<Namespace>;

  // Workloads
  getWorkloads(namespaceId?: number): Promise<Workload[]>;
  getWorkload(id: number): Promise<Workload | undefined>;
  createWorkload(workload: InsertWorkload): Promise<Workload>;

  // Cost Metrics
  getCostMetrics(filters: Partial<DashboardFilters>): Promise<CostMetric[]>;
  createCostMetric(metric: InsertCostMetric): Promise<CostMetric>;
  getCostOverview(filters: Partial<DashboardFilters>): Promise<CostOverviewMetrics>;
  getNamespaceCosts(filters: Partial<DashboardFilters>): Promise<NamespaceCostData[]>;
  getCostTrend(filters: Partial<DashboardFilters>): Promise<CostTrendData[]>;
  getWorkloadCosts(filters: Partial<DashboardFilters>): Promise<WorkloadCostData[]>;

  // Alerts
  getAlerts(isResolved?: boolean): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: number): Promise<Alert | undefined>;

  // Optimization Recommendations
  getOptimizationRecommendations(workloadId?: number): Promise<OptimizationRecommendation[]>;
  createOptimizationRecommendation(recommendation: InsertOptimizationRecommendation): Promise<OptimizationRecommendation>;

  // Pod Metrics & Monitoring
  getPodMetrics(workloadId?: number, timeRange?: string): Promise<PodMetric[]>;
  createPodMetric(metric: InsertPodMetric): Promise<PodMetric>;
  getWorkloadMonitoring(filters: Partial<DashboardFilters>): Promise<WorkloadMonitoringData[]>;
  getClusterMonitoringOverview(clusterId?: number): Promise<ClusterMonitoringOverview>;
  getMetricTrends(filters: Partial<DashboardFilters>): Promise<MetricTrendData[]>;

  // Deployment Events
  getDeploymentEvents(workloadId?: number, limit?: number): Promise<DeploymentEvent[]>;
  createDeploymentEvent(event: InsertDeploymentEvent): Promise<DeploymentEvent>;

  // Monitoring Alerts
  getMonitoringAlerts(isResolved?: boolean): Promise<MonitoringAlert[]>;
  createMonitoringAlert(alert: InsertMonitoringAlert): Promise<MonitoringAlert>;
  resolveMonitoringAlert(id: number): Promise<MonitoringAlert | undefined>;
}

export class MemStorage implements IStorage {
  private clusters: Map<number, Cluster> = new Map();
  private namespaces: Map<number, Namespace> = new Map();
  private workloads: Map<number, Workload> = new Map();
  private costMetrics: Map<number, CostMetric> = new Map();
  private alerts: Map<number, Alert> = new Map();
  private optimizationRecommendations: Map<number, OptimizationRecommendation> = new Map();
  private podMetrics: Map<number, PodMetric> = new Map();
  private deploymentEvents: Map<number, DeploymentEvent> = new Map();
  private monitoringAlerts: Map<number, MonitoringAlert> = new Map();
  
  private currentClusterId = 1;
  private currentNamespaceId = 1;
  private currentWorkloadId = 1;
  private currentCostMetricId = 1;
  private currentAlertId = 1;
  private currentRecommendationId = 1;
  private currentPodMetricId = 1;
  private currentDeploymentEventId = 1;
  private currentMonitoringAlertId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample data structure only - no actual cost data
    const now = new Date();
    
    // Create clusters
    const prodCluster: Cluster = {
      id: this.currentClusterId++,
      name: "production-cluster",
      region: "us-west-2",
      status: "active",
      created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    
    const stagingCluster: Cluster = {
      id: this.currentClusterId++,
      name: "staging-cluster",
      region: "us-west-2",
      status: "active",
      created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    };

    this.clusters.set(prodCluster.id, prodCluster);
    this.clusters.set(stagingCluster.id, stagingCluster);

    // Create namespaces
    const namespaceData = [
      { name: "production", clusterId: prodCluster.id },
      { name: "monitoring", clusterId: prodCluster.id },
      { name: "default", clusterId: prodCluster.id },
      { name: "kube-system", clusterId: prodCluster.id },
      { name: "staging", clusterId: stagingCluster.id },
    ];

    namespaceData.forEach(ns => {
      const namespace: Namespace = {
        id: this.currentNamespaceId++,
        name: ns.name,
        cluster_id: ns.clusterId,
        labels: {},
        created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      };
      this.namespaces.set(namespace.id, namespace);
    });

    // Create workloads
    const workloadData = [
      { name: "frontend-app", namespaceId: 1, type: "Deployment", replicas: 12 },
      { name: "api-gateway", namespaceId: 1, type: "Deployment", replicas: 6 },
      { name: "redis-cache", namespaceId: 1, type: "StatefulSet", replicas: 3 },
      { name: "prometheus-server", namespaceId: 2, type: "Deployment", replicas: 2 },
      { name: "grafana", namespaceId: 2, type: "Deployment", replicas: 1 },
    ];

    workloadData.forEach(w => {
      const workload: Workload = {
        id: this.currentWorkloadId++,
        name: w.name,
        namespace_id: w.namespaceId,
        type: w.type,
        replicas: w.replicas,
        labels: {},
        cpu_request: "500m",
        memory_request: "1Gi",
        created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      };
      this.workloads.set(workload.id, workload);
    });

    // Initialize sample monitoring alerts for demonstration
    this.initializeMonitoringAlerts();
  }

  async getClusters(): Promise<Cluster[]> {
    return Array.from(this.clusters.values());
  }

  async getCluster(id: number): Promise<Cluster | undefined> {
    return this.clusters.get(id);
  }

  async createCluster(cluster: InsertCluster): Promise<Cluster> {
    const id = this.currentClusterId++;
    const newCluster: Cluster = {
      ...cluster,
      id,
      created_at: new Date(),
    };
    this.clusters.set(id, newCluster);
    return newCluster;
  }

  async getNamespaces(clusterId?: number): Promise<Namespace[]> {
    const namespaces = Array.from(this.namespaces.values());
    return clusterId ? namespaces.filter(ns => ns.cluster_id === clusterId) : namespaces;
  }

  async getNamespace(id: number): Promise<Namespace | undefined> {
    return this.namespaces.get(id);
  }

  async createNamespace(namespace: InsertNamespace): Promise<Namespace> {
    const id = this.currentNamespaceId++;
    const newNamespace: Namespace = {
      ...namespace,
      id,
      created_at: new Date(),
    };
    this.namespaces.set(id, newNamespace);
    return newNamespace;
  }

  async getWorkloads(namespaceId?: number): Promise<Workload[]> {
    const workloads = Array.from(this.workloads.values());
    return namespaceId ? workloads.filter(w => w.namespace_id === namespaceId) : workloads;
  }

  async getWorkload(id: number): Promise<Workload | undefined> {
    return this.workloads.get(id);
  }

  async createWorkload(workload: InsertWorkload): Promise<Workload> {
    const id = this.currentWorkloadId++;
    const newWorkload: Workload = {
      ...workload,
      id,
      created_at: new Date(),
    };
    this.workloads.set(id, newWorkload);
    return newWorkload;
  }

  async getCostMetrics(filters: Partial<DashboardFilters>): Promise<CostMetric[]> {
    return Array.from(this.costMetrics.values());
  }

  async createCostMetric(metric: InsertCostMetric): Promise<CostMetric> {
    const id = this.currentCostMetricId++;
    const newMetric: CostMetric = {
      ...metric,
      id,
      created_at: new Date(),
    };
    this.costMetrics.set(id, newMetric);
    return newMetric;
  }

  async getCostOverview(filters: Partial<DashboardFilters>): Promise<CostOverviewMetrics> {
    // Return empty/zero state until real data is available
    return {
      totalCost: 0,
      dailyAverage: 0,
      activePods: 0,
      costPerPod: 0,
      efficiencyScore: 0,
      totalChange: 0,
      dailyChange: 0,
      podsChange: 0,
      perPodChange: 0,
    };
  }

  async getNamespaceCosts(filters: Partial<DashboardFilters>): Promise<NamespaceCostData[]> {
    // Return empty array until real data is available
    return [];
  }

  async getCostTrend(filters: Partial<DashboardFilters>): Promise<CostTrendData[]> {
    // Return empty array until real data is available
    return [];
  }

  async getWorkloadCosts(filters: Partial<DashboardFilters>): Promise<WorkloadCostData[]> {
    const workloads = Array.from(this.workloads.values());
    const namespaces = Array.from(this.namespaces.values());
    const clusters = Array.from(this.clusters.values());

    return workloads.map(workload => {
      const namespace = namespaces.find(ns => ns.id === workload.namespace_id);
      const cluster = clusters.find(c => c.id === namespace?.cluster_id);
      
      return {
        id: workload.id,
        name: workload.name,
        namespace: namespace?.name || "unknown",
        type: workload.type,
        cluster: cluster?.name || "unknown",
        pods: workload.replicas,
        cost: 0, // Will be populated by AWS Cost Explorer API
        avgCostPerPod: 0,
        trend: 0,
        labels: workload.labels as Record<string, string> || {},
      };
    });
  }

  async getAlerts(isResolved?: boolean): Promise<Alert[]> {
    const alerts = Array.from(this.alerts.values());
    return isResolved !== undefined ? alerts.filter(a => a.is_resolved === isResolved) : alerts;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const newAlert: Alert = {
      ...alert,
      id,
      created_at: new Date(),
      resolved_at: null,
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async resolveAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.is_resolved = true;
      alert.resolved_at = new Date();
      this.alerts.set(id, alert);
    }
    return alert;
  }

  async getOptimizationRecommendations(workloadId?: number): Promise<OptimizationRecommendation[]> {
    const recommendations = Array.from(this.optimizationRecommendations.values());
    return workloadId ? recommendations.filter(r => r.workload_id === workloadId) : recommendations;
  }

  async createOptimizationRecommendation(recommendation: InsertOptimizationRecommendation): Promise<OptimizationRecommendation> {
    const id = this.currentRecommendationId++;
    const newRecommendation: OptimizationRecommendation = {
      ...recommendation,
      id,
      created_at: new Date(),
    };
    this.optimizationRecommendations.set(id, newRecommendation);
    return newRecommendation;
  }

  private initializeMonitoringAlerts() {
    const sampleAlerts = [
      {
        type: "high_cpu",
        title: "High CPU Usage Detected",
        message: "Frontend app pod is using 85% CPU for the last 10 minutes",
        severity: "high" as const,
        cluster_id: 1,
        namespace_id: 1,
        workload_id: 1,
        pod_name: "frontend-app-7d4f8b6c9d-abc12",
        threshold_value: "80",
        current_value: "85",
        metric_name: "cpu_usage",
        is_resolved: false,
      },
      {
        type: "pod_crash_loop",
        title: "Pod Crash Loop Detected",
        message: "Redis cache pod has restarted 5 times in the last hour",
        severity: "critical" as const,
        cluster_id: 1,
        namespace_id: 1,
        workload_id: 3,
        pod_name: "redis-cache-0",
        threshold_value: "3",
        current_value: "5",
        metric_name: "restart_count",
        is_resolved: false,
      }
    ];

    sampleAlerts.forEach(alert => {
      const monitoringAlert: MonitoringAlert = {
        ...alert,
        id: this.currentMonitoringAlertId++,
        created_at: new Date(),
        resolved_at: null,
      };
      this.monitoringAlerts.set(monitoringAlert.id, monitoringAlert);
    });
  }

  // Pod Metrics & Monitoring
  async getPodMetrics(workloadId?: number, timeRange?: string): Promise<PodMetric[]> {
    const metrics = Array.from(this.podMetrics.values());
    return workloadId ? metrics.filter(m => m.workload_id === workloadId) : metrics;
  }

  async createPodMetric(metric: InsertPodMetric): Promise<PodMetric> {
    const id = this.currentPodMetricId++;
    const newMetric: PodMetric = {
      ...metric,
      id,
      created_at: new Date(),
    };
    this.podMetrics.set(id, newMetric);
    return newMetric;
  }

  async getWorkloadMonitoring(filters: Partial<DashboardFilters>): Promise<WorkloadMonitoringData[]> {
    const workloads = Array.from(this.workloads.values());
    const namespaces = Array.from(this.namespaces.values());
    const clusters = Array.from(this.clusters.values());

    return workloads.map(workload => {
      const namespace = namespaces.find(ns => ns.id === workload.namespace_id);
      const cluster = clusters.find(c => c.id === namespace?.cluster_id);
      
      // Generate sample pod health data
      const pods: PodHealthData[] = Array.from({ length: workload.replicas }, (_, i) => ({
        podName: `${workload.name}-${Math.random().toString(36).substr(2, 10)}`,
        status: Math.random() > 0.1 ? "Running" : "Pending",
        restartCount: Math.floor(Math.random() * 3),
        cpuUsage: Math.floor(Math.random() * 800 + 200), // 200-1000 millicores
        memoryUsage: Math.floor(Math.random() * 1073741824 + 536870912), // 512MB-1.5GB
        cpuLimit: 1000,
        memoryLimit: 1073741824, // 1GB
        cpuUtilization: Math.floor(Math.random() * 60 + 20), // 20-80%
        memoryUtilization: Math.floor(Math.random() * 70 + 30), // 30-100%
        networkRxBytes: Math.floor(Math.random() * 1000000),
        networkTxBytes: Math.floor(Math.random() * 1000000),
        uptime: Math.floor(Math.random() * 86400 * 7), // up to 7 days
      }));

      const runningPods = pods.filter(p => p.status === "Running").length;
      const totalRestarts = pods.reduce((sum, p) => sum + p.restartCount, 0);
      const avgCpuUsage = pods.reduce((sum, p) => sum + p.cpuUtilization, 0) / pods.length;
      const avgMemoryUsage = pods.reduce((sum, p) => sum + p.memoryUtilization, 0) / pods.length;

      return {
        id: workload.id,
        name: workload.name,
        namespace: namespace?.name || "unknown",
        type: workload.type,
        cluster: cluster?.name || "unknown",
        replicas: workload.replicas,
        readyReplicas: runningPods,
        availableReplicas: runningPods,
        avgCpuUsage,
        avgMemoryUsage,
        totalRestarts,
        status: runningPods === workload.replicas ? "Healthy" : "Degraded",
        pods,
      };
    });
  }

  async getClusterMonitoringOverview(clusterId?: number): Promise<ClusterMonitoringOverview> {
    const workloadMonitoring = await this.getWorkloadMonitoring({});
    const monitoringAlerts = await this.getMonitoringAlerts(false);
    
    const totalPods = workloadMonitoring.reduce((sum, w) => sum + w.replicas, 0);
    const runningPods = workloadMonitoring.reduce((sum, w) => sum + w.readyReplicas, 0);
    const pendingPods = totalPods - runningPods;
    const failedPods = 0; // No failed pods in current sample data
    const totalRestarts = workloadMonitoring.reduce((sum, w) => sum + w.totalRestarts, 0);
    
    return {
      totalPods,
      runningPods,
      pendingPods,
      failedPods,
      totalCpuUsage: 1200, // Sample values
      totalMemoryUsage: 8589934592, // 8GB
      totalCpuCapacity: 4000, // 4 cores
      totalMemoryCapacity: 17179869184, // 16GB
      clusterUtilization: 75,
      totalRestarts,
      activeAlerts: monitoringAlerts.length,
    };
  }

  async getMetricTrends(filters: Partial<DashboardFilters>): Promise<MetricTrendData[]> {
    // Generate sample trend data for the last 24 hours
    const trends: MetricTrendData[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      trends.push({
        timestamp: timestamp.toISOString(),
        cpuUsage: Math.floor(Math.random() * 30 + 40), // 40-70%
        memoryUsage: Math.floor(Math.random() * 40 + 50), // 50-90%
        podCount: Math.floor(Math.random() * 5 + 20), // 20-25 pods
        networkRx: Math.floor(Math.random() * 1000000 + 500000), // Network bytes
        networkTx: Math.floor(Math.random() * 800000 + 400000),
      });
    }
    
    return trends;
  }

  // Deployment Events
  async getDeploymentEvents(workloadId?: number, limit = 50): Promise<DeploymentEvent[]> {
    const events = Array.from(this.deploymentEvents.values())
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    const filtered = workloadId ? events.filter(e => e.workload_id === workloadId) : events;
    return filtered.slice(0, limit);
  }

  async createDeploymentEvent(event: InsertDeploymentEvent): Promise<DeploymentEvent> {
    const id = this.currentDeploymentEventId++;
    const newEvent: DeploymentEvent = {
      ...event,
      id,
      created_at: new Date(),
    };
    this.deploymentEvents.set(id, newEvent);
    return newEvent;
  }

  // Monitoring Alerts
  async getMonitoringAlerts(isResolved?: boolean): Promise<MonitoringAlert[]> {
    const alerts = Array.from(this.monitoringAlerts.values());
    return isResolved !== undefined ? alerts.filter(a => a.is_resolved === isResolved) : alerts;
  }

  async createMonitoringAlert(alert: InsertMonitoringAlert): Promise<MonitoringAlert> {
    const id = this.currentMonitoringAlertId++;
    const newAlert: MonitoringAlert = {
      ...alert,
      id,
      created_at: new Date(),
      resolved_at: null,
    };
    this.monitoringAlerts.set(id, newAlert);
    return newAlert;
  }

  async resolveMonitoringAlert(id: number): Promise<MonitoringAlert | undefined> {
    const alert = this.monitoringAlerts.get(id);
    if (alert) {
      alert.is_resolved = true;
      alert.resolved_at = new Date();
      this.monitoringAlerts.set(id, alert);
    }
    return alert;
  }
}

export const storage = new MemStorage();
