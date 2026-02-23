import { create } from 'mutative';
import { statusSchema } from 'pl-api';
import * as v from 'valibot';

import { normalizeStatus } from '@/normalizers/status';
import { selectOwnAccount } from '@/selectors';

import type { RootState } from '@/store';
import type { PendingStatus } from '@/stores/pending-statuses';

const buildMentions = (pendingStatus: PendingStatus) => {
  if (pendingStatus.in_reply_to_id) {
    return (pendingStatus.to ?? []).map((acct) => ({ acct }));
  } else {
    return [];
  }
};

const buildPoll = (pendingStatus: PendingStatus) => {
  if (pendingStatus.poll?.options) {
    return create(pendingStatus.poll, (draft) => {
      // @ts-ignore
      draft.options = draft.options.map((title) => ({ title }));
    });
  } else {
    return null;
  }
};

const buildStatus = (state: RootState, pendingStatus: PendingStatus, idempotencyKey: string) => {
  const account = selectOwnAccount(state)!;
  const inReplyToId = pendingStatus.in_reply_to_id;

  const status = {
    account,
    content: pendingStatus.status.replace(
      new RegExp('\n', 'g'),
      '<br>',
    ) /* eslint-disable-line no-control-regex */,
    id: `末pending-${idempotencyKey}`,
    in_reply_to_account_id: state.statuses[inReplyToId ?? '']?.account_id || null,
    in_reply_to_id: inReplyToId,
    media_attachments: (pendingStatus.media_ids ?? []).map((id: string) => ({ id })),
    mentions: buildMentions(pendingStatus),
    poll: buildPoll(pendingStatus),
    quote: pendingStatus.quote_id ? state.statuses[pendingStatus.quote_id] : null,
    sensitive: pendingStatus.sensitive,
    visibility: pendingStatus.visibility,
  };

  return normalizeStatus(v.parse(statusSchema, status));
};

export { buildStatus };
