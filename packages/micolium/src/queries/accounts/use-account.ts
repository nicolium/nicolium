import { useQueryClient } from '@tanstack/react-query';
// import { useMemo } from 'react';
import React from 'react';

import { useClient, useCurrentAccount } from '@/contexts/current-account-context';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { useRelationshipQuery } from './use-relationship';

// import type { NicoliumResponse } from '@/api';

// const ADMIN_PERMISSION = 0x1n;

// const getResponseStatus = (error: unknown) =>
//   (error as { response?: NicoliumResponse })?.response?.status;

// const hasAdminPermission = (permissions?: string): boolean | undefined => {
//   if (!permissions) return undefined;

//   try {
//     return (BigInt(permissions) & ADMIN_PERMISSION) === ADMIN_PERMISSION;
//   } catch {
//     return undefined;
//   }
// };

const useAccount = (accountId?: string, withRelationship = false) => {
  const client = useClient();
  // const features = useFeatures();
  // const { me } = useLoggedIn();
  const queryClient = useQueryClient();
  // const { accountNicknames } = useSettings();
  const scopeUrl = useCurrentAccount();

  // const nickname = accountNicknames[accountId ?? ''];

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

  // const { data: credentialAccount } = useCredentialAccount(me === accountId);

  const { data: relationship, isLoading: isRelationshipLoading } = useRelationshipQuery(
    withRelationship ? accountQuery.data?.id : undefined,
  );

  // const isBlocked = accountQuery.data?.relationship?.blocked_by === true;

  // const credentialIsAdmin = useMemo(
  //   () =>
  //     me === accountId &&
  //     (hasAdminPermission(credentialAccount?.role?.permissions) || credentialAccount?.is_admin),
  //   [credentialAccount?.role?.permissions, me, accountId],
  // );

  const account = React.useMemo(() => {
    if (!accountQuery.data) return undefined;

    const mergedRelationship = relationship ?? accountQuery.data.relationship;
    // const mergedIsAdmin = credentialIsAdmin ?? accountQuery.data.is_admin;

    return {
      ...accountQuery.data,
      // display_name: nickname ?? accountQuery.data.display_name,
      // original_display_name: accountQuery.data.display_name,
      relationship: mergedRelationship,
      // is_admin: mergedIsAdmin,
    };
  }, [accountQuery.data, relationship]);

  return {
    ...accountQuery,
    isRelationshipLoading,
    // isUnauthorized,
    // isUnavailable,
    data: account,
  };
};

export { useAccount };
