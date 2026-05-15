import iconLock from '@phosphor-icons/core/regular/lock.svg';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import VerificationBadge from '@/components/accounts/verification-badge';
import StillImage from '@/components/still-image';
import Avatar from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useAcct } from '@/hooks/use-acct';
import { useAccount } from '@/queries/accounts/use-account';
import { useSettings } from '@/stores/settings';
import { shortNumberFormat } from '@/utils/numbers';

import { AccountLink } from '../accounts/account-link';

const messages = defineMessages({
  accountLocked: {
    id: 'account.locked_info',
    defaultMessage: 'This account is locked. The owner manually reviews who can follow them.',
  },
  originalDisplayName: {
    id: 'account.original_display_name',
    defaultMessage: 'You have assigned a nickname to this user.',
  },
});

interface IUserPanel {
  accountId: string;
  action?: React.JSX.Element;
  badges?: React.JSX.Element[];
  domain?: string;
}

const UserPanel: React.FC<IUserPanel> = ({ accountId, action, badges, domain }) => {
  const intl = useIntl();
  const { demetricator, disableUserProvidedMedia } = useSettings();
  const { data: account } = useAccount(accountId);
  const displayedAcct = useAcct(account);

  if (!account) return null;
  const acct = !account.acct.includes('@') && domain ? `${account.acct}@${domain}` : account.acct;
  const header = account.header;
  const verified = account.verified;

  return (
    <div className='relative'>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-col'>
          {!disableUserProvidedMedia && (
            <div className='relative -mx-4 -mt-4 h-24 overflow-hidden bg-gray-200'>
              {header && <StillImage src={account.header} alt={account.header_description} />}
            </div>
          )}

          <div
            className={clsx('flex', disableUserProvidedMedia ? 'justify-end' : 'justify-between')}
          >
            {!disableUserProvidedMedia && (
              <AccountLink account={account} title={acct} className='-mt-12 block'>
                <Avatar
                  src={account.avatar}
                  alt={account.avatar_description}
                  isCat={account.is_cat}
                  username={account.username}
                  showAlt
                  size={80}
                  className='size-20 bg-gray-50 ring-2 ring-white'
                />
              </AccountLink>
            )}

            {action && <div className='mt-2'>{action}</div>}
          </div>
        </div>

        <div className='flex flex-col'>
          <AccountLink account={account}>
            <div className='flex items-center gap-1'>
              <Text size='lg' weight='bold' truncate>
                <Emojify text={account.display_name} emojis={account.emojis} />
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

              {verified && <VerificationBadge />}

              {badges && badges.length > 0 && (
                <div className='flex items-center gap-1'>{badges}</div>
              )}
            </div>
          </AccountLink>

          <div className='flex items-center gap-1'>
            <Text size='sm' theme='muted' direction='ltr' truncate>
              @{displayedAcct}
            </Text>

            {account.locked && (
              <Icon
                src={iconLock}
                alt={intl.formatMessage(messages.accountLocked)}
                className='size-4 text-gray-600'
              />
            )}
          </div>
        </div>

        {!demetricator && (
          <div className='flex items-center gap-3'>
            {account.followers_count >= 0 && (
              <Link
                to='/@{$username}/followers'
                params={{ username: account.acct }}
                title={intl.formatNumber(account.followers_count)}
              >
                <div className='flex items-center gap-1'>
                  <Text theme='primary' weight='bold' size='sm'>
                    {shortNumberFormat(account.followers_count)}
                  </Text>
                  <Text weight='bold' size='sm'>
                    <FormattedMessage id='account.followers' defaultMessage='Followers' />
                  </Text>
                </div>
              </Link>
            )}

            {account.following_count >= 0 && (
              <Link
                to='/@{$username}/following'
                params={{ username: account.acct }}
                title={intl.formatNumber(account.following_count)}
              >
                <div className='flex items-center gap-1'>
                  <Text theme='primary' weight='bold' size='sm'>
                    {shortNumberFormat(account.following_count)}
                  </Text>
                  <Text weight='bold' size='sm'>
                    <FormattedMessage id='account.follows' defaultMessage='Following' />
                  </Text>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { UserPanel as default };
