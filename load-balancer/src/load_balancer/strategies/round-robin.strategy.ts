import { Injectable } from '@nestjs/common';

import { PayloadInterface } from '../interfaces/payload.interface';
import { WorkerNode } from '../interfaces/worker.interface';

import { WorkerRegistryService } from '../services/worker-registry.service';
import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class RoundRobinStrategy implements LoadBalancingStrategyInterface {
  private index = 0;
  constructor(private readonly registry: WorkerRegistryService) {}
  select(_payload: PayloadInterface): WorkerNode | null {
    const workers = this.registry.getWorkers();
    if (workers.length === 0) {
      return null;
    }

    let attempts = 0;

    while (attempts < workers.length) {
      const candidate = workers[this.index % workers.length];

      this.index++;

      if (!candidate.isDestroyed) {
        return candidate;
      }

      attempts++;
    }

    return null;
  }
}
