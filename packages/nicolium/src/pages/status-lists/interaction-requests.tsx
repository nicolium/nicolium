import iconArrowBendUpLeft from '@phosphor-icons/core/regular/arrow-bend-up-left.svg';
import iconRepeat from '@phosphor-icons/core/regular/repeat.svg';
import iconRocketLaunch from '@phosphor-icons/core/regular/rocket-launch.svg';
import iconStar from '@phosphor-icons/core/regular/star.svg';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import { buildLink } from '@/components/notification';
import PullToRefresh from '@/components/pull-to-refresh';
import RelativeTimestamp from '@/components/relative-timestamp';
import ScrollableList from '@/components/scrollable-list';
import StatusContent from '@/components/statuses/status-content';
import StatusInfo from '@/components/statuses/status-info';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import { Hotkeys } from '@/features/ui/components/hotkeys';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAccount } from '@/queries/accounts/use-account';
import {
  type MinifiedInteractionRequest,
  useAuthorizeInteractionRequestMutation,
  useFlatInteractionRequests,
  useRejectInteractionRequestMutation,
} from '@/queries/statuses/use-interaction-requests';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';

const messages = defineMessages({
  title: { id: 'column.interaction_requests', defaultMessage: 'Interaction requests' },
  favourite: {
    id: 'interaction_request.favourite',
    defaultMessage: '{name} wants to like your <link>post</link>',
  },
  reply: {
    id: 'interaction_request.reply',
    defaultMessage: '{name} wants to reply to your <link>post</link>',
  },
  reblog: {
    id: 'interaction_request.reblog',
    defaultMessage: '{name} wants to repost your <link>post</link>',
  },
  authorize: { id: 'interaction_request.authorize', defaultMessage: 'Accept' },
  reject: { id: 'interaction_request.reject', defaultMessage: 'Reject' },
  authorized: {
    id: 'interaction_request.authorize.success',
    defaultMessage: 'Authorized @{acct} interaction request',
  },
  authorizeFail: {
    id: 'interaction_request.authorize.fail',
    defaultMessage: 'Failed to authorize @{acct} interaction request',
  },
  rejected: {
    id: 'interaction_request.reject.success',
    defaultMessage: 'Rejected @{acct} interaction request',
  },
  rejectFail: {
    id: 'interaction_request.reject.fail',
    defaultMessage: 'Failed to reject @{acct} interaction request',
  },
});

const icons = {
  favourite: iconStar,
  reblog: iconRepeat,
  reply: iconArrowBendUpLeft,
};

const avatarSize = 42;

interface IInteractionRequestStatus {
  id: string;
  hasReply?: boolean;
  isReply?: boolean;
  actions?: React.JSX.Element;
}

const InteractionRequestStatus: React.FC<IInteractionRequestStatus> = ({
  id: statusId,
  hasReply,
  isReply,
  actions,
}) => {
  const { data: status } = useMinimalStatus(statusId);

  if (!status) return null;

  return (
    <div
      className={clsx('interaction-request__status', {
        'interaction-request__status--has-reply': hasReply,
      })}
    >
      {hasReply && <div className='interaction-request__status__connector' />}

      <AccountContainer
        id={status.account_id}
        showAccountHoverCard={false}
        withLinkToProfile={false}
        timestamp={status.created_at}
        action={actions ?? <></>}
      />

      <div className='interaction-request__status__content'>
        <StatusContent status={status} preview={!isReply} />

        {status.media_attachments.length > 0 && <AttachmentThumbs status={status} />}
      </div>
    </div>
  );
};

interface IInteractionRequest {
  interactionRequest: MinifiedInteractionRequest;
  onMoveUp?: (requestId: string) => void;
  onMoveDown?: (requestId: string) => void;
}

const InteractionRequest: React.FC<IInteractionRequest> = ({
  interactionRequest,
  onMoveUp,
  onMoveDown,
}) => {
  const intl = useIntl();
  const { data: ownAccount } = useOwnAccount();
  const { data: account } = useAccount(interactionRequest.account_id);
  const { useRocketIconForReblogs } = useSettings();

  const { mutate: authorize } = useAuthorizeInteractionRequestMutation(interactionRequest.id);
  const { mutate: reject } = useRejectInteractionRequestMutation(interactionRequest.id);

  const handleAuthorize = () => {
    authorize(undefined, {
      onSuccess: () => {
        toast.success(
          intl.formatMessage(messages.authorized, {
            acct: account?.acct,
          }),
        );
      },
      onError: () => {
        toast.error(
          intl.formatMessage(messages.authorizeFail, {
            acct: account?.acct,
          }),
        );
      },
    });
  };

  const handleReject = () => {
    reject(undefined, {
      onSuccess: () => {
        toast.success(
          intl.formatMessage(messages.rejected, {
            acct: account?.acct,
          }),
        );
      },
      onError: () => {
        toast.error(
          intl.formatMessage(messages.rejectFail, {
            acct: account?.acct,
          }),
        );
      },
    });
  };

  if (interactionRequest.accepted_at || interactionRequest.rejected_at) return null;

  const message = intl.formatMessage(messages[interactionRequest.type], {
    name: account && buildLink(account),
    link: (children: React.ReactNode) => {
      if (interactionRequest.status_id) {
        return (
          <Link
            className='font-bold text-gray-800 hover:underline dark:text-gray-200'
            to='/@{$username}/posts/$statusId'
            params={{ username: ownAccount?.acct ?? '', statusId: interactionRequest.status_id }}
          >
            {children}
          </Link>
        );
      }

      return children;
    },
  });

  const actions = (
    <div className='flex gap-2'>
      <Button
        theme='secondary'
        size='sm'
        text={intl.formatMessage(messages.authorize)}
        onClick={() => {
          handleAuthorize();
        }}
      />
      <Button
        theme='danger'
        size='sm'
        text={intl.formatMessage(messages.reject)}
        onClick={() => {
          handleReject();
        }}
      />
    </div>
  );

  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp(interactionRequest.id);
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown(interactionRequest.id);
    }
  };

  const handlers = {
    moveUp: handleMoveUp,
    moveDown: handleMoveDown,
  };

  let icon = icons[interactionRequest.type];
  if (interactionRequest.type === 'reblog' && useRocketIconForReblogs) {
    icon = iconRocketLaunch;
  }

  return (
    <Hotkeys handlers={handlers} className='interaction-request notification' tabIndex={0}>
      <div className='notification__header'>
        <div className='notification__info'>
          <StatusInfo
            avatarSize={avatarSize}
            icon={<Icon src={icon} className='notification__icon' aria-hidden />}
            text={message}
          />
        </div>

        {interactionRequest.type !== 'reply' && (
          <p className='notification__timestamp'>
            <RelativeTimestamp timestamp={interactionRequest.created_at} theme='muted' size='sm' />
          </p>
        )}
      </div>

      {interactionRequest.status_id && (
        <InteractionRequestStatus
          id={interactionRequest.status_id}
          hasReply={interactionRequest.type === 'reply'}
          actions={interactionRequest.reply_id ? undefined : actions}
        />
      )}
      {interactionRequest.reply_id && (
        <InteractionRequestStatus id={interactionRequest.reply_id} isReply actions={actions} />
      )}
    </Hotkeys>
  );
};

const InteractionRequestsPage = () => {
  const intl = useIntl();

  const {
    data = [],
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    refetch,
  } = useFlatInteractionRequests();

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.interaction_requests'
      defaultMessage='There are no pending interaction requests.'
    />
  );

  const handleMoveUp = (id: string) => {
    const elementIndex = data.findIndex((item) => item !== null && item.id === id) - 1;
    selectChild(elementIndex);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex = data.findIndex((item) => item !== null && item.id === id) + 1;
    selectChild(elementIndex);
  };

  const selectChild = (index: number) => {
    const selector = `[data-index="${index}"] .focusable`;
    const element = document.querySelector<HTMLDivElement>(selector);

    if (element) element.focus();
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <PullToRefresh onRefresh={refetch}>
        <ScrollableList
          scrollKey='interactionRequests'
          isLoading={isFetching}
          showLoading={isLoading}
          hasMore={hasNextPage}
          emptyMessageText={emptyMessage}
          onLoadMore={() => fetchNextPage()}
          listClassName={clsx('status-list', {
            'status-list--loading': isLoading,
          })}
        >
          {data?.map((request) => (
            <InteractionRequest
              key={request.id}
              interactionRequest={request}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </ScrollableList>
      </PullToRefresh>
    </Column>
  );
};

export { InteractionRequestsPage as default };
