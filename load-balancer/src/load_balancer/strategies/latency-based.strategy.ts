import { Injectable } from '@nestjs/common';
import { PayloadInterface } from '../interfaces/payload.interface';
import { WorkerNode } from '../interfaces/worker.interface';
import { WorkerRegistryService } from '../services/worker-registry.service';
import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class LatencyBasedStrategy implements LoadBalancingStrategyInterface {
  constructor(private readonly registry: WorkerRegistryService) {}
  select(_payload: PayloadInterface): WorkerNode | null {
    const healthy = this.registry.getHealthyWorker();

    if (healthy.length === 0) {
      return null;
    }

    if (healthy.length === 1) {
      return healthy[0];
    }

    return healthy.reduce((best, current) => {
      const bestLatency = best.smoothedLatency ?? 99999;

      const currentLatency = current.smoothedLatency ?? 99999;

      return currentLatency < bestLatency ? current : best;
    });
  }
}
