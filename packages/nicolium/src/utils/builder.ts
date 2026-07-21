import { pollSchema, statusSchema, type Account, type ScheduledStatus } from 'pl-api';
import * as v from 'valibot';

import { normalizeStatus } from '@/queries/statuses/normalize';

import type { DraftStatus } from '@/queries/statuses/use-draft-statuses';

const buildPollFromParams = (draftPoll: DraftStatus['poll']) => {
  if (draftPoll?.options) {
    return v.parse(pollSchema, {
      ...draftPoll,
      id: 'poll',
      options: draftPoll.options.map((title: string) => ({ title })),
    });
  } else {
    return null;
  }
};

const buildStatusFromDraft = (account: Account, draftStatus: DraftStatus) => {
  const status = v.parse(statusSchema, {
    id: 'draft',
    account,
    content: draftStatus.text.replaceAll(new RegExp('\n', 'g'), '<br>'),
    created_at: draftStatus.schedule,
    group: draftStatus.group_id,
    in_reply_to_id: draftStatus.in_reply_to,
    media_attachments: draftStatus.media_attachments,
    quote_id: draftStatus.quote,
    sensitive: draftStatus.sensitive,
    spoiler_text: draftStatus.spoiler_text,
    uri: `/draft_statuses/${draftStatus.draft_id}`,
    url: `/draft_statuses/${draftStatus.draft_id}`,
    visibility: draftStatus.privacy,
    poll: buildPollFromParams(draftStatus.poll),
  });

  return normalizeStatus(status);
};

const buildStatusFromScheduledStatus = (account: Account, scheduledStatus: ScheduledStatus) => {
  const poll = scheduledStatus.params.poll
    ? {
        id: `${scheduledStatus.id}-poll`,
        ...scheduledStatus.params.poll,
        options: scheduledStatus.params.poll.options.map((option) => ({ title: option })),
        voted: true,
      }
    : null;

  const status = v.parse(statusSchema, {
    account,
    content: scheduledStatus.params.text?.replaceAll(
      new RegExp('\n', 'g'),
      '<br>',
    ) /* eslint-disable-line no-control-regex */,
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

export { buildStatusFromDraft, buildStatusFromScheduledStatus, buildPollFromParams };
