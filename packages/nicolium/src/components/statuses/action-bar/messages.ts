import { defineMessages } from 'react-intl';

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
  interactAs: {
    id: 'status.interact_as',
    defaultMessage: 'Interact from other accounts',
  },
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
  interactAsConfirmationCheckbox: {
    id: 'interact_as_modal.confirmation.checkbox',
    defaultMessage: 'Don’t ask again',
  },
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
  quickReaction: { id: 'status.quick_reaction', defaultMessage: 'React with {emoji}' },
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
});

export { messages as default };
