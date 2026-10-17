import { IconButton } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { shareAsync } from 'expo-sharing';
import { DotsThreeIcon, DotsThreeVerticalIcon } from 'phosphor-react-native';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Alert, Linking, Platform } from 'react-native';
import { toast } from 'sonner-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import { editStatus } from '@/queries/statuses/status-actions';
import { useBookmarkFolders } from '@/queries/statuses/use-bookmark-folders';
import { useDeleteStatus, type SelectedStatus } from '@/queries/statuses/use-status';
import {
  useBookmarkStatus,
  useMuteStatus,
  usePinStatus,
  useReblogStatus,
  useUnbookmarkStatus,
  useUnmuteStatus,
  useUnpinStatus,
} from '@/queries/statuses/use-status-interactions';
import { useAuthStore } from '@/stores/auth';
import { useSetting } from '@/stores/settings';
import { useUiStoreActions } from '@/stores/ui';

import { iconHelper } from '../ui/icon';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  copy: { id: 'status.copy', defaultMessage: 'Copy link to post' },
  open: { id: 'status.open', defaultMessage: 'Show post details' },
  openInBrowser: { id: 'status.open_in_browser', defaultMessage: 'Open post in browser' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  interactAs: { id: 'status.interact_as', defaultMessage: 'Interact from other accounts' },
  interactAsConfirmationHeading: {
    id: 'interact_as_modal.title',
    defaultMessage: 'Interact from accounts',
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
});

interface IStatusActionsDropdown {
  status: SelectedStatus;
  detailed?: boolean;
}

const StatusActionsDropdown: React.FC<IStatusActionsDropdown> = ({ status, detailed }) => {
  const client = useClient();
  const features = useFeatures();
  const intl = useIntl();
  const navigation = useNavigation();
  const scopeUrl = useScopeUrl();

  const hasOtherAccounts = useAuthStore((state) => Object.keys(state.sessions).length > 1);
  const { openInteractAs } = useUiStoreActions();

  const { data: bookmarkFolders } = useBookmarkFolders();
  const { data: currentAccountId } = useCredentialAccountId();

  const skipInteractAsConfirmation = useSetting('timelines.skipInteractAsConfirmation');

  const { mutate: bookmark } = useBookmarkStatus(status.id);
  const { mutate: unbookmark } = useUnbookmarkStatus(status.id);
  const { mutate: reblog } = useReblogStatus(status.id);
  const { mutate: deleteStatus } = useDeleteStatus(status.id);
  const { mutate: pin } = usePinStatus(status.id);
  const { mutate: unpin } = useUnpinStatus(status.id);
  const { mutate: muteStatus } = useMuteStatus(status.id);
  const { mutate: unmuteStatus } = useUnmuteStatus(status.id);

  const publicStatus = ['public', 'unlisted', 'group'].includes(status.visibility);
  const ownStatus = status.account_id === currentAccountId;

  const handleExpand = () =>
    navigation.navigate('status', {
      screen: 'view',
      params: { id: status.id },
    });

  const handleCopy = () => Clipboard.setStringAsync(status.uri);

  const handleOpenInBrowser = () => Linking.openURL(status.uri);

  const handleOpenInteractAs = () => {
    if (skipInteractAsConfirmation) openInteractAs(status.id, scopeUrl);
    else {
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
      bookmark(folderId === status.bookmark_folder ? undefined : folderId || undefined);
    } else {
      unbookmark();
    }
  };

  const handleReblog = (visibility?: string) => {
    reblog({ visibility });
  };

  const handleBiteStatus = () => {
    client.statuses
      .biteStatus(status.id)
      .then(() => {
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
    if (status.pinned) unpin();
    else pin();
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
          onPress: () => deleteStatus(),
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
    Alert.alert('not implemented');
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          icon={iconHelper(Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon)}
          style={{ height: 32, width: 32 }}
          onPress={() => {}}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          {!detailed && (
            <DropdownMenu.Item key='expand' onSelect={handleExpand}>
              <DropdownMenu.ItemIcon
                ios={{ name: 'arrow.up.and.line.horizontal.and.arrow.down' }}
                androidIconName='ph_arrows_vertical'
              />
              <DropdownMenu.ItemTitle>{intl.formatMessage(messages.open)}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item key='copy' onSelect={handleCopy}>
            <DropdownMenu.ItemIcon
              ios={{ name: 'link' }}
              androidIconName='ph_link_simple_horizontal'
            />
            <DropdownMenu.ItemTitle>{intl.formatMessage(messages.copy)}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key='open-in-browser' onSelect={handleOpenInBrowser}>
            <DropdownMenu.ItemIcon ios={{ name: 'safari' }} androidIconName='ph_arrow_square_out' />
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
        <DropdownMenu.Group>
          {hasOtherAccounts && (
            <DropdownMenu.Item key='interact-as' onSelect={handleOpenInteractAs}>
              <DropdownMenu.ItemIcon ios={{ name: 'person.3' }} androidIconName='ph_users_three' />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(messages.interactAs)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          )}
          {features.bookmarks && (
            <DropdownMenu.Item key='bookmark' onSelect={handleBookmark}>
              <DropdownMenu.ItemIcon
                ios={{ name: status.bookmarked ? 'bookmark.slash' : 'bookmark' }}
                androidIconName={status.bookmarked ? 'ph_bookmark' : 'ph_bookmark_simple'}
              />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(status.bookmarked ? messages.unbookmark : messages.bookmark)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          )}
          {status.bookmarked && features.bookmarkFolders && (
            <DropdownMenu.Sub key='bookmark-folder'>
              <DropdownMenu.SubTrigger key='bookmark-folder-sub'>
                <DropdownMenu.ItemIcon ios={{ name: 'folder' }} androidIconName={'ph_folders'} />
                <DropdownMenu.ItemTitle>
                  {intl.formatMessage(
                    status.bookmark_folder
                      ? messages.bookmarkChangeFolder
                      : messages.bookmarkSetFolder,
                  )}
                </DropdownMenu.ItemTitle>
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                {bookmarkFolders ? (
                  bookmarkFolders.length ? (
                    bookmarkFolders.map((folder) => (
                      <DropdownMenu.CheckboxItem
                        key={`bookmarks:${folder.id}`}
                        onSelect={() => handleBookmark(folder.id)}
                        value={status.bookmark_folder === folder.id}
                      >
                        <DropdownMenu.ItemIcon
                          ios={{ name: 'folder' }}
                          androidIconName='ph_folder_simple'
                        />
                        <DropdownMenu.ItemTitle>{folder.name}</DropdownMenu.ItemTitle>
                      </DropdownMenu.CheckboxItem>
                    ))
                  ) : (
                    <DropdownMenu.Item key='bookmarks-empty' disabled>
                      <DropdownMenu.ItemTitle>
                        {intl.formatMessage(messages.noBookmarkFolders)}
                      </DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                  )
                ) : (
                  <DropdownMenu.Item key='bookmarks-loading' disabled>
                    <DropdownMenu.ItemTitle>
                      {intl.formatMessage(messages.loading)}
                    </DropdownMenu.ItemTitle>
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          )}
          {!status.reblogged && publicStatus && features.reblogVisibility ? (
            <DropdownMenu.Sub key='reblog'>
              <DropdownMenu.SubTrigger key='reblog-sub'>
                <DropdownMenu.ItemIcon ios={{ name: 'repeat' }} androidIconName={'ph_repeat'} />
                <DropdownMenu.ItemTitle>
                  {intl.formatMessage(messages.reblogVisibility)}
                </DropdownMenu.ItemTitle>
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item key='reblog-public' onSelect={() => handleReblog('public')}>
                  <DropdownMenu.ItemIcon
                    ios={{ name: 'globe' }}
                    androidIconName='ph_globe_simple'
                  />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(messages.reblogVisibilityPublic)}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                <DropdownMenu.Item key='reblog-unlisted' onSelect={() => handleReblog('unlisted')}>
                  <DropdownMenu.ItemIcon ios={{ name: 'moon' }} androidIconName='ph_moon' />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(messages.reblogVisibilityUnlisted)}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                <DropdownMenu.Item key='reblog-private' onSelect={() => handleReblog('private')}>
                  <DropdownMenu.ItemIcon ios={{ name: 'lock' }} androidIconName='ph_lock' />
                  <DropdownMenu.ItemTitle>
                    {intl.formatMessage(messages.reblogVisibilityPrivate)}
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          ) : (
            ownStatus &&
            (status.visibility === 'private' || status.visibility === 'mutuals_only') && (
              <DropdownMenu.Item key='reblog-private' onSelect={() => handleReblog('private')}>
                <DropdownMenu.ItemIcon ios={{ name: 'repeat' }} androidIconName='ph_repeat' />
                <DropdownMenu.ItemTitle>
                  {intl.formatMessage(messages.reblogPrivate)}
                </DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            )
          )}
          {!ownStatus && features.biteStatuses && (
            <DropdownMenu.Item key='bite-status' onSelect={handleBiteStatus}>
              <DropdownMenu.ItemIcon ios={{ name: 'cat' }} androidIconName='ph_tooth' />
              <DropdownMenu.ItemTitle>{intl.formatMessage(messages.bite)}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Group>
        {ownStatus ? (
          <DropdownMenu.Group>
            <DropdownMenu.Item key='pin' onSelect={() => handlePin()}>
              <DropdownMenu.ItemIcon
                ios={{ name: status.pinned ? 'pin.slash' : 'pin' }}
                androidIconName={status.pinned ? 'ph_push_pin_slash' : 'ph_push_pin'}
              />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(status.pinned ? messages.unpin : messages.pin)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            <DropdownMenu.Item key='delete' onSelect={() => handleDelete()} destructive>
              <DropdownMenu.ItemIcon ios={{ name: 'trash' }} androidIconName={'ph_trash'} />
              <DropdownMenu.ItemTitle>{intl.formatMessage(messages.delete)}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            <DropdownMenu.Item key='edit' onSelect={() => handleEdit()}>
              <DropdownMenu.ItemIcon
                ios={{ name: 'pencil' }}
                androidIconName={'ph_pencil_simple'}
              />
              <DropdownMenu.ItemTitle>{intl.formatMessage(messages.edit)}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        ) : (
          <DropdownMenu.Group>
            <DropdownMenu.Item key='mute-conversation' onSelect={() => handleMuteConversation()}>
              <DropdownMenu.ItemIcon
                ios={{ name: status.pinned ? 'bell' : 'bell.slash' }}
                androidIconName={status.pinned ? 'ph_bell_simple' : 'ph_bell_simple_slash'}
              />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(
                  status.muted ? messages.unmuteConversation : messages.muteConversation,
                )}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            <DropdownMenu.Item key='report' onSelect={() => handleReport()}>
              <DropdownMenu.ItemIcon ios={{ name: 'flag' }} androidIconName={'ph_flag'} />
              <DropdownMenu.ItemTitle>{intl.formatMessage(messages.report)}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export { StatusActionsDropdown };
