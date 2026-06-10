import { Injectable } from '@nestjs/common';
import { WorkerNode } from '../interfaces/worker.interface';

@Injectable()
export class CircuitBreakerService {
  private readonly FAILURE_THRESHOLD = 3;

  private readonly RECOVERY_TIME = 10000;

  onSuccess(worker: WorkerNode) {
    worker.circuitFailures = 0;
    worker.circuitState = 'closed';
  }

  onFailure(worker: WorkerNode) {
    worker.circuitFailures++;

    if (worker.circuitFailures >= this.FAILURE_THRESHOLD) {
      worker.circuitState = 'open';
      worker.circuitOpenedAt = Date.now();
    }
  }

  canExecute(worker: WorkerNode): boolean {
    if (worker.circuitState === 'closed') {
      return true;
    }

    if (worker.circuitState === 'open') {
      const elapsed = Date.now() - worker.circuitOpenedAt;

      if (elapsed > this.RECOVERY_TIME) {
        worker.circuitState = 'half-open';
        return true;
      }

      return false;
    }

    return true;
  }
}
