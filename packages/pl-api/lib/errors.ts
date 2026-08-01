import type { Response } from '@/request';

class PlApiError<T = any> extends Error {
  readonly response: Response<T>;

  constructor(response: Response<T>, message?: string) {
    super(message || `Request failed with status ${response.status}`);
    this.name = 'PlApiError';
    this.response = response;
  }

  get status(): number {
    return this.response.status;
  }

  get json(): T {
    return this.response.json;
  }
}

export { PlApiError };
