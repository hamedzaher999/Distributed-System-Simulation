import { Injectable } from '@nestjs/common';

@Injectable()
export class RetryService {
  async execute<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch {
        console.log('retry');
      }
    }

    throw new Error();
  }
}
