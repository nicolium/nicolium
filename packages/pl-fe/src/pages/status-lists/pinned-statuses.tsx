import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import MissingIndicator from '@/components/missing-indicator';
import StatusList from '@/components/status-list';
import Column from '@/components/ui/column';
import { profilePinsRoute } from '@/features/ui/router';
import { useOwnAccount } from '@/hooks/use-own-account';
import { usePinnedStatuses } from '@/queries/status-lists/use-pinned-statuses';

const messages = defineMessages({
  heading: { id: 'column.pins', defaultMessage: 'Pinned posts' },
});

const PinnedStatusesPage = () => {
  const intl = useIntl();
  const { username } = profilePinsRoute.useParams();

  const { account } = useOwnAccount();
  const { data: statusIds = [], isFetching: isLoading, hasNextPage: hasMore } = usePinnedStatuses(account?.id ?? '');
  const isMyAccount = username.toLowerCase() === account?.username.toLowerCase();

  if (!isMyAccount) {
    return (
      <MissingIndicator />
    );
  }

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <StatusList
        statusIds={statusIds}
        scrollKey='pinned_statuses'
        hasMore={hasMore}
        isLoading={isLoading}
        emptyMessageText={<FormattedMessage id='pinned_statuses.none' defaultMessage='No pins to show.' />}
      />
    </Column>
  );
};

export { PinnedStatusesPage as default };
