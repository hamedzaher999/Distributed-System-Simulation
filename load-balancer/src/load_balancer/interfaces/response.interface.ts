export interface ResponsePayload {
  status: string;

  result: number;

  worker: string;

  telemetry?: {
    cpu: number;
    memory: number;
    timestamp: number;
  };
}
