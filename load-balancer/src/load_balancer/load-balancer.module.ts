import { Module } from '@nestjs/common';
import { LoadBalancerController } from './load-balancer.controller';
import { LoadBalancerGateway } from './load-balancer.gateway';
import { LoadBalancerService } from './load-balancer.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { HealthCheckService } from './services/health-check.service';
import { IdleQueueService } from './services/idle-queue.service';
import { RequestExecutorService } from './services/request-executor.service';
import { RetryService } from './services/retry.service';
import { TimeoutService } from './services/timeout.service';
import { WorkerMetricsService } from './services/worker-metrics.service';
import { WorkerRegistryService } from './services/worker-registry.service';
import { AdaptiveStrategy } from './strategies/adaptive.strategy';
import { ConsistentHashingStrategy } from './strategies/consistent-hashing.strategy';
import { HealthAwareStrategy } from './strategies/health-aware.strategy';
import { JoinIdleQueueStrategy } from './strategies/join-idle-queue.strategy';
import { LatencyBasedStrategy } from './strategies/latency-based.strategy';
import { LeastConnectionsStrategy } from './strategies/least-connections.strategy';
import { PowerOfTwoStrategy } from './strategies/power-of-two.strategy';
import { ResourceAwareStrategy } from './strategies/Resource_aware.strategy';
import { RoundRobinStrategy } from './strategies/round-robin.strategy';
import { StickySessionStrategy } from './strategies/sticky-session.strategy';
import { StrategyFactory } from './strategies/strategy.factory';
import { WeightedLeastConnectionsStrategy } from './strategies/weighted-least-connections.strategy';
import { WeightedRoundRobinStrategy } from './strategies/weighted-round-robin.strategy';

@Module({
  controllers: [LoadBalancerController],
  providers: [
    LoadBalancerService,
    //
    CircuitBreakerService,
    TimeoutService,
    RetryService,
    JoinIdleQueueStrategy,
    LoadBalancerGateway,
    RoundRobinStrategy,
    IdleQueueService,
    LeastConnectionsStrategy,
    WeightedLeastConnectionsStrategy,
    ConsistentHashingStrategy,
    AdaptiveStrategy,
    ResourceAwareStrategy,
    StickySessionStrategy,
    PowerOfTwoStrategy,
    LatencyBasedStrategy,
    WeightedRoundRobinStrategy,
    HealthAwareStrategy,
    //
    WorkerRegistryService,
    WorkerMetricsService,
    HealthCheckService,
    RequestExecutorService,
    //
    StrategyFactory,
  ],
  exports: [LoadBalancerService, LoadBalancerGateway],
})
export class LoadBalancerModule {}
