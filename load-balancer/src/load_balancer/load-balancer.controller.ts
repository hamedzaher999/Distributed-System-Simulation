import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { PayloadInterface } from './interfaces/payload.interface';
import type { LoadBalancingStrategy } from './interfaces/strategy.type';
import type { WorkerInfo } from './interfaces/worker.interface';
import { LoadBalancerService } from './load-balancer.service';
import { IdleQueueService } from './services/idle-queue.service';
import type { ExecuteType } from './services/request-executor.service';
import { RequestExecutorService } from './services/request-executor.service';
@Controller()
export class LoadBalancerController {
  constructor(
    private readonly loadBalancerService: LoadBalancerService,
    private readonly idleQueue: IdleQueueService,
    private readonly executer: RequestExecutorService,
  ) {}

  @MessagePattern('worker-idle')
  workerIdle(@Payload() body: { workerName: string }) {
    console.log('====== idle =======' + body.workerName);
    this.idleQueue.markIdle(body.workerName);
    return {
      status: 'ok',
    };
  }
  @Get('worker')
  getWorker() {
    return this.loadBalancerService.getAllRegisteredWorker();
  }
  @Get('process_info')
  getProcessInfo() {
    return {
      workers: this.loadBalancerService.getAllRegisteredWorker(),
      strategy: this.loadBalancerService.getCurrentStrategy(),
      executeBehavior: this.executer.getExecuteType(),
    };
  }
  @Post('register')
  register(@Body() worker: WorkerInfo) {
    this.loadBalancerService.register(worker);
  }
  @Post('calculate')
  async calculate(@Body() payload: PayloadInterface) {
    await this.loadBalancerService.calculate(payload);
  }
  @Post('destroy/:port')
  destroyWorker(@Param('port') port: number) {
    this.loadBalancerService.destroyWorker(port);
  }
  @Post('fix/:port')
  fixWorker(@Param('port') port: number) {
    this.loadBalancerService.fixWorker(port);
  }
  @Post('reset')
  reset() {
    this.loadBalancerService.resetServer();
    return {
      status: 'reset done',
    };
  }
  @Post('strategy')
  setStrategy(@Body('strategy') strategy: LoadBalancingStrategy) {
    this.loadBalancerService.setStrategy(strategy);
    return { strategy, status: 'updated' };
  }

  @Post('executeBehavior')
  setExecuteBehavior(@Body('behavior') behavior: ExecuteType) {
    this.executer.changeExecuteType(behavior);
    return { executeBehavior: behavior, status: 'updated' };
  }
}
