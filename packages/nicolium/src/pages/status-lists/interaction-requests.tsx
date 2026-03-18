import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import Icon from '@/components/icon';
import AttachmentThumbs from '@/components/media/attachment-thumbs';
import { buildLink } from '@/components/notification';
import PullToRefresh from '@/components/pull-to-refresh';
import RelativeTimestamp from '@/components/relative-timestamp';
import ScrollableList from '@/components/scrollable-list';
import StatusContent from '@/components/statuses/status-content';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Text from '@/components/ui/text';
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
  favourite: require('@phosphor-icons/core/regular/star.svg'),
  reblog: require('@phosphor-icons/core/regular/repeat.svg'),
  reply: require('@phosphor-icons/core/regular/arrow-bend-up-left.svg'),
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
    <div className='relative flex flex-col gap-2 py-2'>
      {hasReply && (
        <div className='absolute left-5 top-[62px] z-[1] block h-[calc(100%-58px)] w-0.5 bg-gray-200 black:bg-gray-800 dark:bg-primary-800 rtl:left-auto rtl:right-5' />
      )}

      <AccountContainer
        id={status.account_id}
        showAccountHoverCard={false}
        withLinkToProfile={false}
        timestamp={status.created_at}
        action={actions ?? <></>}
      />

      <div className={clsx('flex flex-col gap-2', hasReply && 'pl-[54px]')}>
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

  return (
    <Hotkeys handlers={handlers} className='notification focusable' tabIndex={0}>
      <div className='focusable p-4'>
        <div className='flex flex-col gap-2'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='flex justify-end' style={{ flexBasis: avatarSize }}>
                <Icon
                  src={icons[interactionRequest.type]}
                  className='flex-none text-primary-600 dark:text-primary-400'
                />
              </div>

              <div className='truncate'>
                <Text theme='muted' size='xs' truncate>
                  {message}
                </Text>
              </div>

              {interactionRequest.type !== 'reply' && (
                <div className='ml-auto'>
                  <Text theme='muted' size='xs' truncate>
                    <RelativeTimestamp
                      timestamp={interactionRequest.created_at}
                      theme='muted'
                      size='sm'
                      className='whitespace-nowrap'
                    />
                  </Text>
                </div>
              )}
            </div>
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
        </div>
      </div>
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
          listClassName={clsx('⁂-status-list', {
            'animate-pulse': data?.length === 0,
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
