import React, { useEffect, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import StatusActionBar from '@/components/statuses/status-action-bar';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import { CurrentAccountProvider } from '@/contexts/current-account-context';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useStatus } from '@/queries/statuses/use-status';
import { DEFAULT_STATUS_ACTION_BAR_ITEMS } from '@/schemas/frontend-settings';
import { useAuthStore } from '@/stores/auth';
import { resolveStatus } from '@/utils/resolve';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  title: { id: 'interact_as_modal.title', defaultMessage: 'Interact from accounts' },
  unavailable: {
    id: 'interact_as_modal.unavailable',
    defaultMessage: 'This post could not be found from this account.',
  },
});

const ResolvedStatusActionBar: React.FC<{ statusId: string }> = ({ statusId }) => {
  const { data: status } = useStatus(statusId);

  if (!status?.account) return <Spinner size={24} withText={false} />;

  return (
    <StatusActionBar
      status={status}
      withCounters={false}
      withMenu={false}
      actionItems={DEFAULT_STATUS_ACTION_BAR_ITEMS}
    />
  );
};

interface IInteractAsAccount {
  accountUrl: string;
  statusId: string;
  sourceScope: string;
}

const InteractAsAccount: React.FC<IInteractAsAccount> = ({ accountUrl, statusId, sourceScope }) => {
  const intl = useIntl();
  const { data: account } = useOwnAccount();

  const [resolvedId, setResolvedId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let active = true;

    resolveStatus(statusId, sourceScope, accountUrl)
      .then((id) => active && setResolvedId(id ?? null))
      .catch(() => active && setResolvedId(null));

    return () => {
      active = false;
    };
  }, [statusId, sourceScope, accountUrl]);

  if (!account) return null;

  return (
    <div className='interact-as__account'>
      <Account
        account={account}
        showAccountHoverCard={false}
        withLinkToProfile={false}
        withRelationship={false}
        hideActions
      />

      <div className='interact-as__actions'>
        {resolvedId === undefined ? (
          <Spinner size={24} withText={false} />
        ) : resolvedId === null ? (
          <p className='interact-as__unavailable'>{intl.formatMessage(messages.unavailable)}</p>
        ) : (
          <ResolvedStatusActionBar statusId={resolvedId} />
        )}
      </div>
    </div>
  );
};

interface InteractAsModalProps {
  statusId: string;
}

const InteractAsModal: React.FC<BaseModalProps & InteractAsModalProps> = ({
  onClose,
  statusId,
}) => {
  const sourceScope = useScopeUrl();
  const users = useAuthStore((state) => state.users);

  const accountUrls = useMemo(() => Object.keys(users).filter((url) => users[url]?.id), [users]);

  return (
    <Modal
      title={
        <FormattedMessage id='interact_as_modal.title' defaultMessage='Interact from accounts' />
      }
      onClose={() => onClose('INTERACT_AS')}
    >
      <div className='interact-as'>
        {accountUrls.map((url) => (
          <CurrentAccountProvider key={url} accountUrl={url}>
            <InteractAsAccount accountUrl={url} statusId={statusId} sourceScope={sourceScope} />
          </CurrentAccountProvider>
        ))}
      </div>
    </Modal>
  );
};

export { InteractAsModal as default, type InteractAsModalProps };
