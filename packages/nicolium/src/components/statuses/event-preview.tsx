import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import VerificationBadge from '@/components/accounts/verification-badge';
import Icon from '@/components/icon';
import Button from '@/components/ui/button';
import { useCurrentAccount } from '@/contexts/current-account-context';
import Emojify from '@/features/emoji/emojify';
import EventActionButton from '@/features/event/components/event-action-button';
import EventDate from '@/features/event/components/event-date';
import { useAccount } from '@/queries/accounts/use-account';

import type { NormalizedStatus as StatusEntity } from '@/normalizers/status';

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
    <div className={clsx('⁂-event-card', className)}>
      <div className='⁂-event-card__action__container'>{floatingAction && action}</div>
      <div className='⁂-event-card__banner'>
        {banner && <img src={banner.url} alt={intl.formatMessage(messages.eventBanner)} />}
      </div>
      <div className='⁂-event-card__body'>
        <div className='⁂-event-card__heading'>
          <p>{event.name}</p>

          {!floatingAction && action}
        </div>

        <div className='⁂-event-card__info'>
          <div className='⁂-event-card__author'>
            <Icon src={require('@phosphor-icons/core/regular/user.svg')} />
            <div className='⁂-event-card__author__name'>
              <span>
                <Emojify text={account.display_name} emojis={account.emojis} />
              </span>
              {account.verified && <VerificationBadge />}
            </div>
          </div>

          <EventDate status={status} />

          {event.location && (
            <div className='⁂-event-card__location'>
              <Icon src={require('@phosphor-icons/core/regular/map-pin.svg')} />
              <span>{event.location.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { EventPreview as default };
