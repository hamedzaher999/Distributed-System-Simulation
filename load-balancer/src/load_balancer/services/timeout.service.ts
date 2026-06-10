import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeoutService {
  async run<T>(promise: Promise<T>, timeoutMs = 5000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs),
      ),
    ]);
  }
}
