import { Injectable } from '@nestjs/common';

@Injectable()
export class IdleQueueService {
  private readonly idleWorkers = new Set<string>();

  markIdle(workerName: string) {
    this.idleWorkers.add(workerName);
  }

  remove(workerName: string) {
    this.idleWorkers.delete(workerName);
  }

  getNextIdleWorker(): string | null {
    console.log('-------------idle----------------');
    console.log(this.idleWorkers.values());
    console.log('-----------------------------');
    const first = this.idleWorkers.values().next();
    console.log('-----------------------------');
    console.log(first);
    console.log('--------------hsl---------------');
    if (first.done) {
      return null;
    }

    const workerName = first.value;

    this.idleWorkers.delete(workerName);

    return workerName;
  }

  getIdleWorkers(): string[] {
    return [...this.idleWorkers];
  }
}
