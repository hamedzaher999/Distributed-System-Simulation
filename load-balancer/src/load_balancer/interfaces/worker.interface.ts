export interface WorkerInfo {
  name: string;
  port: number;
  weight: number;
  cpuCores: number;
  memoryGB: number;
  cpuUsage: number;
  memoryUsage: number;
}

export interface WorkerMetrics {
  activeConnections: number;

  totalRequests: number;
  failedRequests: number;

  lastResponseTime: number;

  isHealthy: boolean;
  isDestroyed: boolean;

  lastHealthCheck: number;

  computedWeight: number;

  currentLoadRatio: number;

  smoothedLatency: number;

  adaptiveScore: number;
  resourceScore: number;
  healthScore: number;

  circuitState: 'closed' | 'open' | 'half-open';

  circuitFailures: number;

  circuitOpenedAt: number;
}

export const initialWorkerMetrics: WorkerMetrics = {
  activeConnections: 0,
  totalRequests: 0,
  failedRequests: 0,

  isHealthy: true,
  isDestroyed: false,

  lastResponseTime: 0,
  lastHealthCheck: Date.now(),

  computedWeight: 0,

  currentLoadRatio: 0,

  smoothedLatency: 0,

  adaptiveScore: 0,
  resourceScore: 0,
  healthScore: 0,
  circuitState: 'closed',
  circuitFailures: 0,
  circuitOpenedAt: 0,
};

export type WorkerNode = WorkerInfo & WorkerMetrics;
