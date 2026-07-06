import { expect, test } from 'vitest';

import { normalizeUsername } from '@/utils/input';

test('normalizeUsername', () => {
  expect(normalizeUsername('@mkljczk')).toBe('mkljczk');
  expect(normalizeUsername('mkljczk@twojstary.gay')).toBe('mkljczk@twojstary.gay');
  expect(normalizeUsername('@mkljczk@twojstary.gay')).toBe('mkljczk@twojstary.gay');
});
