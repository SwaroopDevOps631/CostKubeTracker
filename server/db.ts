import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from './config';
import logger from './logger';

neonConfig.webSocketConstructor = ws;

// Configure connection pool
export const pool = new Pool({ 
  connectionString: config.databaseUrl,
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not established
});

// Add event listeners for connection issues
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = drizzle({ client: pool, schema });

// Add graceful shutdown handler
process.on('SIGINT', async () => {
  await pool.end();
  logger.info('Database pool has ended');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  logger.info('Database pool has ended');
  process.exit(0);
});