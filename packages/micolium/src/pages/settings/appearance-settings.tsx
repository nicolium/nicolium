import { ScrollView } from '@expo/ui/swift-ui';
import { isGlassEffectAPIAvailable } from 'expo-glass-effect';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { List } from '@/components/ui/list';
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
  enableLiquidGlassDisabledDescription: {
    id: 'preferences.appearance.enable_liquid_glass.disabled_description',
    defaultMessage: 'how did you even get there lol ',
  },
});
const AppearanceSettingsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'appearance'>) => {
  const intl = useIntl();
  const glassEffect = isGlassEffectAPIAvailable();

  const { update } = useSettingsActions();

  const enableLiquidGlass = useSetting('appearance.enableLiquidGlass');

  return (
    <ScrollView>
      <List
        sections={[
          {
            items: [
              {
                type: 'toggle',
                label: intl.formatMessage(messages.enableLiquidGlass),
                sublabel: intl.formatMessage(
                  glassEffect
                    ? messages.enableLiquidGlassDescription
                    : messages.enableLiquidGlassDisabledDescription,
                ),
                active: enableLiquidGlass,
                onPress: () => update('appearance.enableLiquidGlass', !enableLiquidGlass),
                disabled: !glassEffect,
              },
            ],
          },
        ]}
      />
    </ScrollView>
  );
};

export { AppearanceSettingsScreen };
