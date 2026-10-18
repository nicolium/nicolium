import { useTheme } from '@mkljczk/react-native-paper';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { TabView } from 'react-native-tab-view';

import { AccountsList } from '@/components/accounts/accounts-list';
import { TabBar } from '@/components/ui/tab-bar';
import { useFeatures } from '@/contexts/current-account-context';
import {
  useFollowRequests,
  useOutgoingFollowRequests,
} from '@/queries/accounts/use-follow-requests';

import type { RootStackParams } from '../router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  incoming: { id: 'column.follow_requests.short', defaultMessage: 'Incoming' },
  outgoing: { id: 'column.outgoing_follow_requests.short', defaultMessage: 'Outgoing' },
});

const IncomingFollowRequests = () => {
  const query = useFollowRequests();

  return (
    <AccountsList
      query={query}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.follow_requests'
          defaultMessage='You don’t have any follow requests yet. When you receive one, it will show up here.'
        />
      }
      actionType='follow_request'
    />
  );
};

const OutgoingFollowRequests = () => {
  const query = useOutgoingFollowRequests();

  return (
    <AccountsList
      query={query}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.outgoing_follow_requests'
          defaultMessage='You don’t have any outgoing follow requests yet. When you try to follow a user, it will show up here.'
        />
      }
    />
  );
};

const FollowRequestsScreen = (_: NativeStackScreenProps<RootStackParams, 'follow_requests'>) => {
  const { colors } = useTheme();
  const intl = useIntl();
  const [index, setIndex] = useState(0);
  const features = useFeatures();

  if (!features.outgoingFollowRequests) return <IncomingFollowRequests />;

  const routes = [
    { key: 'incoming', title: intl.formatMessage(messages.incoming) },
    { key: 'outgoing', title: intl.formatMessage(messages.outgoing) },
  ];

  return (
    <TabView
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={({ route }) =>
        route.key === 'outgoing' ? <OutgoingFollowRequests /> : <IncomingFollowRequests />
      }
      renderTabBar={(props) => (
        <TabBar {...props} style={{ backgroundColor: colors.surfaceContainer }} />
      )}
      lazy
    />
  );
};

export { FollowRequestsScreen };
