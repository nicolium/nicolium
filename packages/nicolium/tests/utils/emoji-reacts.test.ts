import { emojiReactionSchema } from 'pl-api';
import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { simulateEmojiReact, simulateUnEmojiReact } from '@/utils/emoji-reacts';

describe('simulateEmojiReact', () => {
  it('adds the emoji to the list', () => {
    const emojiReacts = [
      { count: 2, me: false, name: '👍', url: undefined },
      { count: 2, me: false, name: '❤️', url: undefined },
    ].map((react) => v.parse(emojiReactionSchema, react));
    expect(simulateEmojiReact(emojiReacts, '❤️')).toMatchObject([
      { count: 2, me: false, name: '👍', url: undefined },
      { count: 3, me: true, name: '❤️', url: undefined },
    ]);
  });

  it("creates the emoji if it didn't already exist", () => {
    const emojiReacts = [
      { count: 2, me: false, name: '👍', url: undefined },
      { count: 2, me: false, name: '❤️', url: undefined },
    ].map((react) => v.parse(emojiReactionSchema, react));
    expect(simulateEmojiReact(emojiReacts, '😯')).toMatchObject([
      { count: 2, me: false, name: '👍', url: undefined },
      { count: 2, me: false, name: '❤️', url: undefined },
      { count: 1, me: true, name: '😯', url: undefined },
    ]);
  });

  it('adds a custom emoji to the list', () => {
    const emojiReacts = [
      { count: 2, me: false, name: '👍', url: undefined },
      { count: 2, me: false, name: '❤️', url: undefined },
    ].map((react) => v.parse(emojiReactionSchema, react));
    expect(
      simulateEmojiReact(
        emojiReacts,
        'neopapaj',
        'https://pl.fediverse.pl/emoji/neopapaj/neopapaj.png',
      ),
    ).toMatchObject([
      { count: 2, me: false, name: '👍', url: undefined },
      { count: 2, me: false, name: '❤️', url: undefined },
      {
        count: 1,
        me: true,
        name: 'neopapaj',
        url: 'https://pl.fediverse.pl/emoji/neopapaj/neopapaj.png',
      },
    ]);
  });
});

describe('simulateUnEmojiReact', () => {
  it('removes the emoji from the list', () => {
    const emojiReacts = [
      { count: 2, me: false, name: '👍' },
      { count: 3, me: true, name: '❤️' },
    ].map((react) => v.parse(emojiReactionSchema, react));
    expect(simulateUnEmojiReact(emojiReacts, '❤️')).toMatchObject([
      { count: 2, me: false, name: '👍' },
      { count: 2, me: false, name: '❤️' },
    ]);
  });

  it("removes the emoji if it's the last one in the list", () => {
    const emojiReacts = [
      { count: 2, me: false, name: '👍' },
      { count: 2, me: false, name: '❤️' },
      { count: 1, me: true, name: '😯' },
    ].map((react) => v.parse(emojiReactionSchema, react));
    expect(simulateUnEmojiReact(emojiReacts, '😯')).toMatchObject([
      { count: 2, me: false, name: '👍' },
      { count: 2, me: false, name: '❤️' },
    ]);
  });

  it('removes custom emoji from the list', () => {
    const emojiReacts = [
      { count: 2, me: false, name: '👍' },
      { count: 2, me: false, name: '❤️' },
      {
        count: 1,
        me: true,
        name: 'neopapaj',
        url: 'https://pl.fediverse.pl/emoji/neopapaj/neopapaj.png',
      },
    ].map((react) => v.parse(emojiReactionSchema, react));
    expect(simulateUnEmojiReact(emojiReacts, 'neopapaj')).toMatchObject([
      { count: 2, me: false, name: '👍' },
      { count: 2, me: false, name: '❤️' },
    ]);
  });
});
