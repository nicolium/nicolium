import React from 'react';
import { useIntl } from 'react-intl';
import { ScrollView } from 'react-native';

import { List } from '@/components/ui/list';
import { useInstance } from '@/contexts/current-account-context';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const RulesScreen = (_: NativeStackScreenProps<SettingsStackParams, 'rules'>) => {
  const intl = useIntl();
  const instance = useInstance();

  return (
    <ScrollView>
      <List
        sections={[
          {
            items: instance.rules.map((rule) => ({
              type: 'text',
              label: rule.translations?.[intl.locale]?.text ?? rule.text,
              sublabel: rule.translations?.[intl.locale]?.hint ?? rule.hint,
            })),
          },
        ]}
      />
    </ScrollView>
  );
};

export { RulesScreen };
