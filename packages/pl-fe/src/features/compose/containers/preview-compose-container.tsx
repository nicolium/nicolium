import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { cancelPreviewCompose } from 'pl-fe/actions/compose';
import EventPreview from 'pl-fe/components/event-preview';
import OutlineBox from 'pl-fe/components/outline-box';
import QuotedStatusIndicator from 'pl-fe/components/quoted-status-indicator';
import StatusContent from 'pl-fe/components/status-content';
import StatusMedia from 'pl-fe/components/status-media';
import StatusReplyMentions from 'pl-fe/components/status-reply-mentions';
import SensitiveContentOverlay from 'pl-fe/components/statuses/sensitive-content-overlay';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';

import type { Status } from 'pl-fe/normalizers/status';

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
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { account: ownAccount } = useOwnAccount();

  const previewedStatus = useCompose(composeId).preview as unknown as Status;

  const handleClose = () => {
    dispatch(cancelPreviewCompose(composeId));
  };

  const status = useMemo(() => previewedStatus ? ({
    ...previewedStatus,
    account: previewedStatus.account || ownAccount,
  }) : null, [previewedStatus, ownAccount]);

  if (!status) {
    return null;
  }

  return (
    <OutlineBox>
      <Stack space={2}>
        <HStack space={1} alignItems='center'>
          <Icon className='size-4 text-gray-700 dark:text-gray-600' src={require('@tabler/icons/outline/eye.svg')} />
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
          id={status.account.id}
          timestamp={status.created_at}
          withRelationship={false}
          showAccountHoverCard={false}
          withLinkToProfile={!false}
        />

        <StatusReplyMentions status={status} hoverable={false} />

        {status.event ? <EventPreview status={status} hideAction /> : (
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
