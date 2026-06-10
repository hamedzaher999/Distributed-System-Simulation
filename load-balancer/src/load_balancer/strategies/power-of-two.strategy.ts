import { Injectable } from '@nestjs/common';

import { PayloadInterface } from '../interfaces/payload.interface';

import { WorkerNode } from '../interfaces/worker.interface';

import { WorkerRegistryService } from '../services/worker-registry.service';
import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class PowerOfTwoStrategy implements LoadBalancingStrategyInterface {
  constructor(private readonly registry: WorkerRegistryService) {}
  select(_payload: PayloadInterface): WorkerNode | null {
    const available = this.registry.getAvailableWorker();

    if (available.length === 0) {
      return null;
    }

    if (available.length === 1) {
      return available[0];
    }

    const i = Math.floor(Math.random() * available.length);

    const j = Math.floor(Math.random() * available.length);

    const w1 = available[i];
    const w2 = available[j];

    return w1.activeConnections <= w2.activeConnections ? w1 : w2;
  }
}
