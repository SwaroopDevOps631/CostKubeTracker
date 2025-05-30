import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClusterSchema, 
  insertNamespaceSchema, 
  insertWorkloadSchema, 
  insertCostMetricSchema,
  insertAlertSchema,
  insertOptimizationRecommendationSchema,
  insertPodMetricSchema,
  insertDeploymentEventSchema,
  insertMonitoringAlertSchema,
  DashboardFilters 
} from "@shared/schema";
import { AppError } from "./middleware/errorHandler";
import logger from "./logger";
import { ZodError } from "zod";

// Helper function to parse pagination parameters
const getPaginationParams = (req: Request) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

// Helper function to parse filter parameters
const getFilterParams = (req: Request): Partial<DashboardFilters> => {
  return {
    timeRange: req.query.timeRange as string,
    clusters: req.query.clusters ? (req.query.clusters as string).split(",") : undefined,
    namespaces: req.query.namespaces ? (req.query.namespaces as string).split(",") : undefined,
    workloadTypes: req.query.workloadTypes ? (req.query.workloadTypes as string).split(",") : undefined,
  };
};

// Async handler to catch errors in async routes
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    // In a real app, check if user is authenticated
    // For now, we'll just pass through
    next();
  };

  // Clusters
  app.get("/api/clusters", asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req);
    const clusters = await storage.getClusters(limit, offset);
    const total = await storage.getClustersCount();
    
    res.json({
      data: clusters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }));

  app.get("/api/clusters/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid cluster ID", 400);
    }
    
    const cluster = await storage.getCluster(id);
    if (!cluster) {
      throw new AppError("Cluster not found", 404);
    }
    
    res.json(cluster);
  }));

  app.post("/api/clusters", isAuthenticated, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertClusterSchema.parse(req.body);
      const cluster = await storage.createCluster(validatedData);
      
      logger.info(`Cluster created: ${cluster.name}`);
      res.status(201).json(cluster);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      throw error;
    }
  }));

  // Namespaces
  app.get("/api/namespaces", asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req);
    const clusterId = req.query.clusterId ? parseInt(req.query.clusterId as string) : undefined;
    
    const namespaces = await storage.getNamespaces(clusterId, limit, offset);
    const total = await storage.getNamespacesCount(clusterId);
    
    res.json({
      data: namespaces,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }));

  app.post("/api/namespaces", isAuthenticated, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertNamespaceSchema.parse(req.body);
      const namespace = await storage.createNamespace(validatedData);
      
      logger.info(`Namespace created: ${namespace.name}`);
      res.status(201).json(namespace);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      throw error;
    }
  }));

  // Workloads
  app.get("/api/workloads", asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req);
    const namespaceId = req.query.namespaceId ? parseInt(req.query.namespaceId as string) : undefined;
    
    const workloads = await storage.getWorkloads(namespaceId, limit, offset);
    const total = await storage.getWorkloadsCount(namespaceId);
    
    res.json({
      data: workloads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }));

  app.post("/api/workloads", isAuthenticated, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertWorkloadSchema.parse(req.body);
      const workload = await storage.createWorkload(validatedData);
      
      logger.info(`Workload created: ${workload.name}`);
      res.status(201).json(workload);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      throw error;
    }
  }));

  // Cost Metrics
  app.get("/api/cost-overview", asyncHandler(async (req, res) => {
    const filters = getFilterParams(req);
    const overview = await storage.getCostOverview(filters);
    
    // Add cache headers for performance
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.json(overview);
  }));

  app.get("/api/namespace-costs", asyncHandler(async (req, res) => {
    const filters = getFilterParams(req);
    const namespaceCosts = await storage.getNamespaceCosts(filters);
    
    // Add cache headers for performance
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.json(namespaceCosts);
  }));

  app.get("/api/cost-trend", asyncHandler(async (req, res) => {
    const filters = getFilterParams(req);
    const costTrend = await storage.getCostTrend(filters);
    
    // Add cache headers for performance
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.json(costTrend);
  }));

  app.get("/api/workload-costs", asyncHandler(async (req, res) => {
    const filters = getFilterParams(req);
    const { page, limit, offset } = getPaginationParams(req);
    
    const workloadCosts = await storage.getWorkloadCosts(filters, limit, offset);
    const total = await storage.getWorkloadCostsCount(filters);
    
    res.json({
      data: workloadCosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }));

  app.post("/api/cost-metrics", isAuthenticated, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertCostMetricSchema.parse(req.body);
      const metric = await storage.createCostMetric(validatedData);
      
      logger.info(`Cost metric created for date: ${metric.date}`);
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      throw error;
    }
  }));

  // Alerts
  app.get("/api/alerts", asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req);
    const isResolved = req.query.resolved ? req.query.resolved === "true" : undefined;
    
    const alerts = await storage.getAlerts(isResolved, limit, offset);
    const total = await storage.getAlertsCount(isResolved);
    
    res.json({
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }));

  app.post("/api/alerts", isAuthenticated, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      
      logger.info(`Alert created: ${alert.title}`);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      throw error;
    }
  }));

  app.patch("/api/alerts/:id/resolve", isAuthenticated, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid alert ID", 400);
    }
    
    const alert = await storage.resolveAlert(id);
    if (!alert) {
      throw new AppError("Alert not found", 404);
    }
    
    logger.info(`Alert resolved: ${alert.title}`);
    res.json(alert);
  }));

  // Optimization Recommendations
  app.get("/api/recommendations", asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req);
    const workloadId = req.query.workloadId ? parseInt(req.query.workloadId as string) : undefined;
    
    const recommendations = await storage.getOptimizationRecommendations(workloadId, limit, offset);
    const total = await storage.getOptimizationRecommendationsCount(workloadId);
    
    res.json({
      data: recommendations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }));

  app.post("/api/recommendations", isAuthenticated, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertOptimizationRecommendationSchema.parse(req.body);
      const recommendation = await storage.createOptimizationRecommendation(validatedData);
      
      logger.info(`Recommendation created: ${recommendation.title}`);
      res.status(201).json(recommendation);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      throw error;
    }
  }));

  // Monitoring endpoints
  app.get("/api/workload-monitoring", asyncHandler(async (req, res) => {
    const filters = getFilterParams(req);
    const { page, limit, offset } = getPaginationParams(req);
    
    const workloadMonitoring = await storage.getWorkloadMonitoring(filters, limit, offset);
    const total = await storage.getWorkloadMonitoringCount(filters);
    
    res.json({
      data: workloadMonitoring,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }));

  app.get("/api/cluster-monitoring-overview", asyncHandler(async (req, res) => {
    const clusterId = req.query.clusterId ? parseInt(req.query.clusterId as string) : undefined;
    const overview = await storage.getClusterMonitoringOverview(clusterId);
    
    // Add cache headers for performance
    res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
    res.json(overview);
  }));

  app.get("/api/metric-trends", asyncHandler(async (req, res) => {
    const filters = getFilterParams(req);
    const trends = await storage.getMetricTrends(filters);
    
    // Add cache headers for performance
    res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
    res.json(trends);
  }));

  app.get("/api/pod-metrics", asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req);
    const workloadId = req.query.workloadId ? parseInt(req.query.workloadId as string) : undefined;
    const timeRange = req.query.timeRange as string;
    
    const metrics = await storage.getPodMetrics(workloadId, timeRange, limit, offset);
    const total = await storage.getPodMetricsCount(workloadId, timeRange);
    
    res.json({
      data: metrics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }));

  app.get("/api/deployment-events", asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req);
    const workloadId = req.query.workloadId ? parseInt(req.query.workloadId as string) : undefined;
    
    const events = await storage.getDeploymentEvents(workloadId, limit, offset);
    const total = await storage.getDeploymentEventsCount(workloadId);
    
    res.json({
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }));

  app.get("/api/monitoring-alerts", asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req);
    const isResolved = req.query.resolved ? req.query.resolved === "true" : undefined;
    
    const alerts = await storage.getMonitoringAlerts(isResolved, limit, offset);
    const total = await storage.getMonitoringAlertsCount(isResolved);
    
    res.json({
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }));

  app.post("/api/monitoring-alerts", isAuthenticated, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertMonitoringAlertSchema.parse(req.body);
      const alert = await storage.createMonitoringAlert(validatedData);
      
      logger.info(`Monitoring alert created: ${alert.title}`);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      throw error;
    }
  }));

  app.patch("/api/monitoring-alerts/:id/resolve", isAuthenticated, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid monitoring alert ID", 400);
    }
    
    const alert = await storage.resolveMonitoringAlert(id);
    if (!alert) {
      throw new AppError("Monitoring alert not found", 404);
    }
    
    logger.info(`Monitoring alert resolved: ${alert.title}`);
    res.json(alert);
  }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    // Check database connection
    try {
      // Simple check to see if we can connect to the database
      const dbStatus = storage.isHealthy() ? "connected" : "disconnected";
      
      res.json({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        services: {
          api: "healthy",
          database: dbStatus
        }
      });
    } catch (error) {
      logger.error("Health check failed", error);
      res.status(500).json({ 
        status: "unhealthy", 
        timestamp: new Date().toISOString(),
        services: {
          api: "healthy",
          database: "disconnected"
        }
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
