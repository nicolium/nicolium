import { IconButton } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { shareAsync } from 'expo-sharing';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Linking, Platform } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import {
  useUnblockAccountMutation,
  useUnmuteAccountMutation,
} from '@/queries/accounts/use-relationship';

import { iconHelper } from '../ui/icon';

import { BlockMuteDialog } from './block-mute-dialog';

import type { Account } from 'pl-api';

const messages = defineMessages({
  copy: { id: 'account.copy', defaultMessage: 'Copy link to profile' },
  openInBrowser: { id: 'account.open_in_browser', defaultMessage: 'Open profile in browser' },
  share: { id: 'account.share', defaultMessage: 'Share profile' },
  favourites: { id: 'column.favourites', defaultMessage: 'Likes' },
  followRequests: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
  blocked: { id: 'column.blocks.long', defaultMessage: 'Blocked accounts' },
  muted: { id: 'column.mutes.long', defaultMessage: 'Muted accounts' },
  filters: { id: 'column.filters', defaultMessage: 'Muted words' },
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

  const [blockMuteDialog, setBlockMuteDialog] = React.useState<'block' | 'mute' | null>(null);

  const { data: currentAccountId } = useCredentialAccountId();
  const { mutate: unmuteAccount } = useUnmuteAccountMutation(account.id);
  const { mutate: unblockAccount } = useUnblockAccountMutation(account.id);

  const ownAccount = currentAccountId === account.id;

  const handleCopy = () => Clipboard.setStringAsync(account.url);

  const handleOpenInBrowser = () => Linking.openURL(account.url);

  const handleShare = () => {
    shareAsync(account.url);
  };

  const handleMute = () => {
    if (account.relationship?.muting) unmuteAccount();
    else setBlockMuteDialog('mute');
  };

  const handleBlock = () => {
    if (account.relationship?.blocking) unblockAccount();
    else setBlockMuteDialog('block');
  };

  return (
    <>
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
            <DropdownMenu.Item key='copy' onSelect={handleCopy}>
              <DropdownMenu.ItemIcon
                ios={{ name: 'link' }}
                androidIconName='ph_link_simple_horizontal'
              />
              <DropdownMenu.ItemTitle>{intl.formatMessage(messages.copy)}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            <DropdownMenu.Item key='open-in-browser' onSelect={handleOpenInBrowser}>
              <DropdownMenu.ItemIcon
                ios={{ name: 'safari' }}
                androidIconName='ph_arrow_square_out'
              />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(messages.openInBrowser)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            <DropdownMenu.Item key='share' onSelect={handleShare}>
              <DropdownMenu.ItemIcon
                ios={{ name: 'square.and.arrow.up' }}
                androidIconName='ph_export'
              />
              <DropdownMenu.ItemTitle>{intl.formatMessage(messages.share)}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
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
              <>
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
                <DropdownMenu.Item
                  key='blocks'
                  onSelect={() =>
                    navigation.navigate('settings', {
                      screen: 'blocks',
                    })
                  }
                >
                  <DropdownMenu.ItemIcon ios={{ name: 'nosign' }} androidIconName='ph_prohibit' />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(messages.blocked)}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  key='mutes'
                  onSelect={() =>
                    navigation.navigate('settings', {
                      screen: 'mutes',
                    })
                  }
                >
                  <DropdownMenu.ItemIcon
                    ios={{ name: 'speaker.slash' }}
                    androidIconName='ph_speaker_simple_x'
                  />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(messages.muted)}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  key='filters'
                  onSelect={() =>
                    navigation.navigate('settings', {
                      screen: 'filters',
                    })
                  }
                >
                  <DropdownMenu.ItemIcon
                    ios={{ name: 'line.3.horizontal.decrease.circle' }}
                    androidIconName='ph_funnel'
                  />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(messages.filters)}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Group>
          {!ownAccount && (
            <>
              <DropdownMenu.Separator />
              <DropdownMenu.Group>
                <DropdownMenu.Item key='mute' onSelect={handleMute}>
                  <DropdownMenu.ItemIcon
                    ios={{ name: 'speaker.slash' }}
                    androidIconName='ph_speaker_simple_x'
                  />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(
                      account.relationship?.muting ? messages.unmute : messages.mute,
                      {
                        name: account.username,
                      },
                    )}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                <DropdownMenu.Item key='block' onSelect={handleBlock}>
                  <DropdownMenu.ItemIcon ios={{ name: 'nosign' }} androidIconName='ph_prohibit' />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(
                      account.relationship?.blocking ? messages.unblock : messages.block,
                      {
                        name: account.username,
                      },
                    )}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                <DropdownMenu.Item key='report'>
                  <DropdownMenu.ItemIcon ios={{ name: 'flag' }} androidIconName='ph_flag' />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(messages.report, {
                      name: account.username,
                    })}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      {blockMuteDialog && (
        <BlockMuteDialog
          action={blockMuteDialog}
          accountId={account.id}
          visible
          onDismiss={() => setBlockMuteDialog(null)}
        />
      )}
    </>
  );
};

export { AccountActionsDropdown };
