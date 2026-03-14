import {
  type Account as BaseAccount,
  type Status as BaseStatus,
  type MediaAttachment,
  type StatusWithoutAccount,
  mentionSchema,
} from 'pl-api';
import * as v from 'valibot';

import { unescapeHTML } from '@/utils/html';

const domParser = new DOMParser();

type StatusApprovalStatus = Exclude<BaseStatus['approval_status'], null>;

type OldStatus = Pick<BaseStatus, 'content' | 'spoiler_text'> & {
  search_index: string;
  account_id: string;
};

// Gets titles of poll options from status
const getPollOptionTitles = (poll?: BaseStatus['poll']): readonly string[] => {
  if (poll && typeof poll === 'object') {
    return poll.options.map(({ title }) => title);
  } else {
    return [];
  }
};

// Gets usernames of mentioned users from status
const getMentionedUsernames = (status: Pick<BaseStatus, 'mentions'>): Array<string> =>
  status.mentions.map(({ acct }) => `@${acct}`);

// Creates search text from the status
const buildSearchContent = (
  status: Pick<BaseStatus, 'mentions' | 'spoiler_text' | 'content'>,
  poll?: BaseStatus['poll'],
): string => {
  const pollOptionTitles = getPollOptionTitles(poll);
  const mentionedUsernames = getMentionedUsernames(status);

  const fields = [status.spoiler_text, status.content, ...pollOptionTitles, ...mentionedUsernames];

  return unescapeHTML(fields.join('\n\n')) || '';
};

const getSearchIndex = (
  status: Omit<BaseStatus, 'account' | 'reblog' | 'quote' | 'poll' | 'group'>,
  oldStatus?: OldStatus,
  poll?: BaseStatus['poll'],
) => {
  if (
    oldStatus &&
    oldStatus.content === status.content &&
    oldStatus.spoiler_text === status.spoiler_text
  ) {
    return oldStatus.search_index;
  } else {
    const searchContent = buildSearchContent(status, poll);

    return domParser.parseFromString(searchContent, 'text/html').documentElement.textContent || '';
  }
};

const normalizeStatus = (
  {
    account,
    accounts,
    reblog,
    quote,
    poll,
    group,
    ...status
  }: (BaseStatus | StatusWithoutAccount) & {
    accounts?: Array<BaseAccount>;
  },
  oldStatus?: OldStatus,
) => {
  const searchIndex = getSearchIndex(status, oldStatus, poll);

  // Sort the replied-to mention to the top
  let mentions = status.mentions.toSorted((a, _b) => {
    if (a.id === status.in_reply_to_account_id) {
      return -1;
    } else {
      return 0;
    }
  });

  const accountId = account?.id || oldStatus?.account_id || window.__PL_API_FALLBACK_ACCOUNT.id;

  // Add self to mentions if it's a reply to self
  const isSelfReply = accountId === status.in_reply_to_account_id;
  const hasSelfMention = status.mentions.some((mention) => accountId === mention.id);

  if (isSelfReply && !hasSelfMention) {
    const selfMention = v.parse(mentionSchema, account);
    mentions = [selfMention, ...mentions];
  }

  // Normalize event
  let event: BaseStatus['event'] &
    ({
      banner: MediaAttachment | null;
      links: Array<MediaAttachment>;
    } | null) = null;
  let media_attachments = status.media_attachments;

  if (status.event) {
    const firstAttachment = status.media_attachments[0];
    let banner: MediaAttachment | null = null;

    if (firstAttachment?.description === 'Banner' && firstAttachment.type === 'image') {
      banner = firstAttachment;
      media_attachments = media_attachments.slice(1);
    }

    const links = media_attachments.filter((attachment) => attachment.mime_type === 'text/html');
    media_attachments = media_attachments.filter(
      (attachment) => attachment.mime_type !== 'text/html',
    );

    event = {
      ...status.event,
      banner,
      links,
    };
  }

  return {
    account_id: accountId,
    account_ids: accounts ? accounts.map(({ id }) => id) : [accountId],
    reblog_id: reblog?.id ?? null,
    poll_id: poll?.id ?? null,
    group_id: group?.id ?? null,
    expectsCard: false,
    showFiltered: null as null | boolean,
    deleted: false,
    ...status,
    quote_id: status.quote_id ?? null,
    mentions,
    event,
    media_attachments,
    search_index: searchIndex,
  };
};

type NormalizedStatus = ReturnType<typeof normalizeStatus>;

export { normalizeStatus, type NormalizedStatus, type StatusApprovalStatus };
