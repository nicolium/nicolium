import { describe, expect, it } from 'vitest';

import * as base64 from '@/utils/base64';

describe('base64', () => {
  describe('decode', () => {
    it('returns a uint8 array', () => {
      const arr = base64.decode('dGVzdA==');
      expect(arr).toEqual(new Uint8Array([116, 101, 115, 116]));
    });
  });
});
