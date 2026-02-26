import { createRequire } from 'node:module';

import type { EmojiData } from './data';

interface UnicodeMap {
  [s: string]: {
    unified: string;
    shortcode: string;
  };
}

const unicodeMapping = compileTime(() => {
  const require = createRequire(import.meta.url);
  const data = require('@emoji-mart/data/sets/14/twitter.json');

  const stripLeadingZeros = /^0+/;

  /*
   * Twemoji strips their hex codes from unicode codepoints to make it look "pretty"
   * - leading 0s are removed
   * - fe0f is removed unless it has 200d
   * - fe0f is NOT removed for 1f441-fe0f-200d-1f5e8-fe0f even though it has a 200d
   *
   * this is all wrong
   */
  const blacklist = {
    '1f441-fe0f-200d-1f5e8-fe0f': true,
  };

  const tweaks = {
    '#⃣': ['23-20e3', 'hash'],
    '*⃣': ['2a-20e3', 'keycap_star'],
    '0⃣': ['30-20e3', 'zero'],
    '1⃣': ['31-20e3', 'one'],
    '2⃣': ['32-20e3', 'two'],
    '3⃣': ['33-20e3', 'three'],
    '4⃣': ['34-20e3', 'four'],
    '5⃣': ['35-20e3', 'five'],
    '6⃣': ['36-20e3', 'six'],
    '7⃣': ['37-20e3', 'seven'],
    '8⃣': ['38-20e3', 'eight'],
    '9⃣': ['39-20e3', 'nine'],
    '❤‍🔥': ['2764-fe0f-200d-1f525', 'heart_on_fire'],
    '❤‍🩹': ['2764-fe0f-200d-1fa79', 'mending_heart'],
    '👁‍🗨️': ['1f441-fe0f-200d-1f5e8-fe0f', 'eye-in-speech-bubble'],
    '👁️‍🗨': ['1f441-fe0f-200d-1f5e8-fe0f', 'eye-in-speech-bubble'],
    '👁‍🗨': ['1f441-fe0f-200d-1f5e8-fe0f', 'eye-in-speech-bubble'],
    '🕵‍♂️': ['1f575-fe0f-200d-2642-fe0f', 'male-detective'],
    '🕵️‍♂': ['1f575-fe0f-200d-2642-fe0f', 'male-detective'],
    '🕵‍♂': ['1f575-fe0f-200d-2642-fe0f', 'male-detective'],
    '🕵‍♀️': ['1f575-fe0f-200d-2640-fe0f', 'female-detective'],
    '🕵️‍♀': ['1f575-fe0f-200d-2640-fe0f', 'female-detective'],
    '🕵‍♀': ['1f575-fe0f-200d-2640-fe0f', 'female-detective'],
    '🏌‍♂️': ['1f3cc-fe0f-200d-2642-fe0f', 'man-golfing'],
    '🏌️‍♂': ['1f3cc-fe0f-200d-2642-fe0f', 'man-golfing'],
    '🏌‍♂': ['1f3cc-fe0f-200d-2642-fe0f', 'man-golfing'],
    '🏌‍♀️': ['1f3cc-fe0f-200d-2640-fe0f', 'woman-golfing'],
    '🏌️‍♀': ['1f3cc-fe0f-200d-2640-fe0f', 'woman-golfing'],
    '🏌‍♀': ['1f3cc-fe0f-200d-2640-fe0f', 'woman-golfing'],
    '⛹‍♂️': ['26f9-fe0f-200d-2642-fe0f', 'man-bouncing-ball'],
    '⛹️‍♂': ['26f9-fe0f-200d-2642-fe0f', 'man-bouncing-ball'],
    '⛹‍♂': ['26f9-fe0f-200d-2642-fe0f', 'man-bouncing-ball'],
    '⛹‍♀️': ['26f9-fe0f-200d-2640-fe0f', 'woman-bouncing-ball'],
    '⛹️‍♀': ['26f9-fe0f-200d-2640-fe0f', 'woman-bouncing-ball'],
    '⛹‍♀': ['26f9-fe0f-200d-2640-fe0f', 'woman-bouncing-ball'],
    '🏋‍♂️': ['1f3cb-fe0f-200d-2642-fe0f', 'man-lifting-weights'],
    '🏋️‍♂': ['1f3cb-fe0f-200d-2642-fe0f', 'man-lifting-weights'],
    '🏋‍♂': ['1f3cb-fe0f-200d-2642-fe0f', 'man-lifting-weights'],
    '🏋‍♀️': ['1f3cb-fe0f-200d-2640-fe0f', 'woman-lifting-weights'],
    '🏋️‍♀': ['1f3cb-fe0f-200d-2640-fe0f', 'woman-lifting-weights'],
    '🏋‍♀': ['1f3cb-fe0f-200d-2640-fe0f', 'woman-lifting-weights'],
    '🏳‍🌈': ['1f3f3-fe0f-200d-1f308', 'rainbow_flag'],
    '🏳‍⚧️': ['1f3f3-fe0f-200d-26a7-fe0f', 'transgender_flag'],
    '🏳️‍⚧': ['1f3f3-fe0f-200d-26a7-fe0f', 'transgender_flag'],
    '🏳‍⚧': ['1f3f3-fe0f-200d-26a7-fe0f', 'transgender_flag'],
  };

  const stripcodes = (unified: string) => {
    const stripped = unified.replace(stripLeadingZeros, '');

    if (unified.includes('200d') && !(unified in blacklist)) {
      return stripped;
    } else {
      return stripped.replaceAll('-fe0f', '');
    }
  };

  const generateMappings = (emojiMap: EmojiData['emojis']): UnicodeMap => {
    const result: UnicodeMap = {};
    const emojis = Object.values(emojiMap ?? {});

    for (const value of emojis) {
      for (const item of value.skins) {
        const { unified, native } = item;
        const stripped = stripcodes(unified, native);

        result[native] = { unified: stripped, shortcode: value.id };
      }
    }

    for (const [native, [unified, shortcode]] of Object.entries(tweaks)) {
      const stripped = stripcodes(unified, native);

      result[native] = { unified: stripped, shortcode };
    }

    return result;
  };

  return generateMappings(data.emojis);
});
export default unicodeMapping;

export type { UnicodeMap };
