import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import MissingIndicator from 'pl-fe/components/missing-indicator';
import StatusList from 'pl-fe/components/status-list';
import Column from 'pl-fe/components/ui/column';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { usePinnedStatuses } from 'pl-fe/queries/status-lists/use-pinned-statuses';

const messages = defineMessages({
  heading: { id: 'column.pins', defaultMessage: 'Pinned posts' },
});

const PinnedStatusesPage = () => {
  const intl = useIntl();
  const { username } = useParams<{ username: string }>();

  const { account } = useOwnAccount();
  const { data: statusIds = [], isFetching: isLoading, hasNextPage: hasMore } = usePinnedStatuses(account?.id || '');
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
