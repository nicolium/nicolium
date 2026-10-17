import { IconButton } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { DotsThreeIcon, DotsThreeVerticalIcon } from 'phosphor-react-native';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';

import { iconHelper } from '../ui/icon';

import type { Account } from 'pl-api';

const messages = defineMessages({
  favourites: { id: 'column.favourites', defaultMessage: 'Likes' },
  followRequests: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
});

interface IAccountActionsDropdown {
  account: Account;
}

const AccountActionsDropdown: React.FC<IAccountActionsDropdown> = ({ account }) => {
  const client = useClient();
  const features = useFeatures();
  const intl = useIntl();
  const navigation = useNavigation();
  const scopeUrl = useScopeUrl();

  const { data: currentAccountId } = useCredentialAccountId();

  const ownAccount = currentAccountId === account.id;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          mode='outlined'
          icon={iconHelper(Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon)}
          onPress={() => {}}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          {(ownAccount || (features.publicFavourites && !account.hide_favorites)) && (
            <DropdownMenu.Item
              key='favourites'
              onSelect={() =>
                navigation.navigate('accounts', {
                  screen: 'favourites',
                  params: { id: account.id },
                })
              }
            >
              <DropdownMenu.ItemIcon ios={{ name: 'star' }} androidIconName='ph_star' />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(messages.favourites)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          )}
          {ownAccount && (
            <DropdownMenu.Item
              key='follow-requests'
              onSelect={() =>
                navigation.navigate('settings', {
                  screen: 'follow_requests',
                })
              }
            >
              <DropdownMenu.ItemIcon
                ios={{ name: 'person.badge.plus' }}
                androidIconName='ph_user_plus'
              />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(messages.followRequests)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Group>
        <DropdownMenu.Group>
          <DropdownMenu.Item key='mute'>
            <DropdownMenu.ItemIcon
              ios={{ name: 'speaker.slash' }}
              androidIconName='ph_speaker_simple_x'
            />
            <DropdownMenu.ItemTitle>
              {intl.formatMessage(account.relationship?.muting ? messages.unmute : messages.mute, {
                name: account.acct,
              })}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key='block'>
            <DropdownMenu.ItemIcon ios={{ name: 'nosign' }} androidIconName='ph_prohibit' />
            <DropdownMenu.ItemTitle>
              {intl.formatMessage(
                account.relationship?.blocking ? messages.unblock : messages.block,
                {
                  name: account.acct,
                },
              )}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key='report'>
            <DropdownMenu.ItemIcon ios={{ name: 'flag' }} androidIconName='ph_flag' />
            <DropdownMenu.ItemTitle>
              {intl.formatMessage(messages.report, {
                name: account.acct,
              })}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export { AccountActionsDropdown };
