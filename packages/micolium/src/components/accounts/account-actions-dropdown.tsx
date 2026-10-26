import { IconButton } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { shareAsync } from 'expo-sharing';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Alert, Linking, Platform } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { useFeatures } from '@/contexts/current-account-context';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import {
  useFollowAccountMutation,
  useRemoveAccountFromFollowersMutation,
  useUnblockAccountMutation,
  useUnfollowAccountMutation,
  useUnmuteAccountMutation,
} from '@/queries/accounts/use-relationship';
import { useBlockDomainMutation, useUnblockDomainMutation } from '@/queries/settings/domain-blocks';
import { useComposeActions } from '@/stores/compose';
import { useUiStoreActions } from '@/stores/ui';

import { HeaderIconButton } from '../ui/header-icon-button';
import { iconHelper } from '../ui/icon';

import { BlockMuteDialog } from './block-mute-dialog';
import { ReportDialog } from './report-dialog';

import type { Account } from 'pl-api';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  editProfile: { id: 'settings.edit_profile', defaultMessage: 'Edit profile' },
  copy: { id: 'account.copy', defaultMessage: 'Copy link to profile' },
  openInBrowser: { id: 'account.open_in_browser', defaultMessage: 'Open profile in browser' },
  share: { id: 'account.share', defaultMessage: 'Share profile' },
  favourites: { id: 'column.favourites', defaultMessage: 'Likes' },
  followRequests: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  mention: { id: 'account.mention', defaultMessage: 'Mention' },
  direct: { id: 'account.direct', defaultMessage: 'Direct message @{name}' },
  removeFromFollowers: {
    id: 'account.remove_from_followers',
    defaultMessage: 'Remove this follower',
  },
  removeFromFollowersHeading: {
    id: 'confirmations.remove_from_followers.heading',
    defaultMessage: 'Remove {name} from followers',
  },
  removeFromFollowersMessage: {
    id: 'confirmations.remove_from_followers.message',
    defaultMessage: 'Are you sure you want to remove {name} from your followers?',
  },
  removeFromFollowersConfirm: {
    id: 'confirmations.remove_from_followers.confirm',
    defaultMessage: 'Remove',
  },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  blockDomain: { id: 'account.block_domain', defaultMessage: 'Hide everything from {domain}' },
  blockDomainHeading: {
    id: 'confirmations.domain_block.heading',
    defaultMessage: 'Block {domain}',
  },
  blockDomainMessage: {
    id: 'confirmations.domain_block.message',
    defaultMessage:
      'Are you really, really sure you want to block the entire {domain}? In most cases a few targeted blocks or mutes are sufficient and preferable. You will not see content from that domain in any public timelines or your notifications.',
  },
  blockDomainConfirm: {
    id: 'confirmations.domain_block.confirm',
    defaultMessage: 'Hide entire domain',
  },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
  blocked: { id: 'column.blocks.long', defaultMessage: 'Blocked accounts' },
  muted: { id: 'column.mutes.long', defaultMessage: 'Muted accounts' },
  filters: { id: 'column.filters', defaultMessage: 'Muted words' },
  follow: { id: 'account.follow', defaultMessage: 'Follow' },
  requestFollow: { id: 'account.request_follow', defaultMessage: 'Request follow' },
  requested: { id: 'account.requested_small', defaultMessage: 'Follow requested' },
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  unfollowHeading: { id: 'confirmations.unfollow.heading', defaultMessage: 'Unfollow {name}' },
  unfollowMessage: {
    id: 'confirmations.unfollow.message',
    defaultMessage: 'Are you sure you want to unfollow {name}?',
  },
  unfollowMessageLocked: {
    id: 'confirmations.unfollow.message.locked',
    defaultMessage:
      'Are you sure you want to unfollow {name}? You will have to request to follow them again if you change your mind.',
  },
  unfollowConfirm: { id: 'confirmations.unfollow.confirm', defaultMessage: 'Unfollow' },
  showReblogs: { id: 'account.show_reblogs.short', defaultMessage: 'Show reposts' },
  subscribe: { id: 'account.subscribe.short', defaultMessage: 'Subscribe to notifications' },
  notifyReplies: { id: 'account.notify_replies.short', defaultMessage: 'Subscribe to replies' },
  notifyReblogs: { id: 'account.notify_reblogs.short', defaultMessage: 'Subscribe to reposts' },
});

interface IAccountActionsDropdown {
  account: Account;
  headerButton?: boolean;
}

const AccountActionsDropdown: React.FC<IAccountActionsDropdown> = ({ account, headerButton }) => {
  const features = useFeatures();
  const intl = useIntl();
  const { mentionCompose, directCompose } = useComposeActions();
  const navigation = useNavigation();
  const { openCompose } = useUiStoreActions();

  const [blockMuteDialog, setBlockMuteDialog] = React.useState<'block' | 'mute' | null>(null);
  const [reportDialog, setReportDialog] = React.useState(false);

  const { data: currentAccountId } = useCredentialAccountId();
  const { mutate: followAccount } = useFollowAccountMutation(account.id);
  const { mutate: unfollowAccount } = useUnfollowAccountMutation(account.id);
  const { mutate: unmuteAccount } = useUnmuteAccountMutation(account.id);
  const { mutate: unblockAccount } = useUnblockAccountMutation(account.id);
  const { mutate: blockDomain } = useBlockDomainMutation();
  const { mutate: unblockDomain } = useUnblockDomainMutation();
  const { mutate: removeFromFollowers } = useRemoveAccountFromFollowersMutation(account.id);

  const ownAccount = currentAccountId === account.id;
  const relationship = account.relationship;

  const handleCopy = () => Clipboard.setStringAsync(account.url);

  const handleOpenInBrowser = () => Linking.openURL(account.url);

  const handleShare = () => {
    shareAsync(account.url);
  };

  const handleUnfollow = () => {
    if (relationship?.requested) {
      unfollowAccount();
    } else {
      Alert.alert(
        intl.formatMessage(messages.unfollowHeading, { name: account.username }),
        intl.formatMessage(
          account.locked ? messages.unfollowMessageLocked : messages.unfollowMessage,
          { name: account.acct },
        ),
        [
          {
            text: intl.formatMessage(messages.cancel),
            style: 'cancel',
          },
          {
            text: intl.formatMessage(messages.unfollowConfirm),
            style: 'destructive',
            onPress: () => unfollowAccount(),
          },
        ],
      );
    }
  };

  const handleToggleShowReposts = () => followAccount({ reblogs: !relationship?.showing_reblogs });

  const handleToggleNotify = () => followAccount({ notify: !relationship?.notifying });

  const handleToggleNotifyReplies = () =>
    followAccount({
      notify: true,
      notify_replies: !relationship?.notifying_replies,
      notify_reblogs: relationship?.notifying_reblogs,
    });

  const handleToggleNotifyReblogs = () =>
    followAccount({
      notify: true,
      notify_replies: relationship?.notifying_replies,
      notify_reblogs: !relationship?.notifying_reblogs,
    });

  const handleMute = () => {
    if (account.relationship?.muting) unmuteAccount();
    else setBlockMuteDialog('mute');
  };

  const handleDirect = () => {
    directCompose(account);
    openCompose();
  };

  const handleMention = () => {
    mentionCompose(account);
    openCompose();
  };

  const handleRemoveFromFollowers = () => {
    Alert.alert(
      intl.formatMessage(messages.removeFromFollowersHeading, {
        name: account.acct,
      }),
      intl.formatMessage(messages.removeFromFollowersMessage, {
        name: account.acct,
      }),
      [
        {
          text: intl.formatMessage(messages.cancel),
          style: 'cancel',
        },
        {
          text: intl.formatMessage(messages.removeFromFollowersConfirm),
          style: 'destructive',
          onPress: () => removeFromFollowers(),
        },
      ],
    );
  };

  const handleBlock = () => {
    if (account.relationship?.blocking) unblockAccount();
    else setBlockMuteDialog('block');
  };

  const handleBlockDomain = () => {
    const domain = account.fqn.split('@')[1];

    if (account.relationship?.domain_blocking) unblockDomain(domain);
    else {
      Alert.alert(
        intl.formatMessage(messages.blockDomainHeading),
        intl.formatMessage(messages.blockDomainMessage),
        [
          {
            text: intl.formatMessage(messages.cancel),
            style: 'cancel',
          },
          {
            text: intl.formatMessage(messages.blockDomainConfirm),
            style: 'destructive',
            onPress: () => blockDomain(domain),
          },
        ],
      );
    }
  };

  const handleReport = () => {
    setReportDialog(true);
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {headerButton ? (
            <HeaderIconButton
              icon={Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon}
            />
          ) : (
            <IconButton
              mode='outlined'
              icon={iconHelper(Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon)}
              onPress={() => {}}
            />
          )}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {headerButton && (
            <DropdownMenu.Group>
              {ownAccount ? (
                <DropdownMenu.Item
                  key='edit-profile'
                  onSelect={() => navigation.navigate('edit_profile')}
                >
                  <DropdownMenu.ItemIcon
                    ios={{ name: 'pencil' }}
                    androidIconName='ph_pencil_simple'
                  />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(messages.editProfile)}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
              ) : relationship?.following || relationship?.requested ? (
                <>
                  <DropdownMenu.Item key='unfollow' onSelect={handleUnfollow} destructive>
                    <DropdownMenu.ItemIcon
                      ios={{ name: 'person.badge.minus' }}
                      androidIconName='ph_user_minus'
                    />
                    <DropdownMenu.ItemTitle>
                      {intl.formatMessage(
                        relationship.requested ? messages.requested : messages.unfollow,
                      )}
                    </DropdownMenu.ItemTitle>
                  </DropdownMenu.Item>
                  <DropdownMenu.CheckboxItem
                    key='show-reblogs'
                    value={relationship.showing_reblogs}
                    onSelect={handleToggleShowReposts}
                  >
                    <DropdownMenu.ItemTitle>
                      {intl.formatMessage(messages.showReblogs)}
                    </DropdownMenu.ItemTitle>
                  </DropdownMenu.CheckboxItem>
                  {features.accountNotifies && (
                    <DropdownMenu.CheckboxItem
                      key='notify'
                      value={relationship.notifying}
                      onSelect={handleToggleNotify}
                    >
                      <DropdownMenu.ItemTitle>
                        {intl.formatMessage(messages.subscribe)}
                      </DropdownMenu.ItemTitle>
                    </DropdownMenu.CheckboxItem>
                  )}
                  {features.accountNotifiesControl && (
                    <>
                      <DropdownMenu.CheckboxItem
                        key='notify-replies'
                        value={relationship.notifying_replies}
                        onSelect={handleToggleNotifyReplies}
                      >
                        <DropdownMenu.ItemTitle>
                          {intl.formatMessage(messages.notifyReplies)}
                        </DropdownMenu.ItemTitle>
                      </DropdownMenu.CheckboxItem>
                      <DropdownMenu.CheckboxItem
                        key='notify-reblogs'
                        value={relationship.notifying_reblogs}
                        onSelect={handleToggleNotifyReblogs}
                      >
                        <DropdownMenu.ItemTitle>
                          {intl.formatMessage(messages.notifyReblogs)}
                        </DropdownMenu.ItemTitle>
                      </DropdownMenu.CheckboxItem>
                    </>
                  )}
                </>
              ) : !relationship?.blocking ? (
                <DropdownMenu.Item
                  key='follow'
                  onSelect={() => followAccount(undefined)}
                  disabled={!relationship || relationship.blocked_by}
                >
                  <DropdownMenu.ItemIcon
                    ios={{ name: 'person.badge.plus' }}
                    androidIconName='ph_user_plus'
                  />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(account.locked ? messages.requestFollow : messages.follow)}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
              ) : null}
            </DropdownMenu.Group>
          )}
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
                <DropdownMenu.Item key='mention' onSelect={handleMention}>
                  <DropdownMenu.ItemIcon ios={{ name: 'at' }} androidIconName='ph_at' />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(messages.mention)}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                {features.privacyScopes && (
                  <DropdownMenu.Item key='direct' onSelect={handleDirect}>
                    <DropdownMenu.ItemIcon
                      ios={{ name: 'envelope' }}
                      androidIconName='ph_envelope_simple'
                    />
                    <DropdownMenu.ItemTitle>
                      {intl.formatMessage(messages.direct, { name: account.username })}
                    </DropdownMenu.ItemTitle>
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Group>
              <DropdownMenu.Separator />
              <DropdownMenu.Group>
                {features.removeFromFollowers && account.relationship?.followed_by && (
                  <DropdownMenu.Item
                    key='remove-from-followers'
                    onSelect={handleRemoveFromFollowers}
                  >
                    <DropdownMenu.ItemIcon
                      ios={{ name: 'person.badge.minus' }}
                      androidIconName='ph_user_minus'
                    />
                    <DropdownMenu.ItemTitle>
                      {intl.formatMessage(messages.removeFromFollowers)}
                    </DropdownMenu.ItemTitle>
                  </DropdownMenu.Item>
                )}
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
                {!account.local && (
                  <DropdownMenu.Item key='block-domain' onSelect={handleBlockDomain}>
                    <DropdownMenu.ItemIcon ios={{ name: 'nosign' }} androidIconName='ph_prohibit' />
                    <DropdownMenu.ItemTitle>
                      {intl.formatMessage(
                        account.relationship?.domain_blocking
                          ? messages.unblockDomain
                          : messages.blockDomain,
                        {
                          domain: account.fqn.split('@')[1],
                        },
                      )}
                    </DropdownMenu.ItemTitle>
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Item key='report' onSelect={handleReport}>
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
      {reportDialog && (
        <ReportDialog accountId={account.id} visible onDismiss={() => setReportDialog(false)} />
      )}
    </>
  );
};

export { AccountActionsDropdown };
