import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import axios from 'axios';
import * as os from 'os';
import { firstValueFrom } from 'rxjs';
export interface PayloadType {
  a: number;
  b: number;
  op: string;
}

@Injectable()
export class AppService {
  private requestCount = 0;
  private currentRequest = 0;
  private isDestroyed = false;
  private lbClient: ClientProxy;

  private readonly WORKER_ID = process.env.WORKER_NAME || 'worker-1';
  private readonly WORKER_PORT = parseInt(
    process.env.WORKER_PORT || '4001',
    10,
  );
  private readonly WORKER_CPU_BASE = parseInt(
    process.env.WORKER_CPU_BASE || '15',
    10,
  );
  private readonly WORKER_RAM_BASE = parseInt(
    process.env.WORKER_RAM_BASE || '20',
    10,
  );
  private readonly WORKER_WEIGHT = parseInt(
    process.env.WORKER_WEIGHT || '3',
    10,
  );
  constructor() {
    this.lbClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        port: 3001,
      },
    });
    setTimeout(() => {
      this.notifyIdle().catch(() => {});
    }, 2000);
  }

  private async notifyIdle() {
    try {
      await firstValueFrom(
        this.lbClient.send('worker-idle', {
          workerName: this.WORKER_ID,
        }),
      );
    } catch {
      console.log('Could not notify LB');
    }
  }
  destroy() {
    this.isDestroyed = true;

    return { status: 'destroyed' };
  }

  healthCheck() {
    return {
      status: 'healthy',
      worker: 'worker-1',
      timestamp: Date.now(),
      telemetry: this.getTelemetry(),
      weight: this.WORKER_WEIGHT,
    };
  }

  async calculate(data: PayloadType) {
    this.requestCount++;
    this.currentRequest++;
    try {
      if (this.isDestroyed) {
        throw new Error('WORKER_DESTROYED');
      }
      await new Promise((res) => setTimeout(res, 3000));
      if (this.requestCount % 5 === 0) throw new Error('failed');
      if (this.requestCount % 7 === 0)
        await new Promise((res) => setTimeout(res, 5500));
      const isHeavy = data.op === 'mul' && data.a > 100;
      if (isHeavy) await new Promise((res) => setTimeout(res, 1500));
      let result = 0;

      switch (data.op) {
        case 'add':
          result = data.a + data.b;
          break;
        case 'sub':
          result = data.a - data.b;
          break;
        case 'mul':
          result = data.a * data.b;
          break;
      }

      return {
        status: 'success',
        result,
        worker: 'worker-1',
        telemetry: this.getTelemetry(),
        weight: this.WORKER_WEIGHT,
      };
    } finally {
      this.currentRequest--;
      if (this.currentRequest === 0) {
        this.notifyIdle().catch(() => {});
      }
    }
  }

  getTelemetry() {
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((sum, cpu) => sum + cpu.times.idle, 0);
    const total = cpus.reduce(
      (sum, cpu) => sum + Object.values(cpu.times).reduce((a, b) => a + b, 0),
      0,
    );
    const realCpu = Math.round((1 - totalIdle / total) * 100);

    const totalMem = os.totalmem();
    const usedMem = totalMem - os.freemem();
    const realRam = Math.round((usedMem / totalMem) * 100);

    const cpuUsage = Math.min(
      100,
      Math.max(
        0,
        realCpu * 0.3 + this.WORKER_CPU_BASE + (Math.random() * 10 - 5),
      ),
    );
    const memoryUsage = Math.min(
      100,
      Math.max(
        0,
        realRam * 0.3 + this.WORKER_RAM_BASE + (Math.random() * 8 - 4),
      ),
    );

    console.log(
      `[${this.WORKER_ID}] Telemetry → CPU: ${cpuUsage.toFixed(1)}%, RAM: ${memoryUsage.toFixed(1)}%`,
    );
    return { cpuUsage, memoryUsage, timestamp: Date.now() };
  }

  async fix() {
    this.isDestroyed = false;
    this.currentRequest = 0;
    await axios.post('http://localhost:3000/register', {
      name: 'worker-1',
      port: 4001,
      weight: this.WORKER_WEIGHT,
      cpuCores: parseInt(process.env.WORKER_CPU_CORES || '4', 10),
      memoryGB: parseInt(process.env.WORKER_MEMORY_GB || '8', 10),
    });
    await this.notifyIdle();
    return { status: 'restored' };
  }
}
