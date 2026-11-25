import { Text } from '@mkljczk/react-native-paper';
import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { StyledHtml } from '@/components/ui/styled-html';
import { usePrivacyPolicy } from '@/queries/instance/use-privacy-policy';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const PrivacyPolicyScreen = (_: NativeStackScreenProps<SettingsStackParams, 'privacy_policy'>) => {
  const { bottom: bottomInset } = useSafeAreaInsets();

  const { data: privacyPolicy } = usePrivacyPolicy();

  if (!privacyPolicy) return <LoadingIndicator />;

  return (
    <ScrollView contentContainerStyle={{ gap: 8, padding: 12, paddingBottom: 12 + bottomInset }}>
      <Text variant='labelLargeEmphasized'>
        <FormattedMessage
          id='privacy_policy.last_updated'
          defaultMessage='Last updated {date}'
          values={{
            date: (
              <FormattedDate
                value={new Date(privacyPolicy.updated_at)}
                hour12
                month='short'
                day='2-digit'
                hour='numeric'
                minute='2-digit'
                year='numeric'
              />
            ),
          }}
        />
      </Text>
      <StyledHtml html={privacyPolicy.content} />
    </ScrollView>
  );
};

export { PrivacyPolicyScreen };
