import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import MissingIndicator from '@/components/missing-indicator';
import StatusList from '@/components/statuses/status-list';
import Column from '@/components/ui/column';
import { profileFavoritesRoute } from '@/features/ui/router';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { useFavourites } from '@/queries/status-lists/use-favourites';

const messages = defineMessages({
  heading: { id: 'column.favourited_statuses', defaultMessage: 'Liked posts' },
});

/** Timeline displaying a user's favourited statuses. */
const FavouritedStatusesPage: React.FC = () => {
  const { username } = profileFavoritesRoute.useParams();

  const intl = useIntl();
  const { data: ownAccount } = useOwnAccount();
  const { data: account, isUnavailable } = useAccountLookup(username);

  const isOwnAccount = username.toLowerCase() === ownAccount?.acct?.toLowerCase();
  const accountId = isOwnAccount ? undefined : account?.id;

  const { data: statusIds = [], isFetching, hasNextPage, fetchNextPage } = useFavourites(accountId);

  if (isUnavailable) {
    return (
      <Column>
        <div className='empty-column-indicator'>
          <FormattedMessage
            id='empty_column.account_unavailable'
            defaultMessage='Profile unavailable'
          />
        </div>
      </Column>
    );
  }

  if (!account) {
    return <MissingIndicator />;
  }

  const emptyMessage = isOwnAccount ? (
    <FormattedMessage
      id='empty_column.favourited_statuses'
      defaultMessage="You don't have any liked posts yet. When you like one, it will show up here."
    />
  ) : (
    <FormattedMessage
      id='empty_column.account_favourited_statuses'
      defaultMessage="This user doesn't have any liked posts yet."
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader={false} transparent>
      <StatusList
        statusIds={statusIds}
        scrollKey={`favourited_statuses:${account.id}`}
        hasMore={hasNextPage}
        isLoading={isFetching}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        emptyMessageText={emptyMessage}
      />
    </Column>
  );
};

export { FavouritedStatusesPage as default };
