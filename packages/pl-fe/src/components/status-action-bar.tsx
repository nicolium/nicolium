import { type CustomEmoji, GroupRoles } from 'pl-api';
import React, { useCallback, useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { blockAccount } from 'pl-fe/actions/accounts';
import { redactStatus } from 'pl-fe/actions/admin';
import { directCompose, mentionCompose, quoteCompose, replyCompose } from 'pl-fe/actions/compose';
import { emojiReact, unEmojiReact } from 'pl-fe/actions/emoji-reacts';
import { deleteStatusModal, toggleStatusSensitivityModal } from 'pl-fe/actions/moderation';
import { initReport, ReportableEntities } from 'pl-fe/actions/reports';
import { changeSetting } from 'pl-fe/actions/settings';
import { deleteStatus, editStatus, toggleMuteStatus } from 'pl-fe/actions/statuses';
import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import { useGroupRelationship } from 'pl-fe/api/hooks/groups/use-group-relationship';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import StatusActionButton from 'pl-fe/components/status-action-button';
import HStack from 'pl-fe/components/ui/hstack';
import EmojiPickerDropdown from 'pl-fe/features/emoji/containers/emoji-picker-dropdown-container';
import { languages } from 'pl-fe/features/preferences';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useCanInteract } from 'pl-fe/hooks/use-can-interact';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useChats } from 'pl-fe/queries/chats';
import { useBlockGroupUserMutation } from 'pl-fe/queries/groups/use-group-blocks';
import { useCustomEmojis } from 'pl-fe/queries/instance/use-custom-emojis';
import { useTranslationLanguages } from 'pl-fe/queries/instance/use-translation-languages';
import { useBookmarkStatus, useDislikeStatus, useFavouriteStatus, usePinStatus, useReblogStatus, useUnbookmarkStatus, useUndislikeStatus, useUnfavouriteStatus, useUnpinStatus, useUnreblogStatus } from 'pl-fe/queries/statuses/use-status-interactions';
import { useModalsActions } from 'pl-fe/stores/modals';
import { useSettings } from 'pl-fe/stores/settings';
import { useStatusMeta, useStatusMetaActions } from 'pl-fe/stores/status-meta';
import toast from 'pl-fe/toast';
import copy from 'pl-fe/utils/copy';

import GroupPopover from './groups/popover/group-popover';
import Popover from './ui/popover';
import Stack from './ui/stack';
import Text from './ui/text';

import type { Menu } from 'pl-fe/components/dropdown-menu';
import type { Emoji as EmojiType } from 'pl-fe/features/emoji';
import type { UnauthorizedModalAction } from 'pl-fe/modals/unauthorized-modal';
import type { Account } from 'pl-fe/normalizers/account';
import type { Group } from 'pl-fe/normalizers/group';
import type { SelectedStatus } from 'pl-fe/selectors';
import type { Me } from 'pl-fe/types/pl-fe';

const messages = defineMessages({
  adminAccount: { id: 'status.admin_account', defaultMessage: 'Moderate @{name}' },
  admin_status: { id: 'status.admin_status', defaultMessage: 'Open this post in the moderation interface' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  blocked: { id: 'group.group_mod_block.success', defaultMessage: '@{name} is banned' },
  blockAndReport: { id: 'confirmations.block.block_and_report', defaultMessage: 'Block and report' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark' },
  bookmarkSetFolder: { id: 'status.bookmark_folder', defaultMessage: 'Set bookmark folder' },
  bookmarkChangeFolder: { id: 'status.bookmark_folder_change', defaultMessage: 'Change bookmark folder' },
  cancel_reblog_private: { id: 'status.cancel_reblog_private', defaultMessage: 'Un-repost' },
  cannot_reblog: { id: 'status.cannot_reblog', defaultMessage: 'This post cannot be reposted' },
  chat: { id: 'status.chat', defaultMessage: 'Chat with @{name}' },
  copy: { id: 'status.copy', defaultMessage: 'Copy link to post' },
  deactivateUser: { id: 'admin.users.actions.deactivate_user', defaultMessage: 'Deactivate @{name}' },
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteFromGroupMessage: { id: 'confirmations.delete_from_group.message', defaultMessage: 'Are you sure you want to delete @{name}\'s post?' },
  deleteHeading: { id: 'confirmations.delete.heading', defaultMessage: 'Delete post' },
  deleteMessage: { id: 'confirmations.delete.message', defaultMessage: 'Are you sure you want to delete this post?' },
  deleteStatus: { id: 'admin.statuses.actions.delete_status', defaultMessage: 'Delete post' },
  deleteUser: { id: 'admin.users.actions.delete_user', defaultMessage: 'Delete @{name}' },
  direct: { id: 'status.direct', defaultMessage: 'Direct message @{name}' },
  disfavourite: { id: 'status.disfavourite', defaultMessage: 'Disike' },
  edit: { id: 'status.edit', defaultMessage: 'Edit' },
  embed: { id: 'status.embed', defaultMessage: 'Embed post' },
  external: { id: 'status.external', defaultMessage: 'View post on {domain}' },
  favourite: { id: 'status.favourite', defaultMessage: 'Like' },
  groupBlockConfirm: { id: 'confirmations.block_from_group.confirm', defaultMessage: 'Ban user' },
  groupBlockFromGroupHeading: { id: 'confirmations.block_from_group.heading', defaultMessage: 'Ban from group' },
  groupBlockFromGroupMessage: { id: 'confirmations.block_from_group.message', defaultMessage: 'Are you sure you want to ban @{name} from the group?' },
  groupModDelete: { id: 'status.group_mod_delete', defaultMessage: 'Delete post from group' },
  group_remove_account: { id: 'status.remove_account_from_group', defaultMessage: 'Remove account from group' },
  group_remove_post: { id: 'status.remove_post_from_group', defaultMessage: 'Remove post from group' },
  loadConversation: { id: 'status.load_conversation', defaultMessage: 'Load conversation from remote server' },
  loadConversationError: { id: 'status.load_conversation.error', defaultMessage: 'Failed to load conversation from a remote server' },
  loadConversationSuccess: { id: 'status.load_conversation.success', defaultMessage: 'Scheduled loading conversation from a remote server' },
  markStatusNotSensitive: { id: 'admin.statuses.actions.mark_status_not_sensitive', defaultMessage: 'Mark post not sensitive' },
  markStatusSensitive: { id: 'admin.statuses.actions.mark_status_sensitive', defaultMessage: 'Mark post sensitive' },
  mention: { id: 'status.mention', defaultMessage: 'Mention @{name}' },
  more: { id: 'status.more', defaultMessage: 'More' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  muteConversation: { id: 'status.mute_conversation', defaultMessage: 'Mute conversation' },
  open: { id: 'status.open', defaultMessage: 'Show post details' },
  pin: { id: 'status.pin', defaultMessage: 'Pin on profile' },
  quotePost: { id: 'status.quote', defaultMessage: 'Quote post' },
  reblog: { id: 'status.reblog', defaultMessage: 'Repost' },
  reblog_private: { id: 'status.reblog_private', defaultMessage: 'Repost to original audience' },
  reblog_visibility: { id: 'status.reblog_visibility', defaultMessage: 'Repost to specific audience' },
  reblog_visibility_public: { id: 'status.reblog_visibility_public', defaultMessage: 'Public repost' },
  reblog_visibility_unlisted: { id: 'status.reblog_visibility_unlisted', defaultMessage: 'Quiet public repost' },
  reblog_visibility_private: { id: 'status.reblog_visibility_private', defaultMessage: 'Followers-only repost' },
  redact: { id: 'status.redact', defaultMessage: 'Redact' },
  redraft: { id: 'status.redraft', defaultMessage: 'Delete & re-draft' },
  redraftConfirm: { id: 'confirmations.redraft.confirm', defaultMessage: 'Delete & redraft' },
  redraftHeading: { id: 'confirmations.redraft.heading', defaultMessage: 'Delete & redraft' },
  redraftMessage: { id: 'confirmations.redraft.message', defaultMessage: 'Are you sure you want to delete this post and re-draft it? Favorites and reposts will be lost, and replies to the original post will be orphaned.' },
  replies_disabled_group: { id: 'status.disabled_replies.group_membership', defaultMessage: 'Only group members can reply' },
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  replyAll: { id: 'status.reply_all', defaultMessage: 'Reply to thread' },
  replyConfirm: { id: 'confirmations.reply.confirm', defaultMessage: 'Reply' },
  replyMessage: { id: 'confirmations.reply.message', defaultMessage: 'Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?' },
  report: { id: 'status.report', defaultMessage: 'Report @{name}' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  unbookmark: { id: 'status.unbookmark', defaultMessage: 'Remove bookmark' },
  unmuteConversation: { id: 'status.unmute_conversation', defaultMessage: 'Unmute conversation' },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  viewReactions: { id: 'status.view_reactions', defaultMessage: 'View reactions' },
  wrench: { id: 'status.wrench', defaultMessage: 'Wrench reaction' },
  addKnownLanguage: { id: 'status.add_known_language', defaultMessage: 'Do not auto-translate posts in {language}.' },
  translate: { id: 'status.translate', defaultMessage: 'Translate' },
  hideTranslation: { id: 'status.hide_translation', defaultMessage: 'Hide translation' },

  favouriteInteractionPolicyHeader: { id: 'status.interaction_policy.favourite.header', defaultMessage: 'The author limits who can like this post.' },
  reblogInteractionPolicyHeader: { id: 'status.interaction_policy.reblog.header', defaultMessage: 'The author limits who can repost this post.' },
  replyInteractionPolicyHeader: { id: 'status.interaction_policy.reply.header', defaultMessage: 'The author limits who can reply to this post.' },

  favouriteInteractionPolicyFollowers: { id: 'status.interaction_policy.favourite.followers_only', defaultMessage: 'Only users following the author can like.' },
  favouriteInteractionPolicyFollowing: { id: 'status.interaction_policy.favourite.following_only', defaultMessage: 'Only users followed by the author can like.' },
  favouriteInteractionPolicyMutuals: { id: 'status.interaction_policy.favourite.mutuals_only', defaultMessage: 'Only users mutually following the author can like.' },
  favouriteInteractionPolicyMentioned: { id: 'status.interaction_policy.favourite.mentioned_only', defaultMessage: 'Only users mentioned by the author can like.' },

  reblogInteractionPolicyFollowers: { id: 'status.interaction_policy.reblog.followers_only', defaultMessage: 'Only users following the author can repost.' },
  reblogInteractionPolicyFollowing: { id: 'status.interaction_policy.reblog.following_only', defaultMessage: 'Only users followed by the author can repost.' },
  reblogInteractionPolicyMutuals: { id: 'status.interaction_policy.reblog.mutuals_only', defaultMessage: 'Only users mutually following the author can repost.' },
  reblogInteractionPolicyMentioned: { id: 'status.interaction_policy.reblog.mentioned_only', defaultMessage: 'Only users mentioned by the author can repost.' },

  replyInteractionPolicyFollowers: { id: 'status.interaction_policy.reply.followers_only', defaultMessage: 'Only users following the author can reply.' },
  replyInteractionPolicyFollowing: { id: 'status.interaction_policy.reply.following_only', defaultMessage: 'Only users followed by the author can reply.' },
  replyInteractionPolicyMutuals: { id: 'status.interaction_policy.reply.mutuals_only', defaultMessage: 'Only users mutually following the author can reply.' },
  replyInteractionPolicyMentioned: { id: 'status.interaction_policy.reply.mentioned_only', defaultMessage: 'Only users mentioned by the author can reply.' },

  favouriteApprovalRequired: { id: 'status.interaction_policy.favourite.approval_required', defaultMessage: 'The author needs to approve your like.' },
  reblogApprovalRequired: { id: 'status.interaction_policy.reblog.approval_required', defaultMessage: 'The author needs to approve your repost.' },
});

interface IInteractionPopover {
  type: 'favourite' | 'reblog' | 'reply';
  allowed: ReturnType<typeof useCanInteract>['allowed'];
}

const INTERACTION_POLICY_HEADERS = {
  favourite: messages.favouriteInteractionPolicyHeader,
  reblog: messages.reblogInteractionPolicyHeader,
  reply: messages.replyInteractionPolicyHeader,
};

const INTERACTION_POLICY_DESCRIPTIONS = {
  favourite: {
    followers: messages.favouriteInteractionPolicyFollowers,
    following: messages.favouriteInteractionPolicyFollowing,
    mutuals: messages.favouriteInteractionPolicyMutuals,
    mentioned: messages.favouriteInteractionPolicyMentioned,
  },
  reblog: {
    followers: messages.reblogInteractionPolicyFollowers,
    following: messages.reblogInteractionPolicyFollowing,
    mutuals: messages.reblogInteractionPolicyMutuals,
    mentioned: messages.reblogInteractionPolicyMentioned,
  },
  reply: {
    followers: messages.replyInteractionPolicyFollowers,
    following: messages.replyInteractionPolicyFollowing,
    mutuals: messages.replyInteractionPolicyMutuals,
    mentioned: messages.replyInteractionPolicyMentioned,
  },
};

const InteractionPopover: React.FC<IInteractionPopover> = ({ type, allowed }) => {
  const intl = useIntl();

  const allowedType = allowed?.includes('followers') ? 'followers' : allowed?.includes('following') ? 'following' : allowed?.includes('mutuals') ? 'mutuals' : 'mentioned';

  return (
    <Stack space={1} className='max-w-96'>
      <Text weight='semibold' align='center'>
        {intl.formatMessage(INTERACTION_POLICY_HEADERS[type])}
      </Text>
      <Text theme='muted' align='center'>
        {intl.formatMessage(INTERACTION_POLICY_DESCRIPTIONS[type][allowedType])}
      </Text>
    </Stack>
  );
};

interface IActionButton extends Pick<IStatusActionBar, 'status'  | 'statusActionButtonTheme' | 'withLabels'> {
  me: Me;
  onOpenUnauthorizedModal: (action?: UnauthorizedModalAction) => void;
}

interface IReplyButton extends IActionButton {
  rebloggedBy?: Account;
}

const ReplyButton: React.FC<IReplyButton> = ({
  status,
  statusActionButtonTheme,
  withLabels,
  me,
  onOpenUnauthorizedModal,
  rebloggedBy,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const canReply = useCanInteract(status, 'can_reply');
  const { groupRelationship } = useGroupRelationship(status.group_id || undefined);

  let replyTitle;
  let replyDisabled = false;

  if ((status.group as Group)?.membership_required && !groupRelationship?.member) {
    replyDisabled = true;
    replyTitle = intl.formatMessage(messages.replies_disabled_group);
  }

  if (!status.in_reply_to_id) {
    replyTitle = intl.formatMessage(messages.reply);
  } else {
    replyTitle = intl.formatMessage(messages.replyAll);
  }

  const handleReplyClick: React.MouseEventHandler = (e) => {
    if (me) {
      dispatch(replyCompose(status, rebloggedBy, canReply.approvalRequired || false));
    } else {
      onOpenUnauthorizedModal('REPLY');
    }
  };

  const replyButton = (
    <StatusActionButton
      title={replyTitle}
      icon={status.in_reply_to_id ? require('@phosphor-icons/core/regular/arrow-bend-double-up-left.svg') : require('@phosphor-icons/core/regular/arrow-bend-up-left.svg')}
      onClick={handleReplyClick}
      count={status.replies_count}
      text={withLabels ? intl.formatMessage(messages.reply) : undefined}
      disabled={replyDisabled}
      theme={statusActionButtonTheme}
    />
  );

  if (me && !canReply.canInteract) return (
    <Popover
      interaction='click'
      content={<InteractionPopover allowed={canReply.allowed} type='reply' />}
    >
      {replyButton}
    </Popover>
  );

  return status.group ? (
    <GroupPopover
      group={status.group}
      isEnabled={replyDisabled}
    >
      {replyButton}
    </GroupPopover>
  ) : replyButton;
};

interface IReblogButton extends IActionButton {
  publicStatus: boolean;
}

const ReblogButton: React.FC<IReblogButton> = ({
  status,
  statusActionButtonTheme,
  withLabels,
  me,
  onOpenUnauthorizedModal,
  publicStatus,
}) => {
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const intl = useIntl();

  const { boostModal } = useSettings();
  const { openModal } = useModalsActions();
  const canReblog = useCanInteract(status, 'can_reblog');

  const { mutate: reblogStatus } = useReblogStatus(status.id);
  const { mutate: unreblogStatus } = useUnreblogStatus(status.id);

  let reblogIcon = require('@phosphor-icons/core/regular/repeat.svg');

  if (status.visibility === 'direct') {
    reblogIcon = require('@phosphor-icons/core/regular/at.svg');
  } else if (status.visibility === 'private' || status.visibility === 'mutuals_only') {
    reblogIcon = require('@phosphor-icons/core/regular/lock.svg');
  }

  const handleReblogClick: React.EventHandler<React.MouseEvent> = e => {
    if (me) {
      const modalReblog = () => {
        if (status.reblogged) {
          unreblogStatus();
        } else {
          reblogStatus(undefined, {
            onSuccess: () => {
              if (canReblog.approvalRequired) toast.info(messages.reblogApprovalRequired);
            },
          });
        }
      };
      if ((e && e.shiftKey) || !boostModal) {
        modalReblog();
      } else {
        openModal('BOOST', { statusId: status.id, onReblog: modalReblog });
      }
    } else {
      onOpenUnauthorizedModal('REBLOG');
    }
  };

  const handleReblogLongPress = status.reblogs_count ? () => {
    openModal('REBLOGS', { statusId: status.id });
  } : undefined;

  const reblogButton = (
    <StatusActionButton
      icon={reblogIcon}
      color='success'
      disabled={!publicStatus}
      title={!publicStatus ? intl.formatMessage(messages.cannot_reblog) : intl.formatMessage(messages.reblog)}
      active={status.reblogged}
      onClick={handleReblogClick}
      onLongPress={handleReblogLongPress}
      count={status.reblogs_count + status.quotes_count}
      text={withLabels ? intl.formatMessage(messages.reblog) : undefined}
      theme={statusActionButtonTheme}
    />
  );

  if (me && !canReblog.canInteract) return (
    <Popover
      interaction='click'
      content={<InteractionPopover allowed={canReblog.allowed} type='reblog' />}
    >
      {reblogButton}
    </Popover>
  );

  if (!features.quotePosts || !me) return reblogButton;

  const handleQuoteClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (me) {
      dispatch(quoteCompose(status));
    } else {
      onOpenUnauthorizedModal('REBLOG');
    }
  };

  const reblogMenu = [{
    text: intl.formatMessage(status.reblogged ? messages.cancel_reblog_private : messages.reblog),
    action: handleReblogClick,
    icon: require('@phosphor-icons/core/regular/repeat.svg'),
  }, {
    text: intl.formatMessage(messages.quotePost),
    action: handleQuoteClick,
    icon: require('@phosphor-icons/core/regular/quotes.svg'),
  }];

  return (
    <DropdownMenu
      items={reblogMenu}
      disabled={!publicStatus}
      onShiftClick={handleReblogClick}
    >
      {reblogButton}
    </DropdownMenu>
  );
};

const FavouriteButton: React.FC<IActionButton> = ({
  status,
  statusActionButtonTheme,
  me,
  withLabels,
  onOpenUnauthorizedModal,
}) => {
  const features = useFeatures();
  const intl = useIntl();

  const { openModal } = useModalsActions();
  const canFavourite = useCanInteract(status, 'can_favourite');

  const { mutate: favouriteStatus } = useFavouriteStatus(status.id);
  const { mutate: unfavouriteStatus } = useUnfavouriteStatus(status.id);

  const handleFavouriteClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (me) {
      if (status.favourited) {
        unfavouriteStatus();
      } else {
        favouriteStatus(undefined, {
          onSuccess: () => {
            if (canFavourite.approvalRequired) toast.info(messages.favouriteApprovalRequired);
          },
        });
      }
    } else {
      onOpenUnauthorizedModal('FAVOURITE');
    }
  };

  const handleFavouriteLongPress = status.favourites_count ? () => {
    openModal('FAVOURITES', { statusId: status.id });
  } : undefined;

  const favouriteButton = (
    <StatusActionButton
      title={intl.formatMessage(messages.favourite)}
      icon={features.statusDislikes ? require('@phosphor-icons/core/regular/thumbs-up.svg') : require('@phosphor-icons/core/regular/star.svg')}
      filledIcon={features.statusDislikes ? require('@phosphor-icons/core/fill/thumbs-up-fill.svg') : require('@phosphor-icons/core/fill/star-fill.svg')}
      color='accent'
      onClick={handleFavouriteClick}
      onLongPress={handleFavouriteLongPress}
      active={status.favourited}
      count={status.favourites_count}
      text={withLabels ? intl.formatMessage(messages.favourite) : undefined}
      theme={statusActionButtonTheme}
    />
  );

  if (me && !canFavourite.canInteract) return (
    <Popover
      interaction='click'
      content={<InteractionPopover allowed={canFavourite.allowed} type='favourite' />}
    >
      {favouriteButton}
    </Popover>
  );
  return favouriteButton;
};

const DislikeButton: React.FC<IActionButton> = ({
  status,
  statusActionButtonTheme,
  withLabels,
  me,
  onOpenUnauthorizedModal,
}) => {
  const features = useFeatures();
  const intl = useIntl();

  const { openModal } = useModalsActions();

  const { mutate: dislikeStatus } = useDislikeStatus(status.id);
  const { mutate: undislikeStatus } = useUndislikeStatus(status.id);

  if (!features.statusDislikes) return;

  const handleDislikeClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (me) {
      if (status.disliked) {
        undislikeStatus();
      } else {
        dislikeStatus();
      }
    } else {
      onOpenUnauthorizedModal('DISLIKE');
    }
  };

  const handleDislikeLongPress = status.dislikes_count ? () => {
    openModal('DISLIKES', { statusId: status.id });
  } : undefined;

  return (
    <StatusActionButton
      title={intl.formatMessage(messages.disfavourite)}
      icon={require('@phosphor-icons/core/regular/thumbs-down.svg')}
      filledIcon={require('@phosphor-icons/core/fill/thumbs-down-fill.svg')}
      color='accent'
      onClick={handleDislikeClick}
      onLongPress={handleDislikeLongPress}
      active={status.disliked}
      count={status.dislikes_count}
      text={withLabels ? intl.formatMessage(messages.disfavourite) : undefined}
      theme={statusActionButtonTheme}
    />
  );
};

const getLongerWrench = (emojis: Array<CustomEmoji>) => emojis.find(({ shortcode }) => shortcode === 'longestest_wrench') || emojis.find(({ shortcode }) => shortcode === 'longest_wrench');

const WrenchButton: React.FC<IActionButton> = ({
  status,
  statusActionButtonTheme,
  withLabels,
  me,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();

  const { openModal } = useModalsActions();
  const { showWrenchButton } = useSettings();

  const { data: hasLongerWrench } = useCustomEmojis(getLongerWrench);

  if (!me || withLabels || !features.emojiReacts || !showWrenchButton) return;

  const wrenches = showWrenchButton && status.emoji_reactions.find(emoji => emoji.name === '🔧') || undefined;

  const handleWrenchClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (wrenches?.me) {
      dispatch(unEmojiReact(status.id, '🔧'));
    } else {
      dispatch(emojiReact(status.id, '🔧', undefined, intl));
    }
  };

  const handleWrenchLongPress = () => {
    if (features.customEmojiReacts && hasLongerWrench) {
      dispatch(emojiReact(status.id, hasLongerWrench.shortcode, hasLongerWrench.url, intl));
    } else if (wrenches?.count) {
      openModal('REACTIONS', { statusId: status.id, reaction: wrenches.name });
    }
  };

  return (
    <StatusActionButton
      title={intl.formatMessage(messages.wrench)}
      icon={require('@phosphor-icons/core/regular/wrench.svg')}
      filledIcon={require('@phosphor-icons/core/fill/wrench-fill.svg')}
      color='accent'
      onClick={handleWrenchClick}
      onLongPress={handleWrenchLongPress}
      active={wrenches?.me}
      count={wrenches?.count || undefined}
      theme={statusActionButtonTheme}
    />
  );
};

const EmojiPickerButton: React.FC<Omit<IActionButton, 'onOpenUnauthorizedModal'>> = ({
  status,
  statusActionButtonTheme,
  withLabels,
  me,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const features = useFeatures();

  const handlePickEmoji = (emoji: EmojiType) => {
    dispatch(emojiReact(status.id, emoji.custom ? emoji.id : emoji.native, emoji.custom ? emoji.imageUrl : undefined, intl));
  };

  return me && !withLabels && features.emojiReacts && (
    <EmojiPickerDropdown
      onPickEmoji={handlePickEmoji}
      theme={statusActionButtonTheme}
    />
  );
};

interface IMenuButton extends IActionButton {
  expandable?: boolean;
  fromBookmarks?: boolean;
  publicStatus: boolean;
}

const MenuButton: React.FC<IMenuButton> = ({
  status,
  statusActionButtonTheme,
  me,
  expandable,
  fromBookmarks,
  publicStatus,
}) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const match = useRouteMatch<{ groupId: string }>('/groups/:groupId');
  const { boostModal } = useSettings();
  const client = useClient();

  const { fetchTranslation, hideTranslation } = useStatusMetaActions();
  const { targetLanguage } = useStatusMeta(status.id);
  const { openModal } = useModalsActions();
  const { group } = useGroup((status.group as Group)?.id as string);
  const { mutate: blockGroupMember } = useBlockGroupUserMutation(status.group?.id as string, status.account.id);
  const { getOrCreateChatByAccountId } = useChats();
  const { mutate: bookmarkStatus } = useBookmarkStatus(status.id);
  const { mutate: unbookmarkStatus } = useUnbookmarkStatus(status.id);
  const { mutate: pinStatus } = usePinStatus(status?.id!);
  const { mutate: unpinStatus } = useUnpinStatus(status?.id!);

  const { groupRelationship } = useGroupRelationship(status.group_id || undefined);
  const features = useFeatures();
  const instance = useInstance();
  const { autoTranslate, deleteModal, knownLanguages } = useSettings();

  const { translationLanguages } = useTranslationLanguages();
  const { mutate: reblogStatus } = useReblogStatus(status.id);
  const { mutate: unreblogStatus } = useUnreblogStatus(status.id);

  const autoTranslating = useMemo(() => {
    const {
      allow_remote: allowRemote,
      allow_unauthenticated: allowUnauthenticated,
    } = instance.pleroma.metadata.translation;

    const renderTranslate = (me || allowUnauthenticated) && (allowRemote || status.account.local) && ['public', 'unlisted'].includes(status.visibility) && status.content.length > 0 && status.language !== null && !knownLanguages.includes(status.language);
    const supportsLanguages = (translationLanguages[status.language!]?.includes(intl.locale));

    return autoTranslate && features.translations && renderTranslate && supportsLanguages;
  }, [me, status, autoTranslate]);

  const { account } = useOwnAccount();
  const isStaff = account ? account.is_admin || account.is_moderator : false;
  const isAdmin = account ? account.is_admin : false;

  const menu = useMemo(() => {
    const mutingConversation = status.muted;
    const ownAccount = status.account_id === me;
    const { username, local: localAccount } = status.account;

    const handleBookmarkClick: React.EventHandler<React.MouseEvent> = (e) => {
      if (status.bookmarked) unbookmarkStatus();
      else bookmarkStatus(undefined);
    };

    const handleBookmarkFolderClick = () => {
      openModal('SELECT_BOOKMARK_FOLDER', {
        statusId: status.id,
      });
    };

    const doDeleteStatus = (withRedraft = false) => {
      if (!deleteModal) {
        dispatch(deleteStatus(status.id, undefined, withRedraft));
      } else {
        openModal('CONFIRM', {
          heading: intl.formatMessage(withRedraft ? messages.redraftHeading : messages.deleteHeading),
          message: intl.formatMessage(withRedraft ? messages.redraftMessage : messages.deleteMessage),
          confirm: intl.formatMessage(withRedraft ? messages.redraftConfirm : messages.deleteConfirm),
          onConfirm: () => dispatch(deleteStatus(status.id, undefined, withRedraft)),
        });
      }
    };

    const handleDeleteClick: React.EventHandler<React.MouseEvent> = (e) => {
      doDeleteStatus();
    };

    const handleRedraftClick: React.EventHandler<React.MouseEvent> = (e) => {
      doDeleteStatus(true);
    };

    const handleEditClick: React.EventHandler<React.MouseEvent> = () => {
      if (status.event) history.push(`/@${status.account.acct}/events/${status.id}/edit`);
      else dispatch(editStatus(status.id));
    };

    const handlePinClick: React.EventHandler<React.MouseEvent> = (e) => {
      if (status.pinned) unpinStatus();
      else pinStatus();
    };

    const handleReblogClick = (e: React.MouseEvent | React.KeyboardEvent, visibility?: string) => {
      const modalReblog = () => {
        if (status.reblogged) unreblogStatus();
        else reblogStatus(visibility);
      };
      if ((e && e.shiftKey) || !boostModal) {
        modalReblog();
      } else {
        openModal('BOOST', { statusId: status.id, onReblog: modalReblog, visibility });
      }
    };

    const handleMentionClick: React.EventHandler<React.MouseEvent> = (e) => {
      dispatch(mentionCompose(status.account));
    };

    const handleDirectClick: React.EventHandler<React.MouseEvent> = (e) => {
      dispatch(directCompose(status.account));
    };

    const handleChatClick: React.EventHandler<React.MouseEvent> = (e) => {
      const account = status.account;

      getOrCreateChatByAccountId(account.id)
        .then((chat) => history.push(`/chats/${chat.id}`))
        .catch(() => {});
    };

    const handleMuteClick: React.EventHandler<React.MouseEvent> = (e) => {
      openModal('MUTE', { accountId: status.account.id });
    };

    const handleBlockClick: React.EventHandler<React.MouseEvent> = (e) => {
      const account = status.account;

      openModal('CONFIRM', {
        heading: <FormattedMessage id='confirmations.block.heading' defaultMessage='Block @{name}' values={{ name: account.acct }} />,
        message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong className='break-words'>@{account.acct}</strong> }} />,
        confirm: intl.formatMessage(messages.blockConfirm),
        onConfirm: () => dispatch(blockAccount(account.id)),
        secondary: intl.formatMessage(messages.blockAndReport),
        onSecondary: () => {
          dispatch(blockAccount(account.id));
          dispatch(initReport(ReportableEntities.STATUS, account, { status }));
        },
      });
    };

    const handleEmbed = () => {
      openModal('EMBED', {
        url: status.url,
        onError: (error: any) => toast.showAlertForError(error),
      });
    };

    const handleOpenReactionsModal = () => {
      openModal('REACTIONS', { statusId: status.id });
    };

    const handleReport: React.EventHandler<React.MouseEvent> = (e) => {
      dispatch(initReport(ReportableEntities.STATUS, status.account, { status }));
    };

    const handleConversationMuteClick: React.EventHandler<React.MouseEvent> = (e) => {
      dispatch(toggleMuteStatus(status));
    };

    const handleLoadConversationClick = () => {
      client.statuses.loadConversation(status.id)
        .then(() => toast.success(messages.loadConversationSuccess))
        .catch((error) => toast.error(messages.loadConversationError));
    };

    const handleCopy: React.EventHandler<React.MouseEvent> = (e) => {
      const { uri } = status;

      copy(uri);
    };

    const handleShare = () => {
      navigator.share({
        text: status.search_index,
        url: status.uri,
      }).catch((e) => {
        if (e.name !== 'AbortError') console.error(e);
      });
    };

    const handleDeleteStatus: React.EventHandler<React.MouseEvent> = (e) => {
      dispatch(deleteStatusModal(intl, status.id));
    };

    const handleToggleStatusSensitivity: React.EventHandler<React.MouseEvent> = (e) => {
      dispatch(toggleStatusSensitivityModal(intl, status.id, status.sensitive));
    };

    const handleDeleteFromGroup: React.EventHandler<React.MouseEvent> = () => {
      const account = status.account;

      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.deleteHeading),
        message: intl.formatMessage(messages.deleteFromGroupMessage, { name: <strong className='break-words'>{account.username}</strong> }),
        confirm: intl.formatMessage(messages.deleteConfirm),
        onConfirm: () => {
          dispatch(deleteStatus(status.id, group?.id));
        },
      });
    };

    const handleBlockFromGroup = () => {
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.groupBlockFromGroupHeading),
        message: intl.formatMessage(messages.groupBlockFromGroupMessage, { name: status.account.username }),
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
      dispatch(changeSetting(['autoTranslate'], [...knownLanguages, status.language], { showAlert: true }));
    };

    const handleTranslate = () => {
      if (targetLanguage) {
        hideTranslation(status.id);
      } else {
        fetchTranslation(status.id, intl.locale);
      }
    };

    const handleRedactStatus: React.EventHandler<React.MouseEvent> = () => {
      dispatch(redactStatus(status.id));
    };

    const menu: Menu = [];

    if (expandable) {
      menu.push({
        text: intl.formatMessage(messages.open),
        icon: require('@phosphor-icons/core/regular/arrows-vertical.svg'),
        to: `/@${status.account.acct}/posts/${status.id}`,
      });
    }

    if (publicStatus) {
      menu.push({
        text: intl.formatMessage(messages.copy),
        action: handleCopy,
        icon: require('@phosphor-icons/core/regular/clipboard.svg'),
      });

      if ('share' in navigator) {
        menu.push({
          text: intl.formatMessage(messages.share),
          action: handleShare,
          icon: require('@phosphor-icons/core/regular/export.svg'),
        });
      }

      if (features.embeds && localAccount) {
        menu.push({
          text: intl.formatMessage(messages.embed),
          action: handleEmbed,
          icon: require('@phosphor-icons/core/regular/code-simple.svg'),
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
        icon: require('@phosphor-icons/core/regular/smiley.svg'),
      });
    }

    const isGroupStatus = typeof status.group === 'object';

    if (features.bookmarks) {
      menu.push({
        text: intl.formatMessage(status.bookmarked ? messages.unbookmark : messages.bookmark),
        action: handleBookmarkClick,
        icon: status.bookmarked ? require('@phosphor-icons/core/regular/bookmark.svg') : require('@phosphor-icons/core/regular/bookmark-simple.svg'),
      });
    }

    if (features.bookmarkFolders && fromBookmarks) {
      menu.push({
        text: intl.formatMessage(status.bookmark_folder ? messages.bookmarkChangeFolder : messages.bookmarkSetFolder),
        action: handleBookmarkFolderClick,
        icon: require('@phosphor-icons/core/regular/folders.svg'),
      });
    }

    if (features.federating && !localAccount) {
      const { hostname: domain } = new URL(status.uri);
      menu.push({
        text: intl.formatMessage(messages.external, { domain }),
        icon: require('@phosphor-icons/core/regular/arrow-square-out.svg'),
        href: status.uri,
        target: '_blank',
      });
    }

    menu.push(null);

    menu.push({
      text: intl.formatMessage(mutingConversation ? messages.unmuteConversation : messages.muteConversation),
      action: handleConversationMuteClick,
      icon: mutingConversation ? require('@phosphor-icons/core/regular/bell-simple.svg') : require('@phosphor-icons/core/regular/bell-simple-slash.svg'),
    });

    if (!status.in_reply_to_id && features.loadConversation) {
      menu.push({
        text: intl.formatMessage(messages.loadConversation),
        action: handleLoadConversationClick,
        icon: require('@phosphor-icons/core/regular/arrows-clockwise.svg'),
      });
    }

    menu.push(null);

    if (publicStatus && !status.reblogged && features.reblogVisibility) {
      menu.push({
        text: intl.formatMessage(messages.reblog_visibility),
        icon: require('@phosphor-icons/core/regular/repeat.svg'),
        items: [
          {
            text: intl.formatMessage(messages.reblog_visibility_public),
            action: (e) => handleReblogClick(e, 'public'),
            icon: require('@phosphor-icons/core/regular/globe.svg'),
          },
          {
            text: intl.formatMessage(messages.reblog_visibility_unlisted),
            action: (e) => handleReblogClick(e, 'unlisted'),
            icon: require('@phosphor-icons/core/regular/moon.svg'),
          },
          {
            text: intl.formatMessage(messages.reblog_visibility_private),
            action: (e) => handleReblogClick(e, 'private'),
            icon: require('@phosphor-icons/core/regular/lock.svg'),
          },
        ],
      });
    }

    if (ownAccount) {
      if (publicStatus) {
        menu.push({
          text: intl.formatMessage(status.pinned ? messages.unpin : messages.pin),
          action: handlePinClick,
          icon: status.pinned ? require('@phosphor-icons/core/regular/push-pin-slash.svg') : require('@phosphor-icons/core/regular/push-pin.svg'),
        });
      } else {
        if (status.visibility === 'private' || status.visibility === 'mutuals_only') {
          menu.push({
            text: intl.formatMessage(status.reblogged ? messages.cancel_reblog_private : messages.reblog_private),
            action: handleReblogClick,
            icon: require('@phosphor-icons/core/regular/repeat.svg'),
          });
        }
      }

      menu.push({
        text: intl.formatMessage(messages.delete),
        action: handleDeleteClick,
        icon: require('@phosphor-icons/core/regular/trash.svg'),
        destructive: true,
      });
      if (features.editStatuses) {
        menu.push({
          text: intl.formatMessage(messages.edit),
          action: handleEditClick,
          icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.redraft),
          action: handleRedraftClick,
          icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
          destructive: true,
        });
      }
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: username }),
        action: handleMentionClick,
        icon: require('@phosphor-icons/core/regular/at.svg'),
      });

      if (status.account.accepts_chat_messages === true) {
        menu.push({
          text: intl.formatMessage(messages.chat, { name: username }),
          action: handleChatClick,
          icon: require('@phosphor-icons/core/regular/chats-teardrop.svg'),
        });
      } else if (features.privacyScopes) {
        menu.push({
          text: intl.formatMessage(messages.direct, { name: username }),
          action: handleDirectClick,
          icon: require('@phosphor-icons/core/regular/chat-circle.svg'),
        });
      }

      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.mute, { name: username }),
        action: handleMuteClick,
        icon: require('@phosphor-icons/core/regular/speaker-x.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.block, { name: username }),
        action: handleBlockClick,
        icon: require('@phosphor-icons/core/regular/prohibit.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.report, { name: username }),
        action: handleReport,
        icon: require('@phosphor-icons/core/regular/flag.svg'),
      });
    }

    if (autoTranslating) {
      if (targetLanguage) {
        menu.push({
          text: intl.formatMessage(messages.hideTranslation),
          action: handleTranslate,
          icon: require('@phosphor-icons/core/regular/translate.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.translate),
          action: handleTranslate,
          icon: require('@phosphor-icons/core/regular/translate.svg'),
        });
      }

      menu.push({
        text: intl.formatMessage(messages.addKnownLanguage, { language: languages[status.language as 'en'] || status.language }),
        action: handleIgnoreLanguage,
        icon: require('@phosphor-icons/core/regular/flag.svg'),
      });
    }

    if (isGroupStatus && !!status.group) {
      const isGroupOwner = groupRelationship?.role === GroupRoles.OWNER;
      const isGroupAdmin = groupRelationship?.role === GroupRoles.ADMIN;
      // const isStatusFromOwner = group.owner.id === account.id;

      const canBanUser = match?.isExact && (isGroupOwner || isGroupAdmin) && !ownAccount;
      const canDeleteStatus = !ownAccount && (isGroupOwner || isGroupAdmin);

      if (canBanUser || canDeleteStatus) {
        menu.push(null);
      }

      if (canBanUser) {
        menu.push({
          text: 'Ban from Group',
          action: handleBlockFromGroup,
          icon: require('@phosphor-icons/core/regular/prohibit.svg'),
          destructive: true,
        });
      }

      if (canDeleteStatus) {
        menu.push({
          text: intl.formatMessage(messages.groupModDelete),
          action: handleDeleteFromGroup,
          icon: require('@phosphor-icons/core/regular/trash.svg'),
          destructive: true,
        });
      }
    }

    if (isStaff) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: username }),
        to: `/pl-fe/admin/accounts/${status.account_id}`,
        icon: require('@phosphor-icons/core/regular/gavel.svg'),
      });

      if (isAdmin && features.pleromaAdminStatuses) {
        menu.push({
          text: intl.formatMessage(messages.admin_status),
          href: `/pleroma/admin/#/statuses/${status.id}/`,
          icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
        });
      }

      if (features.pleromaAdminStatuses) {
        menu.push({
          text: intl.formatMessage(status.sensitive === false ? messages.markStatusSensitive : messages.markStatusNotSensitive),
          action: handleToggleStatusSensitivity,
          icon: require('@phosphor-icons/core/regular/warning.svg'),
        });
      }

      if (isAdmin && features.pleromaAdminStatusesRedact) {
        menu.push({
          text: intl.formatMessage(messages.redact),
          action: handleRedactStatus,
          icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
          destructive: true,
        });
      }

      if (!ownAccount) {
        menu.push({
          text: intl.formatMessage(messages.deleteStatus),
          action: handleDeleteStatus,
          icon: require('@phosphor-icons/core/regular/trash.svg'),
          destructive: true,
        });
      }
    }

    return menu;
  }, [me, targetLanguage, status.bookmarked, status.muted, status.emoji_reactions.length > 0, status.pinned, status.reblogged]);

  return useMemo(() => (
    <DropdownMenu items={menu}>
      <StatusActionButton
        title={intl.formatMessage(messages.more)}
        icon={require('@phosphor-icons/core/regular/dots-three.svg')}
        theme={statusActionButtonTheme}
      />
    </DropdownMenu>
  ), [menu, statusActionButtonTheme]);
};

interface IStatusActionBar {
  status: SelectedStatus;
  rebloggedBy?: Account;
  withLabels?: boolean;
  expandable?: boolean;
  space?: 'sm' | 'md' | 'lg';
  statusActionButtonTheme?: 'default' | 'inverse';
  fromBookmarks?: boolean;
}

const StatusActionBar: React.FC<IStatusActionBar> = ({
  status,
  withLabels = false,
  expandable,
  space = 'sm',
  statusActionButtonTheme = 'default',
  fromBookmarks = false,
  rebloggedBy,
}) => {

  const { openModal } = useModalsActions();

  const me = useAppSelector(state => state.me);

  const publicStatus = useMemo(() => status ? ['public', 'unlisted', 'group'].includes(status.visibility) : false, [status.visibility]);

  const onContainerClick: React.MouseEventHandler<HTMLDivElement> = useCallback((e) => e.stopPropagation(), []);

  const onOpenUnauthorizedModal = useCallback((action?: UnauthorizedModalAction) => {
    openModal('UNAUTHORIZED', {
      action,
      ap_id: status.url,
    });
  }, []);

  if (!status) {
    return null;
  }

  const spacing: {
    [key: string]: React.ComponentProps<typeof HStack>['space'];
  } = {
    'sm': 2,
    'md': 8,
    'lg': 0, // using justifyContent instead on the HStack
  };

  return (
    <HStack
      justifyContent={space === 'lg' ? 'between' : undefined}
      space={spacing[space]}
      grow={space === 'lg'}
      onClick={onContainerClick}
      alignItems='center'
    >
      <ReplyButton
        status={status}
        statusActionButtonTheme={statusActionButtonTheme}
        withLabels={withLabels}
        me={me}
        onOpenUnauthorizedModal={onOpenUnauthorizedModal}
        rebloggedBy={rebloggedBy}
      />

      <ReblogButton
        status={status}
        statusActionButtonTheme={statusActionButtonTheme}
        withLabels={withLabels}
        me={me}
        onOpenUnauthorizedModal={onOpenUnauthorizedModal}
        publicStatus={publicStatus}
      />

      <FavouriteButton
        status={status}
        statusActionButtonTheme={statusActionButtonTheme}
        withLabels={withLabels}
        me={me}
        onOpenUnauthorizedModal={onOpenUnauthorizedModal}
      />

      <DislikeButton
        status={status}
        statusActionButtonTheme={statusActionButtonTheme}
        withLabels={withLabels}
        me={me}
        onOpenUnauthorizedModal={onOpenUnauthorizedModal}
      />

      <WrenchButton
        status={status}
        statusActionButtonTheme={statusActionButtonTheme}
        withLabels={withLabels}
        me={me}
        onOpenUnauthorizedModal={onOpenUnauthorizedModal}
      />

      <EmojiPickerButton
        status={status}
        statusActionButtonTheme={statusActionButtonTheme}
        withLabels={withLabels}
        me={me}
      />

      <MenuButton
        status={status}
        statusActionButtonTheme={statusActionButtonTheme}
        withLabels={withLabels}
        me={me}
        onOpenUnauthorizedModal={onOpenUnauthorizedModal}
        expandable={expandable}
        fromBookmarks={fromBookmarks}
        publicStatus={publicStatus}
      />
    </HStack>
  );
};

export { StatusActionBar as default };
