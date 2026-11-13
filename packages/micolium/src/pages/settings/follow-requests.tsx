import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useScrollToTop } from '@react-navigation/native';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { AccountsList } from '@/components/accounts/accounts-list';
import { useTabBarProps } from '@/components/ui/tab-bar';
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

const IncomingFollowRequests = () => {
  const query = useFollowRequests();
  const ref = React.useRef<FlashListRef<string>>(null);
  useScrollToTop(ref);

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

const OutgoingFollowRequests = () => {
  const query = useOutgoingFollowRequests();
  const ref = React.useRef<FlashListRef<string>>(null);
  useScrollToTop(ref);

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

const FollowRequestsTabs = createMaterialTopTabNavigator<{
  incoming: undefined;
  outgoing: undefined;
}>();

const FollowRequestsScreen = (
  _: NativeStackScreenProps<SettingsStackParams, 'follow_requests'>,
) => {
  const intl = useIntl();
  const features = useFeatures();
  const tabBarProps = useTabBarProps();

  if (!features.outgoingFollowRequests) return <IncomingFollowRequests />;

  return (
    <FollowRequestsTabs.Navigator {...tabBarProps}>
      <FollowRequestsTabs.Screen
        name='incoming'
        component={IncomingFollowRequests}
        options={{ title: intl.formatMessage(messages.incoming) }}
      />
      <FollowRequestsTabs.Screen
        name='outgoing'
        component={OutgoingFollowRequests}
        options={{ title: intl.formatMessage(messages.outgoing) }}
      />
    </FollowRequestsTabs.Navigator>
  );
};

export { FollowRequestsScreen };
