import { ChatSlashIcon } from 'phosphor-react-native/src/icons/ChatSlash';
import { FunnelIcon } from 'phosphor-react-native/src/icons/Funnel';
import { GlobeSimpleXIcon } from 'phosphor-react-native/src/icons/GlobeSimpleX';
import { HeartHalfIcon } from 'phosphor-react-native/src/icons/HeartHalf';
import { ProhibitIcon } from 'phosphor-react-native/src/icons/Prohibit';
import { SpeakerSimpleXIcon } from 'phosphor-react-native/src/icons/SpeakerSimpleX';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ScrollView } from 'react-native';

import { type IListSections, List } from '@/components/ui/list';
import { useFeatures } from '@/contexts/current-account-context';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  muted: { id: 'column.mutes.long', defaultMessage: 'Muted accounts' },
  blocked: { id: 'column.blocks.long', defaultMessage: 'Blocked accounts' },
  domainBlocks: { id: 'column.domain_blocks', defaultMessage: 'Domain blocks' },
  filters: { id: 'column.filters', defaultMessage: 'Muted words' },
  interactionPolicies: {
    id: 'column.interaction_policies',
    defaultMessage: 'Interaction policies',
  },
  mutedThreads: { id: 'column.muted_threads', defaultMessage: 'Muted conversations' },
});

const ContentFilteringSettingsScreen = ({
  navigation,
}: NativeStackScreenProps<SettingsStackParams, 'content_filtering'>) => {
  const intl = useIntl();
  const features = useFeatures();

  const listSections = React.useMemo(() => {
    const section: IListSections[number] = {
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
          icon: GlobeSimpleXIcon,
          type: 'button',
          label: intl.formatMessage(messages.domainBlocks),
          onPress: () => navigation.navigate('domain_blocks'),
        },
        {
          icon: FunnelIcon,
          type: 'button',
          label: intl.formatMessage(messages.filters),
          onPress: () => navigation.navigate('filters'),
        },
      ],
    };

    if (features.interactionRequests || features.quoteApprovalPolicies) {
      section.items.push({
        icon: HeartHalfIcon,
        type: 'button',
        label: intl.formatMessage(messages.interactionPolicies),
        onPress: () => navigation.navigate('interaction_policies'),
      });
    }

    if (features.mutedThreads) {
      section.items.push({
        icon: ChatSlashIcon,
        type: 'button',
        label: intl.formatMessage(messages.mutedThreads),
        onPress: () => navigation.navigate('muted_threads'),
      });
    }

    return [section];
  }, [features]);

  return (
    <ScrollView>
      <List sections={listSections} />
    </ScrollView>
  );
};

export { ContentFilteringSettingsScreen };
