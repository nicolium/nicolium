import { expect, describe, it } from 'vitest';

import { removeVS16s, toCodePoints } from '@/utils/emoji';

const ASCII_HEART = '❤'; // '\u2764\uFE0F'
const RED_HEART_RGI = '❤️'; // '\u2764'
const JOY = '😂';

describe('removeVS16s()', () => {
  it('removes Variation Selector-16 characters from emoji', () => {
    // Sanity check
    expect(ASCII_HEART).not.toBe(RED_HEART_RGI);

    // It normalizes an emoji with VS16s
    expect(removeVS16s(RED_HEART_RGI)).toBe(ASCII_HEART);

    // Leaves a regular emoji alone
    expect(removeVS16s(JOY)).toBe(JOY);
  });
});

describe('toCodePoints()', () => {
  it('converts a plain emoji', () => {
    expect(toCodePoints('😂')).toEqual(['1f602']);
  });

  it('converts a VS16 emoji', () => {
    expect(toCodePoints(RED_HEART_RGI)).toEqual(['2764', 'fe0f']);
  });

  it('converts an ASCII character', () => {
    expect(toCodePoints(ASCII_HEART)).toEqual(['2764']);
  });

  it('converts a sequence emoji', () => {
    expect(toCodePoints('🇺🇸')).toEqual(['1f1fa', '1f1f8']);
  });
});
