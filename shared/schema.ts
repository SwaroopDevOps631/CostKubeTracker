import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
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
