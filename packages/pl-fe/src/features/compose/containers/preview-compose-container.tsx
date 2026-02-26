import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import EventPreview from '@/components/event-preview';
import OutlineBox from '@/components/outline-box';
import QuotedStatusIndicator from '@/components/quoted-status-indicator';
import StatusContent from '@/components/status-content';
import StatusMedia from '@/components/status-media';
import StatusReplyMentions from '@/components/status-reply-mentions';
import SensitiveContentOverlay from '@/components/statuses/sensitive-content-overlay';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import AccountContainer from '@/containers/account-container';
import { useCompose, useComposeActions } from '@/stores/compose';

import type { NormalizedStatus as Status } from '@/reducers/statuses';

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
      <Stack space={2}>
        <HStack space={1} alignItems='center'>
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
        </HStack>
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
          <Stack className='relative z-0'>
            <Stack space={4}>
              <StatusContent status={status} isQuote />

              {status.quote_id && <QuotedStatusIndicator statusId={status.quote_id} />}

              {status.media_attachments?.length > 0 && (
                <div className='relative'>
                  <SensitiveContentOverlay status={status} />
                  <StatusMedia status={status} muted />
                </div>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </OutlineBox>
  );
};

export { PreviewComposeContainer as default };
