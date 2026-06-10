import { Injectable } from '@nestjs/common';
import { PayloadInterface } from '../interfaces/payload.interface';
import { WorkerNode } from '../interfaces/worker.interface';
import { WorkerRegistryService } from '../services/worker-registry.service';
import { LoadBalancingStrategyInterface } from './strategy.interface';

@Injectable()
export class StickySessionStrategy implements LoadBalancingStrategyInterface {
  private sessionMap = new Map<string, string>();

  constructor(private readonly registry: WorkerRegistryService) {}
  select(payload: PayloadInterface): WorkerNode | null {
    const available = this.registry.getAvailableWorker();

    if (available.length === 0) return null;

    const sessionId = payload?.sessionId || 'default-session';

    const existing = this.sessionMap.get(sessionId);

    if (existing) {
      const worker = available.find((w) => w.name === existing);

      if (worker) return worker;
    }

    const chosen = available[Math.floor(Math.random() * available.length)];

    this.sessionMap.set(sessionId, chosen.name);

    return chosen;
  }
}
