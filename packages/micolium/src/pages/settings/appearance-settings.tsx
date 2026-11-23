import { isGlassEffectAPIAvailable } from 'expo-glass-effect';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform, ScrollView } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { type IListSections, List } from '@/components/ui/list';
import { useSetting, useSettingsActions } from '@/stores/settings';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  autoPlayGif: {
    id: 'preferences.fields.auto_play_gif.label',
    defaultMessage: 'Auto-play animated GIFs',
  },
  blackMode: {
    id: 'preferences.appearance.black_mode',
    defaultMessage: 'Use black color for the background in dark mode',
  },
  enableLiquidGlass: {
    id: 'preferences.appearance.enable_liquid_glass',
    defaultMessage: 'Use native glass effect',
  },
  enableLiquidGlassDescription: {
    id: 'preferences.appearance.enable_liquid_glass.description',
    defaultMessage:
      'Turning this option off will reduce the amount of displayed glass effects, but won’t fully disable it.',
  },
  contrast: { id: 'preferences.fields.contrast', defaultMessage: 'Contrast' },
  contrastStandard: { id: 'preferences.options.contrast.normal', defaultMessage: 'Normal' },
  contrastMedium: { id: 'preferences.options.contrast.medium', defaultMessage: 'Medium' },
  contrastHigh: { id: 'preferences.options.contrast.high', defaultMessage: 'High' },
  baseColor: {
    id: 'preferences.options.brand_color',
    defaultMessage: 'Base color',
  },
  useHeartIconForFavourites: {
    id: 'preferences.fields.use_heart_icon_for_favourites.label.short',
    defaultMessage: 'Use heart icon for likes',
  },
});
const AppearanceSettingsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'appearance'>) => {
  const intl = useIntl();
  const glassEffect = isGlassEffectAPIAvailable();
  const reducedMotion = useReducedMotion();

  const { update } = useSettingsActions();

  const enableLiquidGlass = useSetting('appearance.enableLiquidGlass');
  const sourceColor = useSetting('appearance.sourceColor');
  const black = useSetting('appearance.black');
  const contrast = useSetting('appearance.contrast');
  const useHeartIconForFavourites = useSetting('appearance.useHeartIconForFavourites');
  const autoPlayGif = useSetting('appearance.autoPlayGif');

  const listSections = React.useMemo(() => {
    const section: IListSections[number] = {
      items: [
        {
          type: 'toggle',
          label: intl.formatMessage(messages.blackMode),
          active: black,
          onPress: () => update('appearance.black', !black),
        },
        {
          type: 'select',
          label: intl.formatMessage(messages.contrast),
          active: contrast,
          onChange: (value: typeof contrast) => update('appearance.contrast', value),
          options: [
            { value: 'standard', label: intl.formatMessage(messages.contrastStandard) },
            { value: 'medium', label: intl.formatMessage(messages.contrastMedium) },
            { value: 'high', label: intl.formatMessage(messages.contrastHigh) },
          ],
        },
      ],
    };

    if (Platform.OS !== 'android') {
      section.items.push({
        type: 'color-picker',
        label: intl.formatMessage(messages.baseColor),
        value: sourceColor,
        onChange: (color) => update('appearance.sourceColor', color),
      });
    }

    if (glassEffect) {
      section.items.push({
        type: 'toggle',
        label: intl.formatMessage(messages.enableLiquidGlass),
        sublabel: intl.formatMessage(messages.enableLiquidGlassDescription),
        active: enableLiquidGlass,
        onPress: () => update('appearance.enableLiquidGlass', !enableLiquidGlass),
      });
    }

    return [
      section,
      {
        items: [
          {
            type: 'toggle',
            label: intl.formatMessage(messages.autoPlayGif),
            active: autoPlayGif,
            onPress: () => update('appearance.autoPlayGif', !autoPlayGif),
            disabled: reducedMotion,
          },
          {
            type: 'toggle',
            label: intl.formatMessage(messages.useHeartIconForFavourites),
            active: useHeartIconForFavourites,
            onPress: () =>
              update('appearance.useHeartIconForFavourites', !useHeartIconForFavourites),
          },
        ],
      },
    ] as IListSections;
  }, [
    black,
    contrast,
    sourceColor,
    glassEffect,
    enableLiquidGlass,
    useHeartIconForFavourites,
    autoPlayGif,
    reducedMotion,
  ]);

  return (
    <ScrollView>
      <List sections={listSections} />
    </ScrollView>
  );
};

export { AppearanceSettingsScreen };
