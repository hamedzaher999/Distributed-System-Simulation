import { Injectable } from '@nestjs/common';
import { PayloadInterface } from '../interfaces/payload.interface';
import { WorkerNode } from '../interfaces/worker.interface';
import { WorkerRegistryService } from '../services/worker-registry.service';
import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class ResourceAwareStrategy implements LoadBalancingStrategyInterface {
  constructor(private readonly registry: WorkerRegistryService) {}
  select(_payload: PayloadInterface): WorkerNode | null {
    const available = this.registry.getAvailableWorker();

    if (available.length === 0) return null;
    const selected = available.reduce((best, current) => {
      return current.resourceScore < best.resourceScore ? current : best;
    });

    return selected;
  }
}
