import { ChatSlashIcon } from 'phosphor-react-native/src/icons/ChatSlash';
import { FunnelIcon } from 'phosphor-react-native/src/icons/Funnel';
import { HeartHalfIcon } from 'phosphor-react-native/src/icons/HeartHalf';
import { ProhibitIcon } from 'phosphor-react-native/src/icons/Prohibit';
import { SpeakerSimpleXIcon } from 'phosphor-react-native/src/icons/SpeakerSimpleX';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ScrollView } from 'react-native';

import { List } from '@/components/ui/list';
import { useFeatures } from '@/contexts/current-account-context';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  muted: { id: 'column.mutes.long', defaultMessage: 'Muted accounts' },
  blocked: { id: 'column.blocks.long', defaultMessage: 'Blocked accounts' },
  filters: { id: 'column.filters', defaultMessage: 'Muted words' },
  interactionPolicies: {
    id: 'column.interaction_policies',
    defaultMessage: 'Interaction policies',
  },
  mutedThreads: { id: 'column.muted_threads', defaultMessage: 'Muted conversations' },
});

const ContentSettingsScreen = ({
  navigation,
}: NativeStackScreenProps<SettingsStackParams, 'content'>) => {
  const intl = useIntl();
  const features = useFeatures();

  return (
    <ScrollView>
      <List
        sections={[
          {
            items: [
              {
                icon: SpeakerSimpleXIcon,
                type: 'button',
                label: intl.formatMessage(messages.muted),
                onPress: () => navigation.navigate('mutes'),
              },
              {
                icon: ProhibitIcon,
                type: 'button',
                label: intl.formatMessage(messages.blocked),
                onPress: () => navigation.navigate('blocks'),
              },
              {
                icon: FunnelIcon,
                type: 'button',
                label: intl.formatMessage(messages.filters),
                onPress: () => navigation.navigate('filters'),
              },
              {
                icon: HeartHalfIcon,
                type: 'button',
                label: intl.formatMessage(messages.interactionPolicies),
                onPress: () => navigation.navigate('interaction_policies'),
                enabled: features.interactionRequests || features.quoteApprovalPolicies,
              },
              {
                icon: ChatSlashIcon,
                type: 'button',
                label: intl.formatMessage(messages.mutedThreads),
                onPress: () => navigation.navigate('muted_threads'),
                enabled: features.mutedThreads,
              },
            ],
          },
        ]}
      />
    </ScrollView>
  );
};

export { ContentSettingsScreen };
