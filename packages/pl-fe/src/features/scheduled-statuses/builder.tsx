import { statusSchema, type ScheduledStatus } from 'pl-api';
import * as v from 'valibot';

import { normalizeStatus } from '@/normalizers/status';
import { selectOwnAccount } from '@/selectors';

import type { RootState } from '@/store';

const buildStatus = (state: RootState, scheduledStatus: ScheduledStatus) => {
  const account = selectOwnAccount(state);

  const poll = scheduledStatus.params.poll ? {
    id: `${scheduledStatus.id}-poll`,
    ...scheduledStatus.params.poll,
    options: scheduledStatus.params.poll.options.map((option) => ({ title: option })),
    voted: true,
  } : null;

  const status = v.parse(statusSchema, {
    account,
    content: scheduledStatus.params.text?.replace(new RegExp('\n', 'g'), '<br>'), /* eslint-disable-line no-control-regex */
    created_at: scheduledStatus.scheduled_at,
    id: scheduledStatus.id,
    in_reply_to_id: scheduledStatus.params.in_reply_to_id,
    media_attachments: scheduledStatus.media_attachments,
    poll,
    sensitive: scheduledStatus.params.sensitive,
    uri: `/scheduled_statuses/${scheduledStatus.id}`,
    url: `/scheduled_statuses/${scheduledStatus.id}`,
    visibility: scheduledStatus.params.visibility,
  });

  return normalizeStatus(status);
};

export { buildStatus };
