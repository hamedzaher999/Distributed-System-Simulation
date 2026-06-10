import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { PayloadType } from './app.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @MessagePattern('calculate')
  async calculate(@Payload() data: PayloadType) {
    return this.service.calculate(data);
  }

  @MessagePattern('health-check')
  healthCheck() {
    return this.service.healthCheck();
  }

  @MessagePattern('worker-destroy')
  destroy() {
    this.service.destroy();
    return { status: 'destroyed' };
  }

  @MessagePattern('worker-fix')
  async fix() {
    await this.service.fix();
    return { status: 'restored' };
  }
}
