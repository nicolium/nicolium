import { autoUpdate, flip, shift, useFloating, useTransitionStyles } from '@floating-ui/react';
import iconCalendarDots from '@phosphor-icons/core/regular/calendar-dots.svg';
import iconTag from '@phosphor-icons/core/regular/tag.svg';
import { useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';

import ActionButton from '@/components/accounts/action-button';
import { isTimezoneLabel } from '@/components/accounts/profile-field';
import Badge from '@/components/badge';
import Card, { CardBody } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { UserPanel } from '@/features/ui/util/async-components';
import { useAccountScrobbleQuery } from '@/queries/accounts/account-scrobble';
import { useAccount } from '@/queries/accounts/use-account';
import { useAccountHoverCardActions, useAccountHoverCardStore } from '@/stores/account-hover-card';

import { dateFormatOptions } from '../relative-timestamp';
import { ParsedContent } from '../statuses/parsed-content';

import AccountLocalTime from './account-local-time';
import { showAccountHoverCard } from './hover-account-wrapper';
import Scrobble from './scrobble';

import type { Account } from 'pl-api';

const messages = {
  pronouns: { id: 'account.pronouns.with_label', defaultMessage: 'Pronouns: {pronouns}' },
};

const getBadges = (account?: Pick<Account, 'is_admin' | 'is_moderator'>): React.JSX.Element[] => {
  const badges = [];

  if (account?.is_admin) {
    badges.push(
      <Badge
        key='admin'
        slug='admin'
        title={
          <FormattedMessage id='account_moderation_modal.roles.admin' defaultMessage='Admin' />
        }
      />,
    );
  } else if (account?.is_moderator) {
    badges.push(
      <Badge
        key='moderator'
        slug='moderator'
        title={
          <FormattedMessage
            id='account_moderation_modal.roles.moderator'
            defaultMessage='Moderator'
          />
        }
      />,
    );
  }

  return badges;
};

interface IAccountHoverCard {
  visible?: boolean;
}

/** Popup profile preview that appears when hovering avatars and display names. */
const AccountHoverCard: React.FC<IAccountHoverCard> = ({ visible = true }) => {
  const router = useRouter();
  const intl = useIntl();

  const { accountId, ref } = useAccountHoverCardStore();
  const { updateAccountHoverCard, closeAccountHoverCard } = useAccountHoverCardActions();

  const me = useCurrentAccount();
  const { data: account } = useAccount(accountId ?? undefined, true);
  const { data: scrobble } = useAccountScrobbleQuery(account?.id);
  const badges = getBadges(account);

  useEffect(() => {
    const unlisten = router.subscribe('onLoad', ({ pathChanged }) => {
      if (pathChanged) {
        showAccountHoverCard.cancel();
        closeAccountHoverCard(true);
      }
    });

    return () => {
      unlisten();
    };
  }, []);

  const { x, y, strategy, refs, context, placement } = useFloating({
    open: !!account,
    elements: {
      reference: ref?.current,
    },
    middleware: [
      flip(),
      shift({
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { styles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.8)',
      transformOrigin: placement === 'bottom' ? 'top' : 'bottom',
    },
    duration: {
      open: 100,
      close: 100,
    },
  });

  const handleMouseEnter = () => {
    updateAccountHoverCard();
  };

  const handleMouseLeave = () => {
    closeAccountHoverCard(true);
  };

  if (!account) return null;
  const memberSinceDate = intl.formatDate(account.created_at, { month: 'long', year: 'numeric' });
  const followedBy = me !== account.id && account.relationship?.followed_by === true;

  const timezoneField = account.fields.find((field) => isTimezoneLabel(field.name));

  return (
    <div
      className={clsx({
        'absolute left-0 top-0 z-[101] w-[320px] transition-opacity': true,
        'opacity-100': visible && context.open,
        'pointer-events-none opacity-0': !visible || !context.open,
      })}
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        ...styles,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card
        variant='rounded'
        className='relative isolate overflow-hidden black:rounded-xl black:border black:border-gray-800'
      >
        <CardBody>
          <div className='flex flex-col gap-2'>
            <UserPanel
              accountId={account.id}
              action={<ActionButton account={account} small />}
              badges={badges}
            />

            {account.local ? (
              <div className='flex items-center gap-0.5'>
                <Icon src={iconCalendarDots} className='size-4 text-gray-800 dark:text-gray-200' />

                <Text size='sm' title={intl.formatDate(account.created_at, dateFormatOptions)}>
                  <FormattedMessage
                    id='account.member_since'
                    defaultMessage='Joined {date}'
                    values={{
                      date: memberSinceDate,
                    }}
                  />
                </Text>
              </div>
            ) : null}

            {timezoneField && <AccountLocalTime accountId={account.id} field={timezoneField} />}

            {account.pronouns.length > 0 && (
              <div className='flex items-center gap-0.5'>
                <Icon src={iconTag} className='size-4 text-gray-800 dark:text-gray-200' />

                <Text
                  size='sm'
                  title={intl.formatMessage(messages.pronouns, {
                    pronouns: account.pronouns.join('/'),
                  })}
                >
                  {account.pronouns.join('/')}
                </Text>
              </div>
            )}

            {!!scrobble && <Scrobble scrobble={scrobble} />}

            {account.note.length > 0 && (
              <Text
                truncate
                size='sm'
                className='mr-2 rtl:ml-2 rtl:mr-0 [&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden'
              >
                <ParsedContent html={account.note} emojis={account.emojis} />
              </Text>
            )}
          </div>

          {followedBy && (
            <div className='absolute left-2 top-2'>
              <Badge
                slug='opaque'
                title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export { AccountHoverCard as default };
