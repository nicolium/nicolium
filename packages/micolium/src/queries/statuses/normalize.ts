import {
  type Account as BaseAccount,
  type Status as BaseStatus,
  type MediaAttachment,
  type StatusWithoutAccount,
  mentionSchema,
} from 'pl-api';
import * as v from 'valibot';

type StatusApprovalStatus = Exclude<BaseStatus['approval_status'], null>;

type OldStatus = Pick<BaseStatus, 'content' | 'spoiler_text'> & {
  account_id: string;
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
  // Sort the replied-to mention to the top
  let mentions = status.mentions.toSorted((a, b) => {
    if (a.id === status.in_reply_to_account_id) {
      return -1;
    } else if (b.id === status.in_reply_to_account_id) {
      return 1;
    } else {
      return 0;
    }
  });

  const accountId = account?.id || oldStatus?.account_id || ''; // || window.__PL_API_FALLBACK_ACCOUNT.id;

  // Add self to mentions if it's a reply to self
  const isSelfReply = accountId === status.in_reply_to_account_id;
  const hasSelfMention = status.mentions.some((mention) => accountId === mention.id);

  if (isSelfReply && !hasSelfMention && account) {
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
    ...status,
    quote_status: quote?.state ?? null,
    quote_id: status.quote_id ?? null,
    mentions,
    event,
    media_attachments,
  };
};

type NormalizedStatus = ReturnType<typeof normalizeStatus>;

export { normalizeStatus, type NormalizedStatus, type StatusApprovalStatus };
