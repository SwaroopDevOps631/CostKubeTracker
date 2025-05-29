import { 
  Cluster, InsertCluster,
  Namespace, InsertNamespace,
  Workload, InsertWorkload,
  CostMetric, InsertCostMetric,
  Alert, InsertAlert,
  OptimizationRecommendation, InsertOptimizationRecommendation,
  CostOverviewMetrics,
  NamespaceCostData,
  CostTrendData,
  WorkloadCostData,
  DashboardFilters
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
}

export class MemStorage implements IStorage {
  private clusters: Map<number, Cluster> = new Map();
  private namespaces: Map<number, Namespace> = new Map();
  private workloads: Map<number, Workload> = new Map();
  private costMetrics: Map<number, CostMetric> = new Map();
  private alerts: Map<number, Alert> = new Map();
  private optimizationRecommendations: Map<number, OptimizationRecommendation> = new Map();
  
  private currentClusterId = 1;
  private currentNamespaceId = 1;
  private currentWorkloadId = 1;
  private currentCostMetricId = 1;
  private currentAlertId = 1;
  private currentRecommendationId = 1;

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
}

export const storage = new MemStorage();
