import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import axios from 'axios';
import { AppModule } from './app.module';

async function bootstrap() {
  const WORKER_NAME = process.env.WORKER_NAME || 'worker-3';
  const WORKER_PORT = parseInt(process.env.PORT || '4003', 10);
  const WORKER_WEIGHT = parseInt(process.env.WORKER_WEIGHT || '7', 10);
  const WORKER_CPU_CORES = parseInt(process.env.WORKER_CPU_CORES || '4', 10);
  const WORKER_MEMORY_GB = parseInt(process.env.WORKER_MEMORY_GB || '8', 10);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: { port: WORKER_PORT },
    },
  );

  await app.listen();
  console.log(`${WORKER_NAME} started on port ${WORKER_PORT}`);

  try {
    await axios.post(
      'http://localhost:3000/register',
      {
        name: WORKER_NAME,
        port: WORKER_PORT,
        weight: WORKER_WEIGHT,
        cpuCores: WORKER_CPU_CORES,
        memoryGB: WORKER_MEMORY_GB,
      },
      { timeout: 3000 },
    );

    console.log(`${WORKER_NAME} registered (weight: ${WORKER_WEIGHT})`);
  } catch {
    console.warn(`${WORKER_NAME} auto-registration failed:`);
  }
}
bootstrap().catch(() => {
  console.log('bootstrap error');
});
