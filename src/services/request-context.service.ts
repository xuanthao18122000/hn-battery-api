import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface RequestContext {
  requestId: string;
}

@Injectable()
export class RequestContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  setRequestId(requestId: string): void {
    this.asyncLocalStorage.enterWith({ requestId });
  }

  getRequestId(): string | null {
    const context = this.asyncLocalStorage.getStore();
    return context?.requestId || null;
  }

  clearRequestId(): void {
    // AsyncLocalStorage tự động clear khi context kết thúc
  }

  runWithContext<T>(requestId: string, fn: () => T): T {
    return this.asyncLocalStorage.run({ requestId }, fn);
  }
}
