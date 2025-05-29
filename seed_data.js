import { db } from './server/db.js';
import { clusters, namespaces, workloads, monitoringAlerts } from './shared/schema.js';

async function seedDatabase() {
  try {
    // Create sample clusters
    const [prodCluster] = await db.insert(clusters).values({
      name: 'production-cluster',
      region: 'us-west-2',
      status: 'active'
    }).returning();

    const [stagingCluster] = await db.insert(clusters).values({
      name: 'staging-cluster', 
      region: 'us-east-1',
      status: 'active'
    }).returning();

    // Create sample namespaces
    const [prodNamespace] = await db.insert(namespaces).values({
      name: 'production',
      cluster_id: prodCluster.id,
      labels: { environment: 'prod' }
    }).returning();

    const [stagingNamespace] = await db.insert(namespaces).values({
      name: 'staging',
      cluster_id: stagingCluster.id,
      labels: { environment: 'staging' }
    }).returning();

    // Create sample workloads
    await db.insert(workloads).values([
      {
        name: 'frontend-app',
        namespace_id: prodNamespace.id,
        type: 'Deployment',
        replicas: 3,
        labels: { app: 'frontend', tier: 'web' },
        cpu_request: '500m',
        memory_request: '1Gi'
      },
      {
        name: 'api-server',
        namespace_id: prodNamespace.id,
        type: 'Deployment', 
        replicas: 2,
        labels: { app: 'api', tier: 'backend' },
        cpu_request: '1000m',
        memory_request: '2Gi'
      },
      {
        name: 'redis-cache',
        namespace_id: prodNamespace.id,
        type: 'StatefulSet',
        replicas: 1,
        labels: { app: 'redis', tier: 'cache' },
        cpu_request: '250m',
        memory_request: '512Mi'
      }
    ]);

    // Create monitoring alerts
    await db.insert(monitoringAlerts).values([
      {
        type: 'high_cpu',
        title: 'High CPU Usage Detected',
        message: 'Frontend app pod is using 85% CPU for the last 10 minutes',
        severity: 'high',
        cluster_id: prodCluster.id,
        namespace_id: prodNamespace.id,
        workload_id: 1,
        pod_name: 'frontend-app-7d4f8b6c9d-abc12',
        threshold_value: '80',
        current_value: '85',
        metric_name: 'cpu_usage',
        is_resolved: false
      },
      {
        type: 'pod_crash_loop',
        title: 'Pod Crash Loop Detected', 
        message: 'Redis cache pod has restarted 5 times in the last hour',
        severity: 'critical',
        cluster_id: prodCluster.id,
        namespace_id: prodNamespace.id,
        workload_id: 3,
        pod_name: 'redis-cache-0',
        threshold_value: '3',
        current_value: '5',
        metric_name: 'restart_count',
        is_resolved: false
      }
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
