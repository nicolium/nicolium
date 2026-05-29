import iconBookmarkFill from '@phosphor-icons/core/fill/bookmark-fill.svg';
import iconStarFill from '@phosphor-icons/core/fill/star-fill.svg';
import iconThumbsDownFill from '@phosphor-icons/core/fill/thumbs-down-fill.svg';
import iconThumbsUpFill from '@phosphor-icons/core/fill/thumbs-up-fill.svg';
import iconWrenchFill from '@phosphor-icons/core/fill/wrench-fill.svg';
import iconArrowBendDoubleUpLeft from '@phosphor-icons/core/regular/arrow-bend-double-up-left.svg';
import iconArrowBendUpLeft from '@phosphor-icons/core/regular/arrow-bend-up-left.svg';
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
import iconQuotes from '@phosphor-icons/core/regular/quotes.svg';
import iconRepeat from '@phosphor-icons/core/regular/repeat.svg';
import iconRocketLaunch from '@phosphor-icons/core/regular/rocket-launch.svg';
import iconSmiley from '@phosphor-icons/core/regular/smiley.svg';
import iconSpeakerX from '@phosphor-icons/core/regular/speaker-x.svg';
import iconStar from '@phosphor-icons/core/regular/star.svg';
import iconThumbsDown from '@phosphor-icons/core/regular/thumbs-down.svg';
import iconThumbsUp from '@phosphor-icons/core/regular/thumbs-up.svg';
import iconTranslate from '@phosphor-icons/core/regular/translate.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import iconWarning from '@phosphor-icons/core/regular/warning.svg';
import iconWrench from '@phosphor-icons/core/regular/wrench.svg';
import { useMatch, useNavigate } from '@tanstack/react-router';
import { type Account, type CustomEmoji, GroupRoles } from 'pl-api';
import React, { useCallback, useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { editStatus, toggleMuteStatus, redactStatus } from '@/actions/statuses';
import DropdownMenu from '@/components/dropdown-menu';
import StatusActionButton from '@/components/statuses/status-action-button';
import { useCurrentAccount } from '@/contexts/current-account-context';
import EmojiPickerDropdown from '@/features/emoji/containers/emoji-picker-dropdown-container';
import { useDeleteStatusModal, useToggleStatusSensitivityModal } from '@/hooks/use-admin-modals';
import { useCanInteract } from '@/hooks/use-can-interact';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useTranslate } from '@/hooks/use-translate';
import { languages } from '@/pages/settings/components/preferences';
import { useUnblockAccountMutation } from '@/queries/accounts/use-relationship';
import { useChats } from '@/queries/chats';
import { useGroupQuery } from '@/queries/groups/use-group';
import { useBlockGroupUserMutation } from '@/queries/groups/use-group-blocks';
import { useCustomEmojis } from '@/queries/instance/use-custom-emojis';
import { useTranslationLanguages } from '@/queries/instance/use-translation-languages';
import {
  useDeleteStatus,
  useDeleteStatusFromGroup,
  useStatus,
  type SelectedStatus,
} from '@/queries/statuses/use-status';
import {
  useBookmarkStatus,
  useDislikeStatus,
  useEmojiReactMutation,
  useEmojiUnreactMutation,
  useFavouriteStatus,
  usePinStatus,
  useReblogStatus,
  useUnbookmarkStatus,
  useUndislikeStatus,
  useUnfavouriteStatus,
  useUnpinStatus,
  useUnreblogStatus,
} from '@/queries/statuses/use-status-interactions';
import { layouts } from '@/router';
import { settingsSchema } from '@/schemas/frontend-settings';
import { useComposeActions } from '@/stores/compose';
import { useInstance } from '@/stores/instance';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';
import toast from '@/toast';
import copy from '@/utils/copy';

import GroupPopover from '../groups/popover/group-popover';
import Popover from '../ui/popover';

import type { Menu } from '@/components/dropdown-menu';
import type { Emoji as EmojiType } from '@/features/emoji';
import type { UnauthorizedModalAction } from '@/modals/unauthorized-modal';
import type { Me } from '@/stores/auth';

const messages = defineMessages({
  adminAccount: { id: 'status.admin_account', defaultMessage: 'Moderate @{name}' },
  adminStatus: {
    id: 'status.admin_status',
    defaultMessage: 'Open this post in the moderation interface',
  },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  blocked: { id: 'group.group_mod_block.success', defaultMessage: '@{name} is banned' },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark' },
  bookmarkSetFolder: { id: 'status.bookmark_folder', defaultMessage: 'Set bookmark folder' },
  bookmarkChangeFolder: {
    id: 'status.bookmark_folder_change',
    defaultMessage: 'Change bookmark folder',
  },
  boostConfirm: {
    id: 'confirmations.boost_missing_description.confirm',
    defaultMessage: 'Repost anyway',
  },
  cancelReblogPrivate: { id: 'status.cancel_reblog_private', defaultMessage: 'Un-repost' },
  cannotReblog: { id: 'status.cannot_reblog', defaultMessage: 'This post cannot be reposted' },
  chat: { id: 'status.chat', defaultMessage: 'Chat with @{name}' },
  copy: { id: 'status.copy', defaultMessage: 'Copy link to post' },
  copySuccess: { id: 'status.copy.success', defaultMessage: 'Link to post copied to clipboard' },
  copyStatus: { id: 'status.copy_content', defaultMessage: 'Copy post content' },
  copyStatusSuccess: {
    id: 'status.copy_content.success',
    defaultMessage: 'Post content copied to clipboard',
  },
  deactivateUser: {
    id: 'admin.users.actions.deactivate_user',
    defaultMessage: 'Deactivate @{name}',
  },
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteError: { id: 'status.delete.error', defaultMessage: 'Failed to delete post' },
  deleteFromGroupMessage: {
    id: 'confirmations.delete_from_group.message',
    defaultMessage: 'Are you sure you want to delete @{name}’s post?',
  },
  deleteHeading: { id: 'confirmations.delete.heading', defaultMessage: 'Delete post' },
  deleteMessage: {
    id: 'confirmations.delete.message',
    defaultMessage: 'Are you sure you want to delete this post?',
  },
  deleteStatus: { id: 'admin.statuses.actions.delete_status', defaultMessage: 'Delete post' },
  deleteSuccess: { id: 'status.delete.success', defaultMessage: 'Post deleted' },
  deleteUser: { id: 'admin.users.actions.delete_user', defaultMessage: 'Delete @{name}' },
  direct: { id: 'status.direct', defaultMessage: 'Direct message @{name}' },
  disfavourite: { id: 'status.disfavourite', defaultMessage: 'Dislike' },
  edit: { id: 'status.edit', defaultMessage: 'Edit' },
  embed: { id: 'status.embed', defaultMessage: 'Embed post' },
  external: { id: 'status.external', defaultMessage: 'View post on {domain}' },
  favourite: { id: 'status.favourite', defaultMessage: 'Like' },
  groupBlockConfirm: { id: 'confirmations.block_from_group.confirm', defaultMessage: 'Ban user' },
  groupBlockFromGroupHeading: {
    id: 'confirmations.block_from_group.heading',
    defaultMessage: 'Ban from group',
  },
  groupBlockFromGroupMessage: {
    id: 'confirmations.block_from_group.message',
    defaultMessage: 'Are you sure you want to ban @{name} from the group?',
  },
  groupModDelete: { id: 'status.group_mod_delete', defaultMessage: 'Delete post from group' },
  loadConversation: {
    id: 'status.load_conversation',
    defaultMessage: 'Load conversation from remote server',
  },
  loadConversationError: {
    id: 'status.load_conversation.error',
    defaultMessage: 'Failed to load conversation from a remote server',
  },
  loadConversationSuccess: {
    id: 'status.load_conversation.success',
    defaultMessage: 'Scheduled loading conversation from a remote server',
  },
  markStatusNotSensitive: {
    id: 'admin.statuses.actions.mark_status_not_sensitive',
    defaultMessage: 'Mark post not sensitive',
  },
  markStatusSensitive: {
    id: 'admin.statuses.actions.mark_status_sensitive',
    defaultMessage: 'Mark post sensitive',
  },
  mention: { id: 'status.mention', defaultMessage: 'Mention @{name}' },
  more: { id: 'status.more', defaultMessage: 'More' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  muteConversation: { id: 'status.mute_conversation', defaultMessage: 'Mute conversation' },
  muteConversationSuccess: {
    id: 'status.mute_conversation.success',
    defaultMessage: 'Conversation muted',
  },
  open: { id: 'status.open', defaultMessage: 'Show post details' },
  pin: { id: 'status.pin', defaultMessage: 'Pin on profile' },
  quotePostShort: { id: 'status.quote.short', defaultMessage: 'Quote' },
  quotePost: { id: 'status.quote', defaultMessage: 'Quote post' },
  reblog: { id: 'status.reblog', defaultMessage: 'Repost' },
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
  redact: { id: 'status.redact', defaultMessage: 'Redact' },
  redraft: { id: 'status.redraft', defaultMessage: 'Delete & re-draft' },
  redraftConfirm: { id: 'confirmations.redraft.confirm', defaultMessage: 'Delete & redraft' },
  redraftHeading: { id: 'confirmations.redraft.heading', defaultMessage: 'Delete & redraft' },
  redraftMessage: {
    id: 'confirmations.redraft.message',
    defaultMessage:
      'Are you sure you want to delete this post and re-draft it? Likes and reposts will be lost, and replies to the original post will be orphaned.',
  },
  repliesDisabledGroup: {
    id: 'status.disabled_replies.group_membership',
    defaultMessage: 'Only group members can reply',
  },
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  replyAll: { id: 'status.reply_all', defaultMessage: 'Reply to thread' },
  replyConfirm: { id: 'confirmations.reply.confirm', defaultMessage: 'Reply' },
  replyMessage: {
    id: 'confirmations.reply.message',
    defaultMessage:
      'Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?',
  },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  unbookmark: { id: 'status.unbookmark', defaultMessage: 'Remove bookmark' },
  unmuteConversation: { id: 'status.unmute_conversation', defaultMessage: 'Unmute conversation' },
  unmuteConversationSuccess: {
    id: 'status.unmute_conversation.success',
    defaultMessage: 'Conversation unmuted',
  },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  viewReactions: { id: 'status.view_reactions', defaultMessage: 'View reactions' },
  wrench: { id: 'status.wrench', defaultMessage: 'Wrench reaction' },
  wrenchConfirm: { id: 'confirmations.wrench.confirm', defaultMessage: 'Wrench' },
  addKnownLanguage: {
    id: 'status.add_known_language',
    defaultMessage: 'Do not auto-translate posts in {language}.',
  },
  translate: { id: 'status.translate', defaultMessage: 'Translate' },
  hideTranslation: { id: 'status.hide_translation', defaultMessage: 'Hide translation' },
  downloadModelAndTranslate: {
    id: 'status.translate.download',
    defaultMessage: 'Download model and translate locally',
  },

  favouriteInteractionPolicyHeader: {
    id: 'status.interaction_policy.favourite.header',
    defaultMessage: 'The author limits who can like this post.',
  },
  reblogInteractionPolicyHeader: {
    id: 'status.interaction_policy.reblog.header',
    defaultMessage: 'The author limits who can repost this post.',
  },
  replyInteractionPolicyHeader: {
    id: 'status.interaction_policy.reply.header',
    defaultMessage: 'The author limits who can reply to this post.',
  },
  quoteInteractionPolicyHeader: {
    id: 'status.interaction_policy.quote.header',
    defaultMessage: 'The author limits who can quote this post.',
  },

  favouriteInteractionPolicyFollowers: {
    id: 'status.interaction_policy.favourite.followers_only',
    defaultMessage: 'Only users following the author can like.',
  },
  favouriteInteractionPolicyFollowing: {
    id: 'status.interaction_policy.favourite.following_only',
    defaultMessage: 'Only users followed by the author can like.',
  },
  favouriteInteractionPolicyMutuals: {
    id: 'status.interaction_policy.favourite.mutuals_only',
    defaultMessage: 'Only users mutually following the author can like.',
  },
  favouriteInteractionPolicyMentioned: {
    id: 'status.interaction_policy.favourite.mentioned_only',
    defaultMessage: 'Only users mentioned by the author can like.',
  },

  reblogInteractionPolicyFollowers: {
    id: 'status.interaction_policy.reblog.followers_only',
    defaultMessage: 'Only users following the author can repost.',
  },
  reblogInteractionPolicyFollowing: {
    id: 'status.interaction_policy.reblog.following_only',
    defaultMessage: 'Only users followed by the author can repost.',
  },
  reblogInteractionPolicyMutuals: {
    id: 'status.interaction_policy.reblog.mutuals_only',
    defaultMessage: 'Only users mutually following the author can repost.',
  },
  reblogInteractionPolicyMentioned: {
    id: 'status.interaction_policy.reblog.mentioned_only',
    defaultMessage: 'Only users mentioned by the author can repost.',
  },

  replyInteractionPolicyFollowers: {
    id: 'status.interaction_policy.reply.followers_only',
    defaultMessage: 'Only users following the author can reply.',
  },
  replyInteractionPolicyFollowing: {
    id: 'status.interaction_policy.reply.following_only',
    defaultMessage: 'Only users followed by the author can reply.',
  },
  replyInteractionPolicyMutuals: {
    id: 'status.interaction_policy.reply.mutuals_only',
    defaultMessage: 'Only users mutually following the author can reply.',
  },
  replyInteractionPolicyMentioned: {
    id: 'status.interaction_policy.reply.mentioned_only',
    defaultMessage: 'Only users mentioned by the author can reply.',
  },

  quoteInteractionPolicyFollowers: {
    id: 'status.interaction_policy.quote.followers_only',
    defaultMessage: 'Only users following the author can quote.',
  },
  quoteInteractionPolicyFollowing: {
    id: 'status.interaction_policy.quote.following_only',
    defaultMessage: 'Only users followed by the author can quote.',
  },
  quoteInteractionPolicyMutuals: {
    id: 'status.interaction_policy.quote.mutuals_only',
    defaultMessage: 'Only users mutually following the author can quote.',
  },
  quoteInteractionPolicyMentioned: {
    id: 'status.interaction_policy.quote.mentioned_only',
    defaultMessage: 'Only users mentioned by the author can quote.',
  },

  favouriteApprovalRequired: {
    id: 'status.interaction_policy.favourite.approval_required',
    defaultMessage: 'The author needs to approve your like.',
  },
  reblogApprovalRequired: {
    id: 'status.interaction_policy.reblog.approval_required',
    defaultMessage: 'The author needs to approve your repost.',
  },
});

const STATUS_ACTIONS = settingsSchema.entries.statusActionBarItems.item.options;

interface IInteractionPopover {
  type: 'favourite' | 'reblog' | 'reply' | 'quote';
  allowed: ReturnType<typeof useCanInteract>['allowed'];
}

const INTERACTION_POLICY_HEADERS = {
  favourite: messages.favouriteInteractionPolicyHeader,
  reblog: messages.reblogInteractionPolicyHeader,
  reply: messages.replyInteractionPolicyHeader,
  quote: messages.quoteInteractionPolicyHeader,
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
  quote: {
    followers: messages.quoteInteractionPolicyFollowers,
    following: messages.quoteInteractionPolicyFollowing,
    mutuals: messages.quoteInteractionPolicyMutuals,
    mentioned: messages.quoteInteractionPolicyMentioned,
  },
};

const InteractionPopover: React.FC<IInteractionPopover> = ({ type, allowed }) => {
  const intl = useIntl();

  const allowedType = allowed?.includes('followers')
    ? 'followers'
    : allowed?.includes('following')
      ? 'following'
      : allowed?.includes('mutuals')
        ? 'mutuals'
        : 'mentioned';

  return (
    <div className='interaction-popover'>
      <p className='interaction-popover__header'>
        {intl.formatMessage(INTERACTION_POLICY_HEADERS[type])}
      </p>
      <p className='interaction-popover__description'>
        {intl.formatMessage(INTERACTION_POLICY_DESCRIPTIONS[type][allowedType])}
      </p>
    </div>
  );
};

interface IActionButton extends Pick<IStatusActionBar, 'status' | 'withLabels'> {
  me: Me;
  onOpenUnauthorizedModal: (action?: UnauthorizedModalAction) => void;
}

interface IReplyButton extends IActionButton {
  rebloggedBy?: Account;
}

const ReplyButton: React.FC<IReplyButton> = ({
  status,
  withLabels,
  me,
  onOpenUnauthorizedModal,
  rebloggedBy,
}) => {
  const { replyCompose } = useComposeActions();
  const intl = useIntl();

  const canReply = useCanInteract(status, 'can_reply');
  const { data: group } = useGroupQuery(status.group_id ?? undefined, true);

  let replyTitle;
  let replyDisabled = false;

  if (group?.membership_required && !group.relationship?.member) {
    replyDisabled = true;
    replyTitle = intl.formatMessage(messages.repliesDisabledGroup);
  }

  if (!status.in_reply_to_id) {
    replyTitle = intl.formatMessage(messages.reply);
  } else {
    replyTitle = intl.formatMessage(messages.replyAll);
  }

  const handleReplyClick: React.MouseEventHandler = () => {
    if (me) {
      replyCompose(status, rebloggedBy, canReply.approvalRequired ?? false);
    } else {
      onOpenUnauthorizedModal('REPLY');
    }
  };

  const replyButton = (
    <StatusActionButton
      title={replyTitle}
      icon={status.in_reply_to_id ? iconArrowBendDoubleUpLeft : iconArrowBendUpLeft}
      onClick={handleReplyClick}
      count={status.replies_count}
      text={withLabels ? intl.formatMessage(messages.reply) : undefined}
      disabled={replyDisabled}
    />
  );

  if (me && !canReply.canInteract)
    return (
      <Popover
        interaction='click'
        content={<InteractionPopover allowed={canReply.allowed} type='reply' />}
      >
        {replyButton}
      </Popover>
    );

  return group ? (
    <GroupPopover group={group} isEnabled={replyDisabled}>
      {replyButton}
    </GroupPopover>
  ) : (
    replyButton
  );
};

interface IReblogButton extends IActionButton {
  publicStatus: boolean;
  withQuote: boolean;
}

const ReblogButton: React.FC<IReblogButton> = ({
  status,
  withLabels,
  me,
  onOpenUnauthorizedModal,
  publicStatus,
  withQuote,
}) => {
  const { quoteCompose } = useComposeActions();
  const features = useFeatures();
  const intl = useIntl();

  const { boostModal, missingDescriptionBoostModal, useRocketIconForReblogs } = useSettings();
  const { openModal } = useModalsActions();
  const canReblog = useCanInteract(status, 'can_reblog');
  const canQuote = useCanInteract(status, 'can_quote');

  const { mutate: reblogStatus } = useReblogStatus(status.id);
  const { mutate: unreblogStatus } = useUnreblogStatus(status.id);

  let reblogIcon = useRocketIconForReblogs ? iconRocketLaunch : iconRepeat;

  if (status.visibility === 'direct') {
    reblogIcon = iconAt;
  } else if (status.visibility === 'private' || status.visibility === 'mutuals_only') {
    reblogIcon = iconLock;
  }

  const handleReblogClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (me) {
      const attachments = status.media_attachments.filter(
        (attachment) => attachment.type !== 'unknown',
      );

      const hasMissingDescriptions = attachments.some((attachment) => !attachment.description);

      const hasFilenameDescriptions = attachments.some((attachment) => {
        const extension = (attachment.remote_url || attachment.url).split('.').pop()?.toLowerCase();
        return attachment.description.trim().endsWith(`.${extension}`);
      });

      const doReblog = (visibility?: string, scheduledAt?: string) => {
        if (status.reblogged) {
          unreblogStatus();
        } else {
          reblogStatus(
            { visibility, scheduledAt },
            {
              onSuccess: () => {
                if (canReblog.approvalRequired) toast.info(messages.reblogApprovalRequired);
              },
            },
          );
        }
      };

      if (missingDescriptionBoostModal && (hasMissingDescriptions || hasFilenameDescriptions)) {
        openModal('CONFIRM', {
          heading: (
            <FormattedMessage
              id='confirmations.boost_missing_description.heading'
              defaultMessage='Reposting a post with missing description'
            />
          ),
          message: (
            <>
              {hasMissingDescriptions && (
                <FormattedMessage
                  id='confirmations.boost_missing_description.message'
                  defaultMessage='The post does not have a description for all attachments. Do you want to repost it anyway?'
                />
              )}
              {hasFilenameDescriptions && (
                <FormattedMessage
                  id='confirmations.boost_missing_description.filename_warning'
                  defaultMessage="One or more attachments likely has a filename (e.g. 'image.jpg') as its description instead of meaningful alt text. Do you want to repost it anyway?"
                />
              )}
            </>
          ),
          confirm: intl.formatMessage(messages.boostConfirm),
          onConfirm: doReblog,
        });
      } else if ((e && e.shiftKey) || !boostModal) {
        doReblog();
      } else {
        openModal('BOOST', { statusId: status.id, onReblog: doReblog });
      }
    } else {
      onOpenUnauthorizedModal('REBLOG');
    }
  };

  const handleReblogLongPress = status.reblogs_count
    ? () => {
        openModal('REBLOGS', { statusId: status.id });
      }
    : undefined;

  const reblogButton = (
    <StatusActionButton
      className='status-action-bar__button--reblog'
      icon={reblogIcon}
      disabled={!publicStatus}
      title={
        !publicStatus
          ? intl.formatMessage(messages.cannotReblog)
          : intl.formatMessage(messages.reblog)
      }
      active={status.reblogged}
      onClick={handleReblogClick}
      onLongPress={handleReblogLongPress}
      count={status.reblogs_count + (withQuote ? status.quotes_count : 0)}
      text={withLabels ? intl.formatMessage(messages.reblog) : undefined}
    />
  );

  if (me && !canReblog.canInteract)
    return (
      <Popover
        interaction='click'
        content={<InteractionPopover allowed={canReblog.allowed} type='reblog' />}
      >
        {reblogButton}
      </Popover>
    );

  if (!features.quotePosts || !me || !withQuote) return reblogButton;

  const handleQuoteClick: React.EventHandler<React.MouseEvent> = () => {
    if (me) {
      quoteCompose(status, canQuote.approvalRequired || false);
    } else {
      onOpenUnauthorizedModal('REBLOG');
    }
  };

  const reblogMenu = [
    {
      text: intl.formatMessage(status.reblogged ? messages.cancelReblogPrivate : messages.reblog),
      action: handleReblogClick,
      icon: useRocketIconForReblogs ? iconRocketLaunch : iconRepeat,
    },
    {
      text: intl.formatMessage(messages.quotePost),
      action: handleQuoteClick,
      icon: iconQuotes,
      disabled: !canQuote.canInteract,
    },
  ];

  return (
    <DropdownMenu
      items={reblogMenu}
      disabled={!publicStatus}
      onShiftClick={handleReblogClick}
      forceDropdown
    >
      {reblogButton}
    </DropdownMenu>
  );
};

const FavouriteButton: React.FC<IActionButton> = ({
  status,
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

  const handleFavouriteClick: React.EventHandler<React.MouseEvent> = () => {
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

  const handleFavouriteLongPress = status.favourites_count
    ? () => {
        openModal('FAVOURITES', { statusId: status.id });
      }
    : undefined;

  const favouriteButton = (
    <StatusActionButton
      title={intl.formatMessage(messages.favourite)}
      icon={features.statusDislikes ? iconThumbsUp : iconStar}
      filledIcon={features.statusDislikes ? iconThumbsUpFill : iconStarFill}
      onClick={handleFavouriteClick}
      onLongPress={handleFavouriteLongPress}
      active={status.favourited}
      count={status.favourites_count}
      text={withLabels ? intl.formatMessage(messages.favourite) : undefined}
    />
  );

  if (me && !canFavourite.canInteract)
    return (
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

  const handleDislikeClick: React.EventHandler<React.MouseEvent> = () => {
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

  const handleDislikeLongPress = status.dislikes_count
    ? () => {
        openModal('DISLIKES', { statusId: status.id });
      }
    : undefined;

  return (
    <StatusActionButton
      title={intl.formatMessage(messages.disfavourite)}
      icon={iconThumbsDown}
      filledIcon={iconThumbsDownFill}
      onClick={handleDislikeClick}
      onLongPress={handleDislikeLongPress}
      active={status.disliked}
      count={status.dislikes_count}
      text={withLabels ? intl.formatMessage(messages.disfavourite) : undefined}
    />
  );
};

const getLongerWrench = (emojis: Array<CustomEmoji>) =>
  emojis.find(({ shortcode }) => shortcode === 'longestest_wrench') ??
  emojis.find(({ shortcode }) => shortcode === 'longest_wrench');

const WrenchButton: React.FC<IActionButton> = ({ status, withLabels, me }) => {
  const intl = useIntl();
  const features = useFeatures();

  const { openModal } = useModalsActions();
  const { wrenchModal } = useSettings();

  const { mutate: emojiReact } = useEmojiReactMutation(status.id);
  const { mutate: emojiUnreact } = useEmojiUnreactMutation(status.id);

  const { data: hasLongerWrench } = useCustomEmojis(getLongerWrench);

  if (!me || withLabels || !features.emojiReacts) return;

  const wrenches = status.emoji_reactions.find((emoji) => emoji.name === '🔧') ?? undefined;

  const checkConfirmation = (callback: () => void) => {
    if (wrenchModal) {
      openModal('CONFIRM', {
        heading: (
          <FormattedMessage id='confirmations.wrench.heading' defaultMessage='Wrench the post' />
        ),
        message: (
          <FormattedMessage
            id='confirmations.wrench.message'
            defaultMessage='Are you sure you want to wrench this post? This can have disastrous consequences.'
          />
        ),
        confirm: intl.formatMessage(messages.wrenchConfirm),
        onConfirm: callback,
      });
    } else {
      callback();
    }
  };

  const handleWrenchClick: React.EventHandler<React.MouseEvent> = () => {
    if (wrenches?.me) {
      emojiUnreact('🔧');
    } else {
      checkConfirmation(() => emojiReact('🔧'));
    }
  };

  const handleWrenchLongPress = () => {
    if (features.customEmojiReacts && hasLongerWrench) {
      checkConfirmation(() => emojiReact(hasLongerWrench.shortcode));
    } else if (wrenches?.count) {
      openModal('REACTIONS', { statusId: status.id, reaction: wrenches.name });
    }
  };

  return (
    <StatusActionButton
      title={intl.formatMessage(messages.wrench)}
      icon={iconWrench}
      filledIcon={iconWrenchFill}
      onClick={handleWrenchClick}
      onLongPress={handleWrenchLongPress}
      active={wrenches?.me}
      count={wrenches?.count ?? undefined}
    />
  );
};

const EmojiPickerButton: React.FC<Omit<IActionButton, 'onOpenUnauthorizedModal'>> = ({
  status,
  withLabels,
  me,
}) => {
  const features = useFeatures();

  const { mutate: emojiReact } = useEmojiReactMutation(status.id);

  const handlePickEmoji = (emoji: EmojiType) => {
    emojiReact(emoji.custom ? emoji.id : emoji.native);
  };

  return (
    me &&
    !withLabels &&
    features.emojiReacts && <EmojiPickerDropdown onPickEmoji={handlePickEmoji} />
  );
};

const BookmarkButton: React.FC<IActionButton> = ({ status, me }) => {
  const { openModal } = useModalsActions();
  const features = useFeatures();
  const intl = useIntl();

  const { mutate: bookmarkStatus } = useBookmarkStatus(status.id);
  const { mutate: unbookmarkStatus } = useUnbookmarkStatus(status.id);

  const handleBookmarkClick: React.EventHandler<React.MouseEvent> = () => {
    if (status.bookmarked) unbookmarkStatus();
    else bookmarkStatus(undefined);
  };

  const handleBookmarkLongPress = () => {
    openModal('SELECT_BOOKMARK_FOLDER', {
      statusId: status.id,
    });
  };

  return (
    <StatusActionButton
      title={intl.formatMessage(messages.bookmark)}
      icon={iconBookmarkSimple}
      filledIcon={iconBookmarkFill}
      onClick={handleBookmarkClick}
      onLongPress={
        status.bookmarked && features.bookmarkFolders ? handleBookmarkLongPress : undefined
      }
      active={status.bookmarked}
      disabled={!me}
    />
  );
};

const QuoteButton: React.FC<IActionButton> = ({
  status,
  withLabels,
  me,
  onOpenUnauthorizedModal,
}) => {
  const { quoteCompose } = useComposeActions();
  const features = useFeatures();
  const intl = useIntl();

  const canQuote = useCanInteract(status, 'can_quote');

  if (!features.quotePosts) return;

  const handleQuoteClick: React.EventHandler<React.MouseEvent> = () => {
    if (me) {
      quoteCompose(status, canQuote.approvalRequired || false);
    } else {
      onOpenUnauthorizedModal('REBLOG');
    }
  };

  const quoteButton = (
    <StatusActionButton
      title={intl.formatMessage(messages.quotePost)}
      icon={iconQuotes}
      onClick={handleQuoteClick}
      count={status.quotes_count}
      text={withLabels ? intl.formatMessage(messages.quotePostShort) : undefined}
    />
  );

  if (me && !canQuote.canInteract) {
    return (
      <Popover
        interaction='click'
        content={<InteractionPopover allowed={canQuote.allowed} type='quote' />}
      >
        {quoteButton}
      </Popover>
    );
  }

  return quoteButton;
};

const ShareButton: React.FC<IActionButton> = ({ status }) => {
  const intl = useIntl();

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

  if (!('share' in navigator)) return null;

  return (
    <StatusActionButton
      title={intl.formatMessage(messages.share)}
      icon={iconExport}
      onClick={handleShare}
    />
  );
};

const TranslateButton: React.FC<IActionButton> = ({ status }) => {
  const intl = useIntl();
  const translateInformation = useTranslate(status);
  if (!translateInformation) return null;

  const { translate, state } = translateInformation;

  let title;

  switch (state) {
    case 'translated':
      title = intl.formatMessage(messages.hideTranslation);
      break;
    case 'translatable':
    case 'translating':
      title = intl.formatMessage(messages.translate);
      break;
    case 'downloadable':
      title = intl.formatMessage(messages.downloadModelAndTranslate);
      break;
    case 'downloading':
      title = intl.formatMessage(messages.loadConversation);
      break;
  }

  return (
    <StatusActionButton
      title={title}
      icon={iconTranslate}
      onClick={translate}
      loading={state === 'translating' || state === 'downloading'}
      active={state === 'translated'}
    />
  );
};

const useItems = (
  items: Array<(typeof STATUS_ACTIONS)[number]>,
  status: SelectedStatus | undefined,
  withLabels: boolean,
  rebloggedBy?: Account,
) => {
  const features = useFeatures();
  const { openModal } = useModalsActions();
  const me = useCurrentAccount();

  const publicStatus = useMemo(
    () => (status ? ['public', 'unlisted', 'group'].includes(status.visibility) : false),
    [status?.visibility],
  );

  const onOpenUnauthorizedModal = useCallback((action?: UnauthorizedModalAction) => {
    openModal('UNAUTHORIZED', {
      action,
      ap_id: status!.url,
    });
  }, []);

  return useMemo(() => {
    const renderedItems: React.ReactNode[] = [];

    if (!status) return renderedItems;

    for (const item of items) {
      switch (item) {
        case 'reply':
          renderedItems.push(
            <ReplyButton
              key='reply'
              status={status}
              withLabels={withLabels}
              me={me}
              onOpenUnauthorizedModal={onOpenUnauthorizedModal}
              rebloggedBy={rebloggedBy}
            />,
          );
          break;
        case 'reblog':
          renderedItems.push(
            <ReblogButton
              key='reblog'
              status={status}
              withLabels={withLabels}
              me={me}
              onOpenUnauthorizedModal={onOpenUnauthorizedModal}
              publicStatus={publicStatus}
              withQuote={!items.includes('quote')}
            />,
          );
          break;
        case 'favourite':
          renderedItems.push(
            <FavouriteButton
              key='favourite'
              status={status}
              withLabels={withLabels}
              me={me}
              onOpenUnauthorizedModal={onOpenUnauthorizedModal}
            />,
          );
          break;
        case 'dislike':
          if (features.statusDislikes) {
            renderedItems.push(
              <DislikeButton
                key='dislike'
                status={status}
                withLabels={withLabels}
                me={me}
                onOpenUnauthorizedModal={onOpenUnauthorizedModal}
              />,
            );
          }
          break;
        case 'wrench':
          if (features.emojiReacts) {
            renderedItems.push(
              <WrenchButton
                key='wrench'
                status={status}
                withLabels={withLabels}
                me={me}
                onOpenUnauthorizedModal={onOpenUnauthorizedModal}
              />,
            );
          }
          break;
        case 'reaction':
          if (features.emojiReacts) {
            renderedItems.push(
              <EmojiPickerButton key='emoji' status={status} withLabels={withLabels} me={me} />,
            );
          }
          break;
        case 'bookmark':
          if (features.bookmarks) {
            renderedItems.push(
              <BookmarkButton
                key='bookmark'
                status={status}
                withLabels={withLabels}
                me={me}
                onOpenUnauthorizedModal={onOpenUnauthorizedModal}
              />,
            );
          }
          break;
        case 'quote':
          if (features.quotePosts) {
            renderedItems.push(
              <QuoteButton
                key='quote'
                status={status}
                withLabels={withLabels}
                me={me}
                onOpenUnauthorizedModal={onOpenUnauthorizedModal}
              />,
            );
          }
          break;
        case 'share':
          renderedItems.push(
            <ShareButton
              key='share'
              status={status}
              me={me}
              onOpenUnauthorizedModal={onOpenUnauthorizedModal}
            />,
          );
          break;
        case 'translate':
          renderedItems.push(
            <TranslateButton
              key='translate'
              status={status}
              me={me}
              onOpenUnauthorizedModal={onOpenUnauthorizedModal}
            />,
          );
          break;
        default:
          break;
      }
    }

    return renderedItems;
  }, [items, status, withLabels, me, onOpenUnauthorizedModal]);
};

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
      if (['wrench', 'bookmark', 'share', 'translate'].includes(action)) return false;
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
  const { boostModal, useRocketIconForReblogs } = useSettings();
  const client = useClient();

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
  const { autoTranslate, deleteModal, knownLanguages, statusActionBarItems } = useSettings();

  const { data: translationLanguages = {} } = useTranslationLanguages();
  const { mutate: reblogStatus } = useReblogStatus(status.id);
  const { mutate: unreblogStatus } = useUnreblogStatus(status.id);

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
      else editStatus(client, status.id);
    };

    const handlePinClick: React.EventHandler<React.MouseEvent> = () => {
      if (status.pinned) unpinStatus();
      else pinStatus();
    };

    const handleReblogClick = (e: React.MouseEvent | React.KeyboardEvent, visibility?: string) => {
      const modalReblog = (_?: string, scheduledAt?: string) => {
        if (status.reblogged) unreblogStatus();
        else reblogStatus({ visibility, scheduledAt });
      };
      if ((e && e.shiftKey) || !boostModal) {
        modalReblog();
      } else {
        openModal('BOOST', { statusId: status.id, onReblog: modalReblog, visibility });
      }
    };

    const handleMentionClick: React.EventHandler<React.MouseEvent> = () => {
      mentionCompose(status.account);
    };

    const handleDirectClick: React.EventHandler<React.MouseEvent> = () => {
      directCompose(status.account);
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
      openModal('REACTIONS', { statusId: status.id });
    };

    const handleReport: React.EventHandler<React.MouseEvent> = () => {
      openModal('REPORT', { accountId: status.account.id, statusIds: [status.id] });
    };

    const handleConversationMuteClick: React.EventHandler<React.MouseEvent> = () => {
      toggleMuteStatus(client, status).then(() => {
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
          name: <strong className='break-words'>{account.username}</strong>,
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
      redactStatus(client, status.id);
    };

    const menu: Menu = [];

    if (expandable) {
      menu.push({
        text: intl.formatMessage(messages.open),
        icon: iconArrowsVertical,
        to: '/@{$username}/posts/$statusId',
        params: { username: status.account.acct, statusId: status.id },
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

    if (features.federating && !localAccount) {
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
              handleReblogClick(e, 'public');
            },
            icon: iconGlobe,
          },
          {
            text: intl.formatMessage(messages.reblogVisibilityUnlisted),
            action: (e) => {
              handleReblogClick(e, 'unlisted');
            },
            icon: iconMoon,
          },
          {
            text: intl.formatMessage(messages.reblogVisibilityPrivate),
            action: (e) => {
              handleReblogClick(e, 'private');
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
          action: handleReblogClick,
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
      // const isStatusFromOwner = group.owner.id === account.id;

      const canBanUser = match && (isGroupOwner || isGroupAdmin) && !ownAccount;
      const canDeleteStatus = !ownAccount && (isGroupOwner || isGroupAdmin);

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

interface IStatusActionBar {
  status: SelectedStatus;
  rebloggedBy?: Account;
  withLabels?: boolean;
  expandable?: boolean;
  space?: 'sm' | 'md' | 'lg';
  fromBookmarks?: boolean;
}

const StatusActionBar: React.FC<IStatusActionBar> = ({
  status,
  withLabels = false,
  expandable,
  space = 'sm',
  fromBookmarks = false,
  rebloggedBy,
}) => {
  const { openModal } = useModalsActions();
  const { statusActionBarItems } = useSettings();

  const me = useCurrentAccount();

  const publicStatus = useMemo(
    () => (status ? ['public', 'unlisted', 'group'].includes(status.visibility) : false),
    [status.visibility],
  );

  const onContainerClick: React.MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const onOpenUnauthorizedModal = useCallback((action?: UnauthorizedModalAction) => {
    openModal('UNAUTHORIZED', {
      action,
      ap_id: status.url,
    });
  }, []);

  const items = useItems(statusActionBarItems, status, withLabels, rebloggedBy);

  if (!status || !status.account) {
    return null;
  }

  return (
    <div className={`status-action-bar status-action-bar--${space}`} onClick={onContainerClick}>
      {items}

      <MenuButton
        status={status}
        withLabels={withLabels}
        me={me}
        onOpenUnauthorizedModal={onOpenUnauthorizedModal}
        expandable={expandable}
        fromBookmarks={fromBookmarks}
        publicStatus={publicStatus}
        rebloggedBy={rebloggedBy}
      />
    </div>
  );
};

export { StatusActionBar as default };
