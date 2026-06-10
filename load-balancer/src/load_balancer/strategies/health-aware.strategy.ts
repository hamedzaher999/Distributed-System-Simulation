import { Injectable } from '@nestjs/common';
import { PayloadInterface } from '../interfaces/payload.interface';
import { WorkerNode } from '../interfaces/worker.interface';
import { LoadBalancerGateway } from '../load-balancer.gateway';
import { WorkerRegistryService } from '../services/worker-registry.service';
import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class HealthAwareStrategy implements LoadBalancingStrategyInterface {
  constructor(
    private readonly registry: WorkerRegistryService,
    private readonly gateway: LoadBalancerGateway,
  ) {}
  select(_payload: PayloadInterface): WorkerNode | null {
    const healthy = this.registry.getHealthyWorker();

    if (healthy.length === 0) {
      return null;
    }

    if (healthy.length === 1) {
      return healthy[0];
    }

    const selectedWorker = healthy.reduce((best, current) => {
      return current.healthScore < best.healthScore ? current : best;
    });
    this.gateway.updateUI('state', {
      type: 'state',
      worker: selectedWorker,
    });
    return selectedWorker;
  }
}
