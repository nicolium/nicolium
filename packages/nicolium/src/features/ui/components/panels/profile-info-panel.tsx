import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Scrobble from '@/components/accounts/scrobble';
import Badge from '@/components/badge';
import Markup from '@/components/markup';
import { dateFormatOptions } from '@/components/relative-timestamp';
import { ParsedContent } from '@/components/statuses/parsed-content';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { useCurrentAccount } from '@/contexts/current-account-context';
import Emojify from '@/features/emoji/emojify';
import { useAcct } from '@/hooks/use-acct';
import { useAccountScrobbleQuery } from '@/queries/accounts/account-scrobble';
import { capitalize } from '@/utils/strings';

import { ProfileField } from '../../util/async-components';
import ProfileFamiliarFollowers from '../profile-familiar-followers';
import ProfileStats from '../profile-stats';

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
});

interface IProfileInfoPanel {
  account?: Account & { original_display_name?: string };
  /** Username from URL params, in case the account isn't found. */
  username: string;
}

/** User profile metadata, such as location, birthday, etc. */
const ProfileInfoPanel: React.FC<IProfileInfoPanel> = ({ account, username }) => {
  const intl = useIntl();
  const acct = useAcct(account);
  const me = useCurrentAccount();
  const ownAccount = account?.id === me;

  const { data: scrobble } = useAccountScrobbleQuery(account?.id);

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
      <div className='flex items-center gap-0.5'>
        <Icon
          src={
            hasBirthday
              ? require('@phosphor-icons/core/regular/cake.svg')
              : require('@phosphor-icons/core/regular/balloon.svg')
          }
          className='size-4 text-gray-800 dark:text-gray-200'
        />

        <Text size='sm'>
          {hasBirthday ? (
            <FormattedMessage id='account.birthday_today' defaultMessage='Birthday is today!' />
          ) : (
            <FormattedMessage
              id='account.birthday'
              defaultMessage='Born {date}'
              values={{ date: formattedBirthday }}
            />
          )}
        </Text>
      </div>
    );
  };

  if (!account) {
    return (
      <div className='min-w-0 flex-1 sm:px-2'>
        <div className='flex items-center gap-1'>
          <Text size='sm' theme='muted' direction='ltr' truncate>
            @{username}
          </Text>
        </div>
      </div>
    );
  }

  const memberSinceDate = intl.formatDate(account.created_at, { month: 'long', year: 'numeric' });
  const badges = getBadges();

  return (
    <div className='min-w-0 flex-1 sm:px-2'>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-col'>
          <div className='flex items-center gap-1'>
            <Text size='lg' weight='bold' truncate>
              {account.deactivated ? (
                <FormattedMessage id='account.deactivated' defaultMessage='Deactivated' />
              ) : (
                <Emojify text={account.display_name} emojis={account.emojis} />
              )}
            </Text>

            {account.original_display_name &&
              account.original_display_name !== account.display_name && (
                <Text
                  theme='muted'
                  truncate
                  title={intl.formatMessage(messages.originalDisplayName)}
                >
                  {'('}
                  <Emojify text={account.original_display_name} emojis={account.emojis} />
                  {')'}
                </Text>
              )}

            {account.bot && <Badge slug='bot' title={intl.formatMessage(messages.bot)} />}

            {badges.length > 0 && <div className='flex items-center gap-1'>{badges}</div>}
          </div>

          <div className='flex items-center gap-0.5'>
            <Text size='sm' theme='muted' direction='ltr' truncate>
              @{acct}
            </Text>

            {account.locked && (
              <Icon
                src={require('@phosphor-icons/core/regular/lock.svg')}
                alt={intl.formatMessage(messages.accountLocked)}
                className='size-4 text-gray-600'
              />
            )}
          </div>
        </div>

        <ProfileStats account={account} />

        {!!account.note && (
          <Markup className='break-words' size='sm'>
            <ParsedContent
              html={account.note}
              emojis={account.emojis}
              speakAsCat={account.speak_as_cat}
            />
          </Markup>
        )}

        <div className='flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-center'>
          {account.local ? (
            <div className='flex items-center gap-0.5'>
              <Icon
                src={require('@phosphor-icons/core/regular/calendar-dots.svg')}
                className='size-4 text-gray-800 dark:text-gray-200'
              />

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

          {account.location ? (
            <div className='flex items-center gap-0.5'>
              <Icon
                src={require('@phosphor-icons/core/regular/map-pin.svg')}
                className='size-4 text-gray-800 dark:text-gray-200'
              />

              <Text size='sm'>{account.location}</Text>
            </div>
          ) : null}

          {renderBirthday()}

          {account.pronouns.length > 0 ? (
            <div
              className='flex items-center gap-0.5'
              title={intl.formatMessage(messages.pronouns, {
                pronouns: account.pronouns.join('/'),
              })}
            >
              <Icon
                src={require('@phosphor-icons/core/regular/tag.svg')}
                className='size-4 text-gray-800 dark:text-gray-200'
              />

              <Text size='sm'>{account.pronouns.join('/')}</Text>
            </div>
          ) : null}
        </div>

        {scrobble && <Scrobble scrobble={scrobble} />}

        {ownAccount ? null : <ProfileFamiliarFollowers account={account} />}
      </div>

      {account.fields.length > 0 && (
        <div className='mt-4 flex flex-col gap-2 xl:hidden'>
          {account.fields.map((field, i) => (
            <ProfileField field={field} key={i} emojis={account.emojis} accountId={account.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export { ProfileInfoPanel as default };
