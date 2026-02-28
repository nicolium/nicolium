import { describe, expect, it } from 'vitest';

import nyaize from '@/utils/nyaize';

describe('nyaize', () => {
  it('nyaizes english text', () => {
    expect(nyaize('Nicolium, an unopinionated Fediverse client, designed for everyone')).toBe(
      'Nicolium, an unopinionyated Fediverse client, designed for everynyan',
    );
  });

  it('nyaizes uppercase english text', () => {
    expect(nyaize('NICOLIUM, AN UNOPINIONATED FEDIVERSE CLIENT, DESIGNED FOR EVERYONE')).toBe(
      'NICOLIUM, AN UNOPINIONYATED FEDIVERSE CLIENT, DESIGNED FOR EVERYNYAN',
    );
  });

  it('nyaizes japanese text', () => {
    expect(nyaize('いくつかのランダムな言葉')).toBe('いくつかのランダムにゃ言葉');
  });

  it('nyaizes polish text', () => {
    expect(nyaize("miałam wydać nicolium v1 w 2024 :'/")).toBe(
      "miauam wydać nicolium v1 w 2024 :'/",
    );
  });

  it('nyaizes uppercase polish text', () => {
    expect(nyaize('MIAŁAM')).toBe('MIAUAM');
  });

  it('nyaizes russian text', () => {
    expect(nyaize('она написана')).toBe('оня няписаня');
  });

  it('nyaizes korean text', () => {
    expect(nyaize('나는 고양이다')).toBe('냐는 고양이다냥');
  });
});
