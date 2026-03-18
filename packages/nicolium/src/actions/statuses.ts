import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { updateStatus } from '@/queries/statuses/use-status-interactions';
import { isLoggedIn } from '@/stores/auth';
import { useComposeStore } from '@/stores/compose';
import { useContextStore } from '@/stores/contexts';
import { useModalsStore } from '@/stores/modals';
import { usePendingStatusesStore } from '@/stores/pending-statuses';
import { useSettingsStore } from '@/stores/settings';
import { useTimelinesStore } from '@/stores/timelines';
import { shouldHaveCard } from '@/utils/status';

import { importEntities } from '../queries/utils/import-entities';

import type { NormalizedStatus as Status } from '@/queries/statuses/normalize';
import type { useQueryClient } from '@tanstack/react-query';
import type { CreateStatusParams, PlApiClient, Status as BaseStatus } from 'pl-api';
import type { IntlShape } from 'react-intl';

const incrementReplyCount = (
  params: Pick<BaseStatus | CreateStatusParams, 'in_reply_to_id' | 'quote_id'>,
  queryClient: ReturnType<typeof useQueryClient>,
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
  queryClient: ReturnType<typeof useQueryClient>,
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
  client: PlApiClient,
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
      incrementReplyCount(params, queryClient);
    }
  }

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
        queryClient.invalidateQueries({ queryKey: queryKeys.scheduledStatuses.all });
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
          return client.statuses
            .getStatus(status.id)
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
        decrementReplyCount(params, queryClient);
      }
      throw error;
    });
};

const editStatus = (client: PlApiClient, statusId: string) => {
  const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
  if (!status) return;

  const poll = status.poll_id
    ? queryClient.getQueryData(queryKeys.statuses.polls.show(status.poll_id))
    : undefined;

  return client.statuses.getStatusSource(statusId).then((response) => {
    useComposeStore.getState().actions.setComposeToStatus(status, poll, response);
    useModalsStore.getState().actions.openModal('COMPOSE');
  });
};

const redactStatus = (client: PlApiClient, statusId: string) => {
  const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
  if (!status) return;

  const poll = status.poll_id
    ? queryClient.getQueryData(queryKeys.statuses.polls.show(status.poll_id))
    : undefined;

  return client.statuses.getStatusSource(statusId).then((source) => {
    useComposeStore
      .getState()
      .actions.setComposeToStatus(status, poll, source, false, null, null, true);
    useModalsStore.getState().actions.openModal('COMPOSE');
  });
};

const fetchStatus = (client: PlApiClient, statusId: string, intl?: IntlShape) => {
  const params =
    intl && useSettingsStore.getState().settings.autoTranslate
      ? {
          language: intl.locale,
        }
      : undefined;

  return client.statuses.getStatus(statusId, params).then((status) => {
    importEntities({ statuses: [status] });
    return status;
  });
};

const muteStatus = (client: PlApiClient, statusId: string) => {
  if (!isLoggedIn()) return;

  return client.statuses.muteStatus(statusId).then(() => {
    updateStatus(
      statusId,
      (status) => {
        status.muted = true;
      },
      queryClient,
    );
  });
};

const unmuteStatus = (client: PlApiClient, statusId: string) => {
  if (!isLoggedIn()) return;

  return client.statuses.unmuteStatus(statusId).then(() => {
    updateStatus(
      statusId,
      (status) => {
        status.muted = false;
      },
      queryClient,
    );
  });
};

const toggleMuteStatus = (client: PlApiClient, status: Pick<Status, 'id' | 'muted'>) =>
  status.muted ? unmuteStatus(client, status.id) : muteStatus(client, status.id);

export {
  createStatus,
  editStatus,
  redactStatus,
  fetchStatus,
  toggleMuteStatus,
  decrementReplyCount,
  incrementReplyCount,
};
