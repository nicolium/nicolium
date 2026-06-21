import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { FollowingList } from '@/columns/follows';
import Column from '@/components/ui/column';
import { profileFollowingRoute } from '@/router';

const messages = defineMessages({
  heading: { id: 'column.following', defaultMessage: 'Following' },
});

/** Displays a list of accounts the given user is following. */
const FollowingPage: React.FC = () => {
  const { username } = profileFollowingRoute.useParams();
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <FollowingList username={username} />
    </Column>
  );
};

export { FollowingPage as default };
