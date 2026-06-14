import React, { useEffect, useLayoutEffect, useMemo, useState, Suspense } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting, saveSettings } from '@/actions/settings';
import { useTheme } from '@/hooks/use-theme';
import { useCustomEmojis } from '@/queries/instance/use-custom-emojis';
import { useSettings, useSettingsStoreActions } from '@/stores/settings';

import { buildCustomEmojiCategories } from '../../emoji';
import { EmojiPicker } from '../../ui/util/async-components';

import type { Emoji, CustomEmoji, NativeEmoji } from '@/features/emoji';
import type { CustomEmoji as BaseCustomEmoji } from 'pl-api';

const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
  emojiPick: { id: 'emoji_button.pick', defaultMessage: 'Pick an emoji…' },
  emojiOhNo: { id: 'emoji_button.oh_no', defaultMessage: 'Oh no!' },
  emojiSearch: { id: 'emoji_button.search', defaultMessage: 'Search…' },
  emojiNotFound: { id: 'emoji_button.not_found', defaultMessage: 'No emojis found.' },
  emojiAddCustom: { id: 'emoji_button.add_custom', defaultMessage: 'Add custom emoji' },
  custom: { id: 'emoji_button.custom', defaultMessage: 'Custom' },
  recent: { id: 'emoji_button.recent', defaultMessage: 'Frequently used' },
  searchResults: { id: 'emoji_button.search_results', defaultMessage: 'Search results' },
  people: { id: 'emoji_button.people', defaultMessage: 'People' },
  nature: { id: 'emoji_button.nature', defaultMessage: 'Nature' },
  food: { id: 'emoji_button.food', defaultMessage: 'Food & Drink' },
  activity: { id: 'emoji_button.activity', defaultMessage: 'Activity' },
  travel: { id: 'emoji_button.travel', defaultMessage: 'Travel & Places' },
  objects: { id: 'emoji_button.objects', defaultMessage: 'Objects' },
  symbols: { id: 'emoji_button.symbols', defaultMessage: 'Symbols' },
  flags: { id: 'emoji_button.flags', defaultMessage: 'Flags' },
  skinsChoose: { id: 'emoji_button.skins_choose', defaultMessage: 'Choose default skin tone' },
  skins1: { id: 'emoji_button.skins_1', defaultMessage: 'Default' },
  skins2: { id: 'emoji_button.skins_2', defaultMessage: 'Light' },
  skins3: { id: 'emoji_button.skins_3', defaultMessage: 'Medium-Light' },
  skins4: { id: 'emoji_button.skins_4', defaultMessage: 'Medium' },
  skins5: { id: 'emoji_button.skins_5', defaultMessage: 'Medium-Dark' },
  skins6: { id: 'emoji_button.skins_6', defaultMessage: 'Dark' },
});

interface IEmojiPickerDropdown {
  onPickEmoji?: (emoji: Emoji) => void;
  condensed?: boolean;
  withCustom?: boolean;
  visible: boolean;
  setVisible: (value: boolean) => void;
  update: (() => any) | null;
}

const perLine = 8;
const lines = 2;

const DEFAULTS = [
  '+1',
  'grinning',
  'kissing_heart',
  'heart_eyes',
  'laughing',
  'stuck_out_tongue_winking_eye',
  'sweat_smile',
  'joy',
  'yum',
  'disappointed',
  'thinking_face',
  'weary',
  'sob',
  'sunglasses',
  'heart',
  'ok_hand',
];

const getFrequentlyUsedEmojis = (emojiCounters: Record<string, number>) => {
  let emojis = Object.keys(emojiCounters)
    .toSorted((a, b) => emojiCounters[a] - emojiCounters[b])
    .toReversed()
    .slice(0, perLine * lines);

  if (emojis.length < DEFAULTS.length) {
    const uniqueDefaults = DEFAULTS.filter((emoji) => !emojis.includes(emoji));
    emojis = emojis.concat(uniqueDefaults.slice(0, DEFAULTS.length - emojis.length));
  }

  return emojis;
};

const getCustomEmojis = (emojis: Array<BaseCustomEmoji>) =>
  emojis
    .filter((e) => e.visible_in_picker)
    .toSorted((a, b) => {
      const aShort = a.shortcode.toLowerCase();
      const bShort = b.shortcode.toLowerCase();

      if (aShort < bShort) {
        return -1;
      } else if (aShort > bShort) {
        return 1;
      } else {
        return 0;
      }
    });

// Fixes render bug where popover has a delayed position update
const RenderAfter = ({ children, update }: any) => {
  const [nextTick, setNextTick] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setNextTick(true);
    }, 0);
  }, []);

  useLayoutEffect(() => {
    if (nextTick) {
      update();
    }
  }, [nextTick, update]);

  return nextTick ? children : null;
};

const EmojiPickerDropdown: React.FC<IEmojiPickerDropdown> = ({
  onPickEmoji,
  visible,
  setVisible,
  update,
  withCustom = true,
}) => {
  const intl = useIntl();
  const title = intl.formatMessage(messages.emoji);
  const theme = useTheme();
  const { rememberEmojiUse } = useSettingsStoreActions();

  const { data: customEmojis } = useCustomEmojis(getCustomEmojis);

  const settings = useSettings();
  const frequentlyUsedEmojis = useMemo(
    () => getFrequentlyUsedEmojis(settings.frequentlyUsedEmojis),
    [settings.frequentlyUsedEmojis],
  );

  const handlePick = (emoji: any) => {
    setVisible(false);

    let pickedEmoji: Emoji;

    if (emoji.native) {
      pickedEmoji = {
        id: emoji.id,
        colons: emoji.shortcodes,
        custom: false,
        native: emoji.native,
        unified: emoji.unified,
      } as NativeEmoji;
    } else {
      pickedEmoji = {
        id: emoji.id.replaceAll(/^:|:$/g, ''),
        colons: emoji.shortcodes.replaceAll(/^::|::$/g, ':'),
        custom: true,
        imageUrl: emoji.src,
      } as CustomEmoji;
    }

    rememberEmojiUse(pickedEmoji);
    saveSettings();

    if (onPickEmoji) {
      onPickEmoji(pickedEmoji);
    }
  };

  const handleSkinTone = (skinTone: string) => {
    changeSetting(['skinTone'], skinTone);
  };

  const getI18n = () => ({
    search: intl.formatMessage(messages.emojiSearch),
    pick: intl.formatMessage(messages.emojiPick),
    search_no_results_1: intl.formatMessage(messages.emojiOhNo),
    search_no_results_2: intl.formatMessage(messages.emojiNotFound),
    add_custom: intl.formatMessage(messages.emojiAddCustom),
    categories: {
      search: intl.formatMessage(messages.searchResults),
      frequent: intl.formatMessage(messages.recent),
      people: intl.formatMessage(messages.people),
      nature: intl.formatMessage(messages.nature),
      foods: intl.formatMessage(messages.food),
      activity: intl.formatMessage(messages.activity),
      places: intl.formatMessage(messages.travel),
      objects: intl.formatMessage(messages.objects),
      symbols: intl.formatMessage(messages.symbols),
      flags: intl.formatMessage(messages.flags),
      custom: intl.formatMessage(messages.custom),
    },
    skins: {
      choose: intl.formatMessage(messages.skinsChoose),
      1: intl.formatMessage(messages.skins1),
      2: intl.formatMessage(messages.skins2),
      3: intl.formatMessage(messages.skins3),
      4: intl.formatMessage(messages.skins4),
      5: intl.formatMessage(messages.skins5),
      6: intl.formatMessage(messages.skins6),
    },
  });

  useEffect(() => {
    // fix scrolling focus issue
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [visible]);

  useEffect(
    () => () => {
      document.body.style.overflow = '';
    },
    [],
  );

  const customEmojiCategories = useMemo(() => {
    return withCustom ? buildCustomEmojiCategories(customEmojis ?? [], intl) : undefined;
  }, [withCustom, customEmojis]);

  return visible ? (
    <RenderAfter update={update}>
      <Suspense>
        <EmojiPicker
          custom={customEmojiCategories}
          title={title}
          onEmojiSelect={handlePick}
          recent={frequentlyUsedEmojis}
          perLine={8}
          skin={handleSkinTone}
          emojiSize={22}
          emojiButtonSize={34}
          set='twitter'
          theme={theme === 'light' ? 'light' : 'dark'}
          i18n={getI18n()}
          skinTonePosition='search'
          previewPosition='none'
        />
      </Suspense>
    </RenderAfter>
  ) : null;
};

export { EmojiPickerDropdown as default, type IEmojiPickerDropdown };
