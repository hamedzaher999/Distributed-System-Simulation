import { Injectable } from '@nestjs/common';
import { PayloadInterface } from '../interfaces/payload.interface';
import { WorkerNode } from '../interfaces/worker.interface';
import { WorkerRegistryService } from '../services/worker-registry.service';
import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class WeightedLeastConnectionsStrategy implements LoadBalancingStrategyInterface {
  constructor(private readonly registry: WorkerRegistryService) {}
  select(_payload: PayloadInterface): WorkerNode | null {
    const available = this.registry.getAvailableWorker();

    if (available.length === 0) return null;

    return available.reduce((best, current) => {
      const bestRatio = best.activeConnections / Math.max(best.weight, 1);

      const currentRatio =
        current.activeConnections / Math.max(current.weight, 1);

      return currentRatio < bestRatio ? current : best;
    });
  }
}
