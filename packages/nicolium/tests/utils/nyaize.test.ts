import { describe, expect, it } from 'vitest';

import nyaize from '@/utils/nyaize';

describe('nyaize', () => {
  it('nyaizes english text', () => {
    expect(nyaize('Nicolium, an unopinionated Fediverse client, designed for everyone')).toBe(
      'Nicolium, an unopinionyated Fediverse client, designed for everynyan',
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

  it('nyaizes polish ą to au', () => {
    expect(nyaize('mają')).toBe('majau');
  });

  it('nyaizes polish nie to niau', () => {
    expect(nyaize('nie wiem')).toBe('niau wiem');
    expect(nyaize('Nie ma')).toBe('Niau ma');
    expect(nyaize('NIE!')).toBe('NIAU!');
  });

  it('does not nyaize nie inside words', () => {
    expect(nyaize('niebo')).toBe('niebo');
  });
});
