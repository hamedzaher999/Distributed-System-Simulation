import { Injectable } from '@nestjs/common';

import { LoadBalancingStrategy } from '../interfaces/strategy.type';
import { LoadBalancingStrategyInterface } from './strategy.interface';

import { AdaptiveStrategy } from './adaptive.strategy';
import { ConsistentHashingStrategy } from './consistent-hashing.strategy';
import { HealthAwareStrategy } from './health-aware.strategy';
import { JoinIdleQueueStrategy } from './join-idle-queue.strategy';
import { LatencyBasedStrategy } from './latency-based.strategy';
import { LeastConnectionsStrategy } from './least-connections.strategy';
import { PowerOfTwoStrategy } from './power-of-two.strategy';
import { ResourceAwareStrategy } from './Resource_aware.strategy';
import { RoundRobinStrategy } from './round-robin.strategy';
import { StickySessionStrategy } from './sticky-session.strategy';
import { WeightedLeastConnectionsStrategy } from './weighted-least-connections.strategy';
import { WeightedRoundRobinStrategy } from './weighted-round-robin.strategy';
@Injectable()
export class StrategyFactory {
  private readonly map: Record<
    LoadBalancingStrategy,
    LoadBalancingStrategyInterface
  >;

  constructor(
    private readonly roundRobin: RoundRobinStrategy,
    private readonly leastConnections: LeastConnectionsStrategy,
    private readonly powerOfTwo: PowerOfTwoStrategy,
    private readonly healthAware: HealthAwareStrategy,
    private readonly latencyBasedStrategy: LatencyBasedStrategy,
    private readonly weightedRoundRobin: WeightedRoundRobinStrategy,
    private readonly weightedLeastConnections: WeightedLeastConnectionsStrategy,
    private readonly adaptive: AdaptiveStrategy,
    private readonly resource: ResourceAwareStrategy,
    private readonly consistentHashingStrategy: ConsistentHashingStrategy,
    private readonly stickySessionStrategy: StickySessionStrategy,
    private readonly jiq: JoinIdleQueueStrategy,
  ) {
    this.map = {
      'round-robin': this.roundRobin,
      'least-connections': this.leastConnections,
      'power-of-two': this.powerOfTwo,
      'health-aware': this.healthAware,
      'latency-based': this.latencyBasedStrategy,
      'weighted-round-robin': this.weightedRoundRobin,
      'weighted-least-connections': this.weightedLeastConnections,
      'consistent-hashing': this.consistentHashingStrategy,
      'sticky-session': this.stickySessionStrategy,
      adaptive: this.adaptive,

      'resource-aware': this.resource,
      'join-idle-queue': this.jiq,
    };
  }

  get(strategy: LoadBalancingStrategy): LoadBalancingStrategyInterface {
    return this.map[strategy] ?? this.leastConnections;
  }
}
