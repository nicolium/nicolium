import { useMemo } from 'react';

import { Entities } from '@/entity-store/entities';
import { useEntity } from '@/entity-store/hooks/use-entity';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useCredentialAccount } from '@/queries/accounts/use-account-credentials';
import { useRelationshipQuery } from '@/queries/accounts/use-relationship';

import type { Account } from 'pl-api';

interface UseAccountOpts {
  withRelationship?: boolean;
}

const ADMIN_PERMISSION = 0x1n;

const hasAdminPermission = (permissions?: string): boolean | undefined => {
  if (!permissions) return undefined;

  try {
    return (BigInt(permissions) & ADMIN_PERMISSION) === ADMIN_PERMISSION;
  } catch {
    return undefined;
  }
};

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

  const { data: credentialAccount } = useCredentialAccount(me === accountId);

  const { data: relationship, isLoading: isRelationshipLoading } = useRelationshipQuery(
    withRelationship ? entity?.id : undefined,
  );

  const isBlocked = entity?.relationship?.blocked_by === true;
  const isUnavailable = me === entity?.id ? false : isBlocked && !features.blockersVisible;

  const credentialIsAdmin = useMemo(
    () => hasAdminPermission(credentialAccount?.role?.permissions),
    [credentialAccount?.role?.permissions],
  );

  const account = useMemo(() => {
    if (!entity) return undefined;

    const mergedRelationship = relationship ?? entity.relationship;
    const mergedIsAdmin = credentialIsAdmin ?? entity.is_admin;

    if (mergedRelationship === entity.relationship && mergedIsAdmin === entity.is_admin) {
      return entity;
    }

    return {
      ...entity,
      relationship: mergedRelationship,
      is_admin: mergedIsAdmin,
    };
  }, [entity, relationship, credentialIsAdmin]);

  return {
    ...result,
    isRelationshipLoading,
    isUnauthorized,
    isUnavailable,
    account,
  };
};

export { useAccount };
