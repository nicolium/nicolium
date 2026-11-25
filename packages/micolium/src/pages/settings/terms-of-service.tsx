import { Text } from '@mkljczk/react-native-paper';
import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { StyledHtml } from '@/components/ui/styled-html';
import { useTermsOfService } from '@/queries/instance/use-terms-of-service';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const TermsOfServiceScreen = (_: NativeStackScreenProps<SettingsStackParams, 'tos'>) => {
  const { bottom: bottomInset } = useSafeAreaInsets();

  const { data: termsOfService } = useTermsOfService();

  if (!termsOfService) return <LoadingIndicator />;

  return (
    <ScrollView contentContainerStyle={{ gap: 8, padding: 12, paddingBottom: 12 + bottomInset }}>
      <Text variant='labelLargeEmphasized'>
        <FormattedMessage
          id='privacy_policy.last_updated'
          defaultMessage='Last updated {date}'
          values={{
            date: (
              <FormattedDate
                value={new Date(termsOfService.effective_date)}
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
      <StyledHtml html={termsOfService.content} />
    </ScrollView>
  );
};

export { TermsOfServiceScreen };
