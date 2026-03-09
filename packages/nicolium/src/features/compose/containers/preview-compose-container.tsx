import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import OutlineBox from '@/components/outline-box';
import EventPreview from '@/components/statuses/event-preview';
import QuotedStatusIndicator from '@/components/statuses/quoted-status-indicator';
import SensitiveContentOverlay from '@/components/statuses/sensitive-content-overlay';
import StatusContent from '@/components/statuses/status-content';
import StatusMedia from '@/components/statuses/status-media';
import StatusReplyMentions from '@/components/statuses/status-reply-mentions';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Text from '@/components/ui/text';
import AccountContainer from '@/containers/account-container';
import { useCompose, useComposeActions } from '@/stores/compose';

import type { NormalizedStatus as Status } from '@/normalizers/status';

const messages = defineMessages({
  close: {
    id: 'compose_form.preview.close',
    defaultMessage: 'Hide preview',
  },
});

interface IQuotedStatusContainer {
  composeId: string;
}

/** Previewed status shown in post composer. */
const PreviewComposeContainer: React.FC<IQuotedStatusContainer> = ({ composeId }) => {
  const { updateCompose } = useComposeActions();
  const intl = useIntl();

  const previewedStatus = useCompose(composeId).preview as unknown as Status;

  const handleClose = () => {
    updateCompose(composeId, (draft) => {
      draft.preview = null;
    });
  };

  const status = previewedStatus ?? null;

  if (!status) {
    return null;
  }

  return (
    <OutlineBox>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-1'>
          <Icon
            className='size-4 text-gray-700 dark:text-gray-600'
            src={require('@phosphor-icons/core/regular/eye.svg')}
          />
          <Text theme='muted' size='sm' className='grow'>
            <FormattedMessage id='compose_form.preview_label' defaultMessage='Preview' />
          </Text>

          <IconButton
            src={require('@phosphor-icons/core/regular/x.svg')}
            title={intl.formatMessage(messages.close)}
            onClick={handleClose}
            className='bg-transparent text-gray-600 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-500'
            iconClassName='h-4 w-4'
          />
        </div>
        <AccountContainer
          id={status.account_id}
          timestamp={status.created_at}
          withRelationship={false}
          showAccountHoverCard={false}
          withLinkToProfile={!false}
        />

        <StatusReplyMentions status={status} hoverable={false} />

        {status.event ? (
          <EventPreview status={status} hideAction />
        ) : (
          <div className='relative z-0 flex flex-col gap-4'>
            <StatusContent status={status} isQuote />

            {status.quote_id && <QuotedStatusIndicator statusId={status.quote_id} />}

            {status.media_attachments?.length > 0 && (
              <div className='relative'>
                <SensitiveContentOverlay status={status} />
                <StatusMedia status={status} muted />
              </div>
            )}
          </div>
        )}
      </div>
    </OutlineBox>
  );
};

export { PreviewComposeContainer as default };
