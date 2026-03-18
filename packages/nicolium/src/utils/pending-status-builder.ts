import { statusSchema, type Account } from 'pl-api';
import * as v from 'valibot';

import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { normalizeStatus } from '@/queries/statuses/normalize';

import type { PendingStatus } from '@/stores/pending-statuses';

const buildMentions = (pendingStatus: PendingStatus) => {
  if (pendingStatus.in_reply_to_id) {
    return (pendingStatus.to ?? []).map((acct) => ({ acct }));
  } else {
    return [];
  }
};

const buildStatus = (account: Account, pendingStatus: PendingStatus, idempotencyKey: string) => {
  const inReplyToId = pendingStatus.in_reply_to_id;

  const status = {
    account,
    content: pendingStatus.status.replaceAll('\n', '<br>'),
    id: `末pending-${idempotencyKey}`,
    in_reply_to_account_id:
      (inReplyToId && queryClient.getQueryData(queryKeys.statuses.show(inReplyToId))?.account_id) ||
      null,
    in_reply_to_id: inReplyToId,
    media_attachments: (pendingStatus.media_ids ?? []).map((id: string) => ({ id })),
    mentions: buildMentions(pendingStatus),
    quote:
      (pendingStatus.quote_id &&
        queryClient.getQueryData(queryKeys.statuses.show(pendingStatus.quote_id))) ||
      null,
    sensitive: pendingStatus.sensitive,
    visibility: pendingStatus.visibility,
  };

  return normalizeStatus(v.parse(statusSchema, status));
};

export { buildStatus };
