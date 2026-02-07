import { EntityCallbacks } from '@/entity-store/hooks/types';
import { useTransaction } from '@/entity-store/hooks/use-transaction';
import { useClient } from '@/hooks/use-client';

import type { Account } from 'pl-api';

const useSuggest = () => {
  const client = useClient();
  const { transaction } = useTransaction();

  const suggestEffect = (accountId: string, suggested: boolean) => {
    const updater = (account: Account): Account => {
      account.is_suggested = suggested;
      return account;
    };

    transaction({
      Accounts: {
        [accountId]: updater,
      },
    });
  };

  const suggest = async (accountId: string, callbacks?: EntityCallbacks<void, unknown>) => {
    suggestEffect(accountId, true);
    try {
      await client.admin.accounts.suggestUser(accountId);
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      suggestEffect(accountId, false);
    }
  };

  const unsuggest = async (accountId: string, callbacks?: EntityCallbacks<void, unknown>) => {
    suggestEffect(accountId, false);
    try {
      await client.admin.accounts.unsuggestUser(accountId);
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      suggestEffect(accountId, true);
    }
  };

  return {
    suggest,
    unsuggest,
  };
};

export { useSuggest };
