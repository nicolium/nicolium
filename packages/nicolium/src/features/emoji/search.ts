import fuzzysort from 'fuzzysort';

import type { EmojiData } from './data';
import type { Emoji } from './index';
import type { CustomEmoji } from 'pl-api';

let emojis: EmojiData['emojis'] = {};

const nativeData: Array<{ key: string; id: string }> = [];
let customData: Array<{ key: string; id: string }> = [];

import('./data')
  .then((data) => {
    emojis = data.emojis;

    const sortedEmojis = Object.entries(emojis).toSorted((a, b) => a[0].localeCompare(b[0]));
    for (const [key, emoji] of sortedEmojis) {
      nativeData.push({
        key: `${emoji.id} ${emoji.name} ${emoji.keywords.join(' ')}`,
        id: 'n' + key,
      });
    }
  })
  .catch(() => {});

const addCustomToPool = (customEmojis: CustomEmoji[]) => {
  customData = customEmojis.map((emoji, i) => ({
    key: emoji.shortcode,
    id: 'c' + i,
  }));
};

const search = (query: string, customEmojis: Array<CustomEmoji> = [], limit = 5): Emoji[] => {
  return fuzzysort
    .go(query, [...nativeData, ...customData], { key: 'key', limit })
    .map((result) => {
      const { id } = result.obj;

      if (id[0] === 'c') {
        const customEmoji = customEmojis[Number(id.slice(1))];
        return {
          id: customEmoji.shortcode,
          colons: ':' + customEmoji.shortcode + ':',
          custom: true,
          imageUrl: customEmoji.static_url,
        };
      }

      const emojiData = emojis[id.slice(1)];
      if (emojiData) {
        return {
          id: id.slice(1),
          colons: ':' + id.slice(1) + ':',
          unified: emojiData.skins[0].unified,
          native: emojiData.skins[0].native,
        };
      }
    })
    .filter(Boolean) as Array<Emoji>;
};

export { search as default, addCustomToPool };
