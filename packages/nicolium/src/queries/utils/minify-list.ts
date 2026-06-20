import { notifyManager } from '@tanstack/react-query';
import {
  PaginatedResponse,
  type Account,
  type AdminAccount,
  type AdminReport,
  type BlockedAccount,
  type Conversation,
  type Group,
  type GroupedNotificationsResults,
  type MutedAccount,
  type NotificationGroup,
  type Status,
} from 'pl-api';

import { importEntities } from '@/queries/utils/import-entities';

import { queryClient } from '../client';
import { queryKeys } from '../keys';

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

  return new PaginatedResponse(minifiedItems, {
    ...response,
    previous: previous
      ? () =>
          previous().then((list) => minifyList<T1, T2, IsArray>(list, minifier, importer, isArray))
      : null,
    next: next
      ? () => next().then((list) => minifyList<T1, T2, IsArray>(list, minifier, importer, isArray))
      : null,
  });
};

const minifyStatusList = (response: PaginatedResponse<Status>): PaginatedResponse<string> =>
  minifyList(
    response,
    (status) => status.id,
    (statuses) => importEntities({ statuses }),
  );

const minifyAccountList = (response: PaginatedResponse<Account>): PaginatedResponse<string> =>
  minifyList(
    response,
    (account) => account.id,
    (accounts) => {
      notifyManager.batch(() => {
        for (const account of accounts) {
          queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
          if (account.relationship) {
            queryClient.setQueryData(
              queryKeys.accountRelationships.show(account.id),
              account.relationship,
            );
          }
        }
      });
    },
  );

const minifyBlockedAccountList = (
  response: PaginatedResponse<BlockedAccount>,
): PaginatedResponse<[string, string | null]> =>
  minifyList(
    response,
    (account) => [account.id, account.block_expires_at],
    (accounts) => {
      notifyManager.batch(() => {
        for (const account of accounts) {
          queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
          if (account.relationship) {
            queryClient.setQueryData(
              queryKeys.accountRelationships.show(account.id),
              account.relationship,
            );
          }
        }
      });
    },
  );

const minifyMutedAccountList = (
  response: PaginatedResponse<MutedAccount>,
): PaginatedResponse<[string, string | null]> =>
  minifyList(
    response,
    (account) => [account.id, account.mute_expires_at],
    (accounts) => {
      notifyManager.batch(() => {
        for (const account of accounts) {
          queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
          if (account.relationship) {
            queryClient.setQueryData(
              queryKeys.accountRelationships.show(account.id),
              account.relationship,
            );
          }
        }
      });
    },
  );

const minifyGroupList = (response: PaginatedResponse<Group>): PaginatedResponse<string> =>
  minifyList(
    response,
    (group) => group.id,
    (groups) => {
      notifyManager.batch(() => {
        for (const group of groups) {
          queryClient.setQueryData(queryKeys.groups.show(group.id), group);
        }
      });
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
    importEntities({
      accounts: conversations.flatMap((conversation) => conversation.accounts),
      statuses: conversations.map((conversation) => conversation.last_status),
    });
  });

const minifyGroupedNotifications = (
  response: PaginatedResponse<GroupedNotificationsResults, false>,
  hideBots = false,
  accountOrInstanceUrl: string,
): PaginatedResponse<NotificationGroup[], false> =>
  minifyList(
    response,
    (results) => {
      if (!hideBots) return results.notification_groups;

      const botAccountIds = new Set(
        results.accounts.filter((account) => account.bot).map((account) => account.id),
      );

      if (!botAccountIds.size) return results.notification_groups;

      return results.notification_groups.filter(
        (notification) => !notification.sample_account_ids.some((id) => botAccountIds.has(id)),
      );
    },
    (results) => {
      const { accounts, statuses } = results;

      importEntities(accountOrInstanceUrl, { accounts, statuses });
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
      notifyManager.batch(() => {
        for (const { account, ...adminAccount } of accounts) {
          if (account) queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
          queryClient.setQueryData(queryKeys.admin.accounts.show(adminAccount.id), adminAccount);
        }
      });
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
  minifyAdminAccountList(
    new PaginatedResponse(
      [account, action_taken_by_account, assigned_account, target_account].filter(
        (a): a is AdminAccount => !!a,
      ),
      { partial: false },
    ),
  );

  importEntities({
    accounts: [
      account.account,
      action_taken_by_account?.account,
      assigned_account?.account,
      target_account?.account,
    ],
    statuses: statuses,
  });
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
      notifyManager.batch(() => {
        for (const report of reports) {
          queryClient.setQueryData(
            queryKeys.admin.reports.show(report.id),
            minifyAdminReport(report),
          );
        }
      });
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
