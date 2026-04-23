import iconX from '@phosphor-icons/core/regular/x.svg';
import clsx from 'clsx';
import React from 'react';

import Account from '@/components/accounts/account';
import Markup from '@/components/markup';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import { ParsedContent } from '@/components/statuses/parsed-content';
import QuotedStatusIndicator from '@/components/statuses/quoted-status-indicator';
import { useAccount } from '@/queries/accounts/use-account';
import { getTextDirection } from '@/utils/rtl';

import type { NormalizedStatus as Status } from '@/queries/statuses/normalize';

interface IReplyIndicator {
  className?: string;
  status?: Pick<
    Status,
    | 'account_id'
    | 'content'
    | 'created_at'
    | 'emojis'
    | 'filtered'
    | 'media_attachments'
    | 'mentions'
    | 'search_index'
    | 'sensitive'
    | 'spoiler_text'
    | 'quote_id'
    | 'quote_url'
  >;
  onCancel?: () => void;
  hideActions: boolean;
}

const ReplyIndicator: React.FC<IReplyIndicator> = ({
  className,
  status,
  hideActions,
  onCancel,
}) => {
  const handleClick = () => {
    onCancel!();
  };
  const { data: account } = useAccount(status?.account_id);

  if (!status) {
    return null;
  }

  let actions = {};
  if (!hideActions && onCancel) {
    actions = {
      onActionClick: handleClick,
      actionIcon: iconX,
      actionAlignment: 'top',
      actionTitle: 'Dismiss',
    };
  }

  return (
    <div
      className={clsx(
        'flex max-h-72 flex-col gap-2 overflow-y-auto rounded-lg bg-gray-100 p-4 black:bg-gray-900 dark:bg-gray-800',
        className,
      )}
    >
      {account && (
        <Account
          {...actions}
          account={account}
          timestamp={status.created_at}
          showAccountHoverCard={false}
          withLinkToProfile={false}
          hideActions={hideActions}
        />
      )}

      <Markup
        className='break-words'
        size='sm'
        direction={getTextDirection(status.search_index)}
        tag='div'
      >
        <ParsedContent
          html={status.content}
          mentions={status.mentions}
          hasQuote={!!status.quote_id}
          emojis={status.emojis}
          speakAsCat={account?.speak_as_cat}
        />
      </Markup>

      {status.media_attachments.length > 0 && <AttachmentThumbs status={status} />}

      {status.quote_id && (
        <QuotedStatusIndicator statusId={status.quote_id} statusUrl={status.quote_url} />
      )}
    </div>
  );
};

export { ReplyIndicator as default };
