import { useMemo } from 'react';

import { Entities } from 'pl-fe/entity-store/entities';
import { useEntity } from 'pl-fe/entity-store/hooks/use-entity';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { useRelationshipQuery } from 'pl-fe/queries/accounts/use-relationship';

import type { Account } from 'pl-api';

interface UseAccountOpts {
  withRelationship?: boolean;
}

const useAccount = (accountId?: string, opts: UseAccountOpts = {}) => {
  const client = useClient();
  const features = useFeatures();
  const { me } = useLoggedIn();
  const { withRelationship } = opts;

  const { entity, isUnauthorized, ...result } = useEntity<Account>(
    [Entities.ACCOUNTS, accountId!],
    () => client.accounts.getAccount(accountId!),
    { enabled: !!accountId },
  );

  const meta = useAppSelector((state) => accountId ? state.accounts_meta[accountId] : undefined);

  const {
    data: relationship,
    isLoading: isRelationshipLoading,
  } = useRelationshipQuery(withRelationship ? entity?.id : undefined);

  const isBlocked = entity?.relationship?.blocked_by === true;
  const isUnavailable = (me === entity?.id) ? false : (isBlocked && !features.blockersVisible);

  const account = useMemo(
    () => entity ? {
      ...entity,
      relationship,
      __meta: { meta, ...entity.__meta },
      // @ts-ignore
      is_admin: meta?.role ? (meta.role.permissions & 0x1) === 0x1 : entity.is_admin,
    } : undefined,
    [entity, relationship],
  );

  return {
    ...result,
    isRelationshipLoading,
    isUnauthorized,
    isUnavailable,
    account,
  };
};

export { useAccount };
