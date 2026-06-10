import { Injectable } from '@nestjs/common';
import { PayloadInterface } from '../interfaces/payload.interface';
import { WorkerNode } from '../interfaces/worker.interface';
import { LoadBalancerGateway } from '../load-balancer.gateway';
import { HealthCheckService } from '../services/health-check.service';
import { WorkerRegistryService } from '../services/worker-registry.service';
import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class AdaptiveStrategy implements LoadBalancingStrategyInterface {
  constructor(
    private readonly registry: WorkerRegistryService,
    private readonly gateway: LoadBalancerGateway,
    private readonly healthChecker: HealthCheckService,
  ) {}
  select(_payload: PayloadInterface): WorkerNode | null {
    const available = this.registry.getAvailableWorker();

    if (available.length === 0) return null;
    const selected = available.reduce((best, current) => {
      return current.adaptiveScore < best.adaptiveScore ? current : best;
    });

    return selected;
  }
}
