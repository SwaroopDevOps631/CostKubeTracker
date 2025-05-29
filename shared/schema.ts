import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clusters = pgTable("clusters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  region: text("region").notNull(),
  status: text("status").notNull().default("active"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const namespaces = pgTable("namespaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cluster_id: integer("cluster_id").notNull(),
  labels: jsonb("labels"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const workloads = pgTable("workloads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  namespace_id: integer("namespace_id").notNull(),
  type: text("type").notNull(), // Deployment, StatefulSet, DaemonSet, Job
  replicas: integer("replicas").notNull().default(1),
  labels: jsonb("labels"),
  cpu_request: decimal("cpu_request"),
  memory_request: decimal("memory_request"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const costMetrics = pgTable("cost_metrics", {
  id: serial("id").primaryKey(),
  cluster_id: integer("cluster_id"),
  namespace_id: integer("namespace_id"),
  workload_id: integer("workload_id"),
  date: timestamp("date").notNull(),
  cost: decimal("cost").notNull(),
  currency: text("currency").notNull().default("USD"),
  cpu_cost: decimal("cpu_cost"),
  memory_cost: decimal("memory_cost"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // cost_spike, optimization, budget_exceeded
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  cluster_id: integer("cluster_id"),
  namespace_id: integer("namespace_id"),
  workload_id: integer("workload_id"),
  threshold_value: decimal("threshold_value"),
  current_value: decimal("current_value"),
  is_resolved: boolean("is_resolved").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  resolved_at: timestamp("resolved_at"),
});

export const optimizationRecommendations = pgTable("optimization_recommendations", {
  id: serial("id").primaryKey(),
  workload_id: integer("workload_id").notNull(),
  type: text("type").notNull(), // right_size, scale_down, schedule, spot_instance
  title: text("title").notNull(),
  description: text("description").notNull(),
  potential_savings: decimal("potential_savings").notNull(),
  risk_level: text("risk_level").notNull().default("low"), // low, medium, high
  status: text("status").notNull().default("pending"), // pending, applied, dismissed
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const podMetrics = pgTable("pod_metrics", {
  id: serial("id").primaryKey(),
  workload_id: integer("workload_id").notNull(),
  pod_name: text("pod_name").notNull(),
  node_name: text("node_name"),
  status: text("status").notNull(), // Running, Pending, Failed, Succeeded, Unknown
  cpu_usage: decimal("cpu_usage"), // millicores
  memory_usage: decimal("memory_usage"), // bytes
  cpu_limit: decimal("cpu_limit"),
  memory_limit: decimal("memory_limit"),
  restart_count: integer("restart_count").notNull().default(0),
  network_rx_bytes: decimal("network_rx_bytes"),
  network_tx_bytes: decimal("network_tx_bytes"),
  last_restart_time: timestamp("last_restart_time"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const deploymentEvents = pgTable("deployment_events", {
  id: serial("id").primaryKey(),
  workload_id: integer("workload_id").notNull(),
  event_type: text("event_type").notNull(), // scale_up, scale_down, deploy, rollback, restart
  message: text("message").notNull(),
  reason: text("reason"),
  involved_object: text("involved_object"), // pod name, replicaset name, etc.
  severity: text("severity").notNull().default("info"), // info, warning, error
  source_component: text("source_component"), // deployment-controller, kubelet, etc.
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const monitoringAlerts = pgTable("monitoring_alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // high_cpu, high_memory, pod_crash_loop, deployment_failed
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  cluster_id: integer("cluster_id"),
  namespace_id: integer("namespace_id"),
  workload_id: integer("workload_id"),
  pod_name: text("pod_name"),
  threshold_value: decimal("threshold_value"),
  current_value: decimal("current_value"),
  metric_name: text("metric_name"), // cpu_usage, memory_usage, restart_count
  is_resolved: boolean("is_resolved").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  resolved_at: timestamp("resolved_at"),
});

// Insert schemas
export const insertClusterSchema = createInsertSchema(clusters).omit({
  id: true,
  created_at: true,
});

export const insertNamespaceSchema = createInsertSchema(namespaces).omit({
  id: true,
  created_at: true,
});

export const insertWorkloadSchema = createInsertSchema(workloads).omit({
  id: true,
  created_at: true,
});

export const insertCostMetricSchema = createInsertSchema(costMetrics).omit({
  id: true,
  created_at: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  created_at: true,
  resolved_at: true,
});

export const insertOptimizationRecommendationSchema = createInsertSchema(optimizationRecommendations).omit({
  id: true,
  created_at: true,
});

export const insertPodMetricSchema = createInsertSchema(podMetrics).omit({
  id: true,
  created_at: true,
});

export const insertDeploymentEventSchema = createInsertSchema(deploymentEvents).omit({
  id: true,
  created_at: true,
});

export const insertMonitoringAlertSchema = createInsertSchema(monitoringAlerts).omit({
  id: true,
  created_at: true,
  resolved_at: true,
});

// Relations
export const clustersRelations = relations(clusters, ({ many }) => ({
  namespaces: many(namespaces),
  costMetrics: many(costMetrics),
  alerts: many(alerts),
  monitoringAlerts: many(monitoringAlerts),
}));

export const namespacesRelations = relations(namespaces, ({ one, many }) => ({
  cluster: one(clusters, {
    fields: [namespaces.cluster_id],
    references: [clusters.id],
  }),
  workloads: many(workloads),
  costMetrics: many(costMetrics),
  alerts: many(alerts),
  monitoringAlerts: many(monitoringAlerts),
}));

export const workloadsRelations = relations(workloads, ({ one, many }) => ({
  namespace: one(namespaces, {
    fields: [workloads.namespace_id],
    references: [namespaces.id],
  }),
  costMetrics: many(costMetrics),
  alerts: many(alerts),
  optimizationRecommendations: many(optimizationRecommendations),
  podMetrics: many(podMetrics),
  deploymentEvents: many(deploymentEvents),
  monitoringAlerts: many(monitoringAlerts),
}));

export const costMetricsRelations = relations(costMetrics, ({ one }) => ({
  cluster: one(clusters, {
    fields: [costMetrics.cluster_id],
    references: [clusters.id],
  }),
  namespace: one(namespaces, {
    fields: [costMetrics.namespace_id],
    references: [namespaces.id],
  }),
  workload: one(workloads, {
    fields: [costMetrics.workload_id],
    references: [workloads.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  cluster: one(clusters, {
    fields: [alerts.cluster_id],
    references: [clusters.id],
  }),
  namespace: one(namespaces, {
    fields: [alerts.namespace_id],
    references: [namespaces.id],
  }),
  workload: one(workloads, {
    fields: [alerts.workload_id],
    references: [workloads.id],
  }),
}));

export const optimizationRecommendationsRelations = relations(optimizationRecommendations, ({ one }) => ({
  workload: one(workloads, {
    fields: [optimizationRecommendations.workload_id],
    references: [workloads.id],
  }),
}));

export const podMetricsRelations = relations(podMetrics, ({ one }) => ({
  workload: one(workloads, {
    fields: [podMetrics.workload_id],
    references: [workloads.id],
  }),
}));

export const deploymentEventsRelations = relations(deploymentEvents, ({ one }) => ({
  workload: one(workloads, {
    fields: [deploymentEvents.workload_id],
    references: [workloads.id],
  }),
}));

export const monitoringAlertsRelations = relations(monitoringAlerts, ({ one }) => ({
  cluster: one(clusters, {
    fields: [monitoringAlerts.cluster_id],
    references: [clusters.id],
  }),
  namespace: one(namespaces, {
    fields: [monitoringAlerts.namespace_id],
    references: [namespaces.id],
  }),
  workload: one(workloads, {
    fields: [monitoringAlerts.workload_id],
    references: [workloads.id],
  }),
}));

// Types
export type Cluster = typeof clusters.$inferSelect;
export type InsertCluster = z.infer<typeof insertClusterSchema>;

export type Namespace = typeof namespaces.$inferSelect;
export type InsertNamespace = z.infer<typeof insertNamespaceSchema>;

export type Workload = typeof workloads.$inferSelect;
export type InsertWorkload = z.infer<typeof insertWorkloadSchema>;

export type CostMetric = typeof costMetrics.$inferSelect;
export type InsertCostMetric = z.infer<typeof insertCostMetricSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type OptimizationRecommendation = typeof optimizationRecommendations.$inferSelect;
export type InsertOptimizationRecommendation = z.infer<typeof insertOptimizationRecommendationSchema>;

export type PodMetric = typeof podMetrics.$inferSelect;
export type InsertPodMetric = z.infer<typeof insertPodMetricSchema>;

export type DeploymentEvent = typeof deploymentEvents.$inferSelect;
export type InsertDeploymentEvent = z.infer<typeof insertDeploymentEventSchema>;

export type MonitoringAlert = typeof monitoringAlerts.$inferSelect;
export type InsertMonitoringAlert = z.infer<typeof insertMonitoringAlertSchema>;

// Additional types for API responses
export interface CostOverviewMetrics {
  totalCost: number;
  dailyAverage: number;
  activePods: number;
  costPerPod: number;
  efficiencyScore: number;
  totalChange: number;
  dailyChange: number;
  podsChange: number;
  perPodChange: number;
}

export interface NamespaceCostData {
  namespace: string;
  cost: number;
  percentage: number;
  pods: number;
}

export interface CostTrendData {
  date: string;
  cost: number;
}

export interface WorkloadCostData {
  id: number;
  name: string;
  namespace: string;
  type: string;
  cluster: string;
  pods: number;
  cost: number;
  avgCostPerPod: number;
  trend: number;
  labels?: Record<string, string>;
}

export interface DashboardFilters {
  timeRange: string;
  clusters: string[];
  namespaces: string[];
  workloadTypes: string[];
}

// Additional types for monitoring data
export interface PodHealthData {
  podName: string;
  status: string;
  restartCount: number;
  cpuUsage: number;
  memoryUsage: number;
  cpuLimit: number;
  memoryLimit: number;
  cpuUtilization: number;
  memoryUtilization: number;
  networkRxBytes: number;
  networkTxBytes: number;
  lastRestartTime?: Date;
  uptime: number;
}

export interface WorkloadMonitoringData {
  id: number;
  name: string;
  namespace: string;
  type: string;
  cluster: string;
  replicas: number;
  readyReplicas: number;
  availableReplicas: number;
  avgCpuUsage: number;
  avgMemoryUsage: number;
  totalRestarts: number;
  status: string;
  pods: PodHealthData[];
}

export interface ClusterMonitoringOverview {
  totalPods: number;
  runningPods: number;
  pendingPods: number;
  failedPods: number;
  totalCpuUsage: number;
  totalMemoryUsage: number;
  totalCpuCapacity: number;
  totalMemoryCapacity: number;
  clusterUtilization: number;
  totalRestarts: number;
  activeAlerts: number;
}

export interface MetricTrendData {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  podCount: number;
  networkRx: number;
  networkTx: number;
}
