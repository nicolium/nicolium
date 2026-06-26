import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useAccount } from '@/queries/accounts/use-account';
import { scopedQueryKey, useAppInfiniteQuery, useAppQuery } from '@/queries/query';
import { getTagDiff } from '@/utils/badges';

import { queryKeys } from '../keys';
import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { minifyAdminAccount, minifyAdminAccountList } from '../utils/minify-list';

import type {
  AdminAccount,
  AdminAccountAction,
  AdminAccountUpdateCredentialsParams,
  AdminGetAccountsParams,
  AdminPerformAccountActionParams,
  PaginatedResponse,
  PaginationParams,
} from 'pl-api';

const useAdminAccounts = makePaginatedResponseQuery(
  (params: Omit<AdminGetAccountsParams, keyof PaginationParams>) =>
    queryKeys.admin.accountLists.show(params),
  (client, [params]) => client.admin.accounts.getAccounts(params).then(minifyAdminAccountList),
  undefined,
  'isAdmin',
);

const useAdminAccount = (accountId?: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  const query = useAppQuery<AdminAccount>({
    queryKey: queryKeys.admin.accounts.show(accountId!),
    queryFn: () =>
      client.admin.accounts.getAccount(accountId!).then(({ account, ...adminAccount }) => {
        if (account)
          queryClient.setQueryData(
            scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
            account,
          );
        return adminAccount as AdminAccount;
      }),
    enabled: !!accountId,
  });

  const { data: account } = useAccount(query.data ? accountId : undefined);

  if (query.data && account) query.data.account = account;

  return query;
};

const pendingUsersQuery = makePaginatedResponseQueryOptions(
  queryKeys.admin.accountLists.show({ origin: 'local', status: 'pending' }),
  (client) =>
    client.admin.accounts
      .getAccounts({ origin: 'local', status: 'pending' })
      .then(minifyAdminAccountList),
);

const usePendingUsersCount = () => {
  const client = useClient();
  const { data: account } = useOwnAccount();
  const features = useFeatures();
  const scopeUrl = useScopeUrl();

  return useAppInfiniteQuery({
    ...pendingUsersQuery(client, scopeUrl),
    select: (data) =>
      (data.pages.at(-1)?.total ?? data.pages.flatMap((page) => page.items).length) || 0,
    enabled:
      !!(account?.is_admin ?? account?.is_moderator) &&
      (features.pleromaAdminAccounts || features.mastodonAdminV2),
  });
};

const useAdminApproveAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.approveAccount(accountId),
    onSuccess: ({ account, ...adminAccount }) => {
      if (account)
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
          account,
        );
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.admin.accounts.show(adminAccount.id), scopeUrl),
        adminAccount,
      );
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>(
        {
          queryKey: scopedQueryKey(
            queryKeys.admin.accountLists.show({ status: 'pending' }),
            scopeUrl,
          ),
          exact: false,
        },
        filterById(accountId),
      );
    },
  });
};

const useAdminRejectAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.rejectAccount(accountId),
    onSuccess: () => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>(
        {
          queryKey: scopedQueryKey(
            queryKeys.admin.accountLists.show({ status: 'pending' }),
            scopeUrl,
          ),
          exact: false,
        },
        filterById(accountId),
      );
    },
  });
};

const useAdminDeleteAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.deleteAccount(accountId),
    onSuccess: () => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>(
        {
          queryKey: scopedQueryKey(queryKeys.admin.accountLists.root, scopeUrl),
          exact: false,
        },
        filterById(accountId),
      );
    },
  });
};

const useAdminPerformAccountActionMutation = (accountId: string, type: AdminAccountAction) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: (params?: AdminPerformAccountActionParams) =>
      client.admin.accounts.performAccountAction(accountId, type, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.accountLists.root, scopeUrl),
        exact: false,
      });
    },
  });
};

const useAdminEnableAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.enableAccount(accountId),
    onSuccess: (account) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>(
        {
          queryKey: scopedQueryKey(
            queryKeys.admin.accountLists.show({ status: 'disabled' }),
            scopeUrl,
          ),
          exact: false,
        },
        filterById(accountId),
      );
      minifyAdminAccount(account, scopeUrl);
    },
  });
};

const useAdminUnsilenceAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.unsilenceAccount(accountId),
    onSuccess: (account) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>(
        {
          queryKey: scopedQueryKey(
            queryKeys.admin.accountLists.show({ status: 'silenced' }),
            scopeUrl,
          ),
          exact: false,
        },
        filterById(accountId),
      );
      minifyAdminAccount(account, scopeUrl);
    },
  });
};

const useAdminUnsuspendAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.unsuspendAccount(accountId),
    onSuccess: (account) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>(
        {
          queryKey: scopedQueryKey(
            queryKeys.admin.accountLists.show({ status: 'suspended' }),
            scopeUrl,
          ),
          exact: false,
        },
        filterById(accountId),
      );
      minifyAdminAccount(account, scopeUrl);
    },
  });
};

const useAdminUnsensitiveAccountMutation = (accountId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.unsensitiveAccount(accountId),
    onSuccess: (account) => {
      minifyAdminAccount(account, scopeUrl);
    },
  });
};

const useAdminTagUserMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId, 'tag'],
    mutationFn: (tags: Array<string>) => client.admin.accounts.tagUser(accountId, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.accounts.show(accountId), scopeUrl),
      });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
      });
    },
  });
};

const useAdminUntagUserMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId, 'untag'],
    mutationFn: (tags: Array<string>) => client.admin.accounts.untagUser(accountId, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
      });
    },
  });
};

const useAdminUpdateTagsMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId, 'updateTags'],
    mutationFn: ({ oldTags, newTags }: { oldTags: Array<string>; newTags: Array<string> }) => {
      const { added, removed } = getTagDiff(oldTags, newTags);

      return Promise.all([
        added.length ? client.admin.accounts.tagUser(accountId, added) : null,
        removed.length ? client.admin.accounts.untagUser(accountId, removed) : null,
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
      });
    },
  });
};

const useAdminSetRoleMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId, 'setRole'],
    mutationFn: (role: 'user' | 'moderator' | 'admin') => {
      switch (role) {
        case 'user':
          return client.admin.accounts.demoteToUser(accountId);
        case 'moderator':
          return client.admin.accounts.promoteToModerator(accountId);
        case 'admin':
          return client.admin.accounts.promoteToAdmin(accountId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
      });
    },
  });
};

const useAdminResetAccountPasswordMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'accounts', accountId, 'resetPassword'],
    mutationFn: (password: string) => client.admin.accounts.resetPassword(accountId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
      });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.accounts.show(accountId), scopeUrl),
      });
    },
  });
};

const useAdminUpdateAccountCredentialsMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'accounts', accountId, 'update'],
    mutationFn: (params: AdminAccountUpdateCredentialsParams) =>
      client.admin.accounts.updateCredentials(accountId, params),
    onSuccess: ({ account, ...adminAccount }) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.admin.accounts.show(adminAccount.id), scopeUrl),
        adminAccount,
      );
      if (account)
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
          account,
        );
    },
  });
};

export {
  useAdminAccount,
  useAdminAccounts,
  usePendingUsersCount,
  useAdminApproveAccountMutation,
  useAdminRejectAccountMutation,
  useAdminDeleteAccountMutation,
  useAdminPerformAccountActionMutation,
  useAdminEnableAccountMutation,
  useAdminUnsilenceAccountMutation,
  useAdminUnsuspendAccountMutation,
  useAdminUnsensitiveAccountMutation,
  useAdminTagUserMutation,
  useAdminUntagUserMutation,
  useAdminUpdateTagsMutation,
  useAdminSetRoleMutation,
  useAdminResetAccountPasswordMutation,
  useAdminUpdateAccountCredentialsMutation,
};
