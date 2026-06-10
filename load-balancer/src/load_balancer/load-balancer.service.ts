import { Injectable } from '@nestjs/common';
import { ClientResponse } from './interfaces/client-response.interface';
import { PayloadInterface } from './interfaces/payload.interface';
import type { LoadBalancingStrategy } from './interfaces/strategy.type';
import { WorkerInfo, WorkerNode } from './interfaces/worker.interface';
import { LoadBalancerGateway } from './load-balancer.gateway';
import { HealthCheckService } from './services/health-check.service';
import { RequestExecutorService } from './services/request-executor.service';
import { WorkerRegistryService } from './services/worker-registry.service';
import { StrategyFactory } from './strategies/strategy.factory';

@Injectable()
export class LoadBalancerService {
  private currentStrategy: LoadBalancingStrategy = 'round-robin';
  constructor(
    private readonly gateway: LoadBalancerGateway,
    private readonly workerRegistry: WorkerRegistryService,
    private readonly strategyFactory: StrategyFactory,
    private readonly executor: RequestExecutorService,
    private readonly healthChecker: HealthCheckService,
  ) {}

  getCurrentStrategy() {
    return this.currentStrategy;
  }
  setStrategy(strategy: LoadBalancingStrategy) {
    this.currentStrategy = strategy;
    // this.resetServer();
    if (strategy === 'health-aware') {
      this.healthChecker.start();
    } else {
      this.healthChecker.stop();
    }
    this.gateway.updateUI('strategy', {
      type: 'strategy',
      strategy,
    });
  }

  selectWorker(payload?: PayloadInterface): WorkerNode {
    const strategy = this.strategyFactory.get(this.currentStrategy);

    const worker = strategy.select(payload);
    if (!worker) throw new Error('No worker available');
    return worker;
  }

  getAllRegisteredWorker(): WorkerNode[] {
    return this.workerRegistry.getWorkers();
  }

  getAvailableWorker(): WorkerNode[] {
    return this.workerRegistry.getAvailableWorker();
  }

  register(worker: WorkerInfo): WorkerNode {
    return this.workerRegistry.register(worker);
  }

  async calculate(payload: PayloadInterface): Promise<ClientResponse> {
    const worker = this.selectWorker(payload);
    const result = await this.executor.execute(worker, 'calculate', payload);
    return result;
  }
  destroyWorker(port: number) {
    this.workerRegistry.destroy(port);
  }
  fixWorker(port: number) {
    this.workerRegistry.fix(port);
  }
  resetServer() {
    this.workerRegistry.resetWorkerInfo();
  }
}
