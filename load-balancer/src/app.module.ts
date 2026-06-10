import { Module } from '@nestjs/common';
import { LoadBalancerModule } from './load_balancer/load-balancer.module';

@Module({
  imports: [LoadBalancerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
