import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Icon from '@/components/icon';
import Button from '@/components/ui/button';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import VerificationBadge from '@/components/verification-badge';
import Emojify from '@/features/emoji/emojify';
import EventActionButton from '@/features/event/components/event-action-button';
import EventDate from '@/features/event/components/event-date';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useAccount } from '@/queries/accounts/use-account';

import type { NormalizedStatus as StatusEntity } from '@/reducers/statuses';

const messages = defineMessages({
  eventBanner: { id: 'event.banner', defaultMessage: 'Event banner' },
  leaveConfirm: { id: 'confirmations.leave_event.confirm', defaultMessage: 'Leave event' },
  leaveMessage: {
    id: 'confirmations.leave_event.message',
    defaultMessage:
      'If you want to rejoin the event, the request will be manually reviewed again. Are you sure you want to proceed?',
  },
});

interface IEventPreview {
  status: Pick<StatusEntity, 'id' | 'account_id' | 'event' | 'url'>;
  className?: string;
  hideAction?: boolean;
  floatingAction?: boolean;
}

const EventPreview: React.FC<IEventPreview> = ({
  status,
  className,
  hideAction,
  floatingAction = true,
}) => {
  const intl = useIntl();

  const me = useAppSelector((state) => state.me);
  const { data: account } = useAccount(status.account_id);

  const event = status.event!;

  if (!account) return null;

  const banner = event.banner;

  const action =
    !hideAction &&
    (account.id === me ? (
      <Button
        size='sm'
        theme={floatingAction ? 'secondary' : 'primary'}
        to='/@{$username}/events/$statusId/edit'
        params={{ username: account.acct, statusId: status.id }}
      >
        <FormattedMessage id='event.manage' defaultMessage='Manage' />
      </Button>
    ) : (
      <EventActionButton status={status} theme={floatingAction ? 'secondary' : 'primary'} />
    ));

  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden rounded-lg bg-gray-100 black:border black:border-gray-800 black:bg-black dark:bg-primary-800',
        className,
      )}
    >
      <div className='absolute right-3 top-28'>{floatingAction && action}</div>
      <div className='h-40 bg-primary-200 dark:bg-gray-600'>
        {banner && (
          <img
            className='size-full object-cover'
            src={banner.url}
            alt={intl.formatMessage(messages.eventBanner)}
          />
        )}
      </div>
      <Stack className='p-2.5' space={2}>
        <HStack space={2} alignItems='center' justifyContent='between'>
          <Text weight='semibold' truncate>
            {event.name}
          </Text>

          {!floatingAction && action}
        </HStack>

        <div className='flex flex-wrap gap-x-2 gap-y-1 text-gray-700 dark:text-gray-600'>
          <HStack alignItems='center' space={2}>
            <Icon src={require('@phosphor-icons/core/regular/user.svg')} />
            <HStack space={1} alignItems='center' grow>
              <span>
                <Emojify text={account.display_name} emojis={account.emojis} />
              </span>
              {account.verified && <VerificationBadge />}
            </HStack>
          </HStack>

          <EventDate status={status} />

          {event.location && (
            <HStack alignItems='center' space={2}>
              <Icon src={require('@phosphor-icons/core/regular/map-pin.svg')} />
              <span>{event.location.name}</span>
            </HStack>
          )}
        </div>
      </Stack>
    </div>
  );
};

export { EventPreview as default };
