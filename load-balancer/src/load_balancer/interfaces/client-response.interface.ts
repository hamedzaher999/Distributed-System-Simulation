import { Telemetry } from './health.interface';

export interface ClientResponseException {
  message: string;
  error: string;
  responseTime: number;
}
export interface ClientResponse {
  status: string;
  data: number;
  workerName: string;
  port: number;
  telemetry?: Telemetry;
}
