import { autoUpdate, flip, shift, useFloating } from '@floating-ui/react';
import iconCalendarDots from '@phosphor-icons/core/regular/calendar-dots.svg';
import iconTag from '@phosphor-icons/core/regular/tag.svg';
import { useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';

import ActionButton from '@/components/accounts/action-button';
import { isTimezoneLabel } from '@/components/accounts/profile-field';
import Badge from '@/components/badge';
import Icon from '@/components/ui/icon';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { UserPanel } from '@/features/ui/util/async-components';
import { useTransitionStyles } from '@/hooks/use-transition-styles';
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

  useEffect(() => {
    if (account && !ref?.current) {
      showAccountHoverCard.cancel();
      closeAccountHoverCard(true);
    }
  }, [!!account]);

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
      className={clsx('⁂-account-hover-card', {
        '⁂-account-hover-card--hidden': !visible || !context.open,
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
      <div className='⁂-account-hover-card__card'>
        <div className='⁂-account-hover-card__info'>
          <UserPanel
            accountId={account.id}
            action={<ActionButton account={account} small />}
            badges={badges}
          />

          {account.local ? (
            <div
              className='⁂-account-info__details__item'
              title={intl.formatDate(account.created_at, dateFormatOptions)}
            >
              <Icon src={iconCalendarDots} />

              <FormattedMessage
                id='account.member_since'
                defaultMessage='Joined {date}'
                values={{
                  date: memberSinceDate,
                }}
              />
            </div>
          ) : null}

          {timezoneField && <AccountLocalTime accountId={account.id} field={timezoneField} />}

          {account.pronouns.length > 0 && (
            <div
              className='⁂-account-info__details__item'
              title={intl.formatMessage(messages.pronouns, {
                pronouns: account.pronouns.join('/'),
              })}
            >
              <Icon src={iconTag} />

              {account.pronouns.join('/')}
            </div>
          )}

          {!!scrobble && <Scrobble scrobble={scrobble} />}

          {account.note.length > 0 && (
            <p className='⁂-account-hover-card__note'>
              <ParsedContent html={account.note} emojis={account.emojis} />
            </p>
          )}
        </div>

        {followedBy && (
          <div className='⁂-account-hover-card__badge'>
            <Badge
              slug='opaque'
              title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export { AccountHoverCard as default };
