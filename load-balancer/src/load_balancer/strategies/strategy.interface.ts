import { PayloadInterface } from '../interfaces/payload.interface';
import { WorkerNode } from '../interfaces/worker.interface';

export interface LoadBalancingStrategyInterface {
  select(_payload?: PayloadInterface): WorkerNode | null;
}
