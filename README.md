# CostKubeTracker

A Kubernetes cost monitoring application that tracks and visualizes costs across clusters, namespaces, and workloads.

## Features

- Track and visualize Kubernetes costs across clusters, namespaces, and workloads
- Monitor pod metrics and performance
- Get optimization recommendations to reduce costs
- Set up alerts for cost spikes and performance issues
- View deployment events and monitor cluster health

## Tech Stack

- **Frontend**: React, TailwindCSS, Recharts, React Query
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js
- **Containerization**: Docker, Docker Compose

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker and Docker Compose (for containerized deployment)

## Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/costkubetracker.git
   cd costkubetracker
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database
   ```bash
   npm run db:push
   ```

5. Seed the database with sample data
   ```bash
   npm run seed
   ```

6. Start the development server
   ```bash
   npm run dev
   ```

## Production Deployment

### Using Docker

1. Build and run with Docker Compose
   ```bash
   npm run docker:up
   ```

2. To stop the containers
   ```bash
   npm run docker:down
   ```

### Manual Deployment

1. Build the application
   ```bash
   npm run build
   ```

2. Start the production server
   ```bash
   npm start
   ```

## API Documentation

### Clusters

- `GET /api/clusters` - Get all clusters
- `GET /api/clusters/:id` - Get a specific cluster
- `POST /api/clusters` - Create a new cluster

### Namespaces

- `GET /api/namespaces` - Get all namespaces
- `POST /api/namespaces` - Create a new namespace

### Workloads

- `GET /api/workloads` - Get all workloads
- `POST /api/workloads` - Create a new workload

### Cost Metrics

- `GET /api/cost-overview` - Get cost overview metrics
- `GET /api/namespace-costs` - Get costs by namespace
- `GET /api/cost-trend` - Get cost trend data
- `GET /api/workload-costs` - Get costs by workload
- `POST /api/cost-metrics` - Create a new cost metric

### Alerts

- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create a new alert
- `PATCH /api/alerts/:id/resolve` - Resolve an alert

### Optimization Recommendations

- `GET /api/recommendations` - Get all recommendations
- `POST /api/recommendations` - Create a new recommendation

### Monitoring

- `GET /api/workload-monitoring` - Get workload monitoring data
- `GET /api/cluster-monitoring-overview` - Get cluster monitoring overview
- `GET /api/metric-trends` - Get metric trend data
- `GET /api/pod-metrics` - Get pod metrics
- `GET /api/deployment-events` - Get deployment events
- `GET /api/monitoring-alerts` - Get monitoring alerts
- `POST /api/monitoring-alerts` - Create a new monitoring alert
- `PATCH /api/monitoring-alerts/:id/resolve` - Resolve a monitoring alert

## License

MIT