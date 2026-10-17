import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { IconButton, Text, useTheme } from '@mkljczk/react-native-paper';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform, View } from 'react-native';

import emojiData, { type EmojiCategory as MartEmojiCategory } from '@/emoji/data';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useCustomEmojis } from '@/queries/instance/use-custom-emojis';
import { useEmojiPickerActions, useEmojiPickerStore } from '@/stores/emoji-picker';

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
});

interface ICustomEmojiCategory {
  category: string | null;
}

const CustomEmojiCategory: React.FC<ICustomEmojiCategory> = ({ category }) => {
  const { data: emojis = [] } = useCustomEmojis((emojis) => {
    return emojis.filter((emoji) => emoji.category === category);
  });

  const { config } = useEmojiPickerStore();
  const { dismissPicker } = useEmojiPickerActions();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {emojis.map((emoji) => (
        <IconButton
          key={emoji.shortcode}
          onPress={() => {
            config?.onPick(emoji.shortcode);
            dismissPicker();
          }}
          mode={config?.selected?.includes(emoji.shortcode) ? 'contained-tonal' : 'outlined'}
          icon={() => (
            <Image
              key={emoji.shortcode}
              source={{ uri: emoji.url }}
              accessibilityLabel={emoji.shortcode}
              style={{ width: 24, height: 24, objectFit: 'contain', display: 'inline-block' }}
            />
          )}
          size={24}
        />
      ))}
    </View>
  );
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

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {emojis.map((emoji) => (
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
      ))}
    </View>
  );
};

const EmojiPicker = React.forwardRef<FlashListRef<string | MartEmojiCategory | null>>((_, ref) => {
  const intl = useIntl();

  const { data: customCategories = [] } = useCustomEmojis((emojis) => {
    let hasUncategorized = false;

    const categories = new Set<string>();
    for (const emoji of emojis) {
      if (emoji.category) categories.add(emoji.category);
      else hasUncategorized = true;
    }

    const categoriesArray = [...categories];
    if (hasUncategorized) categoriesArray.push('');

    return categories;
  });

  const categories = [...emojiData.categories, ...customCategories]
    .map((category) => [category, null])
    .flat(2);

  const stickyHeaderIndices = categories
    .map((item, index) => {
      if (item !== null) {
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
      renderItem={({ item, index }) => {
        const category = item === null ? categories[index - 1]! : item;

        if (typeof category === 'string') {
          if (item === null)
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

        if (item === null)
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
        return item ? 'sectionHeader' : 'row';
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
  const scrollableRef = React.useRef<FlashListRef<string | MartEmojiCategory | null>>(null);

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
      detents={[0.4, 'auto']}
      onDidDismiss={() => dismissPicker()}
      scrollableRef={scrollableRef}
      style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 16 : 32, paddingHorizontal: 16 }}
      backgroundColor={glassEffect ? undefined : colors.surfaceContainer}
    >
      <EmojiPicker ref={scrollableRef} />
    </TrueSheet>
  );
};

export { EmojiPickerBottomSheet };
