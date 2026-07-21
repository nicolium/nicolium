import iconEye from '@phosphor-icons/core/regular/eye.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import OutlineBox from '@/components/outline-box';
import EventPreview from '@/components/statuses/events/event-preview';
import QuotedStatusIndicator from '@/components/statuses/quoted-status-indicator';
import SensitiveContentOverlay from '@/components/statuses/sensitive-content-overlay';
import StatusContent from '@/components/statuses/status-content';
import StatusMedia from '@/components/statuses/status-media';
import StatusReplyMentions from '@/components/statuses/status-reply-mentions';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Toggle from '@/components/ui/toggle';
import { useCompose, useComposeActions } from '@/stores/compose';

import type { NormalizedStatus as Status } from '@/queries/statuses/normalize';

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

  const compose = useCompose(composeId);
  const autoUpdate = compose.previewAutoUpdate;
  const previewedStatus = compose.preview as unknown as Status;

  const handleClose = () => {
    updateCompose(composeId, (draft) => {
      draft.preview = null;
    });
  };

  const handleSwitchAutoUpdate: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    updateCompose(composeId, (draft) => {
      draft.previewAutoUpdate = event.target.checked;
    });
  };

  const status = previewedStatus ?? null;

  if (!status) {
    return null;
  }

  return (
    <OutlineBox>
      <div className='compose-preview'>
        <div className='compose-preview__header'>
          <Icon src={iconEye} />
          <p className='compose-preview__label'>
            <FormattedMessage id='compose_form.preview.label' defaultMessage='Preview' />
          </p>

          <label className='compose-preview__auto-update'>
            <FormattedMessage id='compose_form.preview.auto_update' defaultMessage='Auto-update' />
            <Toggle size='sm' checked={autoUpdate} onChange={handleSwitchAutoUpdate} />
          </label>
          <IconButton
            src={iconX}
            title={intl.formatMessage(messages.close)}
            onClick={handleClose}
            className='compose-preview__close'
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
          <div className='compose-preview__body'>
            <StatusContent status={status} isQuote />

            {status.quote_id && <QuotedStatusIndicator statusId={status.quote_id} />}

            {status.media_attachments?.length > 0 && (
              <div className='compose-preview__media'>
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
