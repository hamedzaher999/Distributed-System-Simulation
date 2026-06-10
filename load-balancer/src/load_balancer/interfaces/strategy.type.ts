export type LoadBalancingStrategy =
  | 'round-robin'
  | 'least-connections'
  | 'power-of-two'
  | 'health-aware'
  | 'weighted-round-robin'
  | 'weighted-least-connections'
  | 'consistent-hashing'
  | 'sticky-session'
  | 'latency-based'
  | 'resource-aware'
  | 'adaptive'
  | 'join-idle-queue';
