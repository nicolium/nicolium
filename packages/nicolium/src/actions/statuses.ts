import { getClient } from '@/api';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scheduledStatusesQueryOptions } from '@/queries/statuses/scheduled-statuses';
import { updateStatus } from '@/queries/statuses/use-status-interactions';
import { useComposeStore } from '@/stores/compose';
import { useContextStore } from '@/stores/contexts';
import { useModalsStore } from '@/stores/modals';
import { usePendingStatusesStore } from '@/stores/pending-statuses';
import { useSettingsStore } from '@/stores/settings';
import { useTimelinesStore } from '@/stores/timelines';
import { isLoggedIn } from '@/utils/auth';
import { shouldHaveCard } from '@/utils/status';

import { importEntities } from './importer';

import type { NormalizedStatus as Status } from '@/normalizers/status';
import type { CreateStatusParams, Status as BaseStatus } from 'pl-api';
import type { IntlShape } from 'react-intl';

const incrementReplyCount = (
  params: Pick<BaseStatus | CreateStatusParams, 'in_reply_to_id' | 'quote_id'>,
) => {
  if (params.in_reply_to_id) {
    updateStatus(
      params.in_reply_to_id,
      (parent) => {
        parent.replies_count =
          (typeof parent.replies_count === 'number' ? parent.replies_count : 0) + 1;
      },
      queryClient,
    );
  }
  if (params.quote_id) {
    updateStatus(
      params.quote_id,
      (parent) => {
        parent.quotes_count =
          (typeof parent.quotes_count === 'number' ? parent.quotes_count : 0) + 1;
      },
      queryClient,
    );
  }
};

const decrementReplyCount = (
  params: Pick<BaseStatus | CreateStatusParams, 'in_reply_to_id' | 'quote_id'>,
) => {
  if (params.in_reply_to_id) {
    updateStatus(
      params.in_reply_to_id,
      (parent) => {
        parent.replies_count = Math.max(0, parent.replies_count - 1);
      },
      queryClient,
    );
  }
  if (params.quote_id) {
    updateStatus(
      params.quote_id,
      (parent) => {
        parent.quotes_count = Math.max(0, parent.quotes_count - 1);
      },
      queryClient,
    );
  }
};

const createStatus = (
  params: CreateStatusParams,
  idempotencyKey: string,
  editedId: string | null,
  redacting = false,
) => {
  if (!params.preview) {
    usePendingStatusesStore.getState().actions.importStatus(params, idempotencyKey);
    useContextStore.getState().actions.importPendingStatus(params.in_reply_to_id, idempotencyKey);
    useTimelinesStore.getState().actions.importPendingStatus(params, idempotencyKey);
    if (!editedId) {
      incrementReplyCount(params);
    }
  }

  const client = getClient();

  return (
    editedId === null
      ? client.statuses.createStatus(params)
      : redacting
        ? client.admin.statuses.redactStatus(editedId, params)
        : client.statuses.editStatus(editedId, params)
  )
    .then((status) => {
      if (params.preview) return status;

      // The backend might still be processing the rich media attachment
      const expectsCard = status.scheduled_at === null && !status.card && shouldHaveCard(status);

      if (status.scheduled_at === null) {
        importEntities(
          { statuses: [{ ...status, expectsCard }] },
          { idempotencyKey, withParents: true },
        );
      } else {
        queryClient.invalidateQueries(scheduledStatusesQueryOptions);
      }

      useContextStore
        .getState()
        .actions.deletePendingStatus(
          'in_reply_to_id' in status ? status.in_reply_to_id : null,
          idempotencyKey,
        );

      if (status.scheduled_at === null) {
        useTimelinesStore.getState().actions.replacePendingStatus(idempotencyKey, status);
      } else {
        useTimelinesStore.getState().actions.deletePendingStatus(idempotencyKey);
      }

      // Poll the backend for the updated card
      if (expectsCard) {
        const delay = 1000;

        const poll = (retries = 5) => {
          return getClient()
            .statuses.getStatus(status.id)
            .then((response) => {
              if (response.card) {
                importEntities({ statuses: [response] });
              } else if (retries > 0 && response) {
                setTimeout(() => poll(retries - 1), delay);
              }
            })
            .catch(console.error);
        };

        setTimeout(() => poll(), delay);
      }

      return status;
    })
    .catch((error) => {
      usePendingStatusesStore.getState().actions.deleteStatus(idempotencyKey);
      useTimelinesStore.getState().actions.deletePendingStatus(idempotencyKey);
      useContextStore.getState().actions.deletePendingStatus(params.in_reply_to_id, idempotencyKey);
      if (!editedId) {
        decrementReplyCount(params);
      }
      throw error;
    });
};

const editStatus = (statusId: string) => {
  const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
  if (!status) return;

  const poll = status.poll_id
    ? queryClient.getQueryData(queryKeys.statuses.polls.show(status.poll_id))
    : undefined;

  return getClient()
    .statuses.getStatusSource(statusId)
    .then((response) => {
      useComposeStore.getState().actions.setComposeToStatus(status, poll, response);
      useModalsStore.getState().actions.openModal('COMPOSE');
    });
};

const fetchStatus = (statusId: string, intl?: IntlShape) => {
  const params =
    intl && useSettingsStore.getState().settings.autoTranslate
      ? {
          language: intl.locale,
        }
      : undefined;

  return getClient()
    .statuses.getStatus(statusId, params)
    .then((status) => {
      importEntities({ statuses: [status] });
      return status;
    });
};

const deleteStatus = (statusId: string, withRedraft = false) => {
  if (!isLoggedIn()) return null;

  const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
  if (!status) return null;

  const poll = status.poll_id
    ? queryClient.getQueryData(queryKeys.statuses.polls.show(status.poll_id))
    : undefined;

  decrementReplyCount(status);

  return getClient()
    .statuses.deleteStatus(statusId)
    .then((source) => {
      usePendingStatusesStore.getState().actions.deleteStatus(statusId);
      useTimelinesStore.getState().actions.deleteStatus(statusId);
      updateStatus(
        statusId,
        (s) => {
          s.deleted = true;
        },
        queryClient,
      );

      if (withRedraft) {
        useComposeStore.getState().actions.setComposeToStatus(status, poll, source, withRedraft);
        useModalsStore.getState().actions.openModal('COMPOSE');
      }
    })
    .catch(() => {
      incrementReplyCount(status);
    });
};

const deleteStatusFromGroup = (statusId: string, groupId: string) => {
  if (!isLoggedIn()) return null;

  const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
  if (!status) return null;

  decrementReplyCount(status);

  return getClient()
    .experimental.groups.deleteGroupStatus(statusId, groupId)
    .then(() => {
      usePendingStatusesStore.getState().actions.deleteStatus(statusId);
      useTimelinesStore.getState().actions.deleteStatus(statusId);
      updateStatus(
        statusId,
        (s) => {
          s.deleted = true;
        },
        queryClient,
      );
    })
    .catch(() => {
      incrementReplyCount(status);
    });
};

const muteStatus = (statusId: string) => {
  if (!isLoggedIn()) return;

  return getClient()
    .statuses.muteStatus(statusId)
    .then(() => {
      updateStatus(
        statusId,
        (status) => {
          status.muted = true;
        },
        queryClient,
      );
    });
};

const unmuteStatus = (statusId: string) => {
  if (!isLoggedIn()) return;

  return getClient()
    .statuses.unmuteStatus(statusId)
    .then(() => {
      updateStatus(
        statusId,
        (status) => {
          status.muted = false;
        },
        queryClient,
      );
    });
};

const toggleMuteStatus = (status: Pick<Status, 'id' | 'muted'>) =>
  status.muted ? unmuteStatus(status.id) : muteStatus(status.id);

export {
  createStatus,
  editStatus,
  fetchStatus,
  deleteStatus,
  deleteStatusFromGroup,
  toggleMuteStatus,
};
