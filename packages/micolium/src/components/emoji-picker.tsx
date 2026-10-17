import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { IconButton, Searchbar, Text, useTheme } from '@mkljczk/react-native-paper';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform, View } from 'react-native';

import emojiData, { type EmojiCategory as MartEmojiCategory } from '@/emoji/data';
import emojiSearch, { type Emoji } from '@/emoji/search';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useCustomEmojis } from '@/queries/instance/use-custom-emojis';
import { useEmojiPickerActions, useEmojiPickerStore } from '@/stores/emoji-picker';

import type { CustomEmoji } from 'pl-api';

const messages = defineMessages({
  people: { id: 'emoji_button.people', defaultMessage: 'People' },
  nature: { id: 'emoji_button.nature', defaultMessage: 'Nature' },
  foods: { id: 'emoji_button.food', defaultMessage: 'Food & Drink' },
  activity: { id: 'emoji_button.activity', defaultMessage: 'Activity' },
  places: { id: 'emoji_button.travel', defaultMessage: 'Travel & Places' },
  objects: { id: 'emoji_button.objects', defaultMessage: 'Objects' },
  symbols: { id: 'emoji_button.symbols', defaultMessage: 'Symbols' },
  flags: { id: 'emoji_button.flags', defaultMessage: 'Flags' },
  custom: { id: 'emoji_button.custom', defaultMessage: 'Custom' },
  emojiSearch: { id: 'emoji_button.search', defaultMessage: 'Search…' },
});

const selectCustomEmojis = (emojis: Array<CustomEmoji>, category: string | null) => {
  return emojis.filter((emoji) => emoji.category === category);
};

const selectCustomCategories = (emojis: Array<CustomEmoji>) => {
  let hasUncategorized = false;

  const categories = new Set<string>();
  for (const emoji of emojis) {
    if (emoji.category) categories.add(emoji.category);
    else hasUncategorized = true;
  }

  const categoriesArray = [...categories].toSorted();
  if (hasUncategorized) categoriesArray.push('');

  return categories;
};

interface ICustomEmojiCategory {
  category: string | null;
}

const CustomEmojiCategory: React.FC<ICustomEmojiCategory> = ({ category }) => {
  const { data: emojis = [] } = useCustomEmojis((emojis) => selectCustomEmojis(emojis, category));

  const { config } = useEmojiPickerStore();
  const { dismissPicker } = useEmojiPickerActions();

  const renderEmoji = (emoji: CustomEmoji) => (
    <Image
      source={{ uri: emoji.url }}
      accessibilityLabel={emoji.shortcode}
      style={{ width: 24, height: 24, objectFit: 'contain' }}
    />
  );

  const renderedEmojis = React.useMemo(() => {
    return emojis.map((emoji) => (
      <IconButton
        key={emoji.shortcode}
        onPress={() => {
          config?.onPick(emoji.shortcode);
          dismissPicker();
        }}
        mode={config?.selected?.includes(emoji.shortcode) ? 'contained-tonal' : 'outlined'}
        icon={() => renderEmoji(emoji)}
        size={24}
      />
    ));
  }, [emojis]);

  return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{renderedEmojis}</View>;
};

interface IEmojiCategoryHeader {
  title: string;
}

const EmojiCategoryHeader: React.FC<IEmojiCategoryHeader> = ({ title }) => (
  <View style={{ flexDirection: 'row' }}>
    <GlassView
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
        marginBottom: 8,
      }}
      glassEffectStyle='clear'
    >
      <Text variant='titleMedium'>{title}</Text>
    </GlassView>
  </View>
);

interface IEmojiCategory {
  category: MartEmojiCategory;
}

const EmojiCategory: React.FC<IEmojiCategory> = ({ category }) => {
  const { config } = useEmojiPickerStore();
  const { dismissPicker } = useEmojiPickerActions();

  const emojis = category.emojis.map((emoji) => emojiData.emojis[emoji].skins[0].native);

  const renderedEmojis = React.useMemo(() => {
    return emojis.map((emoji) => (
      <IconButton
        key={emoji}
        onPress={() => {
          config?.onPick(emoji);
          dismissPicker();
        }}
        mode={config?.selected?.includes(emoji) ? 'contained-tonal' : 'outlined'}
        icon={() => <Text style={{ fontSize: 24 }}>{emoji}</Text>}
        size={24}
      />
    ));
  }, [emojis]);

  return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{renderedEmojis}</View>;
};

interface IEmojiSearchResults {
  searchResults: Array<Emoji>;
}

const EmojiSearchResults: React.FC<IEmojiSearchResults> = ({ searchResults }) => {
  const { config } = useEmojiPickerStore();
  const { dismissPicker } = useEmojiPickerActions();

  const renderedEmojis = React.useMemo(() => {
    return searchResults.map((emoji) => (
      <IconButton
        key={emoji.id}
        onPress={() => {
          config?.onPick(emoji.custom ? emoji.id : emoji.native);
          dismissPicker();
        }}
        mode={
          config?.selected?.includes(emoji.custom ? emoji.id : emoji.native)
            ? 'contained-tonal'
            : 'outlined'
        }
        icon={() =>
          emoji.custom ? (
            <Image
              source={{ uri: emoji.imageUrl }}
              accessibilityLabel={emoji.id}
              style={{ width: 24, height: 24, objectFit: 'contain' }}
            />
          ) : (
            <Text style={{ fontSize: 24 }}>{emoji.native}</Text>
          )
        }
        size={24}
      />
    ));
  }, [searchResults]);

  return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{renderedEmojis}</View>;
};

type PickerItem =
  | { type: 'header'; category: MartEmojiCategory | string }
  | { type: 'row'; category: MartEmojiCategory | string }
  | { type: 'search-results'; category: '' };

const EmojiPicker = React.forwardRef<FlashListRef<PickerItem>>((_, ref) => {
  const { colors } = useTheme();
  const intl = useIntl();
  const { config } = useEmojiPickerStore();

  const [query, setQuery] = React.useState('');
  const deferredQuery = React.useDeferredValue(query);

  const { data: customEmojis } = useCustomEmojis();
  const { data: customCategories = [] } = useCustomEmojis(selectCustomCategories);

  const searchResults = React.useMemo(() => {
    if (!deferredQuery.trim()) return null;

    return emojiSearch(deferredQuery, customEmojis, 40, config?.withCustom);
  }, [deferredQuery]);

  const categories: Array<PickerItem> = React.useMemo(
    () =>
      searchResults
        ? [{ type: 'search-results', category: '' }]
        : [...emojiData.categories, ...customCategories].flatMap((category) => [
            { type: 'header', category },
            { type: 'row', category },
          ]),
    [searchResults, customCategories],
  );

  const renderSearch = () => {
    return (
      <Searchbar
        placeholder={intl.formatMessage(messages.emojiSearch)}
        value={query}
        onChangeText={setQuery}
        style={{
          marginHorizontal: 0,
          marginBottom: 16,
          borderColor: colors.outlineVariant,
          borderWidth: 1,
        }}
      />
    );
  };

  const stickyHeaderIndices = categories
    .map((item, index) => {
      if (item.type === 'header') {
        return index;
      } else {
        return null;
      }
    })
    .filter((item) => item !== null) as number[];

  return (
    <FlashList
      ref={ref}
      data={categories}
      ListHeaderComponent={renderSearch()}
      renderItem={({ item }) => {
        if (!item) return null;

        const { category, type } = item;

        if (type === 'search-results') return <EmojiSearchResults searchResults={searchResults!} />;

        if (typeof category === 'string') {
          if (type === 'row')
            return (
              <CustomEmojiCategory key={`customCategory:${category}`} category={category || null} />
            );
          return (
            <EmojiCategoryHeader
              key={`customHeader:${category}`}
              title={category || intl.formatMessage(messages.custom)}
            />
          );
        }

        if (type === 'row')
          return <EmojiCategory key={`category:${category.id}`} category={category} />;
        return (
          <EmojiCategoryHeader
            key={`header:${category.id}`}
            title={intl.formatMessage(messages[category.id])}
          />
        );
      }}
      stickyHeaderIndices={stickyHeaderIndices}
      getItemType={(item) => {
        return item?.type === 'header' ? 'sectionHeader' : 'row';
      }}
    />
  );
});

EmojiPicker.displayName = 'EmojiPicker';

const EmojiPickerBottomSheet = () => {
  const glassEffect = useEnableLiquidGlass();
  const { colors } = useTheme();

  const { config } = useEmojiPickerStore();
  const { dismissPicker } = useEmojiPickerActions();

  const bottomSheetRef = React.useRef<TrueSheet>(null);
  const scrollableRef = React.useRef<FlashListRef<PickerItem>>(null);

  React.useEffect(() => {
    if (config) {
      bottomSheetRef.current?.present();
    } else if (bottomSheetRef.current) {
      bottomSheetRef.current?.dismiss();
    }
  }, [!config]);

  return (
    <TrueSheet
      ref={bottomSheetRef}
      detents={[0.5, 'auto']}
      onDidDismiss={dismissPicker}
      scrollableRef={scrollableRef}
      style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 16 : 32, paddingHorizontal: 16 }}
      backgroundColor={glassEffect ? undefined : colors.surfaceContainer}
    >
      <EmojiPicker ref={scrollableRef} />
    </TrueSheet>
  );
};

export { EmojiPickerBottomSheet };
