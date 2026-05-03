/**
 * @category Utils
 */
class PaginatedResponse<T, IsArray extends boolean = true> {
  items: IsArray extends true ? Array<T> : T;
  previous: (() => Promise<PaginatedResponse<T, IsArray>>) | null;
  next: (() => Promise<PaginatedResponse<T, IsArray>>) | null;
  total: number | undefined;
  partial: boolean;

  constructor(
    items: IsArray extends true ? Array<T> : T,
    info: Partial<Omit<PaginatedResponse<T, IsArray>, 'items'>> = {},
  ) {
    this.items = items;
    this.previous = info.previous ?? null;
    this.next = info.next ?? null;
    this.total = info.total;
    this.partial = info.partial ?? false;
  }
}

export { PaginatedResponse };
