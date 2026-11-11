import { IconButton } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { shareAsync } from 'expo-sharing';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform } from 'react-native';

import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useReblog } from '@/hooks/use-reblog';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import {
  useUnblockAccountMutation,
  useUnmuteAccountMutation,
} from '@/queries/accounts/use-relationship';
import { editStatus } from '@/queries/statuses/status-actions';
import { useBookmarkFolders } from '@/queries/statuses/use-bookmark-folders';
import { useDeleteStatus, type SelectedStatus } from '@/queries/statuses/use-status';
import {
  useBookmarkStatus,
  useMuteStatus,
  usePinStatus,
  useUnbookmarkStatus,
  useUnmuteStatus,
  useUnpinStatus,
} from '@/queries/statuses/use-status-interactions';
import { Alert } from '@/stores/alerts';
import { useAuthStore } from '@/stores/auth';
import { useSetting } from '@/stores/settings';
import { useUiStoreActions } from '@/stores/ui';
import { haptics } from '@/utils/haptics';
import { toast } from '@/utils/toast';
import { openUrl } from '@/utils/url';

import { BlockMuteDialog } from '../accounts/block-mute-dialog';
import { ReportDialog } from '../accounts/report-dialog';
import { DropdownMenu, type DropdownMenuItem } from '../ui/dropdown-menu';
import { iconHelper } from '../ui/icon';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  copy: { id: 'status.copy.short', defaultMessage: 'Copy link' },
  openInBrowser: { id: 'status.open_in_browser.short', defaultMessage: 'Open in browser' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  interactAs: { id: 'status.interact_as', defaultMessage: 'Interact from other accounts' },
  interactAsConfirmationHeading: {
    id: 'interact_as_modal.title',
    defaultMessage: 'Interact from other accounts',
  },
  interactAsConfirmationMessage: {
    id: 'interact_as_modal.confirmation_message',
    defaultMessage:
      'This option will ask the remote server to fetch the post on behalf of the other accounts you’re signed in with. That may reveal which accounts you use to the server that hosts the post, so only continue if you are comfortable with that risk. Are you sure you want to proceed?',
  },
  interactAsConfirmationConfirm: {
    id: 'interact_as_modal.confirmation.confirm',
    defaultMessage: 'Confirm',
  },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark' },
  unbookmark: { id: 'status.unbookmark', defaultMessage: 'Remove bookmark' },
  bookmarkSetFolder: { id: 'status.bookmark_folder', defaultMessage: 'Set bookmark folder' },
  bookmarkChangeFolder: {
    id: 'status.bookmark_folder_change',
    defaultMessage: 'Change bookmark folder',
  },
  noBookmarkFolders: {
    id: 'bookmark_folders.empty',
    defaultMessage: 'You have no bookmark folders yet.',
  },
  loading: { id: 'loading_indicator.label', defaultMessage: 'Loading…' },
  reblogPrivate: { id: 'status.reblog_private', defaultMessage: 'Repost to original audience' },
  reblogVisibility: {
    id: 'status.reblog_visibility',
    defaultMessage: 'Repost to specific audience',
  },
  reblogVisibilityPublic: {
    id: 'status.reblog_visibility_public',
    defaultMessage: 'Public repost',
  },
  reblogVisibilityUnlisted: {
    id: 'status.reblog_visibility_unlisted',
    defaultMessage: 'Quiet public repost',
  },
  reblogVisibilityPrivate: {
    id: 'status.reblog_visibility_private',
    defaultMessage: 'Followers-only repost',
  },
  bite: { id: 'status.bite', defaultMessage: 'Bite post' },
  biteSuccess: { id: 'status.bite.success', defaultMessage: 'Post bitten' },
  biteFail: { id: 'status.bite.fail', defaultMessage: 'Failed to bite post' },
  biteFailNotAllowed: {
    id: 'account.bite.fail.not_allowed',
    defaultMessage: '@{acct} does not accept bites',
  },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  pin: { id: 'status.pin', defaultMessage: 'Pin on profile' },
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteError: { id: 'status.delete.error', defaultMessage: 'Failed to delete post' },
  deleteHeading: { id: 'confirmations.delete.heading', defaultMessage: 'Delete post' },
  deleteMessage: {
    id: 'confirmations.delete.message',
    defaultMessage: 'Are you sure you want to delete this post?',
  },
  deleteStatus: { id: 'admin.statuses.actions.delete_status', defaultMessage: 'Delete post' },
  deleteSuccess: { id: 'status.delete.success', defaultMessage: 'Post deleted' },
  edit: { id: 'status.edit', defaultMessage: 'Edit' },
  unmuteConversation: { id: 'status.unmute_conversation', defaultMessage: 'Unmute conversation' },
  muteConversation: { id: 'status.mute_conversation', defaultMessage: 'Mute conversation' },
  report: { id: 'status.report', defaultMessage: 'Report post' },
  accountActions: { id: 'status.account_actions', defaultMessage: 'Account actions' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  reportAccount: { id: 'account.report', defaultMessage: 'Report @{name}' },
  menuTitle: { id: 'dropdown_menu.title', defaultMessage: 'Menu' },
});

const useMenuItems = (
  status: SelectedStatus,
  detailed: boolean | undefined,
  openReportDialog: () => void,
  openBlockMuteDialog: (action: 'block' | 'mute') => void,
) => {
  const client = useClient();
  const features = useFeatures();
  const intl = useIntl();
  const scopeUrl = useScopeUrl();
  const navigation = useNavigation();

  const hasOtherAccounts = useAuthStore((state) => Object.keys(state.sessions).length > 1);
  const { openInteractAs } = useUiStoreActions();
  const doReblog = useReblog(status);

  const { data: bookmarkFolders } = useBookmarkFolders();
  const { data: currentAccountId } = useCredentialAccountId();
  const { mutate: unmuteAccount } = useUnmuteAccountMutation(status.account.id);
  const { mutate: unblockAccount } = useUnblockAccountMutation(status.account.id);

  const skipInteractAsConfirmation = useSetting('timelines.skipInteractAsConfirmation');

  const { mutate: bookmark } = useBookmarkStatus(status.id);
  const { mutate: unbookmark } = useUnbookmarkStatus(status.id);
  const { mutate: deleteStatus } = useDeleteStatus(status.id);
  const { mutate: pin } = usePinStatus(status.id);
  const { mutate: unpin } = useUnpinStatus(status.id);
  const { mutate: muteStatus } = useMuteStatus(status.id);
  const { mutate: unmuteStatus } = useUnmuteStatus(status.id);

  const publicStatus = ['public', 'unlisted', 'group'].includes(status.visibility);
  const ownStatus = status.account_id === currentAccountId;

  const handleCopy = () => Clipboard.setStringAsync(status.uri);

  const handleOpenInBrowser = () => openUrl(status.uri);

  const handleOpenInteractAs = () => {
    if (skipInteractAsConfirmation) {
      openInteractAs(status.id, scopeUrl);
    } else {
      Alert.alert(
        intl.formatMessage(messages.interactAsConfirmationHeading),
        intl.formatMessage(messages.interactAsConfirmationMessage),
        [
          {
            text: intl.formatMessage(messages.cancel),
            style: 'cancel',
          },
          {
            text: intl.formatMessage(messages.interactAsConfirmationConfirm),
            onPress: () => openInteractAs(status.id, scopeUrl),
          },
        ],
      );
    }
  };

  const handleShare = () => {
    shareAsync(status.uri);
  };

  const handleBookmark = (folderId?: string | null) => {
    if (folderId !== undefined || !status.bookmarked) {
      bookmark(folderId === status.bookmark_folder ? undefined : folderId || undefined, {
        onSuccess: () => haptics.toggleOn(),
      });
    } else {
      unbookmark(undefined, {
        onSuccess: () => haptics.toggleOff(),
      });
    }
  };

  const handleReblog = (visibility?: string) => {
    return doReblog(visibility, () => {
      haptics.toggleOn();
    });
  };

  const handleBiteStatus = () => {
    client.statuses
      .biteStatus(status.id)
      .then(() => {
        haptics.toggleOn();
        toast.success(intl.formatMessage(messages.biteSuccess));
      })
      .catch((error) => {
        if (error.response?.json?.message === 'This user does not accept bites') {
          toast.error(
            intl.formatMessage(messages.biteFailNotAllowed, { acct: status.account.acct }),
          );
        } else {
          toast.error(intl.formatMessage(messages.biteFail));
        }
      });
  };

  const handlePin = () => {
    if (status.pinned)
      unpin(undefined, {
        onSuccess: () => haptics.toggleOff(),
      });
    else
      pin(undefined, {
        onSuccess: () => haptics.toggleOn(),
      });
  };

  const handleDelete = () => {
    Alert.alert(
      intl.formatMessage(messages.deleteHeading),
      intl.formatMessage(messages.deleteMessage),
      [
        {
          text: intl.formatMessage(messages.cancel),
          style: 'cancel',
        },
        {
          text: intl.formatMessage(messages.deleteConfirm),
          style: 'destructive',
          onPress: () =>
            deleteStatus(undefined, {
              onSuccess: () => {
                if (detailed) {
                  navigation.goBack();
                }
              },
            }),
        },
      ],
    );
  };

  const handleEdit = () => {
    editStatus(client, status.id, scopeUrl, features);
  };

  const handleMuteConversation = () => {
    if (status.muted) unmuteStatus();
    else muteStatus();
  };

  const handleReport = () => {
    openReportDialog();
  };

  const handleMute = () => {
    if (status.account.relationship?.muting) unmuteAccount();
    else openBlockMuteDialog('mute');
  };

  const handleBlock = () => {
    if (status.account.relationship?.blocking) unblockAccount();
    else openBlockMuteDialog('block');
  };

  const getBookmarkFolderItems = (): Array<DropdownMenuItem> => {
    if (!bookmarkFolders) {
      return [
        {
          key: 'bookmarks-loading',
          type: 'button',
          label: intl.formatMessage(messages.loading),
          disabled: true,
          onPress: () => {},
        },
      ];
    }

    if (!bookmarkFolders.length) {
      return [
        {
          key: 'bookmarks-empty',
          type: 'button',
          label: intl.formatMessage(messages.noBookmarkFolders),
          disabled: true,
          onPress: () => {},
        },
      ];
    }

    return bookmarkFolders.map((folder) => ({
      key: `bookmarks:${folder.id}`,
      type: 'button',
      label: folder.name,
      appleIcon: 'folder',
      androidIcon: 'ph_folder_simple',
      checked: status.bookmark_folder === folder.id,
      onPress: () => handleBookmark(folder.id),
    }));
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

  const interactionItems: Array<DropdownMenuItem> = [];

  if (hasOtherAccounts) {
    interactionItems.push({
      key: 'interact-as',
      type: 'button',
      label: intl.formatMessage(messages.interactAs),
      appleIcon: 'person.3',
      androidIcon: 'ph_users_three',
      onPress: handleOpenInteractAs,
    });
  }

  if (features.bookmarks) {
    interactionItems.push({
      key: 'bookmark',
      type: 'button',
      label: intl.formatMessage(status.bookmarked ? messages.unbookmark : messages.bookmark),
      appleIcon: status.bookmarked ? 'bookmark.slash' : 'bookmark',
      androidIcon: status.bookmarked ? 'ph_bookmark' : 'ph_bookmark_simple',
      onPress: () => handleBookmark(),
    });
  }

  if (status.bookmarked && features.bookmarkFolders) {
    interactionItems.push({
      key: 'bookmark-folder',
      type: 'menu',
      label: intl.formatMessage(
        status.bookmark_folder ? messages.bookmarkChangeFolder : messages.bookmarkSetFolder,
      ),
      appleIcon: 'folder',
      androidIcon: 'ph_folders',
      children: getBookmarkFolderItems(),
    });
  }

  if (!status.reblogged && publicStatus && features.reblogVisibility) {
    interactionItems.push({
      key: 'reblog',
      type: 'menu',
      label: intl.formatMessage(messages.reblogVisibility),
      appleIcon: 'repeat',
      androidIcon: 'ph_repeat',
      children: [
        {
          key: 'reblog-public',
          type: 'button',
          label: intl.formatMessage(messages.reblogVisibilityPublic),
          appleIcon: 'globe',
          androidIcon: 'ph_globe_simple',
          onPress: () => handleReblog('public'),
        },
        {
          key: 'reblog-unlisted',
          type: 'button',
          label: intl.formatMessage(messages.reblogVisibilityUnlisted),
          appleIcon: 'moon',
          androidIcon: 'ph_moon',
          onPress: () => handleReblog('unlisted'),
        },
        {
          key: 'reblog-private',
          type: 'button',
          label: intl.formatMessage(messages.reblogVisibilityPrivate),
          appleIcon: 'lock',
          androidIcon: 'ph_lock',
          onPress: () => handleReblog('private'),
        },
      ],
    });
  } else if (
    ownStatus &&
    (status.visibility === 'private' || status.visibility === 'mutuals_only')
  ) {
    interactionItems.push({
      key: 'reblog-private',
      type: 'button',
      label: intl.formatMessage(messages.reblogPrivate),
      appleIcon: 'repeat',
      androidIcon: 'ph_repeat',
      onPress: () => handleReblog('private'),
    });
  }

  if (!ownStatus && features.biteStatuses) {
    interactionItems.push({
      key: 'bite-status',
      type: 'button',
      label: intl.formatMessage(messages.bite),
      appleIcon: 'cat',
      androidIcon: 'ph_tooth',
      onPress: handleBiteStatus,
    });
  }

  const statusItems: Array<DropdownMenuItem> = ownStatus
    ? [
        {
          key: 'pin',
          type: 'button',
          label: intl.formatMessage(status.pinned ? messages.unpin : messages.pin),
          appleIcon: status.pinned ? 'pin.slash' : 'pin',
          androidIcon: status.pinned ? 'ph_push_pin_slash' : 'ph_push_pin',
          onPress: handlePin,
        },
        {
          key: 'delete',
          type: 'button',
          label: intl.formatMessage(messages.delete),
          appleIcon: 'trash',
          androidIcon: 'ph_trash',
          destructive: true,
          onPress: handleDelete,
        },
        {
          key: 'edit',
          type: 'button',
          label: intl.formatMessage(messages.edit),
          appleIcon: 'pencil',
          androidIcon: 'ph_pencil_simple',
          onPress: handleEdit,
        },
      ]
    : [
        {
          key: 'mute-conversation',
          type: 'button',
          label: intl.formatMessage(
            status.muted ? messages.unmuteConversation : messages.muteConversation,
          ),
          appleIcon: status.muted ? 'bell' : 'bell.slash',
          androidIcon: status.muted ? 'ph_bell_simple' : 'ph_bell_simple_slash',
          onPress: handleMuteConversation,
        },
        {
          key: 'report',
          type: 'button',
          label: intl.formatMessage(messages.report),
          appleIcon: 'flag',
          androidIcon: 'ph_flag',
          onPress: handleReport,
        },
        {
          key: 'account-actions',
          type: 'menu',
          label: intl.formatMessage(messages.accountActions),
          appleIcon: 'person',
          androidIcon: 'ph_user',
          children: [
            {
              key: 'mute',
              type: 'button',
              label: intl.formatMessage(
                status.account.relationship?.muting ? messages.unmute : messages.mute,
                { name: status.account.username },
              ),
              appleIcon: 'speaker.slash',
              androidIcon: 'ph_speaker_simple_x',
              onPress: handleMute,
            },
            {
              key: 'block',
              type: 'button',
              label: intl.formatMessage(
                status.account.relationship?.blocking ? messages.unblock : messages.block,
                { name: status.account.username },
              ),
              appleIcon: 'nosign',
              androidIcon: 'ph_prohibit',
              onPress: handleBlock,
            },
            {
              key: 'report-account',
              type: 'button',
              label: intl.formatMessage(messages.reportAccount, {
                name: status.account.username,
              }),
              appleIcon: 'flag',
              androidIcon: 'ph_flag',
              onPress: handleReport,
            },
          ],
        },
      ];

  const items: Array<DropdownMenuItem> = [
    { key: 'share', type: 'section', children: shareItems, controlGroup: true },
  ];

  if (interactionItems.length) {
    items.push({ key: 'interactions', type: 'section', children: interactionItems });
  }

  items.push({ key: 'status', type: 'section', children: statusItems });

  return items;
};

interface IStatusActionsDropdown {
  status: SelectedStatus;
  detailed?: boolean;
}

const StatusActionsDropdown: React.FC<IStatusActionsDropdown> = ({ status, detailed }) => {
  const intl = useIntl();

  const [blockMuteDialog, setBlockMuteDialog] = React.useState<'block' | 'mute' | null>(null);
  const [reportDialog, setReportDialog] = React.useState(false);

  return (
    <>
      <DropdownMenu
        trigger={
          <IconButton
            icon={iconHelper(Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon)}
            style={{ height: 32, width: 32 }}
            onPress={() => {}}
            accessibilityLabel={intl.formatMessage(messages.menuTitle)}
          />
        }
        useItems={useMenuItems}
        hookArgs={[
          status,
          detailed,
          () => setReportDialog(true),
          (action) => setBlockMuteDialog(action),
        ]}
      />
      {blockMuteDialog && (
        <BlockMuteDialog
          action={blockMuteDialog}
          accountId={status.account_id}
          visible
          onDismiss={() => setBlockMuteDialog(null)}
        />
      )}
      {reportDialog && (
        <ReportDialog
          accountId={status.account_id}
          statusId={status.id}
          visible
          onDismiss={() => setReportDialog(false)}
        />
      )}
    </>
  );
};

export { StatusActionsDropdown };
