import iconArrowsVertical from '@phosphor-icons/core/regular/arrows-vertical.svg';
import iconCheck from '@phosphor-icons/core/regular/check.svg';
import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import iconFlag from '@phosphor-icons/core/regular/flag.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconSpeakerSimpleX from '@phosphor-icons/core/regular/speaker-simple-x.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useMemo, useRef } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import Counter from '@/components/ui/counter';
import IconButton from '@/components/ui/icon-button';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useUnblockAccountMutation,
  useUnmuteAccountMutation,
} from '@/queries/accounts/use-relationship';
import { queryKeys } from '@/queries/keys';
import {
  useAcceptNotificationRequestMutation,
  useDismissNotificationRequestMutation,
  useNotificationRequests,
} from '@/queries/notifications/use-notification-requests';
import { useModalsActions } from '@/stores/modals';
import { userTouching } from '@/utils/is-mobile';

import type { MinifiedNotificationRequest } from '@/queries/utils/minify-list';

const messages = defineMessages({
  unmuteAccount: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  blockAccount: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblockAccount: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  muteAccount: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  reportAccount: { id: 'account.report', defaultMessage: 'Report @{name}' },
  accept: { id: 'notification_requests.accept', defaultMessage: 'Accept' },
  dismiss: { id: 'notification_requests.dismiss', defaultMessage: 'Dismiss' },
  view: { id: 'notification_requests.view', defaultMessage: 'View notifications' },
});

interface INotificationRequest {
  request: MinifiedNotificationRequest;
}

const NotificationRequest: React.FC<INotificationRequest> = ({ request }) => {
  const intl = useIntl();
  const { openModal } = useModalsActions();

  const { data: account } = useAccount(request.account_id, true);

  const { mutate: acceptRequest } = useAcceptNotificationRequestMutation(request.id);
  const { mutate: dismissRequest } = useDismissNotificationRequestMutation(request.id);
  const { mutate: unblockAccount } = useUnblockAccountMutation(request.account_id);
  const { mutate: unmuteAccount } = useUnmuteAccountMutation(request.account_id);

  const items = useMemo((): Menu => {
    if (!account) return [];

    const onReport = () => {
      openModal('REPORT', { accountId: request.account_id });
    };

    const onMute = () => {
      if (account.relationship?.muting) {
        unmuteAccount();
      } else {
        openModal('BLOCK_MUTE', { accountId: request.account_id, action: 'MUTE' });
      }
    };

    const onBlock = () => {
      if (account.relationship?.blocking) {
        unblockAccount();
      } else {
        openModal('BLOCK_MUTE', { accountId: account.id, action: 'BLOCK' });
      }
    };

    return [
      {
        text: intl.formatMessage(messages.view),
        to: '/notifications/requests/$requestId',
        params: { requestId: request.id },
        icon: iconArrowsVertical,
      },
      null,
      {
        text: intl.formatMessage(messages.accept),
        action: () => acceptRequest(),
        icon: iconCheck,
      },
      {
        text: intl.formatMessage(messages.dismiss),
        action: () => dismissRequest(),
        icon: iconX,
      },
      null,
      account.relationship?.muting
        ? {
            text: intl.formatMessage(messages.unmuteAccount, { name: account.username }),
            action: onMute,
            icon: iconSpeakerSimpleX,
          }
        : {
            text: intl.formatMessage(messages.muteAccount, { name: account.username }),
            action: onMute,
            icon: iconSpeakerSimpleX,
          },
      account.relationship?.blocking
        ? {
            text: intl.formatMessage(messages.unblockAccount, { name: account.username }),
            action: onBlock,
            icon: iconProhibit,
          }
        : {
            text: intl.formatMessage(messages.blockAccount, { name: account.username }),
            action: onBlock,
            icon: iconProhibit,
          },
      {
        text: intl.formatMessage(messages.reportAccount, { name: account.username }),
        action: onReport,
        icon: iconFlag,
      },
    ];
  }, [account]);

  return (
    <AccountContainer
      to='/notifications/requests/$requestId'
      params={{ requestId: request.id }}
      id={request.account_id}
      emoji={<Counter className='account-card__emoji' count={+request.notifications_count} />}
      action={
        <DropdownMenu items={items}>
          <IconButton src={iconDotsThree} theme='outlined' className='account-menu__button' />
        </DropdownMenu>
      }
    />
  );
};

interface INotificationRequestsColumn {
  /** Whether the container is used as scroll parent instead of the window. */
  multiColumn?: boolean;
}

const NotificationRequestsColumn: React.FC<INotificationRequestsColumn> = ({ multiColumn }) => {
  const columnId: string = useRef(`notificationRequests-${crypto.randomUUID()}`).current;

  const {
    data: requests = [],
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useNotificationRequests();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  const handleRefresh = () => {
    queryClient.resetQueries({
      queryKey: [scopeUrl, ...queryKeys.notifications.notificationRequests.root],
    });
  };

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.notification_requests'
      defaultMessage='There are no filtered notifications to review.'
    />
  );

  const scrollContainer = (
    <ScrollableList
      id={columnId}
      scrollKey='notification_requests'
      isLoading={isFetching}
      showLoading={isLoading}
      hasMore={hasNextPage ?? false}
      emptyMessageText={emptyMessage}
      placeholderCount={20}
      onLoadMore={() => fetchNextPage()}
      listClassName={clsx('status-list', { 'status-list--loading': isLoading })}
      itemClassName='account-list__item'
      useWindowScroll={!multiColumn}
    >
      {requests.map((request) => (
        <NotificationRequest key={request.id} request={request} />
      ))}
    </ScrollableList>
  );

  if (userTouching.matches)
    return <PullToRefresh onRefresh={handleRefresh}>{scrollContainer}</PullToRefresh>;
  return scrollContainer;
};

export { NotificationRequestsColumn };
