import iconChartBar from '@phosphor-icons/core/regular/chart-bar.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import AttachmentThumbs from '@/components/media/attachment-thumbs';
import { ParsedContent } from '@/components/statuses/parsed-content';
import Icon from '@/components/ui/icon';

import StatusActionBar from '../statuses/action-bar';
import QuotedStatusIndicator from '../statuses/quoted-status-indicator';

import type { SelectedStatus } from '@/queries/statuses/use-status';

interface IStatusPreview {
  status: SelectedStatus;
}

const StatusPreview: React.FC<IStatusPreview> = ({ status }) => {
  const output: Array<React.ReactNode> = [];

  if (status.content) {
    output.push(
      <div className='notification__status-preview' data-markup key='content'>
        <ParsedContent
          html={status.content}
          mentions={status.mentions}
          hasQuote={!!status.quote_id}
          emojis={status.emojis}
          speakAsCat={status.account.speak_as_cat}
        />
      </div>,
    );
  }

  if (status.media_attachments.length) {
    output.push(<AttachmentThumbs key='attachments' status={status} />);
  }

  if (status.quote_id) {
    output.push(
      <QuotedStatusIndicator key='quote' statusId={status.quote_id} statusUrl={status.quote_url} />,
    );
  }

  if (status.poll_id) {
    output.push(
      <div className='quoted-status-indicator'>
        <Icon src={iconChartBar} aria-hidden />
        <p>
          <FormattedMessage id='poll.hint' defaultMessage='Poll' />
        </p>
      </div>,
    );
  }

  if (!status.rss_feed) {
    output.push(<StatusActionBar key='action-bar' status={status} space='sm' />);
  }

  return output;
};

export { StatusPreview };
