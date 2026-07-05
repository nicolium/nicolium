import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import MissingIndicator from '@/components/missing-indicator';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { useEndorsedAccounts } from '@/queries/accounts/use-endorsed-accounts';
import { profileRecommendationsRoute } from '@/router';

const messages = defineMessages({
  heading: { id: 'pinned_accounts.title', defaultMessage: '{name}’s choices' },
});

/** Displays the accounts an account features on their profile. */
const RecommendationsPage: React.FC = () => {
  const intl = useIntl();
  const { username } = profileRecommendationsRoute.useParams();

  const { data: account, isLoading: isLoadingAccount } = useAccountLookup(username);
  const { data: accountIds = [], isLoading } = useEndorsedAccounts(account?.id!, {
    enabled: !!account,
  });

  return (
    <Column
      label={intl.formatMessage(messages.heading, {
        name: account?.display_name || account?.acct || username,
      })}
      transparent
    >
      {isLoadingAccount ? (
        <Spinner />
      ) : !account ? (
        <MissingIndicator />
      ) : (
        <ScrollableList
          scrollKey='recommendations'
          isLoading={isLoading}
          emptyMessageText={
            <FormattedMessage
              id='account.recommendations.empty'
              defaultMessage='@{acct} doesn’t feature any accounts on their profile.'
              values={{ acct: account.acct }}
            />
          }
          itemClassName='account-list__item'
        >
          {accountIds.map((accountId) => (
            <AccountContainer key={accountId} id={accountId} withRelationship={false} />
          ))}
        </ScrollableList>
      )}
    </Column>
  );
};

export { RecommendationsPage as default };
