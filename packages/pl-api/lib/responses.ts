/**
 * @category Utils
 */
class PaginatedResponse<T, IsArray extends boolean = true> {
  items: IsArray extends true ? Array<T> : T;
  declare previous: (() => Promise<PaginatedResponse<T, IsArray>>) | null;
  declare next: (() => Promise<PaginatedResponse<T, IsArray>>) | null;
  declare total: number | undefined;
  declare partial: boolean;

  constructor(
    items: IsArray extends true ? Array<T> : T,
    info: Partial<Omit<PaginatedResponse<T, IsArray>, 'items'>> = {},
  ) {
    this.items = items;
    Object.defineProperties(this, {
      items: { value: items, writable: true, enumerable: true, configurable: true },
      previous: {
        value: info.previous ?? null,
        writable: true,
        enumerable: false,
        configurable: true,
      },
      next: {
        value: info.next ?? null,
        writable: true,
        enumerable: false,
        configurable: true,
      },
      total: { value: info.total, writable: true, enumerable: false, configurable: true },
      partial: {
        value: info.partial ?? false,
        writable: true,
        enumerable: false,
        configurable: true,
      },
    });
  }
}

export { PaginatedResponse };
