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
});
