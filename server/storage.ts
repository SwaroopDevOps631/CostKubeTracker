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
  // Health check
  isHealthy(): boolean;

  // Clusters
  getClusters(limit?: number, offset?: number): Promise<Cluster[]>;
  getClustersCount(): Promise<number>;
  getCluster(id: number): Promise<Cluster | undefined>;
  createCluster(cluster: InsertCluster): Promise<Cluster>;
  updateCluster(id: number, cluster: Partial<InsertCluster>): Promise<Cluster | undefined>;
  deleteCluster(id: number): Promise<boolean>;

  // Namespaces
  getNamespaces(clusterId?: number, limit?: number, offset?: number): Promise<Namespace[]>;
  getNamespacesCount(clusterId?: number): Promise<number>;
  getNamespace(id: number): Promise<Namespace | undefined>;
  createNamespace(namespace: InsertNamespace): Promise<Namespace>;
  updateNamespace(id: number, namespace: Partial<InsertNamespace>): Promise<Namespace | undefined>;
  deleteNamespace(id: number): Promise<boolean>;

  // Workloads
  getWorkloads(namespaceId?: number, limit?: number, offset?: number): Promise<Workload[]>;
  getWorkloadsCount(namespaceId?: number): Promise<number>;
  getWorkload(id: number): Promise<Workload | undefined>;
  createWorkload(workload: InsertWorkload): Promise<Workload>;
  updateWorkload(id: number, workload: Partial<InsertWorkload>): Promise<Workload | undefined>;
  deleteWorkload(id: number): Promise<boolean>;

  // Cost Metrics
  getCostMetrics(filters: Partial<DashboardFilters>, limit?: number, offset?: number): Promise<CostMetric[]>;
  getCostMetricsCount(filters: Partial<DashboardFilters>): Promise<number>;
  createCostMetric(metric: InsertCostMetric): Promise<CostMetric>;
  getCostOverview(filters: Partial<DashboardFilters>): Promise<CostOverviewMetrics>;
  getNamespaceCosts(filters: Partial<DashboardFilters>): Promise<NamespaceCostData[]>;
  getCostTrend(filters: Partial<DashboardFilters>): Promise<CostTrendData[]>;
  getWorkloadCosts(filters: Partial<DashboardFilters>, limit?: number, offset?: number): Promise<WorkloadCostData[]>;
  getWorkloadCostsCount(filters: Partial<DashboardFilters>): Promise<number>;

  // Alerts
  getAlerts(isResolved?: boolean, limit?: number, offset?: number): Promise<Alert[]>;
  getAlertsCount(isResolved?: boolean): Promise<number>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: number): Promise<Alert | undefined>;
  deleteAlert(id: number): Promise<boolean>;

  // Optimization Recommendations
  getOptimizationRecommendations(workloadId?: number, limit?: number, offset?: number): Promise<OptimizationRecommendation[]>;
  getOptimizationRecommendationsCount(workloadId?: number): Promise<number>;
  createOptimizationRecommendation(recommendation: InsertOptimizationRecommendation): Promise<OptimizationRecommendation>;
  updateRecommendationStatus(id: number, status: string): Promise<OptimizationRecommendation | undefined>;
  deleteRecommendation(id: number): Promise<boolean>;

  // Pod Metrics & Monitoring
  getPodMetrics(workloadId?: number, timeRange?: string, limit?: number, offset?: number): Promise<PodMetric[]>;
  getPodMetricsCount(workloadId?: number, timeRange?: string): Promise<number>;
  createPodMetric(metric: InsertPodMetric): Promise<PodMetric>;
  getWorkloadMonitoring(filters: Partial<DashboardFilters>, limit?: number, offset?: number): Promise<WorkloadMonitoringData[]>;
  getWorkloadMonitoringCount(filters: Partial<DashboardFilters>): Promise<number>;
  getClusterMonitoringOverview(clusterId?: number): Promise<ClusterMonitoringOverview>;
  getMetricTrends(filters: Partial<DashboardFilters>): Promise<MetricTrendData[]>;

  // Deployment Events
  getDeploymentEvents(workloadId?: number, limit?: number, offset?: number): Promise<DeploymentEvent[]>;
  getDeploymentEventsCount(workloadId?: number): Promise<number>;
  createDeploymentEvent(event: InsertDeploymentEvent): Promise<DeploymentEvent>;
  deleteDeploymentEvent(id: number): Promise<boolean>;

  // Monitoring Alerts
  getMonitoringAlerts(isResolved?: boolean, limit?: number, offset?: number): Promise<MonitoringAlert[]>;
  getMonitoringAlertsCount(isResolved?: boolean): Promise<number>;
  createMonitoringAlert(alert: InsertMonitoringAlert): Promise<MonitoringAlert>;
  resolveMonitoringAlert(id: number): Promise<MonitoringAlert | undefined>;
  deleteMonitoringAlert(id: number): Promise<boolean>;
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

  /**
   * Check if the storage is healthy and available
   */
  isHealthy(): boolean {
    return true; // In-memory storage is always healthy
  }

  /**
   * Initialize the storage with sample data
   */
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

  /**
   * Helper method to apply pagination to an array
   */
  private paginate<T>(items: T[], limit?: number, offset?: number): T[] {
    if (limit === undefined && offset === undefined) {
      return items;
    }
    
    const start = offset || 0;
    const end = limit ? start + limit : undefined;
    return items.slice(start, end);
  }

  // Clusters
  async getClusters(limit?: number, offset?: number): Promise<Cluster[]> {
    const clusters = Array.from(this.clusters.values());
    return this.paginate(clusters, limit, offset);
  }

  async getClustersCount(): Promise<number> {
    return this.clusters.size;
  }

  async getCluster(id: number): Promise<Cluster | undefined> {
    return this.clusters.get(id);
  }

  async createCluster(cluster: InsertCluster): Promise<Cluster> {
    // Check if cluster with same name already exists
    const existingCluster = Array.from(this.clusters.values()).find(c => c.name === cluster.name);
    if (existingCluster) {
      throw new Error(`Cluster with name '${cluster.name}' already exists`);
    }
    
    const id = this.currentClusterId++;
    const newCluster: Cluster = {
      ...cluster,
      id,
      created_at: new Date(),
    };
    this.clusters.set(id, newCluster);
    return newCluster;
  }

  async updateCluster(id: number, cluster: Partial<InsertCluster>): Promise<Cluster | undefined> {
    const existingCluster = this.clusters.get(id);
    if (!existingCluster) {
      return undefined;
    }
    
    // Check if name is being changed and if it conflicts
    if (cluster.name && cluster.name !== existingCluster.name) {
      const nameExists = Array.from(this.clusters.values()).some(c => c.id !== id && c.name === cluster.name);
      if (nameExists) {
        throw new Error(`Cluster with name '${cluster.name}' already exists`);
      }
    }
    
    const updatedCluster: Cluster = {
      ...existingCluster,
      ...cluster,
    };
    
    this.clusters.set(id, updatedCluster);
    return updatedCluster;
  }

  async deleteCluster(id: number): Promise<boolean> {
    // Check if there are namespaces associated with this cluster
    const hasNamespaces = Array.from(this.namespaces.values()).some(ns => ns.cluster_id === id);
    if (hasNamespaces) {
      throw new Error('Cannot delete cluster with associated namespaces');
    }
    
    return this.clusters.delete(id);
  }

  // Namespaces
  async getNamespaces(clusterId?: number, limit?: number, offset?: number): Promise<Namespace[]> {
    const namespaces = Array.from(this.namespaces.values());
    const filtered = clusterId ? namespaces.filter(ns => ns.cluster_id === clusterId) : namespaces;
    return this.paginate(filtered, limit, offset);
  }

  async getNamespacesCount(clusterId?: number): Promise<number> {
    if (clusterId) {
      return Array.from(this.namespaces.values()).filter(ns => ns.cluster_id === clusterId).length;
    }
    return this.namespaces.size;
  }

  async getNamespace(id: number): Promise<Namespace | undefined> {
    return this.namespaces.get(id);
  }

  async createNamespace(namespace: InsertNamespace): Promise<Namespace> {
    // Check if cluster exists
    const cluster = this.clusters.get(namespace.cluster_id);
    if (!cluster) {
      throw new Error(`Cluster with ID ${namespace.cluster_id} does not exist`);
    }
    
    // Check if namespace with same name already exists in the cluster
    const existingNamespace = Array.from(this.namespaces.values()).find(
      ns => ns.cluster_id === namespace.cluster_id && ns.name === namespace.name
    );
    if (existingNamespace) {
      throw new Error(`Namespace with name '${namespace.name}' already exists in cluster '${cluster.name}'`);
    }
    
    const id = this.currentNamespaceId++;
    const newNamespace: Namespace = {
      ...namespace,
      id,
      created_at: new Date(),
    };
    this.namespaces.set(id, newNamespace);
    return newNamespace;
  }

  async updateNamespace(id: number, namespace: Partial<InsertNamespace>): Promise<Namespace | undefined> {
    const existingNamespace = this.namespaces.get(id);
    if (!existingNamespace) {
      return undefined;
    }
    
    // If cluster_id is being changed, check if the new cluster exists
    if (namespace.cluster_id && namespace.cluster_id !== existingNamespace.cluster_id) {
      const newCluster = this.clusters.get(namespace.cluster_id);
      if (!newCluster) {
        throw new Error(`Cluster with ID ${namespace.cluster_id} does not exist`);
      }
    }
    
    // If name is being changed, check for conflicts
    if (namespace.name && namespace.name !== existingNamespace.name) {
      const clusterId = namespace.cluster_id || existingNamespace.cluster_id;
      const nameExists = Array.from(this.namespaces.values()).some(
        ns => ns.id !== id && ns.cluster_id === clusterId && ns.name === namespace.name
      );
      if (nameExists) {
        throw new Error(`Namespace with name '${namespace.name}' already exists in this cluster`);
      }
    }
    
    const updatedNamespace: Namespace = {
      ...existingNamespace,
      ...namespace,
    };
    
    this.namespaces.set(id, updatedNamespace);
    return updatedNamespace;
  }

  async deleteNamespace(id: number): Promise<boolean> {
    // Check if there are workloads associated with this namespace
    const hasWorkloads = Array.from(this.workloads.values()).some(w => w.namespace_id === id);
    if (hasWorkloads) {
      throw new Error('Cannot delete namespace with associated workloads');
    }
    
    return this.namespaces.delete(id);
  }

  // Workloads
  async getWorkloads(namespaceId?: number, limit?: number, offset?: number): Promise<Workload[]> {
    const workloads = Array.from(this.workloads.values());
    const filtered = namespaceId ? workloads.filter(w => w.namespace_id === namespaceId) : workloads;
    return this.paginate(filtered, limit, offset);
  }

  async getWorkloadsCount(namespaceId?: number): Promise<number> {
    if (namespaceId) {
      return Array.from(this.workloads.values()).filter(w => w.namespace_id === namespaceId).length;
    }
    return this.workloads.size;
  }

  async getWorkload(id: number): Promise<Workload | undefined> {
    return this.workloads.get(id);
  }

  async createWorkload(workload: InsertWorkload): Promise<Workload> {
    // Check if namespace exists
    const namespace = this.namespaces.get(workload.namespace_id);
    if (!namespace) {
      throw new Error(`Namespace with ID ${workload.namespace_id} does not exist`);
    }
    
    // Check if workload with same name already exists in the namespace
    const existingWorkload = Array.from(this.workloads.values()).find(
      w => w.namespace_id === workload.namespace_id && w.name === workload.name
    );
    if (existingWorkload) {
      throw new Error(`Workload with name '${workload.name}' already exists in namespace '${namespace.name}'`);
    }
    
    const id = this.currentWorkloadId++;
    const newWorkload: Workload = {
      ...workload,
      id,
      created_at: new Date(),
    };
    this.workloads.set(id, newWorkload);
    return newWorkload;
  }

  async updateWorkload(id: number, workload: Partial<InsertWorkload>): Promise<Workload | undefined> {
    const existingWorkload = this.workloads.get(id);
    if (!existingWorkload) {
      return undefined;
    }
    
    // If namespace_id is being changed, check if the new namespace exists
    if (workload.namespace_id && workload.namespace_id !== existingWorkload.namespace_id) {
      const newNamespace = this.namespaces.get(workload.namespace_id);
      if (!newNamespace) {
        throw new Error(`Namespace with ID ${workload.namespace_id} does not exist`);
      }
    }
    
    // If name is being changed, check for conflicts
    if (workload.name && workload.name !== existingWorkload.name) {
      const namespaceId = workload.namespace_id || existingWorkload.namespace_id;
      const nameExists = Array.from(this.workloads.values()).some(
        w => w.id !== id && w.namespace_id === namespaceId && w.name === workload.name
      );
      if (nameExists) {
        throw new Error(`Workload with name '${workload.name}' already exists in this namespace`);
      }
    }
    
    const updatedWorkload: Workload = {
      ...existingWorkload,
      ...workload,
    };
    
    this.workloads.set(id, updatedWorkload);
    return updatedWorkload;
  }

  async deleteWorkload(id: number): Promise<boolean> {
    // Check if there are cost metrics, alerts, or recommendations associated with this workload
    const hasCostMetrics = Array.from(this.costMetrics.values()).some(cm => cm.workload_id === id);
    const hasAlerts = Array.from(this.alerts.values()).some(a => a.workload_id === id);
    const hasRecommendations = Array.from(this.optimizationRecommendations.values()).some(r => r.workload_id === id);
    
    if (hasCostMetrics || hasAlerts || hasRecommendations) {
      throw new Error('Cannot delete workload with associated metrics, alerts, or recommendations');
    }
    
    return this.workloads.delete(id);
  }

  // Cost Metrics
  async getCostMetrics(filters: Partial<DashboardFilters>, limit?: number, offset?: number): Promise<CostMetric[]> {
    const metrics = Array.from(this.costMetrics.values());
    return this.paginate(metrics, limit, offset);
  }

  async getCostMetricsCount(filters: Partial<DashboardFilters>): Promise<number> {
    return this.costMetrics.size;
  }

  async createCostMetric(metric: InsertCostMetric): Promise<CostMetric> {
    // Validate references if provided
    if (metric.cluster_id && !this.clusters.has(metric.cluster_id)) {
      throw new Error(`Cluster with ID ${metric.cluster_id} does not exist`);
    }
    
    if (metric.namespace_id && !this.namespaces.has(metric.namespace_id)) {
      throw new Error(`Namespace with ID ${metric.namespace_id} does not exist`);
    }
    
    if (metric.workload_id && !this.workloads.has(metric.workload_id)) {
      throw new Error(`Workload with ID ${metric.workload_id} does not exist`);
    }
    
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

  async getWorkloadCosts(filters: Partial<DashboardFilters>, limit?: number, offset?: number): Promise<WorkloadCostData[]> {
    const workloads = Array.from(this.workloads.values());
    const namespaces = Array.from(this.namespaces.values());
    const clusters = Array.from(this.clusters.values());

    // Apply filters if provided
    let filteredWorkloads = workloads;
    
    if (filters.clusters && filters.clusters.length > 0) {
      const clusterNames = filters.clusters;
      const clusterIds = clusters
        .filter(c => clusterNames.includes(c.name))
        .map(c => c.id);
      
      const namespaceIds = namespaces
        .filter(ns => clusterIds.includes(ns.cluster_id))
        .map(ns => ns.id);
      
      filteredWorkloads = filteredWorkloads.filter(w => namespaceIds.includes(w.namespace_id));
    }
    
    if (filters.namespaces && filters.namespaces.length > 0) {
      const namespaceNames = filters.namespaces;
      const namespaceIds = namespaces
        .filter(ns => namespaceNames.includes(ns.name))
        .map(ns => ns.id);
      
      filteredWorkloads = filteredWorkloads.filter(w => namespaceIds.includes(w.namespace_id));
    }
    
    if (filters.workloadTypes && filters.workloadTypes.length > 0) {
      filteredWorkloads = filteredWorkloads.filter(w => filters.workloadTypes!.includes(w.type));
    }

    // Map workloads to cost data
    const workloadCosts = filteredWorkloads.map(workload => {
      const namespace = namespaces.find(ns => ns.id === workload.namespace_id);
      const cluster = namespace ? clusters.find(c => c.id === namespace.cluster_id) : undefined;
      
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

    return this.paginate(workloadCosts, limit, offset);
  }

  async getWorkloadCostsCount(filters: Partial<DashboardFilters>): Promise<number> {
    // This would normally filter based on the filters, but for simplicity we'll just return the workload count
    return this.workloads.size;
  }

  // Alerts
  async getAlerts(isResolved?: boolean, limit?: number, offset?: number): Promise<Alert[]> {
    const alerts = Array.from(this.alerts.values());
    const filtered = isResolved !== undefined ? alerts.filter(a => a.is_resolved === isResolved) : alerts;
    return this.paginate(filtered, limit, offset);
  }

  async getAlertsCount(isResolved?: boolean): Promise<number> {
    if (isResolved !== undefined) {
      return Array.from(this.alerts.values()).filter(a => a.is_resolved === isResolved).length;
    }
    return this.alerts.size;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    // Validate references if provided
    if (alert.cluster_id && !this.clusters.has(alert.cluster_id)) {
      throw new Error(`Cluster with ID ${alert.cluster_id} does not exist`);
    }
    
    if (alert.namespace_id && !this.namespaces.has(alert.namespace_id)) {
      throw new Error(`Namespace with ID ${alert.namespace_id} does not exist`);
    }
    
    if (alert.workload_id && !this.workloads.has(alert.workload_id)) {
      throw new Error(`Workload with ID ${alert.workload_id} does not exist`);
    }
    
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

  async deleteAlert(id: number): Promise<boolean> {
    return this.alerts.delete(id);
  }

  // Optimization Recommendations
  async getOptimizationRecommendations(workloadId?: number, limit?: number, offset?: number): Promise<OptimizationRecommendation[]> {
    const recommendations = Array.from(this.optimizationRecommendations.values());
    const filtered = workloadId ? recommendations.filter(r => r.workload_id === workloadId) : recommendations;
    return this.paginate(filtered, limit, offset);
  }

  async getOptimizationRecommendationsCount(workloadId?: number): Promise<number> {
    if (workloadId) {
      return Array.from(this.optimizationRecommendations.values()).filter(r => r.workload_id === workloadId).length;
    }
    return this.optimizationRecommendations.size;
  }

  async createOptimizationRecommendation(recommendation: InsertOptimizationRecommendation): Promise<OptimizationRecommendation> {
    // Validate workload reference
    if (!this.workloads.has(recommendation.workload_id)) {
      throw new Error(`Workload with ID ${recommendation.workload_id} does not exist`);
    }
    
    const id = this.currentRecommendationId++;
    const newRecommendation: OptimizationRecommendation = {
      ...recommendation,
      id,
      created_at: new Date(),
    };
    this.optimizationRecommendations.set(id, newRecommendation);
    return newRecommendation;
  }

  async updateRecommendationStatus(id: number, status: string): Promise<OptimizationRecommendation | undefined> {
    const recommendation = this.optimizationRecommendations.get(id);
    if (!recommendation) {
      return undefined;
    }
    
    if (!['pending', 'applied', 'dismissed'].includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: pending, applied, dismissed`);
    }
    
    recommendation.status = status;
    this.optimizationRecommendations.set(id, recommendation);
    return recommendation;
  }

  async deleteRecommendation(id: number): Promise<boolean> {
    return this.optimizationRecommendations.delete(id);
  }

  // Monitoring Alerts
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
  async getPodMetrics(workloadId?: number, timeRange?: string, limit?: number, offset?: number): Promise<PodMetric[]> {
    const metrics = Array.from(this.podMetrics.values());
    const filtered = workloadId ? metrics.filter(m => m.workload_id === workloadId) : metrics;
    return this.paginate(filtered, limit, offset);
  }

  async getPodMetricsCount(workloadId?: number, timeRange?: string): Promise<number> {
    if (workloadId) {
      return Array.from(this.podMetrics.values()).filter(m => m.workload_id === workloadId).length;
    }
    return this.podMetrics.size;
  }

  async createPodMetric(metric: InsertPodMetric): Promise<PodMetric> {
    // Validate workload reference
    if (!this.workloads.has(metric.workload_id)) {
      throw new Error(`Workload with ID ${metric.workload_id} does not exist`);
    }
    
    const id = this.currentPodMetricId++;
    const newMetric: PodMetric = {
      ...metric,
      id,
      created_at: new Date(),
    };
    this.podMetrics.set(id, newMetric);
    return newMetric;
  }

  async getWorkloadMonitoring(filters: Partial<DashboardFilters>, limit?: number, offset?: number): Promise<WorkloadMonitoringData[]> {
    // Generate sample monitoring data based on workloads
    const workloads = Array.from(this.workloads.values());
    const namespaces = Array.from(this.namespaces.values());
    const clusters = Array.from(this.clusters.values());
    
    // Apply filters if provided
    let filteredWorkloads = workloads;
    
    if (filters.clusters && filters.clusters.length > 0) {
      const clusterNames = filters.clusters;
      const clusterIds = clusters
        .filter(c => clusterNames.includes(c.name))
        .map(c => c.id);
      
      const namespaceIds = namespaces
        .filter(ns => clusterIds.includes(ns.cluster_id))
        .map(ns => ns.id);
      
      filteredWorkloads = filteredWorkloads.filter(w => namespaceIds.includes(w.namespace_id));
    }
    
    if (filters.namespaces && filters.namespaces.length > 0) {
      const namespaceNames = filters.namespaces;
      const namespaceIds = namespaces
        .filter(ns => namespaceNames.includes(ns.name))
        .map(ns => ns.id);
      
      filteredWorkloads = filteredWorkloads.filter(w => namespaceIds.includes(w.namespace_id));
    }
    
    if (filters.workloadTypes && filters.workloadTypes.length > 0) {
      filteredWorkloads = filteredWorkloads.filter(w => filters.workloadTypes!.includes(w.type));
    }
    
    // Map workloads to monitoring data
    const monitoringData = filteredWorkloads.map(workload => {
      const namespace = namespaces.find(ns => ns.id === workload.namespace_id);
      const cluster = namespace ? clusters.find(c => c.id === namespace.cluster_id) : undefined;
      
      // Generate random pod health data
      const pods: PodHealthData[] = Array.from({ length: workload.replicas }, (_, i) => {
        const podName = `${workload.name}-${i}`;
        const cpuUtilization = Math.floor(Math.random() * 80) + 10; // 10-90%
        const memoryUtilization = Math.floor(Math.random() * 70) + 20; // 20-90%
        
        return {
          podName,
          status: Math.random() > 0.9 ? 'Warning' : 'Running',
          restartCount: Math.floor(Math.random() * 3),
          cpuUsage: cpuUtilization * 10, // millicores
          memoryUsage: memoryUtilization * 10, // MB
          cpuLimit: 1000, // 1 core
          memoryLimit: 1024, // 1 GB
          cpuUtilization,
          memoryUtilization,
          networkRxBytes: Math.floor(Math.random() * 10000),
          networkTxBytes: Math.floor(Math.random() * 5000),
          uptime: Math.floor(Math.random() * 86400), // seconds
        };
      });
      
      // Calculate averages
      const avgCpuUsage = pods.reduce((sum, pod) => sum + pod.cpuUtilization, 0) / pods.length;
      const avgMemoryUsage = pods.reduce((sum, pod) => sum + pod.memoryUtilization, 0) / pods.length;
      const totalRestarts = pods.reduce((sum, pod) => sum + pod.restartCount, 0);
      
      return {
        id: workload.id,
        name: workload.name,
        namespace: namespace?.name || "unknown",
        type: workload.type,
        cluster: cluster?.name || "unknown",
        replicas: workload.replicas,
        readyReplicas: Math.min(workload.replicas, workload.replicas - Math.floor(Math.random() * 2)),
        availableReplicas: Math.min(workload.replicas, workload.replicas - Math.floor(Math.random() * 3)),
        avgCpuUsage,
        avgMemoryUsage,
        totalRestarts,
        status: totalRestarts > 5 ? 'Warning' : 'Healthy',
        pods,
      };
    });
    
    return this.paginate(monitoringData, limit, offset);
  }

  async getWorkloadMonitoringCount(filters: Partial<DashboardFilters>): Promise<number> {
    // This would normally filter based on the filters, but for simplicity we'll just return the workload count
    return this.workloads.size;
  }

  async getClusterMonitoringOverview(clusterId?: number): Promise<ClusterMonitoringOverview> {
    // Generate sample cluster monitoring data
    const totalPods = Array.from(this.workloads.values())
      .reduce((sum, workload) => sum + workload.replicas, 0);
    
    // If clusterId is provided, filter by cluster
    let filteredWorkloads = Array.from(this.workloads.values());
    
    if (clusterId) {
      const namespaceIds = Array.from(this.namespaces.values())
        .filter(ns => ns.cluster_id === clusterId)
        .map(ns => ns.id);
      
      filteredWorkloads = filteredWorkloads.filter(w => namespaceIds.includes(w.namespace_id));
    }
    
    const clusterPods = filteredWorkloads.reduce((sum, workload) => sum + workload.replicas, 0);
    
    // Generate random monitoring data
    const runningPods = Math.floor(clusterPods * 0.95); // 95% running
    const pendingPods = Math.floor(clusterPods * 0.03); // 3% pending
    const failedPods = clusterPods - runningPods - pendingPods; // 2% failed
    
    const totalCpuCapacity = clusterPods * 1000; // 1 core per pod
    const totalMemoryCapacity = clusterPods * 1024; // 1 GB per pod
    
    const totalCpuUsage = Math.floor(totalCpuCapacity * 0.65); // 65% usage
    const totalMemoryUsage = Math.floor(totalMemoryCapacity * 0.7); // 70% usage
    
    const clusterUtilization = (totalCpuUsage / totalCpuCapacity + totalMemoryUsage / totalMemoryCapacity) / 2;
    
    return {
      totalPods: clusterPods,
      runningPods,
      pendingPods,
      failedPods,
      totalCpuUsage,
      totalMemoryUsage,
      totalCpuCapacity,
      totalMemoryCapacity,
      clusterUtilization,
      totalRestarts: Math.floor(clusterPods * 0.1), // 10% of pods have restarted
      activeAlerts: this.monitoringAlerts.size,
    };
  }

  async getMetricTrends(filters: Partial<DashboardFilters>): Promise<MetricTrendData[]> {
    // Generate sample metric trends for the last 24 hours
    const now = new Date();
    const trends: MetricTrendData[] = [];
    
    // Generate 24 hourly data points
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      
      // Generate random metrics with a realistic pattern
      const timeOfDay = timestamp.getHours();
      const isBusinessHours = timeOfDay >= 9 && timeOfDay <= 17;
      
      // Higher usage during business hours
      const usageMultiplier = isBusinessHours ? 0.7 + (Math.random() * 0.3) : 0.3 + (Math.random() * 0.3);
      
      // Pod count increases during the day
      const podCountBase = isBusinessHours ? 50 : 30;
      const podCount = podCountBase + Math.floor(Math.random() * 10);
      
      // Network traffic follows pod count
      const networkBase = isBusinessHours ? 5000 : 2000;
      
      trends.push({
        timestamp: timestamp.toISOString(),
        cpuUsage: Math.floor(usageMultiplier * 100),
        memoryUsage: Math.floor((0.5 + usageMultiplier * 0.5) * 100),
        podCount,
        networkRx: networkBase + Math.floor(Math.random() * 1000),
        networkTx: networkBase / 2 + Math.floor(Math.random() * 500),
      });
    }
    
    return trends;
  }

  async getDeploymentEvents(workloadId?: number, limit?: number, offset?: number): Promise<DeploymentEvent[]> {
    const events = Array.from(this.deploymentEvents.values());
    const filtered = workloadId ? events.filter(e => e.workload_id === workloadId) : events;
    
    // Sort by created_at in descending order (newest first)
    const sorted = filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    return this.paginate(sorted, limit, offset);
  }

  async getDeploymentEventsCount(workloadId?: number): Promise<number> {
    if (workloadId) {
      return Array.from(this.deploymentEvents.values()).filter(e => e.workload_id === workloadId).length;
    }
    return this.deploymentEvents.size;
  }

  async createDeploymentEvent(event: InsertDeploymentEvent): Promise<DeploymentEvent> {
    // Validate workload reference
    if (!this.workloads.has(event.workload_id)) {
      throw new Error(`Workload with ID ${event.workload_id} does not exist`);
    }
    
    const id = this.currentDeploymentEventId++;
    const newEvent: DeploymentEvent = {
      ...event,
      id,
      created_at: new Date(),
    };
    this.deploymentEvents.set(id, newEvent);
    return newEvent;
  }

  async deleteDeploymentEvent(id: number): Promise<boolean> {
    return this.deploymentEvents.delete(id);
  }

  async getMonitoringAlerts(isResolved?: boolean, limit?: number, offset?: number): Promise<MonitoringAlert[]> {
    const alerts = Array.from(this.monitoringAlerts.values());
    const filtered = isResolved !== undefined ? alerts.filter(a => a.is_resolved === isResolved) : alerts;
    
    // Sort by created_at in descending order (newest first)
    const sorted = filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    return this.paginate(sorted, limit, offset);
  }

  async getMonitoringAlertsCount(isResolved?: boolean): Promise<number> {
    if (isResolved !== undefined) {
      return Array.from(this.monitoringAlerts.values()).filter(a => a.is_resolved === isResolved).length;
    }
    return this.monitoringAlerts.size;
  }

  async createMonitoringAlert(alert: InsertMonitoringAlert): Promise<MonitoringAlert> {
    // Validate references if provided
    if (alert.cluster_id && !this.clusters.has(alert.cluster_id)) {
      throw new Error(`Cluster with ID ${alert.cluster_id} does not exist`);
    }
    
    if (alert.namespace_id && !this.namespaces.has(alert.namespace_id)) {
      throw new Error(`Namespace with ID ${alert.namespace_id} does not exist`);
    }
    
    if (alert.workload_id && !this.workloads.has(alert.workload_id)) {
      throw new Error(`Workload with ID ${alert.workload_id} does not exist`);
    }
    
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

  async deleteMonitoringAlert(id: number): Promise<boolean> {
    return this.monitoringAlerts.delete(id);
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

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Clusters
  async getClusters(): Promise<Cluster[]> {
    return await db.select().from(clusters);
  }

  async getCluster(id: number): Promise<Cluster | undefined> {
    const [cluster] = await db.select().from(clusters).where(eq(clusters.id, id));
    return cluster || undefined;
  }

  async createCluster(cluster: InsertCluster): Promise<Cluster> {
    const [newCluster] = await db.insert(clusters).values(cluster).returning();
    return newCluster;
  }

  // Namespaces
  async getNamespaces(clusterId?: number): Promise<Namespace[]> {
    if (clusterId) {
      return await db.select().from(namespaces).where(eq(namespaces.cluster_id, clusterId));
    }
    return await db.select().from(namespaces);
  }

  async getNamespace(id: number): Promise<Namespace | undefined> {
    const [namespace] = await db.select().from(namespaces).where(eq(namespaces.id, id));
    return namespace || undefined;
  }

  async createNamespace(namespace: InsertNamespace): Promise<Namespace> {
    const [newNamespace] = await db.insert(namespaces).values(namespace).returning();
    return newNamespace;
  }

  // Workloads
  async getWorkloads(namespaceId?: number): Promise<Workload[]> {
    if (namespaceId) {
      return await db.select().from(workloads).where(eq(workloads.namespace_id, namespaceId));
    }
    return await db.select().from(workloads);
  }

  async getWorkload(id: number): Promise<Workload | undefined> {
    const [workload] = await db.select().from(workloads).where(eq(workloads.id, id));
    return workload || undefined;
  }

  async createWorkload(workload: InsertWorkload): Promise<Workload> {
    const [newWorkload] = await db.insert(workloads).values(workload).returning();
    return newWorkload;
  }

  // Cost Metrics
  async getCostMetrics(filters: Partial<DashboardFilters>): Promise<CostMetric[]> {
    return await db.select().from(costMetrics).orderBy(desc(costMetrics.date));
  }

  async createCostMetric(metric: InsertCostMetric): Promise<CostMetric> {
    const [newMetric] = await db.insert(costMetrics).values(metric).returning();
    return newMetric;
  }

  async getCostOverview(filters: Partial<DashboardFilters>): Promise<CostOverviewMetrics> {
    // Return sample data for now - can be enhanced with real calculations
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
    return [];
  }

  async getCostTrend(filters: Partial<DashboardFilters>): Promise<CostTrendData[]> {
    return [];
  }

  async getWorkloadCosts(filters: Partial<DashboardFilters>): Promise<WorkloadCostData[]> {
    const workloadList = await db.select().from(workloads);
    const namespaceList = await db.select().from(namespaces);
    const clusterList = await db.select().from(clusters);

    return workloadList.map(workload => {
      const namespace = namespaceList.find(ns => ns.id === workload.namespace_id);
      const cluster = clusterList.find(c => c.id === namespace?.cluster_id);
      
      return {
        id: workload.id,
        name: workload.name,
        namespace: namespace?.name || "unknown",
        type: workload.type,
        cluster: cluster?.name || "unknown",
        pods: workload.replicas,
        cost: 0,
        avgCostPerPod: 0,
        trend: 0,
        labels: workload.labels as Record<string, string> || {},
      };
    });
  }

  // Alerts
  async getAlerts(isResolved?: boolean): Promise<Alert[]> {
    let query = db.select().from(alerts);
    if (isResolved !== undefined) {
      query = query.where(eq(alerts.is_resolved, isResolved));
    }
    return await query.orderBy(desc(alerts.created_at));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async resolveAlert(id: number): Promise<Alert | undefined> {
    const [updatedAlert] = await db
      .update(alerts)
      .set({ is_resolved: true, resolved_at: new Date() })
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert || undefined;
  }

  // Optimization Recommendations
  async getOptimizationRecommendations(workloadId?: number): Promise<OptimizationRecommendation[]> {
    let query = db.select().from(optimizationRecommendations);
    if (workloadId) {
      query = query.where(eq(optimizationRecommendations.workload_id, workloadId));
    }
    return await query.orderBy(desc(optimizationRecommendations.created_at));
  }

  async createOptimizationRecommendation(recommendation: InsertOptimizationRecommendation): Promise<OptimizationRecommendation> {
    const [newRecommendation] = await db.insert(optimizationRecommendations).values(recommendation).returning();
    return newRecommendation;
  }

  // Pod Metrics & Monitoring
  async getPodMetrics(workloadId?: number, timeRange?: string): Promise<PodMetric[]> {
    let query = db.select().from(podMetrics);
    if (workloadId) {
      query = query.where(eq(podMetrics.workload_id, workloadId));
    }
    return await query.orderBy(desc(podMetrics.timestamp));
  }

  async createPodMetric(metric: InsertPodMetric): Promise<PodMetric> {
    const [newMetric] = await db.insert(podMetrics).values(metric).returning();
    return newMetric;
  }

  async getWorkloadMonitoring(filters: Partial<DashboardFilters>): Promise<WorkloadMonitoringData[]> {
    const workloadList = await db.select().from(workloads);
    const namespaceList = await db.select().from(namespaces);
    const clusterList = await db.select().from(clusters);

    return workloadList.map(workload => {
      const namespace = namespaceList.find(ns => ns.id === workload.namespace_id);
      const cluster = clusterList.find(c => c.id === namespace?.cluster_id);
      
      // Generate sample pod health data
      const pods: PodHealthData[] = Array.from({ length: workload.replicas }, (_, i) => ({
        podName: `${workload.name}-${Math.random().toString(36).substr(2, 10)}`,
        status: Math.random() > 0.1 ? "Running" : "Pending",
        restartCount: Math.floor(Math.random() * 3),
        cpuUsage: Math.floor(Math.random() * 800 + 200),
        memoryUsage: Math.floor(Math.random() * 1073741824 + 536870912),
        cpuLimit: 1000,
        memoryLimit: 1073741824,
        cpuUtilization: Math.floor(Math.random() * 60 + 20),
        memoryUtilization: Math.floor(Math.random() * 70 + 30),
        networkRxBytes: Math.floor(Math.random() * 1000000),
        networkTxBytes: Math.floor(Math.random() * 1000000),
        uptime: Math.floor(Math.random() * 86400 * 7),
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
    const monitoringAlertsList = await this.getMonitoringAlerts(false);
    
    const totalPods = workloadMonitoring.reduce((sum, w) => sum + w.replicas, 0);
    const runningPods = workloadMonitoring.reduce((sum, w) => sum + w.readyReplicas, 0);
    const pendingPods = totalPods - runningPods;
    const totalRestarts = workloadMonitoring.reduce((sum, w) => sum + w.totalRestarts, 0);
    
    return {
      totalPods,
      runningPods,
      pendingPods,
      failedPods: 0,
      totalCpuUsage: 1200,
      totalMemoryUsage: 8589934592,
      totalCpuCapacity: 4000,
      totalMemoryCapacity: 17179869184,
      clusterUtilization: 75,
      totalRestarts,
      activeAlerts: monitoringAlertsList.length,
    };
  }

  async getMetricTrends(filters: Partial<DashboardFilters>): Promise<MetricTrendData[]> {
    const trends: MetricTrendData[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      trends.push({
        timestamp: timestamp.toISOString(),
        cpuUsage: Math.floor(Math.random() * 30 + 40),
        memoryUsage: Math.floor(Math.random() * 40 + 50),
        podCount: Math.floor(Math.random() * 5 + 20),
        networkRx: Math.floor(Math.random() * 1000000 + 500000),
        networkTx: Math.floor(Math.random() * 800000 + 400000),
      });
    }
    
    return trends;
  }

  // Deployment Events
  async getDeploymentEvents(workloadId?: number, limit = 50): Promise<DeploymentEvent[]> {
    let query = db.select().from(deploymentEvents);
    if (workloadId) {
      query = query.where(eq(deploymentEvents.workload_id, workloadId));
    }
    return await query.orderBy(desc(deploymentEvents.created_at)).limit(limit);
  }

  async createDeploymentEvent(event: InsertDeploymentEvent): Promise<DeploymentEvent> {
    const [newEvent] = await db.insert(deploymentEvents).values(event).returning();
    return newEvent;
  }

  // Monitoring Alerts
  async getMonitoringAlerts(isResolved?: boolean): Promise<MonitoringAlert[]> {
    let query = db.select().from(monitoringAlerts);
    if (isResolved !== undefined) {
      query = query.where(eq(monitoringAlerts.is_resolved, isResolved));
    }
    return await query.orderBy(desc(monitoringAlerts.created_at));
  }

  async createMonitoringAlert(alert: InsertMonitoringAlert): Promise<MonitoringAlert> {
    const [newAlert] = await db.insert(monitoringAlerts).values(alert).returning();
    return newAlert;
  }

  async resolveMonitoringAlert(id: number): Promise<MonitoringAlert | undefined> {
    const [updatedAlert] = await db
      .update(monitoringAlerts)
      .set({ is_resolved: true, resolved_at: new Date() })
      .where(eq(monitoringAlerts.id, id))
      .returning();
    return updatedAlert || undefined;
  }
}

export const storage = new DatabaseStorage();
