import { MemStorage } from '../storage';
import { InsertCluster, InsertNamespace, InsertWorkload } from '@shared/schema';

describe('MemStorage', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('Clusters', () => {
    test('getClusters should return all clusters', async () => {
      const clusters = await storage.getClusters();
      expect(clusters).toHaveLength(2);
      expect(clusters[0].name).toBe('production-cluster');
      expect(clusters[1].name).toBe('staging-cluster');
    });

    test('getCluster should return a specific cluster', async () => {
      const cluster = await storage.getCluster(1);
      expect(cluster).toBeDefined();
      expect(cluster?.name).toBe('production-cluster');
    });

    test('createCluster should add a new cluster', async () => {
      const newCluster: InsertCluster = {
        name: 'test-cluster',
        region: 'us-east-1',
        status: 'active',
      };

      const created = await storage.createCluster(newCluster);
      expect(created).toBeDefined();
      expect(created.id).toBe(3);
      expect(created.name).toBe('test-cluster');

      const clusters = await storage.getClusters();
      expect(clusters).toHaveLength(3);
    });

    test('createCluster should throw error if name already exists', async () => {
      const newCluster: InsertCluster = {
        name: 'production-cluster', // Already exists
        region: 'us-east-1',
        status: 'active',
      };

      await expect(storage.createCluster(newCluster)).rejects.toThrow();
    });
  });

  describe('Namespaces', () => {
    test('getNamespaces should return all namespaces', async () => {
      const namespaces = await storage.getNamespaces();
      expect(namespaces.length).toBeGreaterThan(0);
    });

    test('getNamespaces with clusterId should filter by cluster', async () => {
      const namespaces = await storage.getNamespaces(1);
      expect(namespaces.length).toBeGreaterThan(0);
      expect(namespaces.every(ns => ns.cluster_id === 1)).toBe(true);
    });

    test('createNamespace should add a new namespace', async () => {
      const newNamespace: InsertNamespace = {
        name: 'test-namespace',
        cluster_id: 1,
        labels: { environment: 'test' },
      };

      const created = await storage.createNamespace(newNamespace);
      expect(created).toBeDefined();
      expect(created.name).toBe('test-namespace');

      const namespaces = await storage.getNamespaces(1);
      expect(namespaces.some(ns => ns.name === 'test-namespace')).toBe(true);
    });
  });

  describe('Workloads', () => {
    test('getWorkloads should return all workloads', async () => {
      const workloads = await storage.getWorkloads();
      expect(workloads.length).toBeGreaterThan(0);
    });

    test('getWorkloads with namespaceId should filter by namespace', async () => {
      const workloads = await storage.getWorkloads(1);
      expect(workloads.length).toBeGreaterThan(0);
      expect(workloads.every(w => w.namespace_id === 1)).toBe(true);
    });

    test('createWorkload should add a new workload', async () => {
      const newWorkload: InsertWorkload = {
        name: 'test-workload',
        namespace_id: 1,
        type: 'Deployment',
        replicas: 3,
        labels: { app: 'test' },
        cpu_request: '250m',
        memory_request: '512Mi',
      };

      const created = await storage.createWorkload(newWorkload);
      expect(created).toBeDefined();
      expect(created.name).toBe('test-workload');

      const workloads = await storage.getWorkloads(1);
      expect(workloads.some(w => w.name === 'test-workload')).toBe(true);
    });
  });

  // Add more tests for other methods as needed
});