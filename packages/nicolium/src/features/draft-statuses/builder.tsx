import { pollSchema, statusSchema, type Account } from 'pl-api';
import * as v from 'valibot';

import { normalizeStatus } from '@/queries/statuses/normalize';

import type { DraftStatus } from '@/queries/statuses/use-draft-statuses';

const buildPoll = (draftPoll: DraftStatus['poll']) => {
  if (draftPoll?.options) {
    return v.parse(pollSchema, {
      ...draftPoll,
      id: 'poll',
      options: draftPoll.options.map((title: string) => ({ title })).toArray(),
    });
  } else {
    return null;
  }
};

const buildStatus = (account: Account, draftStatus: DraftStatus) => {
  const status = v.parse(statusSchema, {
    id: 'draft',
    account,
    content: draftStatus.text.replaceAll(
      new RegExp('\n', 'g'),
      '<br>',
    ) /* eslint-disable-line no-control-regex */,
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
  });

  return normalizeStatus(status);
};

export { buildStatus, buildPoll };
