import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { FollowersList } from '@/columns/follows';
import Column from '@/components/ui/column';
import { profileFollowersRoute } from '@/router';

const messages = defineMessages({
  heading: { id: 'column.followers', defaultMessage: 'Followers' },
});

/** Displays a list of accounts who follow the given account. */
const FollowersPage: React.FC = () => {
  const { username } = profileFollowersRoute.useParams();
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <FollowersList username={username} />
    </Column>
  );
};

export { FollowersPage as default };
