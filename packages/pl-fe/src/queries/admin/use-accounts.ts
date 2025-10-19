import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


import { importEntities } from 'pl-fe/actions/importer';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';

import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { minifyAdminAccount, minifyAdminAccountList } from '../utils/minify-list';

import type { AdminPerformAccountActionParams, PaginatedResponse, AdminAccount, AdminGetAccountsParams, PaginationParams, AdminAccountAction } from 'pl-api';


const useAdminAccounts = makePaginatedResponseQuery(
  (params: Omit<AdminGetAccountsParams, keyof PaginationParams>) => ['admin', 'accountLists', params],
  (client, [params]) => client.admin.accounts.getAccounts(params).then(minifyAdminAccountList),
  undefined,
  'isAdmin',
);

const useAdminAccount = (accountId?: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  const query = useQuery<AdminAccount>({
    queryKey: ['admin', 'accounts', accountId],
    queryFn: () => client.admin.accounts.getAccount(accountId!).then(({ account, ...adminAccount }) => {
      dispatch(importEntities({ accounts: [account] }));
      return adminAccount as AdminAccount;
    }),
    enabled: !!accountId,
  });

  const { account } = useAccount(query.data ? accountId : undefined);

  if (query.data && account) query.data.account = account;

  return query;
};

const pendingUsersQuery = makePaginatedResponseQueryOptions(
  ['admin', 'accountLists', { origin: 'local', status: 'pending' }],
  (client) => client.admin.accounts.getAccounts({ origin: 'local', status: 'pending' }).then(minifyAdminAccountList),
)();

const usePendingUsersCount = () => {
  const { account } = useOwnAccount();

  return useInfiniteQuery({
    ...pendingUsersQuery,
    select: (data) => data.pages.at(-1)?.total || data.pages.map(page => page.items).flat().length || 0,
    enabled: !!(account?.is_admin || account?.is_moderator),
  });
};

const useAdminApproveAccountMutation = (accountId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.approveAccount(accountId),
    onSuccess: ({ account, ...adminAccount }) => {
      dispatch(importEntities({ accounts: [account] }));
      queryClient.setQueryData(['admin', 'accounts', adminAccount.id], adminAccount);
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>({
        queryKey: ['admin', 'accountLists', {
          status: 'pending',
        }],
        exact: false,
      }, filterById(accountId));
    },
  });
};

const useAdminRejectAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.rejectAccount(accountId),
    onSuccess: () => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>({
        queryKey: ['admin', 'accountLists', {
          status: 'pending',
        }],
        exact: false,
      }, filterById(accountId));
    },
  });
};

const useAdminDeleteAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.deleteAccount(accountId),
    onSuccess: () => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>({
        queryKey: ['admin', 'accountLists'],
        exact: false,
      }, filterById(accountId));
    },
  });
};

const useAdminPerformAccountActionMutation = (accountId: string, type: AdminAccountAction) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: (params?: AdminPerformAccountActionParams) => client.admin.accounts.performAccountAction(accountId, type, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accountLists'], exact: false });
    },
  });
};

const useAdminEnableAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.enableAccount(accountId),
    onSuccess: (account) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>({
        queryKey: ['admin', 'accountLists', { status: 'disabled' }],
        exact: false,
      }, filterById(accountId));
      minifyAdminAccount(account);
    },
  });
};

const useAdminUnsilenceAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.unsilenceAccount(accountId),
    onSuccess: (account) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>({
        queryKey: ['admin', 'accountLists', { status: 'silenced' }],
        exact: false,
      }, filterById(accountId));
      minifyAdminAccount(account);
    },
  });
};

const useAdminUnsuspendAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.unsuspendAccount(accountId),
    onSuccess: (account) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>({
        queryKey: ['admin', 'accountLists', { status: 'suspended' }],
        exact: false,
      }, filterById(accountId));
      minifyAdminAccount(account);
    },
  });
};

const useAdminUnsensitiveAccountMutation = (accountId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['admin', 'acounts', accountId],
    mutationFn: () => client.admin.accounts.unsensitiveAccount(accountId),
    onSuccess: (account) => {
      minifyAdminAccount(account);
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
};
