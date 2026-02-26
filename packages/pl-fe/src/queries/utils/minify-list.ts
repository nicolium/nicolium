import { importEntities } from '@/actions/importer';
import { store } from '@/store';

import { queryClient } from '../client';
import { queryKeys } from '../keys';

import type {
  Account,
  AdminAccount,
  AdminReport,
  BlockedAccount,
  Conversation,
  Group,
  GroupedNotificationsResults,
  MutedAccount,
  NotificationGroup,
  PaginatedResponse,
  Status,
} from 'pl-api';

const minifyList = <T1, T2, IsArray extends boolean = true>(
  { previous, next, items, ...response }: PaginatedResponse<T1, IsArray>,
  minifier: (value: T1) => T2,
  importer?: (items: PaginatedResponse<T1, IsArray>['items']) => void,
  isArray: IsArray = true as IsArray,
): PaginatedResponse<T2, IsArray> => {
  importer?.(items);

  const minifiedItems = (
    isArray ? (items as T1[]).map(minifier) : minifier(items as T1)
  ) as PaginatedResponse<T2, IsArray>['items'];

  return {
    ...response,
    previous: previous
      ? () =>
          previous().then((list) => minifyList<T1, T2, IsArray>(list, minifier, importer, isArray))
      : null,
    next: next
      ? () => next().then((list) => minifyList<T1, T2, IsArray>(list, minifier, importer, isArray))
      : null,
    items: minifiedItems,
  };
};

const minifyStatusList = (response: PaginatedResponse<Status>): PaginatedResponse<string> =>
  minifyList(
    response,
    (status) => status.id,
    (statuses) => {
      store.dispatch(importEntities({ statuses }) as any);
    },
  );

const minifyAccountList = (response: PaginatedResponse<Account>): PaginatedResponse<string> =>
  minifyList(
    response,
    (account) => account.id,
    (accounts) => {
      for (const account of accounts) {
        queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
        if (account.relationship) {
          queryClient.setQueryData(
            queryKeys.accountRelationships.show(account.id),
            account.relationship,
          );
        }
      }
    },
  );

const minifyBlockedAccountList = (
  response: PaginatedResponse<BlockedAccount>,
): PaginatedResponse<[string, string | null]> =>
  minifyList(
    response,
    (account) => [account.id, account.block_expires_at],
    (accounts) => {
      for (const account of accounts) {
        queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
        if (account.relationship) {
          queryClient.setQueryData(
            queryKeys.accountRelationships.show(account.id),
            account.relationship,
          );
        }
      }
    },
  );

const minifyMutedAccountList = (
  response: PaginatedResponse<MutedAccount>,
): PaginatedResponse<[string, string | null]> =>
  minifyList(
    response,
    (account) => [account.id, account.mute_expires_at],
    (accounts) => {
      for (const account of accounts) {
        queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
        if (account.relationship) {
          queryClient.setQueryData(
            queryKeys.accountRelationships.show(account.id),
            account.relationship,
          );
        }
      }
    },
  );

const minifyGroupList = (response: PaginatedResponse<Group>): PaginatedResponse<string> =>
  minifyList(
    response,
    (group) => group.id,
    (groups) => {
      for (const group of groups) {
        queryClient.setQueryData(queryKeys.groups.show(group.id), group);
      }
    },
  );

const minifyConversation = (conversation: Conversation) => ({
  id: conversation.id,
  unread: conversation.unread,
  account_ids: conversation.accounts.map((account) => account.id),
  last_status: conversation.last_status?.id ?? null,
  last_status_created_at: conversation.last_status?.created_at ?? null,
});

type MinifiedConversation = ReturnType<typeof minifyConversation>;

const minifyConversationList = (response: PaginatedResponse<Conversation>) =>
  minifyList(response, minifyConversation, (conversations) => {
    store.dispatch(
      importEntities({
        accounts: conversations.flatMap((conversation) => conversation.accounts),
        statuses: conversations.map((conversation) => conversation.last_status),
      }) as any,
    );
  });

const minifyGroupedNotifications = (
  response: PaginatedResponse<GroupedNotificationsResults, false>,
): PaginatedResponse<NotificationGroup[], false> =>
  minifyList(
    response,
    (results) => results.notification_groups,
    (results) => {
      const { accounts, statuses } = results;

      store.dispatch(importEntities({ accounts, statuses }) as any);
    },
    false,
  );

const minifyAdminAccount = ({ account, ...adminAccount }: AdminAccount) => {
  if (account) queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
  queryClient.setQueryData(queryKeys.admin.accounts.show(adminAccount.id), adminAccount);

  return adminAccount;
};

type MinifiedAdminAccount = ReturnType<typeof minifyAdminAccount>;

const minifyAdminAccountList = (response: PaginatedResponse<AdminAccount>) =>
  minifyList(
    response,
    (account) => account.id,
    (accounts) => {
      for (const { account, ...adminAccount } of accounts) {
        if (account) queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
        queryClient.setQueryData(queryKeys.admin.accounts.show(adminAccount.id), adminAccount);
      }
    },
  );

const minifyAdminReport = ({
  account,
  action_taken_by_account,
  assigned_account,
  target_account,
  statuses,
  ...adminReport
}: AdminReport) => {
  minifyAdminAccountList({
    items: [account, action_taken_by_account, assigned_account, target_account].filter(
      (a): a is AdminAccount => !!a,
    ),
    previous: null,
    next: null,
    partial: false,
  });

  store.dispatch(
    importEntities({
      accounts: [
        account.account,
        action_taken_by_account?.account,
        assigned_account?.account,
        target_account?.account,
      ],
      statuses: statuses as any,
    }) as any,
  );
  return {
    account_id: account.id,
    action_taken_by_account_id: action_taken_by_account?.id,
    assigned_account_id: assigned_account?.id,
    target_account_id: target_account?.id,
    status_ids: statuses.map(({ id }) => id),
    ...adminReport,
  };
};

type MinifiedAdminReport = ReturnType<typeof minifyAdminReport>;

const minifyAdminReportList = (response: PaginatedResponse<AdminReport>) =>
  minifyList(
    response,
    (report) => report.id,
    (reports) => {
      for (const report of reports) {
        queryClient.setQueryData(
          queryKeys.admin.reports.show(report.id),
          minifyAdminReport(report),
        );
      }
    },
  );

export {
  minifyList,
  minifyAccountList,
  minifyBlockedAccountList,
  minifyMutedAccountList,
  minifyStatusList,
  minifyGroupList,
  minifyConversation,
  minifyConversationList,
  minifyGroupedNotifications,
  minifyAdminAccount,
  minifyAdminAccountList,
  minifyAdminReport,
  minifyAdminReportList,
  type MinifiedConversation,
  type MinifiedAdminAccount,
  type MinifiedAdminReport,
};
