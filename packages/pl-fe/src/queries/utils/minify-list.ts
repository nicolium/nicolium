import { importEntities } from '@/actions/importer';
import { store } from '@/store';

import { queryClient } from '../client';

import type {
  Account,
  AdminAccount,
  AdminReport,
  BlockedAccount,
  Conversation,
  Group,
  MutedAccount,
  PaginatedResponse,
  Status,
} from 'pl-api';

const minifyList = <T1, T2>(
  { previous, next, items, ...response }: PaginatedResponse<T1>,
  minifier: (value: T1) => T2,
  importer?: (items: Array<T1>) => void,
): PaginatedResponse<T2> => {
  importer?.(items);

  return {
    ...response,
    previous: previous
      ? () => previous().then((list) => minifyList(list, minifier, importer))
      : null,
    next: next ? () => next().then((list) => minifyList(list, minifier, importer)) : null,
    items: items.map(minifier),
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
      store.dispatch(importEntities({ accounts }) as any);
    },
  );

const minifyBlockedAccountList = (
  response: PaginatedResponse<BlockedAccount>,
): PaginatedResponse<[string, string | null]> =>
  minifyList(
    response,
    (account) => [account.id, account.block_expires_at],
    (accounts) => {
      store.dispatch(importEntities({ accounts }) as any);
    },
  );

const minifyMutedAccountList = (
  response: PaginatedResponse<MutedAccount>,
): PaginatedResponse<[string, string | null]> =>
  minifyList(
    response,
    (account) => [account.id, account.mute_expires_at],
    (accounts) => {
      store.dispatch(importEntities({ accounts }) as any);
    },
  );

const minifyGroupList = (response: PaginatedResponse<Group>): PaginatedResponse<string> =>
  minifyList(
    response,
    (group) => group.id,
    (groups) => {
      for (const group of groups) {
        queryClient.setQueryData(['groups', group.id], group);
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

const minifyAdminAccount = ({ account, ...adminAccount }: AdminAccount) => {
  store.dispatch(importEntities({ accounts: [account] }) as any);
  queryClient.setQueryData(['admin', 'accounts', adminAccount.id], adminAccount);

  return adminAccount;
};

const minifyAdminAccountList = (response: PaginatedResponse<AdminAccount>) =>
  minifyList(
    response,
    (account) => account.id,
    (accounts) => {
      store.dispatch(
        importEntities({ accounts: accounts.map((account) => account.account) }) as any,
      );
      for (const { account, ...adminAccount } of accounts) {
        queryClient.setQueryData(['admin', 'accounts', adminAccount.id], adminAccount);
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

const minifyAdminReportList = (response: PaginatedResponse<AdminReport>) =>
  minifyList(
    response,
    (report) => report.id,
    (reports) => {
      for (const report of reports) {
        queryClient.setQueryData(['admin', 'reports', report.id], minifyAdminReport(report));
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
  minifyAdminAccount,
  minifyAdminAccountList,
  minifyAdminReport,
  minifyAdminReportList,
  type MinifiedConversation,
};
