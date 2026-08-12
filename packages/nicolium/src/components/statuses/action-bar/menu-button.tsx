import iconArrowSquareOut from '@phosphor-icons/core/regular/arrow-square-out.svg';
import iconArrowsClockwise from '@phosphor-icons/core/regular/arrows-clockwise.svg';
import iconArrowsVertical from '@phosphor-icons/core/regular/arrows-vertical.svg';
import iconAt from '@phosphor-icons/core/regular/at.svg';
import iconBellSimpleSlash from '@phosphor-icons/core/regular/bell-simple-slash.svg';
import iconBellSimple from '@phosphor-icons/core/regular/bell-simple.svg';
import iconBookmarkSimple from '@phosphor-icons/core/regular/bookmark-simple.svg';
import iconBookmark from '@phosphor-icons/core/regular/bookmark.svg';
import iconChatCircle from '@phosphor-icons/core/regular/chat-circle.svg';
import iconChatsTeardrop from '@phosphor-icons/core/regular/chats-teardrop.svg';
import iconCodeSimple from '@phosphor-icons/core/regular/code-simple.svg';
import iconCopy from '@phosphor-icons/core/regular/copy.svg';
import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import iconExport from '@phosphor-icons/core/regular/export.svg';
import iconFlag from '@phosphor-icons/core/regular/flag.svg';
import iconFolders from '@phosphor-icons/core/regular/folders.svg';
import iconGavel from '@phosphor-icons/core/regular/gavel.svg';
import iconGlobe from '@phosphor-icons/core/regular/globe.svg';
import iconLinkSimpleHorizontal from '@phosphor-icons/core/regular/link-simple-horizontal.svg';
import iconLock from '@phosphor-icons/core/regular/lock.svg';
import iconMoon from '@phosphor-icons/core/regular/moon.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconPushPinSlash from '@phosphor-icons/core/regular/push-pin-slash.svg';
import iconPushPin from '@phosphor-icons/core/regular/push-pin.svg';
import iconRepeat from '@phosphor-icons/core/regular/repeat.svg';
import iconRocketLaunch from '@phosphor-icons/core/regular/rocket-launch.svg';
import iconSmiley from '@phosphor-icons/core/regular/smiley.svg';
import iconSpeakerX from '@phosphor-icons/core/regular/speaker-x.svg';
import iconTooth from '@phosphor-icons/core/regular/tooth.svg';
import iconTranslate from '@phosphor-icons/core/regular/translate.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import iconUsersThree from '@phosphor-icons/core/regular/users-three.svg';
import iconWarning from '@phosphor-icons/core/regular/warning.svg';
import { useMatch, useNavigate } from '@tanstack/react-router';
import { type Account, GroupRoles } from 'pl-api';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import DropdownMenu from '@/components/dropdown-menu';
import StatusActionButton from '@/components/statuses/status-action-button';
import { useColumnId, deckColumnRouterRegistry } from '@/contexts/deck-column-id-context';
import { useDeleteStatusModal, useToggleStatusSensitivityModal } from '@/hooks/use-admin-modals';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useReblog } from '@/hooks/use-reblog';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useUnblockAccountMutation } from '@/queries/accounts/use-relationship';
import { useChats } from '@/queries/chats';
import { useGroupQuery } from '@/queries/groups/use-group';
import { useBlockGroupUserMutation } from '@/queries/groups/use-group-blocks';
import { useTranslationLanguages } from '@/queries/instance/use-translation-languages';
import { editStatus, toggleMuteStatus, redactStatus } from '@/queries/statuses/status-actions';
import {
  useDeleteStatus,
  useDeleteStatusFromGroup,
  useStatus,
} from '@/queries/statuses/use-status';
import {
  useBookmarkStatus,
  usePinStatus,
  useUnbookmarkStatus,
  useUnpinStatus,
} from '@/queries/statuses/use-status-interactions';
import { layouts } from '@/router';
import { useAuthStore } from '@/stores/auth';
import { useComposeActions } from '@/stores/compose';
import { useInstance } from '@/stores/instance';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';
import toast from '@/toast';
import copy from '@/utils/copy';
import { languages } from '@/utils/languages';

import messages from './messages';
import { STATUS_ACTIONS } from './types';
import { useItems } from './use-items';

import type { IActionButton } from './types';
import type { Menu } from '@/components/dropdown-menu';

interface IMenuButtonRemainingItems {
  statusId: string;
  rebloggedBy?: Account;
}

const MenuButtonRemainingItems: React.FC<IMenuButtonRemainingItems> = ({
  statusId,
  rebloggedBy,
}) => {
  const { statusActionBarItems } = useSettings();

  const { data: status } = useStatus(statusId);

  const remaining = useMemo(() => {
    return STATUS_ACTIONS.filter((action) => {
      if (statusActionBarItems.includes(action)) return false;
      if (action === 'quote' && statusActionBarItems.includes('reblog')) return false;
      if (['wrench', 'bookmark', 'share', 'translate', 'quick-reactions'].includes(action))
        return false;
      return true;
    });
  }, [statusActionBarItems]);

  const items = useItems(remaining, status, false, rebloggedBy);

  if (!items.length || !status) return null;

  return <div className='status-action-bar__menu__items'>{items}</div>;
};

interface IMenuButton extends IActionButton {
  expandable?: boolean;
  fromBookmarks?: boolean;
  publicStatus: boolean;
  rebloggedBy?: Account;
}

const MenuButton: React.FC<IMenuButton> = ({
  status,
  me,
  expandable,
  fromBookmarks,
  publicStatus,
  rebloggedBy,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { mentionCompose, directCompose } = useComposeActions();
  const match = useMatch({ from: layouts.group.id, shouldThrow: false });
  const { useRocketIconForReblogs } = useSettings();
  const client = useClient();
  const scopeUrl = useScopeUrl();
  const defaultScopeUrl = useAuthStore((store) => store.me);

  const columnId = useColumnId();
  const { fetchTranslation, hideTranslation } = useStatusMetaActions();
  const { targetLanguage, spoilerExpanded } = useStatusMeta(status.id);
  const { openModal } = useModalsActions();
  const { data: group } = useGroupQuery(status.group_id || undefined, true);
  const { mutate: blockGroupMember } = useBlockGroupUserMutation(
    status.group_id as string,
    status.account_id,
  );
  const { getOrCreateChatByAccountId } = useChats();
  const { mutate: bookmarkStatus } = useBookmarkStatus(status.id);
  const { mutate: unbookmarkStatus } = useUnbookmarkStatus(status.id);
  const { mutate: pinStatus } = usePinStatus(status.id);
  const { mutate: unpinStatus } = useUnpinStatus(status.id);
  const { mutate: unblockAccount } = useUnblockAccountMutation(status.account_id);
  const { mutate: deleteStatus } = useDeleteStatus(status.id);
  const { mutate: deleteStatusFromGroup } = useDeleteStatusFromGroup(
    status.id,
    status.group_id as string,
  );
  const deleteStatusModal = useDeleteStatusModal(status.id);
  const toggleStatusSensitivityModal = useToggleStatusSensitivityModal(status.id);

  const features = useFeatures();
  const instance = useInstance();
  const {
    autoTranslate,
    deleteModal,
    knownLanguages,
    statusActionBarItems,
    skipInteractAsConfirmation,
  } = useSettings();

  const { data: translationLanguages = {} } = useTranslationLanguages();
  const reblog = useReblog(status);

  const autoTranslating = useMemo(() => {
    const { allow_remote: allowRemote, allow_unauthenticated: allowUnauthenticated } =
      instance.pleroma.metadata.translation;

    const renderTranslate =
      (me ?? allowUnauthenticated) &&
      (allowRemote || status.account.local) &&
      ['public', 'unlisted'].includes(status.visibility) &&
      status.content.length > 0 &&
      status.language !== null &&
      !knownLanguages.includes(status.language);
    const supportsLanguages = translationLanguages[status.language!]?.includes(intl.locale);

    return autoTranslate && features.translations && renderTranslate && supportsLanguages;
  }, [me, status, autoTranslate]);

  const { data: account } = useOwnAccount();
  const isStaff = account ? (account.is_admin ?? account.is_moderator) : false;
  const isAdmin = account ? account.is_admin : false;

  const hasMultipleAccounts = useAuthStore(
    (state) => Object.values(state.users).filter((user) => user?.id).length > 1,
  );

  const hasRemoteInstanceAccounts = useAuthStore((state) => {
    const accounts = Object.values(state.users).filter((user) => user?.id);
    return accounts.some((user) => new URL(user.url).origin !== new URL(scopeUrl).origin);
  });

  const menu = useMemo(() => {
    const mutingConversation = status.muted;
    const ownAccount = status.account_id === me;
    const { username, local: localAccount } = status.account;

    const handleBookmarkClick: React.EventHandler<React.MouseEvent> = () => {
      if (status.bookmarked) unbookmarkStatus();
      else bookmarkStatus(undefined);
    };

    const handleBookmarkFolderClick = () => {
      openModal('SELECT_BOOKMARK_FOLDER', {
        statusId: status.id,
      });
    };

    const doDeleteStatus = (withRedraft = false) => {
      const options = {
        onSuccess: () => toast.success(messages.deleteSuccess),
        onError: () => toast.error(messages.deleteError),
      };

      if (!deleteModal) {
        deleteStatus(withRedraft, options);
      } else {
        openModal('CONFIRM', {
          heading: intl.formatMessage(
            withRedraft ? messages.redraftHeading : messages.deleteHeading,
          ),
          message: intl.formatMessage(
            withRedraft ? messages.redraftMessage : messages.deleteMessage,
          ),
          confirm: intl.formatMessage(
            withRedraft ? messages.redraftConfirm : messages.deleteConfirm,
          ),
          onConfirm: () => deleteStatus(withRedraft, options),
        });
      }
    };

    const handleDeleteClick: React.EventHandler<React.MouseEvent> = () => {
      doDeleteStatus();
    };

    const handleRedraftClick: React.EventHandler<React.MouseEvent> = () => {
      doDeleteStatus(true);
    };

    const handleEditClick: React.EventHandler<React.MouseEvent> = () => {
      if (status.event)
        navigate({
          to: '/@{$username}/events/$statusId/edit',
          params: { username: status.account.acct, statusId: status.id },
        });
      else editStatus(client, status.id, scopeUrl);
    };

    const handlePinClick: React.EventHandler<React.MouseEvent> = () => {
      if (status.pinned) unpinStatus();
      else pinStatus();
    };

    const handleMentionClick: React.EventHandler<React.MouseEvent> = () => {
      mentionCompose(status.account, scopeUrl, columnId);
    };

    const handleDirectClick: React.EventHandler<React.MouseEvent> = () => {
      directCompose(status.account, scopeUrl, columnId);
    };

    const handleChatClick: React.EventHandler<React.MouseEvent> = () => {
      const account = status.account;

      getOrCreateChatByAccountId(account.id)
        .then((chat) => navigate({ to: '/chats/$chatId', params: { chatId: chat.id } }))
        .catch(() => {});
    };

    const handleMuteClick: React.EventHandler<React.MouseEvent> = () => {
      openModal('BLOCK_MUTE', { accountId: status.account.id, action: 'MUTE' });
    };

    const handleBlockClick: React.EventHandler<React.MouseEvent> = () => {
      openModal('BLOCK_MUTE', {
        accountId: status.account.id,
        statusId: status.id,
        action: 'BLOCK',
      });
    };

    const handleUnblockClick: React.EventHandler<React.MouseEvent> = () => {
      unblockAccount();
    };

    const handleEmbed = () => {
      openModal('EMBED', {
        url: status.url,
        onError: (error: any) => toast.showAlertForError(error),
      });
    };

    const handleOpenReactionsModal = () => {
      if (columnId) {
        deckColumnRouterRegistry.get(columnId)?.router.navigate({
          to: '/@{-$username}/posts/$statusId/reactions' as any,
          params: { username: status.account.acct, statusId: status.id } as any,
        });
      } else {
        openModal('REACTIONS', { statusId: status.id });
      }
    };

    const handleReport: React.EventHandler<React.MouseEvent> = () => {
      openModal('REPORT', { accountId: status.account.id, statusIds: [status.id] });
    };

    const handleConversationMuteClick: React.EventHandler<React.MouseEvent> = () => {
      toggleMuteStatus(client, status, scopeUrl).then(() => {
        toast.success(
          mutingConversation
            ? messages.unmuteConversationSuccess
            : messages.muteConversationSuccess,
        );
      });
    };

    const handleLoadConversationClick = () => {
      client.statuses
        .loadConversation(status.id)
        .then(() => {
          toast.success(messages.loadConversationSuccess);
        })
        .catch(() => {
          toast.error(messages.loadConversationError);
        });
    };

    const handleCopyStatus = () => {
      let content = document
        .querySelector(
          `article[data-status-id="${status.id}"] .status-content__container [data-markup="true"]`,
        )
        ?.textContent?.trim();
      if (content) {
        if (status.spoiler_text.length) content = `${status.spoiler_text}\n\n${content}`;
        copy(content, () => toast.success(messages.copyStatusSuccess));
      }
    };

    const handleCopy: React.EventHandler<React.MouseEvent> = () => {
      const { uri } = status;

      copy(uri, () => toast.success(messages.copySuccess));
    };

    const handleShare = () => {
      navigator
        .share({
          text: status.search_index,
          url: status.uri,
        })
        .catch((e) => {
          if (e.name !== 'AbortError') console.error(e);
        });
    };

    const handleDeleteStatus: React.EventHandler<React.MouseEvent> = () => {
      deleteStatusModal();
    };

    const handleToggleStatusSensitivity: React.EventHandler<React.MouseEvent> = () => {
      toggleStatusSensitivityModal(status.sensitive);
    };

    const handleDeleteFromGroup: React.EventHandler<React.MouseEvent> = () => {
      const account = status.account;

      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.deleteHeading),
        message: intl.formatMessage(messages.deleteFromGroupMessage, {
          name: <strong>{account.username}</strong>,
        }),
        confirm: intl.formatMessage(messages.deleteConfirm),
        onConfirm: () => {
          deleteStatusFromGroup();
        },
      });
    };

    const handleBlockFromGroup = () => {
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.groupBlockFromGroupHeading),
        message: intl.formatMessage(messages.groupBlockFromGroupMessage, {
          name: status.account.username,
        }),
        confirm: intl.formatMessage(messages.groupBlockConfirm),
        onConfirm: () => {
          blockGroupMember(undefined, {
            onSuccess: () => {
              toast.success(intl.formatMessage(messages.blocked, { name: account?.acct }));
            },
          });
        },
      });
    };

    const handleIgnoreLanguage = () => {
      changeSetting(['autoTranslate'], [...knownLanguages, status.language], { showAlert: true });
    };

    const handleTranslate = () => {
      if (targetLanguage) {
        hideTranslation(status.id);
      } else {
        fetchTranslation(status.id, intl.locale);
      }
    };

    const handleRedactStatus: React.EventHandler<React.MouseEvent> = () => {
      redactStatus(client, status.id, scopeUrl);
    };

    const handleInteractAs: React.EventHandler<React.MouseEvent> = () => {
      if (skipInteractAsConfirmation || !hasRemoteInstanceAccounts) {
        openModal('INTERACT_AS', { statusId: status.id });
      } else {
        openModal('CONFIRM', {
          heading: intl.formatMessage(messages.interactAsConfirmationHeading),
          message: intl.formatMessage(messages.interactAsConfirmationMessage),
          confirm: intl.formatMessage(messages.interactAsConfirmationConfirm),
          onConfirm: (value) => {
            openModal('INTERACT_AS', { statusId: status.id });
            if (value) changeSetting(['skipInteractAsConfirmation'], true);
          },
          checkbox: intl.formatMessage(messages.interactAsConfirmationCheckbox),
          theme: 'default',
        });
      }
    };

    const menu: Menu = [];

    if (expandable) {
      menu.push({
        text: intl.formatMessage(messages.open),
        icon: iconArrowsVertical,
        to: '/@{-$username}/posts/$statusId',
        params: { username: status.account.acct, statusId: status.id },
      });
    }

    if (hasMultipleAccounts) {
      menu.push({
        text: intl.formatMessage(messages.interactAs),
        action: handleInteractAs,
        icon: iconUsersThree,
      });
    }

    if (status.spoiler_text.length === 0 || (spoilerExpanded ?? false)) {
      menu.push({
        text: intl.formatMessage(messages.copyStatus),
        action: handleCopyStatus,
        icon: iconCopy,
      });
    }

    if (publicStatus) {
      menu.push({
        text: intl.formatMessage(messages.copy),
        action: handleCopy,
        icon: iconLinkSimpleHorizontal,
      });

      if ('share' in navigator && !statusActionBarItems.includes('share')) {
        menu.push({
          text: intl.formatMessage(messages.share),
          action: handleShare,
          icon: iconExport,
        });
      }

      if (features.embeds && localAccount) {
        menu.push({
          text: intl.formatMessage(messages.embed),
          action: handleEmbed,
          icon: iconCodeSimple,
        });
      }
    }

    if (!me) {
      return menu;
    }

    if (status.emoji_reactions.length && features.exposableReactions && features.emojiReactsList) {
      menu.push({
        text: intl.formatMessage(messages.viewReactions),
        action: handleOpenReactionsModal,
        icon: iconSmiley,
      });
    }

    const isGroupStatus = typeof status.group_id === 'string';

    if (features.bookmarks && !statusActionBarItems.includes('bookmark')) {
      menu.push({
        text: intl.formatMessage(status.bookmarked ? messages.unbookmark : messages.bookmark),
        action: handleBookmarkClick,
        icon: status.bookmarked ? iconBookmark : iconBookmarkSimple,
      });
    }

    if (features.bookmarkFolders && status.bookmarked && fromBookmarks) {
      menu.push({
        text: intl.formatMessage(
          status.bookmark_folder ? messages.bookmarkChangeFolder : messages.bookmarkSetFolder,
        ),
        action: handleBookmarkFolderClick,
        icon: iconFolders,
      });
    }

    if (features.federating && (!localAccount || status.account_id === '')) {
      const { hostname: domain } = new URL(status.uri);
      menu.push({
        text: intl.formatMessage(messages.external, { domain }),
        icon: iconArrowSquareOut,
        href: status.uri,
        target: '_blank',
      });
    }

    menu.push(null);

    menu.push({
      text: intl.formatMessage(
        mutingConversation ? messages.unmuteConversation : messages.muteConversation,
      ),
      action: handleConversationMuteClick,
      icon: mutingConversation ? iconBellSimple : iconBellSimpleSlash,
    });

    if (!status.in_reply_to_id && features.loadConversation) {
      menu.push({
        text: intl.formatMessage(messages.loadConversation),
        action: handleLoadConversationClick,
        icon: iconArrowsClockwise,
      });
    }

    menu.push(null);

    if (publicStatus && !status.reblogged && features.reblogVisibility) {
      menu.push({
        text: intl.formatMessage(messages.reblogVisibility),
        icon: useRocketIconForReblogs ? iconRocketLaunch : iconRepeat,
        items: [
          {
            text: intl.formatMessage(messages.reblogVisibilityPublic),
            action: (e) => {
              reblog({ event: e, visibility: 'public' });
            },
            icon: iconGlobe,
          },
          {
            text: intl.formatMessage(messages.reblogVisibilityUnlisted),
            action: (e) => {
              reblog({ event: e, visibility: 'unlisted' });
            },
            icon: iconMoon,
          },
          {
            text: intl.formatMessage(messages.reblogVisibilityPrivate),
            action: (e) => {
              reblog({ event: e, visibility: 'private' });
            },
            icon: iconLock,
          },
        ],
      });
    }

    if (ownAccount) {
      if (publicStatus) {
        menu.push({
          text: intl.formatMessage(status.pinned ? messages.unpin : messages.pin),
          action: handlePinClick,
          icon: status.pinned ? iconPushPinSlash : iconPushPin,
        });
      } else if (status.visibility === 'private' || status.visibility === 'mutuals_only') {
        menu.push({
          text: intl.formatMessage(
            status.reblogged ? messages.cancelReblogPrivate : messages.reblogPrivate,
          ),
          action: (e) => reblog({ event: e }),
          icon: useRocketIconForReblogs ? iconRocketLaunch : iconRepeat,
        });
      }

      menu.push({
        text: intl.formatMessage(messages.delete),
        action: handleDeleteClick,
        icon: iconTrash,
        destructive: true,
      });
      if (features.editStatuses) {
        menu.push({
          text: intl.formatMessage(messages.edit),
          action: handleEditClick,
          icon: iconPencilSimple,
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.redraft),
          action: handleRedraftClick,
          icon: iconPencilSimple,
          destructive: true,
        });
      }
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: username }),
        action: handleMentionClick,
        icon: iconAt,
      });

      if (status.account.accepts_chat_messages === true) {
        menu.push({
          text: intl.formatMessage(messages.chat, { name: username }),
          action: handleChatClick,
          icon: iconChatsTeardrop,
        });
      } else if (features.privacyScopes) {
        menu.push({
          text: intl.formatMessage(messages.direct, { name: username }),
          action: handleDirectClick,
          icon: iconChatCircle,
        });
      }

      if (
        features.biteStatuses &&
        !statusActionBarItems.includes('bite') &&
        status.account.can_bite !== false
      ) {
        const handleBiteClick = () => {
          client.statuses
            .biteStatus(status.id)
            .then(() => {
              toast.success(intl.formatMessage(messages.biteSuccess));
            })
            .catch(() => {
              toast.error(intl.formatMessage(messages.biteFail));
            });
        };

        menu.push({
          text: intl.formatMessage(messages.bite),
          action: handleBiteClick,
          icon: iconTooth,
        });
      }

      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.mute, { name: username }),
        action: handleMuteClick,
        icon: iconSpeakerX,
      });
      if (status.account.relationship?.blocking) {
        menu.push({
          text: intl.formatMessage(messages.unblock, { name: username }),
          action: handleUnblockClick,
          icon: iconProhibit,
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.block, { name: username }),
          action: handleBlockClick,
          icon: iconProhibit,
        });
      }
      menu.push({
        text: intl.formatMessage(messages.report, { name: username }),
        action: handleReport,
        icon: iconFlag,
      });
    }

    if (autoTranslating) {
      if (!statusActionBarItems.includes('translate')) {
        if (targetLanguage) {
          menu.push({
            text: intl.formatMessage(messages.hideTranslation),
            action: handleTranslate,
            icon: iconTranslate,
          });
        } else {
          menu.push({
            text: intl.formatMessage(messages.translate),
            action: handleTranslate,
            icon: iconTranslate,
          });
        }
      }

      menu.push({
        text: intl.formatMessage(messages.addKnownLanguage, {
          language: languages[status.language as 'en'] || status.language,
        }),
        action: handleIgnoreLanguage,
        icon: iconFlag,
      });
    }

    if (isGroupStatus && !!status.group_id) {
      const isGroupOwner = group?.relationship?.role === GroupRoles.OWNER;
      const isGroupAdmin = group?.relationship?.role === GroupRoles.ADMIN;
      const isGroupModerator = group?.relationship?.role === GroupRoles.MODERATOR;
      const canModerate = isGroupOwner || isGroupAdmin || isGroupModerator;
      // const isStatusFromOwner = group.owner.id === account.id;

      const canBanUser = match && canModerate && !ownAccount;
      const canDeleteStatus = !ownAccount && canModerate;

      if (canBanUser || canDeleteStatus) {
        menu.push(null);
      }

      if (canBanUser) {
        menu.push({
          text: 'Ban from group',
          action: handleBlockFromGroup,
          icon: iconProhibit,
          destructive: true,
        });
      }

      if (canDeleteStatus) {
        menu.push({
          text: intl.formatMessage(messages.groupModDelete),
          action: handleDeleteFromGroup,
          icon: iconTrash,
          destructive: true,
        });
      }
    }

    if (isStaff) {
      menu.push(null);

      if (scopeUrl === defaultScopeUrl) {
        menu.push({
          text: intl.formatMessage(messages.adminAccount, { name: username }),
          to: '/nicolium/admin/accounts/$accountId',
          params: { accountId: status.account_id },
          icon: iconGavel,
        });

        if (isAdmin && features.pleromaAdminStatuses) {
          menu.push({
            text: intl.formatMessage(messages.adminStatus),
            href: `/pleroma/admin/#/statuses/${status.id}/`,
            icon: iconPencilSimple,
          });
        }
      }

      if (features.pleromaAdminStatuses) {
        menu.push({
          text: intl.formatMessage(
            !status.sensitive ? messages.markStatusSensitive : messages.markStatusNotSensitive,
          ),
          action: handleToggleStatusSensitivity,
          icon: iconWarning,
        });
      }

      if (isAdmin && features.pleromaAdminStatusesRedact) {
        menu.push({
          text: intl.formatMessage(messages.redact),
          action: handleRedactStatus,
          icon: iconPencilSimple,
          destructive: true,
        });
      }

      if (!ownAccount && features.adminDeleteStatus) {
        menu.push({
          text: intl.formatMessage(messages.deleteStatus),
          action: handleDeleteStatus,
          icon: iconTrash,
          destructive: true,
        });
      }
    }

    return menu;
  }, [
    me,
    targetLanguage,
    status.bookmarked,
    status.muted,
    status.emoji_reactions.length > 0,
    status.pinned,
    status.reblogged,
    status.account?.relationship,
    spoilerExpanded,
    statusActionBarItems,
    scopeUrl,
    hasMultipleAccounts,
    hasRemoteInstanceAccounts,
    skipInteractAsConfirmation,
    reblog,
  ]);

  return useMemo(
    () => (
      <DropdownMenu
        component={() => (
          <MenuButtonRemainingItems statusId={status.id} rebloggedBy={rebloggedBy} />
        )}
        items={menu}
      >
        <StatusActionButton title={intl.formatMessage(messages.more)} icon={iconDotsThree} />
      </DropdownMenu>
    ),
    [menu],
  );
};

export { MenuButton };
