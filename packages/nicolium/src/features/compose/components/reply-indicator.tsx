import clsx from 'clsx';
import React from 'react';

import AccountContainer from '@/components/accounts/account-container';
import Markup from '@/components/markup';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import { ParsedContent } from '@/components/statuses/parsed-content';
import QuotedStatusIndicator from '@/components/statuses/quoted-status-indicator';
import { getTextDirection } from '@/utils/rtl';

import type { NormalizedStatus as Status } from '@/normalizers/status';

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

  if (!status) {
    return null;
  }

  let actions = {};
  if (!hideActions && onCancel) {
    actions = {
      onActionClick: handleClick,
      actionIcon: require('@phosphor-icons/core/regular/x.svg'),
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
      <AccountContainer
        {...actions}
        id={status.account_id}
        timestamp={status.created_at}
        showAccountHoverCard={false}
        withLinkToProfile={false}
        hideActions={hideActions}
      />

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
