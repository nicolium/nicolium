import iconBalloon from '@phosphor-icons/core/regular/balloon.svg';
import iconCake from '@phosphor-icons/core/regular/cake.svg';
import iconCalendarDots from '@phosphor-icons/core/regular/calendar-dots.svg';
import iconLock from '@phosphor-icons/core/regular/lock.svg';
import iconMapPin from '@phosphor-icons/core/regular/map-pin.svg';
import iconTag from '@phosphor-icons/core/regular/tag.svg';
import { clsx } from 'clsx';
import React, { useLayoutEffect, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import ProfileFamiliarFollowers from '@/components/accounts/profile-familiar-followers';
import ProfileStats from '@/components/accounts/profile-stats';
import Scrobble from '@/components/accounts/scrobble';
import Badge from '@/components/badge';
import { dateFormatOptions } from '@/components/relative-timestamp';
import { ParsedContent } from '@/components/statuses/parsed-content';
import Icon from '@/components/ui/icon';
import { useCurrentAccount } from '@/contexts/current-account-context';
import Emojify from '@/features/emoji/emojify';
import { ProfileField } from '@/features/ui/util/async-components';
import { useAcct } from '@/hooks/use-acct';
import { useAccountScrobbleQuery } from '@/queries/accounts/account-scrobble';
import { useSettings } from '@/stores/settings';
import { capitalize } from '@/utils/strings';

import { ExpandButton } from '../statuses/status-content';

import type { Account } from 'pl-api';

const messages = defineMessages({
  linkVerifiedOn: {
    id: 'account.link_verified_on',
    defaultMessage: 'Ownership of this link was checked on {date}',
  },
  accountLocked: {
    id: 'account.locked_info',
    defaultMessage:
      'This account privacy status is set to locked. The owner manually reviews who can follow them.',
  },
  deactivated: { id: 'account.deactivated', defaultMessage: 'Deactivated' },
  bot: { id: 'account.badges.bot', defaultMessage: 'Bot' },
  pronouns: { id: 'account.pronouns.with_label', defaultMessage: 'Pronouns: {pronouns}' },
  originalDisplayName: {
    id: 'account.original_display_name',
    defaultMessage: 'You have assigned a nickname to this user.',
  },
  birthday: { id: 'account.birthday', defaultMessage: 'Born {date}' },
});

interface IProfileInfoPanel {
  account?: Account & { original_display_name?: string };
  /** Username from URL params, in case the account isn't found. */
  username: string;
}

/** User profile metadata, such as location, birthday, etc. */
const ProfileInfoPanel: React.FC<IProfileInfoPanel> = ({ account, username }) => {
  const accountInfoNode = React.useRef<HTMLDivElement>(null);
  const intl = useIntl();
  const acct = useAcct(account);
  const me = useCurrentAccount();
  const ownAccount = account?.id === me;
  const { displayMentionAvatars, sidebarItems } = useSettings();
  const isContextDisplayed = sidebarItems.includes('context');

  const { data: scrobble } = useAccountScrobbleQuery(account?.id);

  const [collapsed, setCollapsed] = useState<boolean | null>(null);

  const maybeSetCollapsed = (): void => {
    if (!accountInfoNode.current) return;

    // 20px * x lines (+ 2px padding at the top)
    setCollapsed(accountInfoNode.current.clientHeight >= 282 ? true : null);
  };

  useLayoutEffect(() => {
    maybeSetCollapsed();
  }, []);

  const getStaffBadge = (): React.ReactNode => {
    if (account?.is_admin) {
      return (
        <Badge
          slug='admin'
          title={
            <FormattedMessage id='account_moderation_modal.roles.admin' defaultMessage='Admin' />
          }
          key='staff'
        />
      );
    } else if (account?.is_moderator) {
      return (
        <Badge
          slug='moderator'
          title={
            <FormattedMessage
              id='account_moderation_modal.roles.moderator'
              defaultMessage='Moderator'
            />
          }
          key='staff'
        />
      );
    } else {
      return null;
    }
  };

  const getCustomBadges = (): React.ReactNode[] => {
    const badges = account?.roles ?? [];

    return badges
      .filter((badge) => badge.highlighted)
      .map((badge) => (
        <Badge
          key={badge.id || badge.name}
          slug={badge.name}
          title={capitalize(badge.name)}
          color={badge.color}
        />
      ));
  };

  const getBadges = (): React.ReactNode[] => {
    const custom = getCustomBadges();
    const staffBadge = getStaffBadge();

    const badges = [];

    if (staffBadge) {
      badges.push(staffBadge);
    }

    return [...badges, ...custom];
  };

  const renderBirthday = (): React.ReactNode => {
    const birthday = account?.birthday;
    if (!birthday) return null;

    const formattedBirthday = intl.formatDate(birthday, {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const date = new Date(birthday);
    const today = new Date();

    const hasBirthday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();

    return (
      <div
        className='⁂-account-info__details__item'
        title={intl.formatMessage(messages.birthday, { date: formattedBirthday })}
      >
        <Icon src={hasBirthday ? iconCake : iconBalloon} />

        {hasBirthday ? (
          <FormattedMessage id='account.birthday_today' defaultMessage='Birthday is today!' />
        ) : (
          <FormattedMessage
            id='account.birthday'
            defaultMessage='Born {date}'
            values={{ date: formattedBirthday }}
          />
        )}
      </div>
    );
  };

  if (!account) {
    return (
      <div className='⁂-account-info-panel__container'>
        <div className='⁂-account-info-panel'>
          <p className='⁂-account-info-panel__name__handle'>@{username}</p>
        </div>
      </div>
    );
  }

  const memberSinceDate = intl.formatDate(account.created_at, { month: 'long', year: 'numeric' });
  const badges = getBadges();

  return (
    <div className='⁂-account-info-panel__container'>
      <div className='⁂-account-info-panel'>
        <div className='⁂-account-info-panel__name'>
          <div className='⁂-account-info-panel__name__display-name'>
            <p>
              <Emojify text={account.display_name} emojis={account.emojis} truncated />
            </p>

            {((account.original_display_name &&
              account.original_display_name !== account.display_name) ||
              account.deactivated) && (
              <p className='⁂-account-info-panel__name__original-display-name'>
                {'('}
                {account.original_display_name &&
                account.original_display_name !== account.display_name ? (
                  <Emojify text={account.original_display_name} emojis={account.emojis} />
                ) : (
                  <FormattedMessage id='account.deactivated' defaultMessage='Deactivated' />
                )}
                {')'}
              </p>
            )}

            {account.bot && <Badge slug='bot' title={intl.formatMessage(messages.bot)} />}

            {badges.length > 0 && (
              <div className='⁂-account-info-panel__name__badges'>{badges}</div>
            )}
          </div>

          <div className='⁂-account-info-panel__name__handle'>
            @{acct}
            {account.locked && (
              <Icon src={iconLock} alt={intl.formatMessage(messages.accountLocked)} />
            )}
          </div>
        </div>

        <ProfileStats account={account} />

        <div className='⁂-account-info__container' ref={accountInfoNode}>
          <div className={clsx('⁂-account-info', { '⁂-account-info--collapsed': collapsed })}>
            {!!account.note && (
              <p className='⁂-account-info__note break-words' data-markup>
                <ParsedContent
                  html={account.note}
                  emojis={account.emojis}
                  speakAsCat={account.speak_as_cat}
                  displayMentionAvatars={displayMentionAvatars}
                />
              </p>
            )}

            <div className='flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-center'>
              {account.local ? (
                <div
                  className='⁂-account-info__details__item'
                  title={intl.formatDate(account.created_at, dateFormatOptions)}
                >
                  <Icon src={iconCalendarDots} aria-hidden />

                  <FormattedMessage
                    id='account.member_since'
                    defaultMessage='Joined {date}'
                    values={{
                      date: memberSinceDate,
                    }}
                  />
                </div>
              ) : null}

              {account.location ? (
                <div className='⁂-account-info__details__item'>
                  <Icon src={iconMapPin} aria-hidden />

                  {account.location}
                </div>
              ) : null}

              {renderBirthday()}

              {account.pronouns.length > 0 ? (
                <div
                  className='⁂-account-info__details__item'
                  title={intl.formatMessage(messages.pronouns, {
                    pronouns: account.pronouns.join('/'),
                  })}
                >
                  <Icon src={iconTag} aria-hidden />

                  {account.pronouns.join('/')}
                </div>
              ) : null}
            </div>

            {scrobble && <Scrobble scrobble={scrobble} withComposeButton={ownAccount} />}

            {ownAccount ? null : <ProfileFamiliarFollowers account={account} />}

            {account.fields.length > 0 && (
              <div
                className={clsx('⁂-account-info__fields', {
                  '⁂-account-info__fields--optional': isContextDisplayed,
                })}
              >
                {account.fields.map((field, i) => (
                  <ProfileField
                    field={field}
                    key={i}
                    emojis={account.emojis}
                    accountId={account.id}
                  />
                ))}
              </div>
            )}
          </div>

          {collapsed !== null && (
            <ExpandButton
              onClick={() => setCollapsed((value) => !value)}
              key='expand'
              expanded={!collapsed}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export { ProfileInfoPanel as default };
