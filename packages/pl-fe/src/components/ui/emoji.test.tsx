import React from 'react';

import { render, screen } from '@/jest/test-helpers';

import Emoji from './emoji';

describe('<Emoji />', () => {
  it('renders a simple emoji', () => {
    render(<Emoji emoji='😀' />);

    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('/packs/emoji/1f600.svg');
    expect(img.getAttribute('alt')).toBe('😀');
  });

  // https://emojipedia.org/emoji-flag-sequence/
  it('renders a sequence emoji', () => {
    render(<Emoji emoji='🇺🇸' />);

    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('/packs/emoji/1f1fa-1f1f8.svg');
    expect(img.getAttribute('alt')).toBe('🇺🇸');
  });
});
