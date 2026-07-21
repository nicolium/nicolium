import clsx from 'clsx';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchStatus } from '@/actions/statuses';
import Account from '@/components/accounts/account';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import OutlineBox from '@/components/outline-box';
import PollPreview from '@/components/polls/poll-preview';
import StatusContent from '@/components/statuses/status-content';
import StatusReplyMentions from '@/components/statuses/status-reply-mentions';
import { buildPollFromParams, buildStatusFromDraft } from '@/features/draft-statuses/builder';
import QuotedStatus from '@/features/status/containers/quoted-status-container';
import { useClient } from '@/hooks/use-client';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import { useCancelDraftStatus } from '@/queries/statuses/use-draft-statuses';
import { openDedicatedComposeWindow, useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { userTouching } from '@/utils/is-mobile';

import type { NormalizedStatus as StatusEntity } from '@/queries/statuses/normalize';
import type { DraftStatus } from '@/queries/statuses/use-draft-statuses';
import type { DraftStatus as DraftStatusType } from '@/queries/statuses/use-draft-statuses';

const messages = defineMessages({
  deleteConfirm: { id: 'confirmations.draft_status_delete.confirm', defaultMessage: 'Discard' },
  deleteHeading: {
    id: 'confirmations.draft_status_delete.heading',
    defaultMessage: 'Cancel draft post',
  },
  deleteMessage: {
    id: 'confirmations.draft_status_delete.message',
    defaultMessage: 'Are you sure you want to discard this draft post?',
  },
});

interface IDraftStatusActionBar {
  source: DraftStatus;
  status: StatusEntity;
}

const DraftStatusActionBar: React.FC<IDraftStatusActionBar> = ({ source, status }) => {
  const intl = useIntl();
  const client = useClient();
  const scopeUrl = useScopeUrl();

  const { openModal } = useModalsActions();
  const { setComposeToStatus } = useComposeActions();
  const settings = useSettings();
  const cancelDraftStatus = useCancelDraftStatus();

  const handleCancelClick = () => {
    const deleteModal = settings.deleteModal;
    if (!deleteModal) {
      cancelDraftStatus(source.draft_id);
    } else {
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.deleteHeading),
        message: intl.formatMessage(messages.deleteMessage),
        confirm: intl.formatMessage(messages.deleteConfirm),
        onConfirm: () => cancelDraftStatus(source.draft_id),
      });
    }
  };

  const handleEditClick = () => {
    if (settings.useDedicatedComposePage && !userTouching.matches) {
      openDedicatedComposeWindow({ draftId: source.draft_id });
      return;
    }

    if (status.in_reply_to_id) fetchStatus(client, status.in_reply_to_id, scopeUrl);
    const poll = status.poll_id
      ? queryClient.getQueryData(
          scopedQueryKey(queryKeys.statuses.polls.show(status.poll_id), scopeUrl),
        )
      : undefined;
    setComposeToStatus(
      status,
      poll,
      { ...source, location: null },
      false,
      source.draft_id,
      source.editorState,
    );
    openModal('COMPOSE');
  };

  return (
    <div className='draft-status__actions'>
      <button onClick={handleEditClick}>
        <FormattedMessage id='draft_status.edit' defaultMessage='Edit' />
      </button>
      <button onClick={handleCancelClick}>
        <FormattedMessage id='draft_status.cancel' defaultMessage='Delete' />
      </button>
    </div>
  );
};

interface IDraftStatus {
  draftStatus: DraftStatusType;
}

const DraftStatus: React.FC<IDraftStatus> = ({ draftStatus, ...other }) => {
  const { data: ownAccount } = useOwnAccount();

  if (!ownAccount || !draftStatus) return null;

  const status = buildStatusFromDraft(ownAccount, draftStatus);
  const poll = draftStatus.poll ? buildPollFromParams(draftStatus.poll) : null;

  if (!status) return null;

  const account = ownAccount;

  let quote;

  if (status.quote_id) {
    if (!(status.quote_visible ?? true)) {
      quote = (
        <OutlineBox>
          <p>
            <FormattedMessage id='statuses.quote_tombstone' defaultMessage='Post is unavailable.' />
          </p>
        </OutlineBox>
      );
    } else {
      quote = <QuotedStatus statusId={status.quote_id} state='accepted' />;
    }
  }

  return (
    <div
      className={clsx('status__wrapper draft-status', `status__wrapper-${status.visibility}`, {
        'status__wrapper-reply': !!status.in_reply_to_id,
      })}
      tabIndex={0}
    >
      <div
        className={clsx('status', `status--${status.visibility}`, {
          'status--reply': !!status.in_reply_to_id,
        })}
        data-id={status.id}
      >
        <div className='draft-status__account'>
          <Account
            key={account.id}
            account={account}
            action={<DraftStatusActionBar source={draftStatus} status={status} {...other} />}
          />
        </div>

        <StatusReplyMentions status={status} />

        <div className='draft-status__content'>
          <StatusContent status={status} collapsable />

          {status.media_attachments.length > 0 && <AttachmentThumbs status={status} />}

          {quote}

          {poll && <PollPreview poll={poll} />}
        </div>
      </div>
    </div>
  );
};

export { DraftStatus as default };
