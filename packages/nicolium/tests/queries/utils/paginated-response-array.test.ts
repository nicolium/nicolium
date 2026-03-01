import { describe, expect, it } from 'vitest';

import { PaginatedResponseArray } from '@/queries/utils/make-paginated-response-query';

/**
 * TanStack Query's isPlainArray check used for structural sharing.
 * If this returns false, structural sharing breaks, causing new references
 * on every render and leading to performance degradation.
 */
const isPlainArray = (value: unknown): boolean =>
  Array.isArray(value) && (value as Array<unknown>).length === Object.keys(value as object).length;

describe('PaginatedResponseArray', () => {
  it('creates an array from items without spread operator', () => {
    const items = PaginatedResponseArray.from([1, 2, 3]);
    expect(items).toEqual([1, 2, 3]);
    expect(items.length).toBe(3);
    expect(items instanceof PaginatedResponseArray).toBe(true);
  });

  it('handles large arrays without stack overflow', () => {
    const largeArray = Array.from({ length: 100_000 }, (_, i) => i);
    const items = PaginatedResponseArray.from(largeArray);
    expect(items.length).toBe(100_000);
  });

  it('supports non-enumerable total and partial properties via setMeta', () => {
    const items = PaginatedResponseArray.from(['a', 'b', 'c']).setMeta(42, true);

    expect(items.total).toBe(42);
    expect(items.partial).toBe(true);
  });

  it('passes isPlainArray check with non-enumerable properties for structural sharing', () => {
    const items = PaginatedResponseArray.from([1, 2, 3]).setMeta(10, false);

    expect(isPlainArray(items)).toBe(true);
  });

  it('total and partial properties are writable after setMeta', () => {
    const items = PaginatedResponseArray.from([1]).setMeta(5, false);

    items.total = 10;
    expect(items.total).toBe(10);
  });
});
