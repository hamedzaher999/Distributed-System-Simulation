import { Injectable } from '@nestjs/common';
import {
  WorkerInfo,
  WorkerNode,
  initialWorkerMetrics,
} from '../interfaces/worker.interface';
import { LoadBalancerGateway } from '../load-balancer.gateway';
import { IdleQueueService } from './idle-queue.service';

@Injectable()
export class WorkerRegistryService {
  private workers: WorkerNode[] = [];
  constructor(
    private readonly gateway: LoadBalancerGateway,
    private readonly idleQueue: IdleQueueService,
  ) {}
  getWorkers(): WorkerNode[] {
    return this.workers;
  }

  getAvailableWorker(): WorkerNode[] {
    return this.workers.filter(
      (w) => !w.isDestroyed && w.circuitState !== 'open',
    );
  }

  getHealthyWorker(): WorkerNode[] {
    return this.workers.filter((w) => w.isHealthy && !w.isDestroyed);
  }

  getWorkerByName(name: string): WorkerNode | undefined {
    return this.workers.find((w) => w.name === name);
  }

  getWorkerByPort(port: number): WorkerNode | undefined {
    return this.workers.find((w) => w.port == port);
  }

  register(worker: WorkerInfo) {
    const existing = this.getWorkerByPort(worker.port);
    const newWorker: WorkerNode = {
      ...worker,
      ...initialWorkerMetrics,
    };
    if (existing) {
      Object.assign(existing, newWorker);
      this.gateway.updateUI('reregister', {
        type: 'reregister',
        worker: existing,
      });
      return existing;
    }

    this.workers.push(newWorker);
    this.gateway.updateUI('register', {
      type: 'register',
      worker: newWorker,
    });
    return newWorker;
  }

  destroy(port: number) {
    const worker = this.getWorkerByPort(port);
    if (!worker) return;

    worker.isDestroyed = true;
    worker.isHealthy = false;
    this.gateway.updateUI('destroyed', {
      type: 'destroyed',
      worker,
    });
  }

  fix(port: number) {
    const worker = this.getWorkerByPort(port);

    if (!worker) return;

    worker.isDestroyed = false;
    worker.isHealthy = true;
    worker.lastHealthCheck = Date.now();

    this.gateway.updateUI('fixed', {
      type: 'fixed',
      worker,
    });
  }

  resetWorkerInfo() {
    for (const worker of this.workers) {
      Object.assign(worker, { ...initialWorkerMetrics });
      this.gateway.updateUI('state', {
        type: 'state',
        worker,
      });
    }
  }
}
