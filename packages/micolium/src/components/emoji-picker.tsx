import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { IconButton, Text, useTheme } from '@mkljczk/react-native-paper';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { GlassView } from 'expo-glass-effect';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform, View } from 'react-native';

import emojiData, { type EmojiCategory as MartEmojiCategory } from '@/emoji/data';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
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
});

const EmojiCategoryHeader: React.FC<IEmojiCategory> = ({ category }) => {
  const intl = useIntl();

  return (
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
        <Text variant='titleMedium'>{intl.formatMessage(messages[category.id])}</Text>
      </GlassView>
    </View>
  );
};

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

const EmojiPicker = React.forwardRef<FlashListRef<MartEmojiCategory | null>>((_, ref) => {
  const emojis = emojiData.categories.map((category) => [category, null]).flat(2);

  const stickyHeaderIndices = emojis
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
      data={emojis}
      renderItem={({ item, index }) => {
        if (item === null)
          return (
            <EmojiCategory
              key={`category:${emojis[index - 1]?.id}`}
              category={emojis[index - 1]!}
            />
          );
        return <EmojiCategoryHeader key={`header:${emojis[index - 1]?.id}`} category={item} />;
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
  const scrollableRef = React.useRef<FlashListRef<string>>(null);

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
