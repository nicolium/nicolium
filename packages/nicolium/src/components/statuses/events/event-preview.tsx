import iconMapPin from '@phosphor-icons/core/regular/map-pin.svg';
import iconUser from '@phosphor-icons/core/regular/user.svg';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import VerificationBadge from '@/components/accounts/verification-badge';
import EventActionButton from '@/components/statuses/events/event-action-button';
import EventDate from '@/components/statuses/events/event-date';
import Icon from '@/components/ui/icon';
import { useCurrentAccount } from '@/contexts/current-account-context';
import Emojify from '@/features/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';

import type { NormalizedStatus as StatusEntity } from '@/queries/statuses/normalize';

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

  const me = useCurrentAccount();
  const { data: account } = useAccount(status.account_id);

  const event = status.event!;

  if (!account) return null;

  const banner = event.banner;

  const action =
    !hideAction &&
    (account.id === me ? (
      <Link
        className={clsx('event-card__manage', !floatingAction && 'event-card__manage--primary')}
        to='/@{$username}/events/$statusId/edit'
        params={{ username: account.acct, statusId: status.id }}
      >
        <FormattedMessage id='event.manage' defaultMessage='Manage' />
      </Link>
    ) : (
      <EventActionButton status={status} theme={floatingAction ? 'secondary' : 'primary'} />
    ));

  return (
    <div className={clsx('event-card', className)}>
      <div className='event-card__action__container'>{floatingAction && action}</div>
      <div className='event-card__banner'>
        {banner && <img src={banner.url} alt={intl.formatMessage(messages.eventBanner)} />}
      </div>
      <div className='event-card__body'>
        <div className='event-card__heading'>
          <p>{event.name}</p>

          {!floatingAction && action}
        </div>

        <div className='event-card__info'>
          <div className='event-card__author'>
            <Icon src={iconUser} />
            <div className='event-card__author__name'>
              <span>
                <Emojify text={account.display_name} emojis={account.emojis} />
              </span>
              {account.verified && <VerificationBadge />}
            </div>
          </div>

          <EventDate status={status} />

          {event.location && (
            <div className='event-card__location'>
              <Icon src={iconMapPin} />
              <span>{event.location.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { EventPreview as default };
