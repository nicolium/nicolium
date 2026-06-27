import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import { updateStatus } from '@/queries/statuses/use-status-interactions';
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
  scopeUrl: string,
) => {
  if (params.in_reply_to_id) {
    updateStatus(
      params.in_reply_to_id,
      (parent) => {
        parent.replies_count =
          (typeof parent.replies_count === 'number' ? parent.replies_count : 0) + 1;
      },
      queryClient,
      scopeUrl,
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
      scopeUrl,
    );
  }
};

const decrementReplyCount = (
  params: Pick<BaseStatus | CreateStatusParams, 'in_reply_to_id' | 'quote_id'>,
  queryClient: ReturnType<typeof useQueryClient>,
  scopeUrl: string,
) => {
  if (params.in_reply_to_id) {
    updateStatus(
      params.in_reply_to_id,
      (parent) => {
        parent.replies_count = Math.max(0, parent.replies_count - 1);
      },
      queryClient,
      scopeUrl,
    );
  }
  if (params.quote_id) {
    updateStatus(
      params.quote_id,
      (parent) => {
        parent.quotes_count = Math.max(0, parent.quotes_count - 1);
      },
      queryClient,
      scopeUrl,
    );
  }
};

const createStatus = (
  client: PlApiClient,
  params: CreateStatusParams,
  idempotencyKey: string,
  editedId: string | null,
  scopeUrl: string,
  redacting = false,
) => {
  if (!params.preview && !editedId) {
    usePendingStatusesStore.getState().actions.importStatus(params, idempotencyKey);
    useContextStore.getState().actions.importPendingStatus(params.in_reply_to_id, idempotencyKey);
    useTimelinesStore.getState().actions.importPendingStatus(params, idempotencyKey);
    incrementReplyCount(params, queryClient, scopeUrl);
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
          scopeUrl,
          { statuses: [{ ...status, expectsCard }] },
          { idempotencyKey, withParents: true },
        );
      } else {
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.scheduledStatuses.all, scopeUrl),
        });
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
                importEntities(scopeUrl, { statuses: [response] });
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
        decrementReplyCount(params, queryClient, scopeUrl);
      }
      throw error;
    });
};

const editStatus = (client: PlApiClient, statusId: string, scopeUrl: string) => {
  const status = queryClient.getQueryData(
    scopedQueryKey(queryKeys.statuses.show(statusId), scopeUrl),
  );
  if (!status) return;

  const poll = status.poll_id
    ? queryClient.getQueryData(
        scopedQueryKey(queryKeys.statuses.polls.show(status.poll_id), scopeUrl),
      )
    : undefined;

  return client.statuses.getStatusSource(statusId).then((response) => {
    useComposeStore.getState().actions.setComposeToStatus(status, poll, response);
    useModalsStore.getState().actions.openModal('COMPOSE');
  });
};

const redactStatus = (client: PlApiClient, statusId: string, scopeUrl: string) => {
  const status = queryClient.getQueryData(
    scopedQueryKey(queryKeys.statuses.show(statusId), scopeUrl),
  );
  if (!status) return;

  const poll = status.poll_id
    ? queryClient.getQueryData(
        scopedQueryKey(queryKeys.statuses.polls.show(status.poll_id), scopeUrl),
      )
    : undefined;

  return client.statuses.getStatusSource(statusId).then((source) => {
    useComposeStore
      .getState()
      .actions.setComposeToStatus(status, poll, source, false, null, null, true);
    useModalsStore.getState().actions.openModal('COMPOSE');
  });
};

const fetchStatus = (client: PlApiClient, statusId: string, scopeUrl: string, intl?: IntlShape) => {
  const params =
    intl && useSettingsStore.getState().settings.autoTranslate
      ? {
          language: intl.locale,
        }
      : undefined;

  return client.statuses.getStatus(statusId, params).then((status) => {
    importEntities(scopeUrl, { statuses: [status] });
    return status;
  });
};

const muteStatus = (client: PlApiClient, statusId: string, scopeUrl: string) =>
  client.statuses.muteStatus(statusId).then(() => {
    updateStatus(
      statusId,
      (status) => {
        status.muted = true;
      },
      queryClient,
      scopeUrl,
    );
  });

const unmuteStatus = (client: PlApiClient, statusId: string, scopeUrl: string) =>
  client.statuses.unmuteStatus(statusId).then(() => {
    updateStatus(
      statusId,
      (status) => {
        status.muted = false;
      },
      queryClient,
      scopeUrl,
    );
  });

const toggleMuteStatus = (
  client: PlApiClient,
  status: Pick<Status, 'id' | 'muted'>,
  scopeUrl: string,
) =>
  status.muted
    ? unmuteStatus(client, status.id, scopeUrl)
    : muteStatus(client, status.id, scopeUrl);

export {
  createStatus,
  editStatus,
  redactStatus,
  fetchStatus,
  toggleMuteStatus,
  decrementReplyCount,
  incrementReplyCount,
};
