export interface Telemetry {
  cpu: number;
  memory: number;
}

export interface HealthCheckResponse {
  status: string;
  worker: string;
  timestamp: number;
  telemetry?: Telemetry;
}
