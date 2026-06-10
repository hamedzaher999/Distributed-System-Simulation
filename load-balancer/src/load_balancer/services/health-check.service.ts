import { Injectable, Logger } from '@nestjs/common';
import { WorkerNode } from '../interfaces/worker.interface';
import { RequestExecutorService } from './request-executor.service';
import { WorkerMetricsService } from './worker-metrics.service';
import { WorkerRegistryService } from './worker-registry.service';

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  private readonly INTERVAL = 5000;
  private readonly TIMEOUT = 3000;

  private intervalId?: NodeJS.Timeout;

  constructor(
    private readonly registry: WorkerRegistryService,
    private readonly metrics: WorkerMetricsService,
    private readonly executor: RequestExecutorService,
  ) {}

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.checkAll().catch(() => {});
    }, this.INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async checkAll() {
    const workers = this.registry.getWorkers();

    for (const worker of workers) {
      await this.checkWorker(worker);
    }
  }

  private async checkWorker(worker: WorkerNode) {
    if (worker.isDestroyed) {
      worker.isHealthy = false;
      return;
    }

    const start = Date.now();

    try {
      await this.executor.execute(worker, 'health-check', {});

      const duration = Math.round(Date.now() - start);
      worker.lastResponseTime = duration;

      this.metrics.calculateHealthScore(worker, duration);
    } catch {
      worker.isHealthy = false;
      worker.lastHealthCheck = Date.now();
      worker.lastResponseTime = Math.round(Date.now() - start);
      const duration = Math.round(Date.now() - start);
      this.metrics.calculateHealthScore(worker, duration);
      this.logger.warn(`Health check failed: ${worker.name}`);
    }
  }
}
