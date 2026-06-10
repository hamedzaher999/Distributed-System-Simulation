import { Injectable } from '@nestjs/common';
import { PayloadInterface } from '../interfaces/payload.interface';
import { WorkerNode } from '../interfaces/worker.interface';
import { WorkerRegistryService } from '../services/worker-registry.service';
import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class ConsistentHashingStrategy implements LoadBalancingStrategyInterface {
  private ring: {
    hash: number;
    worker: WorkerNode;
  }[] = [];
  private lastWorkerCount = 0;

  private VIRTUAL_NODES = 1000;

  constructor(private readonly registry: WorkerRegistryService) {}
  select(payload: PayloadInterface): WorkerNode | null {
    const available = this.registry.getAvailableWorker();

    if (available.length === 0) return null;

    if (this.ring.length === 0 || available.length !== this.lastWorkerCount) {
      this.buildRing(available);
      this.lastWorkerCount = available.length;
    }

    const key = payload?.hashKey || JSON.stringify(payload);

    const hash = this.hash(key);

    const node = this.ring.find((n) => n.hash >= hash) || this.ring[0];
    return node.worker;
  }

  private buildRing(workers: WorkerNode[]) {
    this.ring = [];

    for (const w of workers) {
      for (let i = 0; i < this.VIRTUAL_NODES; i++) {
        this.ring.push({
          hash: this.hash(`${w.name}-${i}`),
          worker: w,
        });
      }
    }

    this.ring.sort((a, b) => a.hash - b.hash);
  }

  private hash(str: string): number {
    let hash = 2166136261;

    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);

      hash +=
        (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }

    return hash >>> 0;
  }
}
