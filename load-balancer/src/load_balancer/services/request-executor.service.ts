import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ClientResponse } from '../interfaces/client-response.interface';
import { WorkerNode } from '../interfaces/worker.interface';
import { LoadBalancerGateway } from '../load-balancer.gateway';
import { CircuitBreakerService } from './circuit-breaker.service';
import { RetryService } from './retry.service';
import { TimeoutService } from './timeout.service';
import { WorkerMetricsService } from './worker-metrics.service';

export type ExecuteType = 'normal' | 'ServiceMeshBehavior';

@Injectable()
export class RequestExecutorService {
  private executeType = 'normal';
  private clients = new Map<number, ClientProxy>();
  constructor(
    private readonly gateway: LoadBalancerGateway,
    private readonly metrics: WorkerMetricsService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly timeout: TimeoutService,
    private readonly retry: RetryService,
  ) {}

  changeExecuteType(type: ExecuteType) {
    this.executeType = type;
  }
  getExecuteType() {
    return this.executeType;
  }
  private getClient(port: number): ClientProxy {
    if (!this.clients.has(port)) {
      const client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { port: port },
      });
      client.connect().catch(() => {
        console.log(`Cannot connect to port ${port}`);
      });
      this.clients.set(port, client);
      return client;
    }
    return this.clients.get(port)!;
  }

  async execute(
    worker: WorkerNode,
    pattern: string,
    payload: object,
  ): Promise<ClientResponse> {
    if (!this.circuitBreaker.canExecute(worker)) {
      throw new Error(`Circuit open for ${worker.name}`);
    }
    const client = this.getClient(worker.port);
    worker.activeConnections = (worker.activeConnections || 0) + 1;
    worker.totalRequests = (worker.totalRequests || 0) + 1;
    const start = Date.now();
    this.gateway.updateUI('selected', {
      type: pattern === 'health-check' ? 'state' : 'selected',
      worker,
      payload,
    });

    try {
      const result =
        this.executeType === 'normal'
          ? await firstValueFrom<ClientResponse>(client.send(pattern, payload))
          : await this.retry.execute(() =>
              this.timeout.run(
                firstValueFrom<ClientResponse>(client.send(pattern, payload)),
              ),
            );
      // const result = await firstValueFrom<ClientResponse>(
      //   client.send(pattern, payload),
      // );
      const duration = Math.round(Date.now() - start);
      Object.assign(worker, { ...result?.telemetry });

      this.metrics.updateLatency(worker, duration);
      this.metrics.calculateAdaptiveScore(worker);
      worker.activeConnections = Math.max(0, worker.activeConnections - 1);
      this.metrics.calculateAdaptiveScore(worker);
      this.metrics.calculateResourceScore(worker);
      this.gateway.updateUI(pattern === 'health-check' ? 'state' : 'response', {
        type: pattern === 'health-check' ? 'state' : 'response',
        worker,
        payload,
        result,
        responseTime: duration,
      });
      this.circuitBreaker.onSuccess(worker);
      return result;
    } catch (err) {
      worker.failedRequests = (worker.failedRequests || 0) + 1;
      this.metrics.penalizeLatency(worker);
      worker.activeConnections = Math.max(0, worker.activeConnections - 1);
      this.metrics.calculateAdaptiveScore(worker);
      this.metrics.calculateResourceScore(worker);

      if (pattern != 'health-check')
        this.gateway.updateUI(pattern === 'health-check' ? 'state' : 'error', {
          type: pattern === 'health-check' ? 'state' : 'error',
          worker,
          payload,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      this.circuitBreaker.onFailure(worker);
      throw err;
    }
  }
}
