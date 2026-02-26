import { selectAccount } from '@/queries/accounts/selectors';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useContextStore } from '@/stores/contexts';

import type { AppDispatch } from '@/store';
import type {
  Account as BaseAccount,
  Group as BaseGroup,
  Poll as BasePoll,
  Relationship as BaseRelationship,
  Status as BaseStatus,
} from 'pl-api';

const STATUS_IMPORT = 'STATUS_IMPORT' as const;
const STATUSES_IMPORT = 'STATUSES_IMPORT' as const;

const isEmpty = (object: Record<string, any>) => !Object.values(object).some((value) => value);

interface ImportStatusAction {
  type: typeof STATUS_IMPORT;
  status: BaseStatus;
  idempotencyKey?: string;
}

interface ImportStatusesAction {
  type: typeof STATUSES_IMPORT;
  statuses: Array<BaseStatus>;
}

const importEntities =
  (
    entities: {
      accounts?: Array<BaseAccount | undefined | null>;
      groups?: Array<BaseGroup | undefined | null>;
      polls?: Array<BasePoll | undefined | null>;
      statuses?: Array<(BaseStatus & { expectsCard?: boolean }) | undefined | null>;
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
  ) =>
  (dispatch: AppDispatch) => {
    const override = options.override ?? true;

    const accounts: Record<string, BaseAccount> = {};
    const groups: Record<string, BaseGroup> = {};
    const polls: Record<string, BasePoll> = {};
    const relationships: Record<string, BaseRelationship> = {};
    const statuses: Record<string, BaseStatus> = {};

    const processAccount = (account: BaseAccount, withSelf = true) => {
      if (!override && selectAccount(account.id)) return;

      if (withSelf) accounts[account.id] = account;

      if (account.moved) processAccount(account.moved);
      if (account.relationship) relationships[account.relationship.id] = account.relationship;
    };

    const processStatus = (status: BaseStatus, withSelf = true) => {
      // Skip broken statuses
      if (status.scheduled_at !== null) return;

      if (withSelf) statuses[status.id] = status;

      if (status.account) {
        processAccount(status.account);
      }

      if (status.quote && 'quoted_status' in status.quote && status.quote.quoted_status)
        processStatus(status.quote.quoted_status);
      if (status.reblog) processStatus(status.reblog);
      if (status.poll) polls[status.poll.id] = status.poll;
      if (status.group) groups[status.group.id] = status.group;
    };

    if (options.withParents) {
      entities.groups?.forEach((group) => group && (groups[group.id] = group));
      entities.polls?.forEach((poll) => poll && (polls[poll.id] = poll));
      entities.relationships?.forEach(
        (relationship) => relationship && (relationships[relationship.id] = relationship),
      );
    }

    entities.accounts?.forEach(
      (account) => account && processAccount(account, options.withParents),
    );

    if (entities.statuses?.length === 1 && entities.statuses[0] && options.idempotencyKey) {
      useContextStore.getState().actions.importStatus(entities.statuses[0], options.idempotencyKey);
      dispatch<ImportStatusAction>({
        type: STATUS_IMPORT,
        status: entities.statuses[0],
        idempotencyKey: options.idempotencyKey,
      });
      processStatus(entities.statuses[0], false);
    } else {
      entities.statuses?.forEach((status) => status && processStatus(status, options.withParents));
    }

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
        queryClient.setQueryData<BasePoll>(queryKeys.statuses.polls.show(poll.id), poll);
      }
    }
    if (!isEmpty(relationships)) {
      for (const relationship of Object.values(relationships)) {
        queryClient.setQueryData<BaseRelationship>(
          queryKeys.accountRelationships.show(relationship.id),
          relationship,
        );
      }
    }
    if (!isEmpty(statuses))
      useContextStore.getState().actions.importStatuses(Object.values(statuses));

    if (!isEmpty(statuses))
      dispatch<ImportStatusesAction>({ type: STATUSES_IMPORT, statuses: Object.values(statuses) });
  };

type ImporterAction = ImportStatusAction | ImportStatusesAction;

export { STATUS_IMPORT, STATUSES_IMPORT, importEntities, type ImporterAction };
