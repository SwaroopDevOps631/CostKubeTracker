import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClusterSchema, 
  insertNamespaceSchema, 
  insertWorkloadSchema, 
  insertCostMetricSchema,
  insertAlertSchema,
  insertOptimizationRecommendationSchema,
  DashboardFilters 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Clusters
  app.get("/api/clusters", async (req, res) => {
    try {
      const clusters = await storage.getClusters();
      res.json(clusters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clusters" });
    }
  });

  app.get("/api/clusters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cluster = await storage.getCluster(id);
      if (!cluster) {
        return res.status(404).json({ message: "Cluster not found" });
      }
      res.json(cluster);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cluster" });
    }
  });

  app.post("/api/clusters", async (req, res) => {
    try {
      const validatedData = insertClusterSchema.parse(req.body);
      const cluster = await storage.createCluster(validatedData);
      res.status(201).json(cluster);
    } catch (error) {
      res.status(400).json({ message: "Invalid cluster data" });
    }
  });

  // Namespaces
  app.get("/api/namespaces", async (req, res) => {
    try {
      const clusterId = req.query.clusterId ? parseInt(req.query.clusterId as string) : undefined;
      const namespaces = await storage.getNamespaces(clusterId);
      res.json(namespaces);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch namespaces" });
    }
  });

  app.post("/api/namespaces", async (req, res) => {
    try {
      const validatedData = insertNamespaceSchema.parse(req.body);
      const namespace = await storage.createNamespace(validatedData);
      res.status(201).json(namespace);
    } catch (error) {
      res.status(400).json({ message: "Invalid namespace data" });
    }
  });

  // Workloads
  app.get("/api/workloads", async (req, res) => {
    try {
      const namespaceId = req.query.namespaceId ? parseInt(req.query.namespaceId as string) : undefined;
      const workloads = await storage.getWorkloads(namespaceId);
      res.json(workloads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workloads" });
    }
  });

  app.post("/api/workloads", async (req, res) => {
    try {
      const validatedData = insertWorkloadSchema.parse(req.body);
      const workload = await storage.createWorkload(validatedData);
      res.status(201).json(workload);
    } catch (error) {
      res.status(400).json({ message: "Invalid workload data" });
    }
  });

  // Cost Metrics
  app.get("/api/cost-overview", async (req, res) => {
    try {
      const filters: Partial<DashboardFilters> = {
        timeRange: req.query.timeRange as string,
        clusters: req.query.clusters ? (req.query.clusters as string).split(",") : undefined,
        namespaces: req.query.namespaces ? (req.query.namespaces as string).split(",") : undefined,
        workloadTypes: req.query.workloadTypes ? (req.query.workloadTypes as string).split(",") : undefined,
      };
      
      const overview = await storage.getCostOverview(filters);
      res.json(overview);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cost overview" });
    }
  });

  app.get("/api/namespace-costs", async (req, res) => {
    try {
      const filters: Partial<DashboardFilters> = {
        timeRange: req.query.timeRange as string,
        clusters: req.query.clusters ? (req.query.clusters as string).split(",") : undefined,
        namespaces: req.query.namespaces ? (req.query.namespaces as string).split(",") : undefined,
        workloadTypes: req.query.workloadTypes ? (req.query.workloadTypes as string).split(",") : undefined,
      };
      
      const namespaceCosts = await storage.getNamespaceCosts(filters);
      res.json(namespaceCosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch namespace costs" });
    }
  });

  app.get("/api/cost-trend", async (req, res) => {
    try {
      const filters: Partial<DashboardFilters> = {
        timeRange: req.query.timeRange as string,
        clusters: req.query.clusters ? (req.query.clusters as string).split(",") : undefined,
        namespaces: req.query.namespaces ? (req.query.namespaces as string).split(",") : undefined,
        workloadTypes: req.query.workloadTypes ? (req.query.workloadTypes as string).split(",") : undefined,
      };
      
      const costTrend = await storage.getCostTrend(filters);
      res.json(costTrend);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cost trend" });
    }
  });

  app.get("/api/workload-costs", async (req, res) => {
    try {
      const filters: Partial<DashboardFilters> = {
        timeRange: req.query.timeRange as string,
        clusters: req.query.clusters ? (req.query.clusters as string).split(",") : undefined,
        namespaces: req.query.namespaces ? (req.query.namespaces as string).split(",") : undefined,
        workloadTypes: req.query.workloadTypes ? (req.query.workloadTypes as string).split(",") : undefined,
      };
      
      const workloadCosts = await storage.getWorkloadCosts(filters);
      res.json(workloadCosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workload costs" });
    }
  });

  app.post("/api/cost-metrics", async (req, res) => {
    try {
      const validatedData = insertCostMetricSchema.parse(req.body);
      const metric = await storage.createCostMetric(validatedData);
      res.status(201).json(metric);
    } catch (error) {
      res.status(400).json({ message: "Invalid cost metric data" });
    }
  });

  // Alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const isResolved = req.query.resolved ? req.query.resolved === "true" : undefined;
      const alerts = await storage.getAlerts(isResolved);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  app.patch("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.resolveAlert(id);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Optimization Recommendations
  app.get("/api/recommendations", async (req, res) => {
    try {
      const workloadId = req.query.workloadId ? parseInt(req.query.workloadId as string) : undefined;
      const recommendations = await storage.getOptimizationRecommendations(workloadId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post("/api/recommendations", async (req, res) => {
    try {
      const validatedData = insertOptimizationRecommendationSchema.parse(req.body);
      const recommendation = await storage.createOptimizationRecommendation(validatedData);
      res.status(201).json(recommendation);
    } catch (error) {
      res.status(400).json({ message: "Invalid recommendation data" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
