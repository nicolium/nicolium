import { isGlassEffectAPIAvailable } from 'expo-glass-effect';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform, ScrollView } from 'react-native';

import { type IListSections, List } from '@/components/ui/list';
import { useSetting, useSettingsActions } from '@/stores/settings';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  enableLiquidGlass: {
    id: 'preferences.appearance.enable_liquid_glass',
    defaultMessage: 'Use native glass effect',
  },
  enableLiquidGlassDescription: {
    id: 'preferences.appearance.enable_liquid_glass.description',
    defaultMessage:
      'Turning this option off will reduce the amount of displayed glass effects, but won’t fully disable it.',
  },
  baseColor: {
    id: 'preferences.options.brand_color',
    defaultMessage: 'Base color',
  },
});
const AppearanceSettingsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'appearance'>) => {
  const intl = useIntl();
  const glassEffect = isGlassEffectAPIAvailable();

  const { update } = useSettingsActions();

  const enableLiquidGlass = useSetting('appearance.enableLiquidGlass');
  const sourceColor = useSetting('appearance.sourceColor');

  const listSections = React.useMemo(() => {
    const section: IListSections[number] = {
      items: [],
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

    return [section];
  }, [sourceColor, glassEffect, enableLiquidGlass]);

  return (
    <ScrollView>
      <List sections={listSections} />
    </ScrollView>
  );
};

export { AppearanceSettingsScreen };
