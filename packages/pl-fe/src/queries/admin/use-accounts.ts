import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginatedResponse, type AdminAccount, type AdminGetAccountsParams, type PaginationParams } from 'pl-api';

import { importEntities } from 'pl-fe/actions/importer';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';

import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { minifyAdminAccountList } from '../utils/minify-list';


const useAdminAccounts = makePaginatedResponseQuery(
  (params: Omit<AdminGetAccountsParams, keyof PaginationParams>) => ['admin', 'accountLists', params],
  (client, [params]) => client.admin.accounts.getAccounts(params).then(minifyAdminAccountList),
  undefined,
  'isAdmin',
);

const useAdminAccount = (accountId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  const query = useQuery<AdminAccount>({
    queryKey: ['admin', 'accounts', accountId],
    queryFn: () => client.admin.accounts.getAccount(accountId).then(({ account, ...adminAccount }) => {
      dispatch(importEntities({ accounts: [account] }));
      return adminAccount as AdminAccount;
    }),
  });

  const { account } = useAccount(query.data ? accountId : undefined);

  if (query.data && account) query.data.account = account;

  return query;
};

const pendingUsersQuery = makePaginatedResponseQueryOptions(
  ['admin', 'accountLists', { origin: 'local', status: 'pending' }],
  (client) => client.admin.accounts.getAccounts({ origin: 'local', status: 'pending' }).then(minifyAdminAccountList),
)();

const usePendingUsersCount = () => useInfiniteQuery({
  ...pendingUsersQuery,
  select: (data) => data.pages.at(-1)?.total || data.pages.flat().length || 0,
});

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

export { useAdminAccount, useAdminAccounts, pendingUsersQuery, usePendingUsersCount, useAdminApproveAccountMutation, useAdminRejectAccountMutation };
