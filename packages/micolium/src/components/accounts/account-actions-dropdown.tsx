import { IconButton } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { shareAsync } from 'expo-sharing';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform } from 'react-native';

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
import { Alert } from '@/stores/alerts';
import { useComposeActions } from '@/stores/compose';
import { useUiStoreActions } from '@/stores/ui';
import { openUrl } from '@/utils/url';

import { DropdownMenu, type DropdownMenuItem } from '../ui/dropdown-menu';
import { HeaderIconButton } from '../ui/header-icon-button';
import { iconHelper } from '../ui/icon';

import { BlockMuteDialog } from './block-mute-dialog';
import { ReportDialog } from './report-dialog';

import type { Account } from 'pl-api';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  editProfile: { id: 'settings.edit_profile', defaultMessage: 'Edit profile' },
  copy: { id: 'account.copy.short', defaultMessage: 'Copy link' },
  openInBrowser: { id: 'account.open_in_browser.short', defaultMessage: 'Open in browser' },
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
  menuTitle: { id: 'dropdown_menu.title', defaultMessage: 'Menu' },
});

const useMenuItems = (
  account: Account,
  headerButton: boolean | undefined,
  openReportDialog: () => void,
  openBlockMuteDialog: (action: 'block' | 'mute') => void,
) => {
  const features = useFeatures();
  const intl = useIntl();
  const { mentionCompose, directCompose } = useComposeActions();
  const navigation = useNavigation();
  const { openCompose } = useUiStoreActions();

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

  const handleOpenInBrowser = () => openUrl(account.url);

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
    else openBlockMuteDialog('mute');
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
    else openBlockMuteDialog('block');
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
    openReportDialog();
  };

  const shareItems: Array<DropdownMenuItem> = [
    {
      key: 'copy',
      type: 'button',
      label: intl.formatMessage(messages.copy),
      appleIcon: 'link',
      androidIcon: 'ph_link_simple_horizontal',
      onPress: handleCopy,
    },
    {
      key: 'open-in-browser',
      type: 'button',
      label: intl.formatMessage(messages.openInBrowser),
      appleIcon: 'safari',
      androidIcon: 'ph_arrow_square_out',
      onPress: handleOpenInBrowser,
    },
    {
      key: 'share',
      type: 'button',
      label: intl.formatMessage(messages.share),
      appleIcon: 'square.and.arrow.up',
      androidIcon: 'ph_export',
      onPress: handleShare,
    },
  ];

  const relationshipItems: Array<DropdownMenuItem> = [];

  if (ownAccount) {
    relationshipItems.push({
      key: 'edit-profile',
      type: 'button',
      label: intl.formatMessage(messages.editProfile),
      appleIcon: 'pencil',
      androidIcon: 'ph_pencil_simple',
      onPress: () => navigation.navigate('settings', { screen: 'edit_profile' }),
    });
  } else if (relationship?.following || relationship?.requested) {
    relationshipItems.push(
      {
        key: 'unfollow',
        type: 'button',
        label: intl.formatMessage(relationship.requested ? messages.requested : messages.unfollow),
        appleIcon: 'person.badge.minus',
        androidIcon: 'ph_user_minus',
        destructive: true,
        onPress: handleUnfollow,
      },
      {
        key: 'show-reblogs',
        type: 'button',
        label: intl.formatMessage(messages.showReblogs),
        checked: relationship.showing_reblogs,
        onPress: handleToggleShowReposts,
      },
    );

    if (features.accountNotifies) {
      relationshipItems.push({
        key: 'notify',
        type: 'button',
        label: intl.formatMessage(messages.subscribe),
        checked: relationship.notifying,
        onPress: handleToggleNotify,
      });
    }

    if (features.accountNotifiesControl) {
      relationshipItems.push(
        {
          key: 'notify-replies',
          type: 'button',
          label: intl.formatMessage(messages.notifyReplies),
          checked: relationship.notifying_replies,
          onPress: handleToggleNotifyReplies,
        },
        {
          key: 'notify-reblogs',
          type: 'button',
          label: intl.formatMessage(messages.notifyReblogs),
          checked: relationship.notifying_reblogs,
          onPress: handleToggleNotifyReblogs,
        },
      );
    }
  } else if (!relationship?.blocking) {
    relationshipItems.push({
      key: 'follow',
      type: 'button',
      label: intl.formatMessage(account.locked ? messages.requestFollow : messages.follow),
      appleIcon: 'person.badge.plus',
      androidIcon: 'ph_user_plus',
      disabled: !relationship || relationship.blocked_by,
      onPress: () => followAccount(undefined),
    });
  }

  const navigationItems: Array<DropdownMenuItem> = [];

  if (ownAccount || (features.publicFavourites && !account.hide_favorites)) {
    navigationItems.push({
      key: 'favourites',
      type: 'button',
      label: intl.formatMessage(messages.favourites),
      appleIcon: 'star',
      androidIcon: 'ph_star',
      onPress: () =>
        navigation.navigate('accounts', { screen: 'favourites', params: { id: account.id } }),
    });
  }

  if (ownAccount) {
    navigationItems.push(
      {
        key: 'follow-requests',
        type: 'button',
        label: intl.formatMessage(messages.followRequests),
        appleIcon: 'person.badge.plus',
        androidIcon: 'ph_user_plus',
        onPress: () => navigation.navigate('settings', { screen: 'follow_requests' }),
      },
      {
        key: 'blocks',
        type: 'button',
        label: intl.formatMessage(messages.blocked),
        appleIcon: 'nosign',
        androidIcon: 'ph_prohibit',
        onPress: () => navigation.navigate('settings', { screen: 'blocks' }),
      },
      {
        key: 'mutes',
        type: 'button',
        label: intl.formatMessage(messages.muted),
        appleIcon: 'speaker.slash',
        androidIcon: 'ph_speaker_simple_x',
        onPress: () => navigation.navigate('settings', { screen: 'mutes' }),
      },
      {
        key: 'filters',
        type: 'button',
        label: intl.formatMessage(messages.filters),
        appleIcon: 'line.3.horizontal.decrease.circle',
        androidIcon: 'ph_funnel',
        onPress: () => navigation.navigate('settings', { screen: 'filters' }),
      },
    );
  }

  const items: Array<DropdownMenuItem> = [
    { key: 'share', type: 'section', children: shareItems, controlGroup: true },
  ];

  if (headerButton && relationshipItems.length) {
    items.push({ key: 'relationship', type: 'section', children: relationshipItems });
  }

  if (navigationItems.length) {
    items.push({ key: 'navigation', type: 'section', children: navigationItems });
  }

  if (!ownAccount) {
    const composeItems: Array<DropdownMenuItem> = [
      {
        key: 'mention',
        type: 'button',
        label: intl.formatMessage(messages.mention),
        appleIcon: 'at',
        androidIcon: 'ph_at',
        onPress: handleMention,
      },
    ];

    if (features.privacyScopes) {
      composeItems.push({
        key: 'direct',
        type: 'button',
        label: intl.formatMessage(messages.direct, { name: account.username }),
        appleIcon: 'envelope',
        androidIcon: 'ph_envelope_simple',
        onPress: handleDirect,
      });
    }

    const moderationItems: Array<DropdownMenuItem> = [];

    if (features.removeFromFollowers && account.relationship?.followed_by) {
      moderationItems.push({
        key: 'remove-from-followers',
        type: 'button',
        label: intl.formatMessage(messages.removeFromFollowers),
        appleIcon: 'person.badge.minus',
        androidIcon: 'ph_user_minus',
        onPress: handleRemoveFromFollowers,
      });
    }

    moderationItems.push(
      {
        key: 'mute',
        type: 'button',
        label: intl.formatMessage(account.relationship?.muting ? messages.unmute : messages.mute, {
          name: account.username,
        }),
        appleIcon: 'speaker.slash',
        androidIcon: 'ph_speaker_simple_x',
        onPress: handleMute,
      },
      {
        key: 'block',
        type: 'button',
        label: intl.formatMessage(
          account.relationship?.blocking ? messages.unblock : messages.block,
          { name: account.username },
        ),
        appleIcon: 'nosign',
        androidIcon: 'ph_prohibit',
        onPress: handleBlock,
      },
    );

    if (!account.local) {
      moderationItems.push({
        key: 'block-domain',
        type: 'button',
        label: intl.formatMessage(
          account.relationship?.domain_blocking ? messages.unblockDomain : messages.blockDomain,
          { domain: account.fqn.split('@')[1] },
        ),
        appleIcon: 'nosign',
        androidIcon: 'ph_prohibit',
        onPress: handleBlockDomain,
      });
    }

    moderationItems.push({
      key: 'report',
      type: 'button',
      label: intl.formatMessage(messages.report, { name: account.username }),
      appleIcon: 'flag',
      androidIcon: 'ph_flag',
      onPress: handleReport,
    });

    items.push(
      { key: 'compose', type: 'section', children: composeItems },
      { key: 'moderation', type: 'section', children: moderationItems },
    );
  }

  return items;
};

interface IAccountActionsDropdown {
  account: Account;
  headerButton?: boolean;
}

const AccountActionsDropdown: React.FC<IAccountActionsDropdown> = ({ account, headerButton }) => {
  const intl = useIntl();

  const [blockMuteDialog, setBlockMuteDialog] = React.useState<'block' | 'mute' | null>(null);
  const [reportDialog, setReportDialog] = React.useState(false);

  return (
    <>
      <DropdownMenu
        trigger={
          headerButton ? (
            <HeaderIconButton
              icon={Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon}
              accessibilityLabel={intl.formatMessage(messages.menuTitle)}
            />
          ) : (
            <IconButton
              mode='outlined'
              icon={iconHelper(Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon)}
              onPress={() => {}}
              accessibilityLabel={intl.formatMessage(messages.menuTitle)}
            />
          )
        }
        useItems={useMenuItems}
        hookArgs={[
          account,
          headerButton,
          () => setReportDialog(true),
          (action) => setBlockMuteDialog(action),
        ]}
      />
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
