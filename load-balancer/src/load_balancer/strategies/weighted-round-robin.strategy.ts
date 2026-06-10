import { Injectable } from '@nestjs/common';
import { PayloadInterface } from '../interfaces/payload.interface';
import { WorkerNode } from '../interfaces/worker.interface';
import { WorkerRegistryService } from '../services/worker-registry.service';
import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class WeightedRoundRobinStrategy implements LoadBalancingStrategyInterface {
  private currentIndex = 0;
  constructor(private readonly registry: WorkerRegistryService) {}
  select(_payload: PayloadInterface): WorkerNode | null {
    const available = this.registry.getAvailableWorker();

    if (available.length === 0) return null;

    const weightedList: WorkerNode[] = [];

    for (const worker of available) {
      for (let i = 0; i < worker.weight; i++) {
        weightedList.push(worker);
      }
    }

    const selected = weightedList[this.currentIndex % weightedList.length];

    this.currentIndex++;

    return selected;
  }
}
