import { notifyManager } from '@tanstack/react-query';

import { selectAccount } from '@/queries/accounts/selectors';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { normalizeStatus } from '@/queries/statuses/normalize';
import { useContextStore } from '@/stores/contexts';

import type {
  Account as BaseAccount,
  Group as BaseGroup,
  Poll as BasePoll,
  Relationship as BaseRelationship,
  Status as BaseStatus,
  StatusWithoutAccount,
  Translation,
} from 'pl-api';

type Status = (BaseStatus | StatusWithoutAccount) & {
  expectsCard?: boolean;
  accounts?: Array<BaseAccount>;
};

const isEmpty = (object: Record<string, any>) => !Object.values(object).some((value) => value);

const importEntities = (
  entities: {
    accounts?: Array<BaseAccount | undefined | null>;
    groups?: Array<BaseGroup | undefined | null>;
    polls?: Array<BasePoll | undefined | null>;
    statuses?: Array<Status | undefined | null>;
    relationships?: Array<BaseRelationship | undefined | null>;
  },
  options: {
    // Whether to replace existing entities. Set to false when working with potentially outdated data. Currently, only implemented for accounts.
    override?: boolean;
    withParents?: boolean;
    idempotencyKey?: string;
  } = {
    withParents: true,
  },
) => {
  const override = options.override ?? true;

  const accounts: Record<string, BaseAccount> = {};
  const groups: Record<string, BaseGroup> = {};
  const polls: Record<string, BasePoll> = {};
  const relationships: Record<string, BaseRelationship> = {};
  const statuses: Record<string, Status> = {};
  const translations: Record<string, Record<string, Translation>> = {};

  const processAccount = (account: BaseAccount, withSelf = true) => {
    if (!override && selectAccount(account.id)) return;

    if (withSelf) accounts[account.id] = account;

    if (account.moved) processAccount(account.moved);
    if (account.relationship) relationships[account.relationship.id] = account.relationship;
  };

  const processStatus = (status: Status, withSelf = true) => {
    // Skip broken statuses
    if (status.scheduled_at !== null) return;

    if (withSelf) statuses[status.id] = status;

    if (status.account) {
      processAccount(status.account);
    }

    if (status.accounts) {
      for (const account of status.accounts) processAccount(account);
    }

    if (status.quote && 'quoted_status' in status.quote && status.quote.quoted_status)
      processStatus(status.quote.quoted_status);
    if (status.reblog) processStatus(status.reblog);
    if (status.poll) polls[status.poll.id] = status.poll;
    if (status.group) groups[status.group.id] = status.group;
    if (status.translation) {
      if (!translations[status.id]) translations[status.id] = {};
      translations[status.id][status.translation.language] = status.translation;
    }
  };

  if (options.withParents) {
    entities.groups?.forEach((group) => group && (groups[group.id] = group));
    entities.polls?.forEach((poll) => poll && (polls[poll.id] = poll));
    entities.relationships?.forEach(
      (relationship) => relationship && (relationships[relationship.id] = relationship),
    );
  }

  entities.accounts?.forEach((account) => account && processAccount(account, options.withParents));

  if (entities.statuses?.length === 1 && entities.statuses[0] && options.idempotencyKey) {
    const status = entities.statuses[0];
    useContextStore.getState().actions.importStatus(status, options.idempotencyKey);
    const oldStatus = queryClient.getQueryData(queryKeys.statuses.show(status.id));
    const normalized = normalizeStatus(status, oldStatus);
    queryClient.setQueryData(queryKeys.statuses.show(status.id), normalized);
    processStatus(status, false);
  } else {
    entities.statuses?.forEach((status) => status && processStatus(status, options.withParents));
  }

  notifyManager.batch(() => {
    if (!isEmpty(accounts)) {
      for (const account of Object.values(accounts)) {
        queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
      }
    }
    if (!isEmpty(groups))
      for (const group of Object.values(groups)) {
        queryClient.setQueryData(queryKeys.groups.show(group.id), group);
        if (group.relationship) {
          queryClient.setQueryData(queryKeys.groupRelationships.show(group.id), group.relationship);
        }
      }
    if (!isEmpty(polls)) {
      for (const poll of Object.values(polls)) {
        queryClient.setQueryData(queryKeys.statuses.polls.show(poll.id), poll);
      }
    }
    if (!isEmpty(relationships)) {
      for (const relationship of Object.values(relationships)) {
        queryClient.setQueryData(
          queryKeys.accountRelationships.show(relationship.id),
          relationship,
        );
      }
    }
    if (!isEmpty(statuses))
      useContextStore.getState().actions.importStatuses(Object.values(statuses));

    if (!isEmpty(statuses)) {
      for (const status of Object.values(statuses)) {
        const oldStatus = queryClient.getQueryData(queryKeys.statuses.show(status.id));
        const normalized = normalizeStatus(status, oldStatus);
        queryClient.setQueryData(queryKeys.statuses.show(status.id), normalized);
      }
    }
    if (!isEmpty(translations)) {
      for (const [statusId, translationsByLanguage] of Object.entries(translations)) {
        for (const [language, translation] of Object.entries(translationsByLanguage)) {
          queryClient.setQueryData(
            queryKeys.statuses.translations(statusId, language),
            translation,
          );
        }
      }
    }
  });
};

export { importEntities };
