import { useMemo } from 'react';

import { Entities } from 'pl-fe/entity-store/entities';
import { useEntityLookup } from 'pl-fe/entity-store/hooks/use-entity-lookup';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { type Account, normalizeAccount } from 'pl-fe/normalizers/account';
import { useRelationshipQuery } from 'pl-fe/queries/accounts/use-relationship';

import type { Account as BaseAccount } from 'pl-api';

interface UseAccountLookupOpts {
  withRelationship?: boolean;
}

const useAccountLookup = (acct: string | undefined, opts: UseAccountLookupOpts = {}) => {
  const client = useClient();
  const features = useFeatures();
  const { me } = useLoggedIn();
  const { withRelationship } = opts;

  const { entity, isUnauthorized, ...result } = useEntityLookup<BaseAccount, Account>(
    Entities.ACCOUNTS,
    (account) => account.acct.toLowerCase() === acct?.toLowerCase(),
    () => client.accounts.lookupAccount(acct!),
    { enabled: !!acct, transform: normalizeAccount },
  );

  const {
    data: relationship,
    isLoading: isRelationshipLoading,
  } = useRelationshipQuery(withRelationship ? entity?.id : undefined);

  const isBlocked = entity?.relationship?.blocked_by === true;
  const isUnavailable = (me === entity?.id) ? false : (isBlocked && !features.blockersVisible);

  const account = useMemo(() => entity ? { ...entity, relationship } : undefined, [entity, relationship]);

  return {
    ...result,
    isLoading: result.isLoading,
    isRelationshipLoading,
    isUnauthorized,
    isUnavailable,
    account,
  };
};

export { useAccountLookup };
