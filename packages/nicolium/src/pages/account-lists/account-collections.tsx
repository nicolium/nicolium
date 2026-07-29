import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountCollectionsColumn from '@/columns/collections';
import MissingIndicator from '@/components/missing-indicator';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import Spinner from '@/components/ui/spinner';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useCredentialAccount } from '@/queries/accounts/use-account-credentials';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { useAccountCollections } from '@/queries/accounts/use-collections';
import { profileCollectionsRoute } from '@/router';
import { useModalsActions } from '@/stores/modals';

const messages = defineMessages({
  heading: { id: 'column.collections', defaultMessage: 'Collections' },
});

const AccountCollectionsPage: React.FC = () => {
  const intl = useIntl();
  const { username } = profileCollectionsRoute.useParams();

  const { me } = useLoggedIn();
  const { openModal } = useModalsActions();

  const { data: account, isLoading: isLoadingAccount } = useAccountLookup(username);
  const { data: credentialAccount } = useCredentialAccount();

  const isOwnAccount = !!account && account.id === me;

  const createdQuery = useAccountCollections(account?.id);

  if (isLoadingAccount) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  if (!account) {
    return (
      <Column>
        <MissingIndicator />
      </Column>
    );
  }

  const handleCreateCollection = () => {
    openModal('COLLECTION_EDITOR', {});
  };

  const collectionLimit = credentialAccount?.role?.collection_limit;
  const canCreateMore =
    isOwnAccount &&
    (typeof collectionLimit !== 'number' || (createdQuery.data?.length ?? 0) < collectionLimit);

  return (
    <Column
      label={intl.formatMessage(messages.heading)}
      transparent
      action={
        canCreateMore && (
          <button className='collections__create' onClick={handleCreateCollection}>
            <Icon src={iconPlus} aria-hidden />
            <FormattedMessage id='collections.new.create' defaultMessage='New collection' />
          </button>
        )
      }
    >
      <AccountCollectionsColumn username={username} />
    </Column>
  );
};

export { AccountCollectionsPage as default };
