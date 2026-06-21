import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { SubscribersList } from '@/columns/follows';
import Column from '@/components/ui/column';
import { profileSubscribersRoute } from '@/router';

const messages = defineMessages({
  heading: { id: 'column.subscribers', defaultMessage: 'Subscribers' },
});

/** Displays a list of accounts subscribing the given account. */
const SubscribersPage: React.FC = () => {
  const { username } = profileSubscribersRoute.useParams();
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <SubscribersList username={username} />
    </Column>
  );
};

export { SubscribersPage as default };
