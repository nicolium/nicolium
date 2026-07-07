import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconExport from '@phosphor-icons/core/regular/export.svg';
import iconEye from '@phosphor-icons/core/regular/eye.svg';
import iconFlag from '@phosphor-icons/core/regular/flag.svg';
import iconLinkSimpleHorizontal from '@phosphor-icons/core/regular/link-simple-horizontal.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import iconUserMinus from '@phosphor-icons/core/regular/user-minus.svg';
import iconUsers from '@phosphor-icons/core/regular/users.svg';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import DropdownMenu from '@/components/dropdown-menu';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useDeleteCollection } from '@/queries/accounts/use-collections';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';
import copy from '@/utils/copy';

import IconButton from '../ui/icon-button';

import { useRevokeCollection } from './use-revoke-collection';

import type { Menu } from '@/components/dropdown-menu';
import type { Collection } from 'pl-api';

const messages = defineMessages({
  more: { id: 'collections.menu', defaultMessage: 'Collection menu' },
  view: { id: 'collections.view_collection', defaultMessage: 'View collection' },
  share: { id: 'collections.share', defaultMessage: 'Share' },
  copyLink: { id: 'collections.copy_link', defaultMessage: 'Copy link' },
  copyLinkSuccess: {
    id: 'collections.copy_link.success',
    defaultMessage: 'Copied collection link to clipboard',
  },
  manageAccounts: { id: 'collections.manage_accounts', defaultMessage: 'Manage accounts' },
  editDetails: { id: 'collections.edit_details', defaultMessage: 'Edit details' },
  delete: { id: 'collections.delete_collection', defaultMessage: 'Delete collection' },
  deleteSuccess: { id: 'collections.delete.success', defaultMessage: 'Collection deleted' },
  deleteError: { id: 'collections.delete.error', defaultMessage: 'Failed to delete collection' },
  revoke: {
    id: 'collections.revoke_collection_inclusion',
    defaultMessage: 'Remove myself from this collection',
  },
  report: { id: 'collections.report_collection', defaultMessage: 'Report this collection' },
  blockOwner: { id: 'collections.block_collection_owner', defaultMessage: 'Block account' },
});

interface ICollectionMenu {
  collection: Collection;
  context: 'list' | 'notifications' | 'collection';
}

const CollectionMenu: React.FC<ICollectionMenu> = ({ collection, context }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { me } = useLoggedIn();
  const { data: ownAccount } = useOwnAccount();
  const { openModal } = useModalsActions();
  const { mutate: deleteCollection } = useDeleteCollection();
  const confirmRevoke = useRevokeCollection(collection);

  const isOwnCollection = collection.account_id === me;
  const collectionUrl = collection.url ?? collection.uri;

  const handleDelete = () => {
    openModal('CONFIRM', {
      heading: (
        <FormattedMessage
          id='confirmations.delete_collection.heading'
          defaultMessage='Delete “{name}”?'
          values={{ name: collection.name }}
        />
      ),
      message: (
        <FormattedMessage
          id='confirmations.delete_collection.message'
          defaultMessage='This will permanently delete the collection. This action cannot be undone.'
        />
      ),
      confirm: (
        <FormattedMessage id='confirmations.delete_collection.confirm' defaultMessage='Delete' />
      ),
      theme: 'danger',
      onConfirm: () => {
        deleteCollection(collection.id, {
          onSuccess: () => {
            toast.success(messages.deleteSuccess);
            if (context === 'collection' && ownAccount) {
              navigate({ to: '/@{$username}/collections', params: { username: ownAccount.acct } });
            }
          },
          onError: () => {
            toast.error(messages.deleteError);
          },
        });
      },
    });
  };

  const handleShare = () => {
    if ('share' in navigator) {
      navigator.share({
        text: collection.name,
        url: collectionUrl,
      });
    }
  };

  const makeMenu = () => {
    const menu: Menu = [];

    if (context === 'list' || context === 'notifications') {
      menu.push({
        text: intl.formatMessage(messages.view),
        to: '/collections/$collectionId',
        params: { collectionId: collection.id },
        icon: iconEye,
      });
    }

    if ('share' in navigator) {
      menu.push({
        text: intl.formatMessage(messages.share),
        action: handleShare,
        icon: iconExport,
      });
    }

    if (collectionUrl) {
      menu.push({
        text: intl.formatMessage(messages.copyLink),
        action: () => copy(collectionUrl, () => toast.success(messages.copyLinkSuccess)),
        icon: iconLinkSimpleHorizontal,
      });
    }

    if (isOwnCollection) {
      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.manageAccounts),
        action: () =>
          openModal('COLLECTION_EDITOR', { collectionId: collection.id, tab: 'accounts' }),
        icon: iconUsers,
      });
      menu.push({
        text: intl.formatMessage(messages.editDetails),
        action: () => openModal('COLLECTION_EDITOR', { collectionId: collection.id }),
        icon: iconPencilSimple,
      });
      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.delete),
        action: handleDelete,
        icon: iconTrash,
        destructive: true,
      });
    } else if (me) {
      menu.push(null);

      if (confirmRevoke && context !== 'notifications') {
        menu.push({
          text: intl.formatMessage(messages.revoke),
          action: confirmRevoke,
          icon: iconUserMinus,
        });
      }

      menu.push({
        text: intl.formatMessage(messages.report),
        action: () =>
          openModal('REPORT', { accountId: collection.account_id, collectionId: collection.id }),
        icon: iconFlag,
      });

      if (confirmRevoke) {
        menu.push({
          text: intl.formatMessage(messages.blockOwner),
          action: () =>
            openModal('BLOCK_MUTE', { accountId: collection.account_id, action: 'BLOCK' }),
          icon: iconProhibit,
          destructive: true,
        });
      }
    }

    return menu;
  };

  return (
    <DropdownMenu
      items={makeMenu()}
      src={iconDotsThreeVertical}
      title={intl.formatMessage(messages.more)}
    >
      <IconButton
        src={iconDotsThreeVertical}
        title={intl.formatMessage(messages.more)}
        theme='outlined'
      />
    </DropdownMenu>
  );
};

export { CollectionMenu };
