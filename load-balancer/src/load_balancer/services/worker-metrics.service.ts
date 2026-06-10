import { Injectable } from '@nestjs/common';
import { WorkerNode } from '../interfaces/worker.interface';
import { LoadBalancerGateway } from '../load-balancer.gateway';

@Injectable()
export class WorkerMetricsService {
  private readonly ALPHA = 0.3;
  private readonly TIMEOUT = 3000;
  constructor(private readonly gateway: LoadBalancerGateway) {}
  updateLatency(worker: WorkerNode, ms: number) {
    if (worker.smoothedLatency === 0) {
      worker.smoothedLatency = Math.round(ms);
    } else {
      worker.smoothedLatency = Math.round(
        this.ALPHA * ms + (1 - this.ALPHA) * worker.smoothedLatency,
      );
    }
  }

  penalizeLatency(worker: WorkerNode) {
    worker.smoothedLatency = worker.smoothedLatency * 1.5 + 1500;

    worker.smoothedLatency = Math.round(
      Math.min(worker.smoothedLatency, 10000),
    );
  }

  updateTelemetry(worker: WorkerNode, cpu?: number, memory?: number) {
    if (typeof cpu === 'number') {
      worker.cpuUsage = Math.min(100, Math.max(0, cpu));
    }

    if (typeof memory === 'number') {
      worker.memoryUsage = Math.min(100, Math.max(0, memory));
    }
  }

  calculateAdaptiveScore(worker: WorkerNode): number {
    const successRate =
      (worker.totalRequests - worker.failedRequests) /
      Math.max(worker.totalRequests, 1);

    const errorRate = (1 - successRate) * 100;

    const queueDepth =
      (worker.activeConnections / Math.max(worker.computedWeight, 1)) * 100;

    const latency = Math.min(100, (worker.smoothedLatency || 0) / 20);
    const score =
      errorRate * 0.4 +
      Math.min(100, queueDepth) * 0.3 +
      latency * 0.2 +
      worker.cpuUsage * 0.05 +
      worker.memoryUsage * 0.05;
    worker.adaptiveScore = score;

    return score;
  }

  calculateHealthScore(worker: WorkerNode, duration: number): number {
    worker.lastHealthCheck = Date.now();
    worker.isHealthy = duration < this.TIMEOUT;

    const connectionLoad = worker.activeConnections * 10;
    const failureRate =
      (worker.failedRequests / Math.max(worker.totalRequests, 1)) * 100;
    const latency = worker.lastResponseTime > this.TIMEOUT ? 50 : 0;
    const score = connectionLoad + failureRate + latency;
    const finalScore = Math.round(score * 10) / 10;
    worker.healthScore = finalScore;
    this.gateway.updateUI('state', {
      type: 'state',
      worker,
    });
    return finalScore;
  }

  calculateResourceScore(worker: WorkerNode): number {
    const cpu = worker.cpuUsage;
    const memory = worker.memoryUsage;

    const connectionLoad =
      (worker.activeConnections / Math.max(worker.weight, 1)) * 100;
    const score =
      cpu * 0.45 + memory * 0.35 + Math.min(100, connectionLoad) * 0.2;
    worker.resourceScore = score;

    return score;
  }
}
