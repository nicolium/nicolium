import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useCredentialAccount } from '@/queries/accounts/use-account-credentials';
import { useRelationshipQuery } from '@/queries/accounts/use-relationship';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQuery } from '@/queries/query';
import { useSettings } from '@/stores/settings';

import type { NicoliumResponse } from '@/api';

const ADMIN_PERMISSION = 0x1n;

const getResponseStatus = (error: unknown) =>
  (error as { response?: NicoliumResponse })?.response?.status;

const hasAdminPermission = (permissions?: string): boolean | undefined => {
  if (!permissions) return undefined;

  try {
    return (BigInt(permissions) & ADMIN_PERMISSION) === ADMIN_PERMISSION;
  } catch {
    return undefined;
  }
};

const useAccount = (accountId?: string, withRelationship = false) => {
  const client = useClient();
  const features = useFeatures();
  const { me } = useLoggedIn();
  const queryClient = useQueryClient();
  const { accountNicknames } = useSettings();
  const scopeUrl = useScopeUrl();

  const nickname = accountNicknames[accountId ?? ''];

  const accountQuery = useAppQuery({
    queryKey: queryKeys.accounts.show(accountId!),
    queryFn: async () => {
      const account = await client.accounts.getAccount(accountId!);
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accounts.lookup(account.acct.toLowerCase()), scopeUrl),
        account.id,
      );
      return account;
    },
    enabled: !!accountId,
  });

  const { data: credentialAccount } = useCredentialAccount(me === accountId);

  const { data: relationship, isLoading: isRelationshipLoading } = useRelationshipQuery(
    withRelationship ? accountQuery.data?.id : undefined,
  );

  const isBlocked = accountQuery.data?.relationship?.blocked_by === true;
  const isUnavailable =
    me === accountQuery.data?.id ? false : isBlocked && !features.blockersVisible;
  const isUnauthorized = getResponseStatus(accountQuery.error) === 401;

  const credentialIsAdmin = useMemo(
    () =>
      me === accountId &&
      (hasAdminPermission(credentialAccount?.role?.permissions) || credentialAccount?.is_admin),
    [credentialAccount?.role?.permissions, me, accountId],
  );

  const account = useMemo(() => {
    if (!accountQuery.data) return undefined;

    const mergedRelationship = relationship ?? accountQuery.data.relationship;
    const mergedIsAdmin = credentialIsAdmin ?? accountQuery.data.is_admin;

    return {
      ...accountQuery.data,
      display_name: nickname ?? accountQuery.data.display_name,
      original_display_name: accountQuery.data.display_name,
      relationship: mergedRelationship,
      is_admin: mergedIsAdmin,
    };
  }, [accountQuery.data, relationship, credentialIsAdmin, nickname]);

  return {
    ...accountQuery,
    isRelationshipLoading,
    isUnauthorized,
    isUnavailable,
    data: account,
  };
};

export { useAccount };
