import { useModalsStore } from '@/stores/modals';

import { getClient } from '../api';

import type { Status } from '@/normalizers/status';
import type { AppDispatch, RootState } from '@/store';
import type { Account } from 'pl-api';

enum ReportableEntities {
  ACCOUNT = 'ACCOUNT',
  STATUS = 'STATUS'
}

type ReportedEntity = {
  status?: Pick<Status, 'id'>;
  statusId?: string;
}

const initReport = (entityType: ReportableEntities, account: Pick<Account, 'id'>, entities?: ReportedEntity) => (dispatch: AppDispatch) => {
  const { status, statusId } = entities || {};

  return useModalsStore.getState().actions.openModal('REPORT', {
    accountId: account.id,
    entityType,
    statusIds: [status?.id, statusId].filter((id): id is string => !!id),
  });
};

const submitReport = (accountId: string, statusIds: string[], ruleIds?: string[], comment?: string, forward?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => getClient(getState()).accounts.reportAccount(accountId, {
    status_ids: statusIds,
    rule_ids: ruleIds,
    comment: comment,
    forward: forward,
  });

export {
  ReportableEntities,
  initReport,
  submitReport,
};
