import { useMemo } from 'react';

import { Entities } from '@/entity-store/entities';
import { useEntityLookup } from '@/entity-store/hooks/use-entity-lookup';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useRelationshipQuery } from '@/queries/accounts/use-relationship';

import type { Account } from 'pl-api';

interface UseAccountLookupOpts {
  withRelationship?: boolean;
}

const useAccountLookup = (acct: string | undefined, opts: UseAccountLookupOpts = {}) => {
  const client = useClient();
  const features = useFeatures();
  const { me } = useLoggedIn();
  const { withRelationship } = opts;

  const { entity, isUnauthorized, ...result } = useEntityLookup<Account>(
    Entities.ACCOUNTS,
    (account) => account.acct.toLowerCase() === acct?.toLowerCase(),
    () => client.accounts.lookupAccount(acct!),
    { enabled: !!acct },
  );

  const { data: relationship, isLoading: isRelationshipLoading } = useRelationshipQuery(
    withRelationship ? entity?.id : undefined,
  );

  const isBlocked = entity?.relationship?.blocked_by === true;
  const isUnavailable = me === entity?.id ? false : isBlocked && !features.blockersVisible;

  const account = useMemo(
    () => (entity ? { ...entity, relationship } : undefined),
    [entity, relationship],
  );

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
