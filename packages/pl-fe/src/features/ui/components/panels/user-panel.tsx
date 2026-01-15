import { Link } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import StillImage from 'pl-fe/components/still-image';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import VerificationBadge from 'pl-fe/components/verification-badge';
import Emojify from 'pl-fe/features/emoji/emojify';
import { useAcct } from 'pl-fe/hooks/use-acct';
import { useSettings } from 'pl-fe/stores/settings';
import { shortNumberFormat } from 'pl-fe/utils/numbers';

const messages = defineMessages({
  account_locked: { id: 'account.locked_info', defaultMessage: 'This account privacy status is set to locked. The owner manually reviews who can follow them.' },
});

interface IUserPanel {
  accountId: string;
  action?: JSX.Element;
  badges?: JSX.Element[];
  domain?: string;
}

const UserPanel: React.FC<IUserPanel> = ({ accountId, action, badges, domain }) => {
  const intl = useIntl();
  const { demetricator, disableUserProvidedMedia } = useSettings();
  const { account } = useAccount(accountId);
  const displayedAcct = useAcct(account);

  if (!account) return null;
  const acct = !account.acct.includes('@') && domain ? `${account.acct}@${domain}` : account.acct;
  const header = account.header;
  const verified = account.verified;

  return (
    <div className='relative'>
      <Stack space={2}>
        <Stack>
          {!disableUserProvidedMedia && (
            <div className='relative -mx-4 -mt-4 h-24 overflow-hidden bg-gray-200'>
              {header && (
                <StillImage src={account.header} alt={account.header_description} />
              )}
            </div>
          )}

          <HStack justifyContent={disableUserProvidedMedia ? 'end' : 'between'}>
            {!disableUserProvidedMedia && (
              <Link
                to='/@{$username}'
                params={{ username: acct }}
                title={acct}
                className='-mt-12 block'
              >
                <Avatar
                  src={account.avatar}
                  alt={account.avatar_description}
                  isCat={account.is_cat}
                  username={account.username}
                  showAlt
                  size={80}
                  className='size-20 bg-gray-50 ring-2 ring-white'
                />
              </Link>
            )}

            {action && (
              <div className='mt-2'>{action}</div>
            )}
          </HStack>
        </Stack>

        <Stack>
          <Link to='/@{$username}' params={{ username: account.acct }}>
            <HStack space={1} alignItems='center'>
              <Text size='lg' weight='bold' truncate>
                <Emojify text={account.display_name} emojis={account.emojis} />
              </Text>

              {verified && <VerificationBadge />}

              {badges && badges.length > 0 && (
                <HStack space={1} alignItems='center'>
                  {badges}
                </HStack>
              )}
            </HStack>
          </Link>

          <HStack alignItems='center' space={1}>
            <Text size='sm' theme='muted' direction='ltr' truncate>
              @{displayedAcct}
            </Text>

            {account.locked && (
              <Icon
                src={require('@phosphor-icons/core/regular/lock.svg')}
                alt={intl.formatMessage(messages.account_locked)}
                className='size-4 text-gray-600'
              />
            )}
          </HStack>
        </Stack>

        {!demetricator && (
          <HStack alignItems='center' space={3}>
            {account.followers_count >= 0 && (
              <Link to='/@{$username}/followers' params={{ username: account.acct }} title={intl.formatNumber(account.followers_count)}>
                <HStack alignItems='center' space={1}>
                  <Text theme='primary' weight='bold' size='sm'>
                    {shortNumberFormat(account.followers_count)}
                  </Text>
                  <Text weight='bold' size='sm'>
                    <FormattedMessage id='account.followers' defaultMessage='Followers' />
                  </Text>
                </HStack>
              </Link>
            )}

            {account.following_count >= 0 && (
              <Link to='/@{$username}/following' params={{ username: account.acct }} title={intl.formatNumber(account.following_count)}>
                <HStack alignItems='center' space={1}>
                  <Text theme='primary' weight='bold' size='sm'>
                    {shortNumberFormat(account.following_count)}
                  </Text>
                  <Text weight='bold' size='sm'>
                    <FormattedMessage id='account.follows' defaultMessage='Following' />
                  </Text>
                </HStack>
              </Link>
            )}
          </HStack>
        )}
      </Stack>
    </div>
  );
};

export { UserPanel as default };
