import React from 'react';
import { FormattedMessage } from 'react-intl';

import { AccountsList } from '@/components/accounts/accounts-list';
import { useFollowRequests } from '@/queries/accounts/use-follow-requests';

import type { RootStackParams } from '../router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const FollowRequestsScreen = (_: NativeStackScreenProps<RootStackParams, 'follow_requests'>) => {
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

export { FollowRequestsScreen };
