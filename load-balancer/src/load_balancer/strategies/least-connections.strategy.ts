import { Injectable } from '@nestjs/common';

import { PayloadInterface } from '../interfaces/payload.interface';

import { WorkerNode } from '../interfaces/worker.interface';

import { WorkerRegistryService } from '../services/worker-registry.service';
import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class LeastConnectionsStrategy implements LoadBalancingStrategyInterface {
  constructor(private readonly registry: WorkerRegistryService) {}
  select(_payload: PayloadInterface): WorkerNode | null {
    const available = this.registry.getAvailableWorker();

    if (available.length === 0) {
      return null;
    }

    if (available.length === 1) {
      return available[0];
    }

    const minConnections = Math.min(
      ...available.map((w) => w.activeConnections),
    );

    const candidates = available.filter(
      (w) => w.activeConnections === minConnections,
    );

    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}
