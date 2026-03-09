import { linkOptions, useNavigate, useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { type MouseEventHandler } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Stack from '@/components/ui/stack';
import AccountContainer from '@/containers/account-container';

import OutlineBox from '../outline-box';

import EventPreview from './event-preview';
import StatusContent from './status-content';
import StatusReplyMentions from './status-reply-mentions';

import type { SelectedStatus } from '@/queries/statuses/use-status';

const messages = defineMessages({
  cancel: { id: 'reply_indicator.cancel', defaultMessage: 'Cancel' },
});

interface IQuotedStatus {
  /** The quoted status entity. */
  status?: SelectedStatus;
  /** Callback when cancelled (during compose). */
  onCancel?: () => void;
  /** Whether the status is shown in the post composer. */
  compose?: boolean;
}

/** Status embedded in a quote post. */
const QuotedStatus: React.FC<IQuotedStatus> = ({ status, onCancel, compose }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const router = useRouter();

  const handleExpandClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!status) return;
    const account = status.account;

    if (!compose && e.button === 0) {
      const link = linkOptions({
        to: '/@{$username}/posts/$statusId',
        params: { username: account.acct, statusId: status.id },
      });
      if (!(e.ctrlKey || e.metaKey)) {
        navigate(link);
      } else {
        const url = router.buildLocation(link).href;
        window.open(url, '_blank');
      }
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (!status) {
    return null;
  }

  const account = status.account;

  let actions = {};
  if (onCancel) {
    actions = {
      onActionClick: handleClose,
      actionIcon: require('@phosphor-icons/core/regular/x.svg'),
      actionAlignment: 'top',
      actionTitle: intl.formatMessage(messages.cancel),
    };
  }

  return (
    <OutlineBox
      data-testid='quoted-status'
      className={clsx('cursor-pointer', {
        'group hover:bg-gray-100 dark:hover:bg-gray-800': !compose,
      })}
    >
      <Stack space={2} onClick={handleExpandClick}>
        {account.id && (
          <AccountContainer
            {...actions}
            id={account.id}
            timestamp={status.created_at}
            withRelationship={false}
            showAccountHoverCard={!compose}
            withLinkToProfile={!compose}
            withLocked={false}
          />
        )}

        <StatusReplyMentions status={status} hoverable={false} />

        {status.event ? (
          <EventPreview status={status} hideAction />
        ) : (
          <Stack space={4} className='relative z-0'>
            <StatusContent status={status} collapsable isQuote withMedia compose={compose} />
          </Stack>
        )}
      </Stack>
    </OutlineBox>
  );
};

export { QuotedStatus as default };
