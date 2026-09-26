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
import List, { ListItem } from '@/components/list';
import PullToRefresh from '@/components/pull-to-refresh';
import ScrollableList from '@/components/scrollable-list';
import Counter from '@/components/ui/counter';
import IconButton from '@/components/ui/icon-button';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import { useFeatures } from '@/hooks/use-features';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useUnblockAccountMutation,
  useUnmuteAccountMutation,
} from '@/queries/accounts/use-relationship';
import { queryKeys } from '@/queries/keys';
import {
  useNotificationPolicy,
  useUpdateNotificationPolicy,
} from '@/queries/notifications/use-notification-policy';
import {
  useAcceptNotificationRequestMutation,
  useDismissNotificationRequestMutation,
  useNotificationRequests,
} from '@/queries/notifications/use-notification-requests';
import { useModalsActions } from '@/stores/modals';
import { userTouching } from '@/utils/is-mobile';

import type { MinifiedNotificationRequest } from '@/queries/utils/minify-list';
import type { UpdateNotificationPolicyRequest } from 'pl-api';

const messages = defineMessages({
  unmuteAccount: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  blockAccount: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblockAccount: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  muteAccount: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  reportAccount: { id: 'account.report', defaultMessage: 'Report @{name}' },
  accept: { id: 'notification_requests.accept', defaultMessage: 'Accept' },
  dismiss: { id: 'notification_requests.dismiss', defaultMessage: 'Dismiss' },
  view: { id: 'notification_requests.view', defaultMessage: 'View notifications' },
  acceptOption: { id: 'notifications.policy.accept', defaultMessage: 'Accept' },
  filter: { id: 'notifications.policy.filter', defaultMessage: 'Filter' },
  drop: { id: 'notifications.policy.drop', defaultMessage: 'Ignore' },
});

interface INotificationRequest {
  request: MinifiedNotificationRequest;
}

const NotificationRequestsSettings = () => {
  const intl = useIntl();
  const { data: policy } = useNotificationPolicy();
  const { mutate: updatePolicy } = useUpdateNotificationPolicy();
  const features = useFeatures();

  const options = {
    accept: intl.formatMessage(messages.acceptOption),
    filter: intl.formatMessage(messages.filter),
    drop: intl.formatMessage(messages.drop),
  };

  if (!policy) return null;

  const handleChange =
    (
      key: keyof UpdateNotificationPolicyRequest,
    ): React.ChangeEventHandler<HTMLSelectElement, Element> =>
    (event) => {
      updatePolicy({ [key]: event.target.value });
    };

  return (
    <div className='notification-requests-settings'>
      <h3>
        <FormattedMessage
          id='notifications.policy.title'
          defaultMessage='Manage notifications from…'
        />
      </h3>
      <List>
        <ListItem
          label={
            <FormattedMessage
              id='notifications.policy.filter_not_following_title'
              defaultMessage="People you don't follow"
            />
          }
          hint={
            <FormattedMessage
              id='notifications.policy.filter_not_following_hint'
              defaultMessage='Until you manually approve them'
            />
          }
          size='sm'
        >
          <SelectDropdown
            defaultValue={policy.for_not_following}
            onChange={handleChange('for_not_following')}
            items={options}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='notifications.policy.filter_not_followers_title'
              defaultMessage='People not following you'
            />
          }
          hint={
            <FormattedMessage
              id='notifications.policy.filter_not_followers_hint'
              defaultMessage='Including people who have been following you fewer than {days, plural, one {one day} other {# days}}'
              values={{ days: 3 }}
            />
          }
          size='sm'
        >
          <SelectDropdown
            defaultValue={policy.for_not_followers}
            onChange={handleChange('for_not_followers')}
            items={options}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='notifications.policy.filter_new_accounts_title'
              defaultMessage='New accounts'
            />
          }
          hint={
            <FormattedMessage
              id='notifications.policy.filter_new_accounts.hint'
              defaultMessage='Created within the past {days, plural, one {one day} other {# days}}'
              values={{ days: 30 }}
            />
          }
          size='sm'
        >
          <SelectDropdown
            items={options}
            defaultValue={policy.for_new_accounts}
            onChange={handleChange('for_new_accounts')}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='notifications.policy.filter_private_mentions_title'
              defaultMessage='Unsolicited private mentions'
            />
          }
          hint={
            <FormattedMessage
              id='notifications.policy.filter_private_mentions_hint'
              defaultMessage="Filtered unless it's in reply to your own mention or if you follow the sender"
            />
          }
          size='sm'
        >
          <SelectDropdown
            defaultValue={policy.for_private_mentions}
            onChange={handleChange('for_private_mentions')}
            items={options}
          />
        </ListItem>

        <ListItem
          label={
            <FormattedMessage
              id='notifications.policy.filter_limited_accounts_title'
              defaultMessage='Moderated accounts'
            />
          }
          hint={
            <FormattedMessage
              id='notifications.policy.filter_limited_accounts_hint'
              defaultMessage='Limited by server moderators'
            />
          }
          size='sm'
        >
          <SelectDropdown
            defaultValue={policy.for_limited_accounts}
            onChange={handleChange('for_limited_accounts')}
            items={options}
          />
        </ListItem>

        {features.notificationsPolicyForBots && (
          <ListItem
            label={
              <FormattedMessage id='notifications.policy.filter_bots_title' defaultMessage='Bots' />
            }
            hint={
              <FormattedMessage
                id='notifications.policy.filter_bots_hint'
                defaultMessage='Accounts marked as automated'
              />
            }
            size='sm'
          >
            <SelectDropdown
              defaultValue={policy.for_bots}
              onChange={handleChange('for_bots')}
              items={options}
            />
          </ListItem>
        )}
      </List>
    </div>
  );
};

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

const NotificationRequestsColumn: React.FC = () => {
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

export { NotificationRequestsColumn, NotificationRequestsSettings };
