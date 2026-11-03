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

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FlashListRef } from '@shopify/flash-list';

const messages = defineMessages({
  incoming: { id: 'column.follow_requests.short', defaultMessage: 'Incoming' },
  outgoing: { id: 'column.outgoing_follow_requests.short', defaultMessage: 'Outgoing' },
});

interface IFollowRequests {
  ref?: React.Ref<FlashListRef<string>>;
}

const IncomingFollowRequests: React.FC<IFollowRequests> = ({ ref }) => {
  const query = useFollowRequests();

  return (
    <AccountsList
      ref={ref}
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

const OutgoingFollowRequests: React.FC<IFollowRequests> = ({ ref }) => {
  const query = useOutgoingFollowRequests();

  return (
    <AccountsList
      ref={ref}
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

const FollowRequestsScreen = (
  _: NativeStackScreenProps<SettingsStackParams, 'follow_requests'>,
) => {
  const intl = useIntl();
  const [index, setIndex] = useState(0);
  const features = useFeatures();

  const listRefs = {
    incoming: React.useRef<FlashListRef<string>>(null),
    outgoing: React.useRef<FlashListRef<string>>(null),
  };

  if (!features.outgoingFollowRequests) return <IncomingFollowRequests />;

  const routes: Array<{ key: 'incoming' | 'outgoing'; title: string }> = [
    { key: 'incoming', title: intl.formatMessage(messages.incoming) },
    { key: 'outgoing', title: intl.formatMessage(messages.outgoing) },
  ];

  return (
    <TabView
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={({ route }) =>
        route.key === 'outgoing' ? (
          <OutgoingFollowRequests ref={listRefs.outgoing} />
        ) : (
          <IncomingFollowRequests ref={listRefs.incoming} />
        )
      }
      renderTabBar={(props) => (
        <TabBar {...props} onTabReselect={({ key }) => listRefs[key].current?.scrollToTop()} />
      )}
      lazy
    />
  );
};

export { FollowRequestsScreen };
