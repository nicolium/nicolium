import { IconButton } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { shareAsync } from 'expo-sharing';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform } from 'react-native';

import { useAccount } from '@/queries/accounts/use-account';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import { useDeleteCollection } from '@/queries/accounts/use-collections';
import {
  useUnblockAccountMutation,
  useUnmuteAccountMutation,
} from '@/queries/accounts/use-relationship';
import { Alert } from '@/stores/alerts';
import { toast } from '@/utils/toast';
import { openUrl } from '@/utils/url';

import { BlockMuteDialog } from '../accounts/block-mute-dialog';
import { ReportDialog } from '../accounts/report-dialog';
import { DropdownMenu, type DropdownMenuItem } from '../ui/dropdown-menu';
import { iconHelper } from '../ui/icon';

import { CreateCollectionDialog } from './create-collection-dialog';
import { useRevokeCollection } from './use-revoke-collection';

import type { Collection } from 'pl-api';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  copy: { id: 'account.copy.short', defaultMessage: 'Copy link' },
  openInBrowser: { id: 'account.open_in_browser.short', defaultMessage: 'Open in browser' },
  share: { id: 'collections.share', defaultMessage: 'Share' },
  menuTitle: { id: 'dropdown_menu.title', defaultMessage: 'Menu' },
  editDetails: { id: 'collections.edit', defaultMessage: 'Edit collection' },
  delete: { id: 'collections.delete_collection', defaultMessage: 'Delete collection' },
  deleteHeading: {
    id: 'confirmations.delete_collection.heading',
    defaultMessage: 'Delete “{name}”?',
  },
  deleteMessage: {
    id: 'confirmations.delete_collection.message',
    defaultMessage: 'This will permanently delete the collection. This action cannot be undone.',
  },
  deleteConfirm: { id: 'confirmations.delete_collection.confirm', defaultMessage: 'Delete' },
  deleteSuccess: { id: 'collections.delete.success', defaultMessage: 'Collection deleted' },
  deleteError: { id: 'collections.delete.error', defaultMessage: 'Failed to delete collection' },
  revoke: {
    id: 'collections.revoke_collection_inclusion',
    defaultMessage: 'Remove myself from this collection',
  },
  report: { id: 'collections.report_collection', defaultMessage: 'Report this collection' },
  accountActions: { id: 'status.account_actions', defaultMessage: 'Account actions' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  reportAccount: { id: 'account.report', defaultMessage: 'Report @{name}' },
});

const useMenuItems = (
  collection: Collection,
  openEditDialog: () => void,
  openReportDialog: (target: 'collection' | 'account') => void,
  openBlockMuteDialog: (action: 'block' | 'mute') => void,
) => {
  const intl = useIntl();
  const navigation = useNavigation();

  const { data: me } = useCredentialAccountId();
  const { data: account } = useAccount(collection.account_id, true);
  const { mutate: unmuteAccount } = useUnmuteAccountMutation(collection.account_id);
  const { mutate: unblockAccount } = useUnblockAccountMutation(collection.account_id);
  const { mutate: deleteCollection } = useDeleteCollection();
  const confirmRevoke = useRevokeCollection(collection);

  const isOwnCollection = collection.account_id === me;

  const handleDelete = () => {
    Alert.alert(
      intl.formatMessage(messages.deleteHeading, { name: collection.name }),
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
            deleteCollection(collection.id, {
              onSuccess: () => {
                toast.success(intl.formatMessage(messages.deleteSuccess));
                navigation.goBack();
              },
              onError: () => toast.error(intl.formatMessage(messages.deleteError)),
            }),
        },
      ],
    );
  };

  const handleMute = () => {
    if (account?.relationship?.muting) unmuteAccount();
    else openBlockMuteDialog('mute');
  };

  const handleBlock = () => {
    if (account?.relationship?.blocking) unblockAccount();
    else openBlockMuteDialog('block');
  };

  const items: Array<DropdownMenuItem> = [];

  if (collection.url) {
    const url = collection.url;

    const shareItems: Array<DropdownMenuItem> = [
      {
        key: 'copy',
        type: 'button',
        label: intl.formatMessage(messages.copy),
        appleIcon: 'link',
        androidIcon: 'ph_link_simple_horizontal',
        onPress: () => Clipboard.setStringAsync(url),
      },
      {
        key: 'open-in-browser',
        type: 'button',
        label: intl.formatMessage(messages.openInBrowser),
        appleIcon: 'safari',
        androidIcon: 'ph_arrow_square_out',
        onPress: () => openUrl(url),
      },
      {
        key: 'share',
        type: 'button',
        label: intl.formatMessage(messages.share),
        appleIcon: 'square.and.arrow.up',
        androidIcon: 'ph_export',
        onPress: () => shareAsync(url),
      },
    ];

    items.push({ key: 'share', type: 'section', children: shareItems, controlGroup: true });
  }

  if (isOwnCollection) {
    items.push({
      key: 'own',
      type: 'section',
      children: [
        {
          key: 'delete',
          type: 'button',
          label: intl.formatMessage(messages.editDetails),
          appleIcon: 'pencil',
          androidIcon: 'ph_pencil_simple',
          onPress: () => openEditDialog(true),
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
      ],
    });
  } else {
    const moderationItems: Array<DropdownMenuItem> = [];

    if (confirmRevoke) {
      moderationItems.push({
        key: 'revoke',
        type: 'button',
        label: intl.formatMessage(messages.revoke),
        appleIcon: 'person.badge.minus',
        androidIcon: 'ph_user_minus',
        onPress: confirmRevoke,
      });
    }

    moderationItems.push({
      key: 'report',
      type: 'button',
      label: intl.formatMessage(messages.report),
      appleIcon: 'flag',
      androidIcon: 'ph_flag',
      onPress: () => openReportDialog('collection'),
    });

    if (account) {
      moderationItems.push({
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
              account.relationship?.muting ? messages.unmute : messages.mute,
              { name: account.username },
            ),
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
          {
            key: 'report-account',
            type: 'button',
            label: intl.formatMessage(messages.reportAccount, { name: account.username }),
            appleIcon: 'flag',
            androidIcon: 'ph_flag',
            onPress: () => openReportDialog('account'),
          },
        ],
      });
    }

    items.push({ key: 'moderation', type: 'section', children: moderationItems });
  }

  return items;
};

interface ICollectionActionsDropdown {
  collection: Collection;
}

const CollectionActionsDropdown: React.FC<ICollectionActionsDropdown> = ({ collection }) => {
  const intl = useIntl();

  const [editDialog, setEditDialog] = React.useState(false);
  const [blockMuteDialog, setBlockMuteDialog] = React.useState<'block' | 'mute' | null>(null);
  const [reportDialog, setReportDialog] = React.useState<'collection' | 'account' | null>(null);

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
          collection,
          () => setEditDialog(true),
          (target) => setReportDialog(target),
          (action) => setBlockMuteDialog(action),
        ]}
      />
      {editDialog && (
        <CreateCollectionDialog id={collection.id} visible onDismiss={() => setEditDialog(false)} />
      )}
      {reportDialog && (
        <ReportDialog
          accountId={collection.account_id}
          collectionId={reportDialog === 'collection' ? collection.id : undefined}
          visible
          onDismiss={() => setReportDialog(null)}
        />
      )}
      {blockMuteDialog && (
        <BlockMuteDialog
          action={blockMuteDialog}
          accountId={collection.account_id}
          visible
          onDismiss={() => setBlockMuteDialog(null)}
        />
      )}
    </>
  );
};

export { CollectionActionsDropdown };
