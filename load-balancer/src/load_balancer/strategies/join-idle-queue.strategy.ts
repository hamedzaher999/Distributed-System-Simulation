import { Injectable } from '@nestjs/common';

import { PayloadInterface } from '../interfaces/payload.interface';
import { WorkerNode } from '../interfaces/worker.interface';

import { IdleQueueService } from '../services/idle-queue.service';
import { WorkerRegistryService } from '../services/worker-registry.service';

import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class JoinIdleQueueStrategy implements LoadBalancingStrategyInterface {
  constructor(
    private readonly idleQueue: IdleQueueService,
    private readonly workerRegistry: WorkerRegistryService,
  ) {}

  select(_payload?: PayloadInterface): WorkerNode | null {
    const workerName = this.idleQueue.getNextIdleWorker();

    if (!workerName) {
      return null;
    }

    return this.workerRegistry.getWorkerByName(workerName) ?? null;
  }
}
