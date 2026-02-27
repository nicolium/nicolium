import { Link } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Text from '@/components/ui/text';
import Widget from '@/components/ui/widget';
import AccountContainer from '@/containers/account-container';
import PlaceholderSidebarSuggestions from '@/features/placeholder/components/placeholder-sidebar-suggestions';
import { useFeatures } from '@/hooks/use-features';
import {
  useDismissSuggestion,
  useSuggestedAccounts,
} from '@/queries/trends/use-suggested-accounts';

import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  dismissSuggestion: { id: 'suggestions.dismiss', defaultMessage: 'Dismiss suggestion' },
});

interface IWhoToFollowPanel {
  limit: number;
}

const WhoToFollowPanel = ({ limit }: IWhoToFollowPanel) => {
  const features = useFeatures();
  const intl = useIntl();

  const { data: suggestions = [], isFetching } = useSuggestedAccounts();
  const dismissSuggestion = useDismissSuggestion();

  const suggestionsToRender = suggestions.slice(0, limit);

  const handleDismiss = (account: AccountEntity) => {
    dismissSuggestion.mutate(account.id);
  };

  if (!isFetching && !suggestionsToRender.length) {
    return null;
  }

  return (
    <Widget
      title={<FormattedMessage id='who_to_follow.title' defaultMessage='People to follow' />}
      action={
        <Link className='text-right' to='/search' search={{ type: 'accounts' }}>
          <Text tag='span' theme='primary' size='sm' className='hover:underline'>
            <FormattedMessage id='feed_suggestions.view_all' defaultMessage='View all' />
          </Text>
        </Link>
      }
    >
      {isFetching ? (
        <PlaceholderSidebarSuggestions limit={limit} />
      ) : (
        suggestionsToRender.map((suggestion) => (
          <AccountContainer
            key={suggestion.account_id}
            id={suggestion.account_id}
            actionIcon={require('@phosphor-icons/core/regular/x.svg')}
            actionTitle={intl.formatMessage(messages.dismissSuggestion)}
            onActionClick={features.suggestionsDismiss ? handleDismiss : undefined}
          />
        ))
      )}
    </Widget>
  );
};

export { WhoToFollowPanel as default };
