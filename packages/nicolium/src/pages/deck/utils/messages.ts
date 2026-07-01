import { defineMessages } from 'react-intl';

const messages = defineMessages({
  searchPlaceholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  home: { id: 'column.home', defaultMessage: 'Home' },
  local: { id: 'column.community', defaultMessage: 'Local timeline' },
  federated: { id: 'column.public', defaultMessage: 'Fediverse timeline' },
  bubble: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
  wrenched: { id: 'column.wrenched', defaultMessage: 'Recent wrenches timeline' },
  timeline: { id: 'column.deck.timeline', defaultMessage: 'Timeline' },
  notifications: { id: 'column.notifications', defaultMessage: 'Notifications' },
  account: { id: 'column.account', defaultMessage: 'Profile' },
  search: { id: 'column.search', defaultMessage: 'Search' },
  status: { id: 'column.status', defaultMessage: 'Post' },
  reblogs: { id: 'column.reblogs', defaultMessage: 'Reposts' },
  favourites: { id: 'column.favourites', defaultMessage: 'Likes' },
  dislikes: { id: 'column.dislikes', defaultMessage: 'Dislikes' },
  reactions: { id: 'column.reactions', defaultMessage: 'Reactions' },
  quotes: { id: 'column.quotes', defaultMessage: 'Post quotes' },
  followers: { id: 'column.followers', defaultMessage: 'Followers' },
  following: { id: 'column.following', defaultMessage: 'Following' },
  subscribers: { id: 'column.subscribers', defaultMessage: 'Subscribers' },
  hashtag: { id: 'column.hashtag', defaultMessage: 'Hashtag' },
  remove: { id: 'column.deck.remove', defaultMessage: 'Remove column' },
  shrink: { id: 'column.deck.width.shrink', defaultMessage: 'Shrink column' },
  widen: { id: 'column.deck.width.widen', defaultMessage: 'Widen column' },
  fill: { id: 'column.deck.width.fill', defaultMessage: 'Fill available width' },
  moveLeft: { id: 'column.deck.position.left', defaultMessage: 'Move column left' },
  moveRight: { id: 'column.deck.position.right', defaultMessage: 'Move column right' },
  showPinned: { id: 'column.deck.account.show_pinned', defaultMessage: 'Show pinned posts' },
  addColumn: {
    id: 'column.deck.add_column',
    defaultMessage: 'Add column to deck',
  },
  trendingAccounts: { id: 'deck.columns.trending_accounts', defaultMessage: 'Suggested accounts' },
  trendingStatuses: { id: 'deck.columns.trending_statuses', defaultMessage: 'Trending statuses' },
  trendingHashtags: { id: 'deck.columns.trending_hashtags', defaultMessage: 'Trending hashtags' },
  trendingLinks: { id: 'deck.columns.trending_links', defaultMessage: 'Trending links' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  scheduled: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
  drafts: { id: 'column.draft_statuses', defaultMessage: 'Drafts' },
  chats: { id: 'column.chats', defaultMessage: 'Chats' },
  chatWith: { id: 'column.chat.with', defaultMessage: 'Chat with @{acct}' },
  showAsAccount: { id: 'column.deck.account_switcher.label', defaultMessage: 'Show as account' },
  showAsAccountTitle: {
    id: 'column.deck.account_switcher.title',
    defaultMessage: 'Choose which account this column is shown as',
  },
  drive: { id: 'column.drive', defaultMessage: 'Drive' },
  showReblogs: { id: 'timeline_filters.show_reblogs', defaultMessage: 'Show reposts' },
  showSelfReblogs: {
    id: 'timeline_filters.show_self_reblogs',
    defaultMessage: 'Show self-reposts',
  },
  showReplies: { id: 'timeline_filters.show_replies', defaultMessage: 'Show replies' },
  showQuotes: { id: 'timeline_filters.show_quotes', defaultMessage: 'Show quotes' },
  showDirect: {
    id: 'timeline_filters.show_direct',
    defaultMessage: 'Show direct messages',
  },
  hideNonMedia: {
    id: 'timeline_filters.show_media_only',
    defaultMessage: 'Only show posts with media',
  },
  showMediaWithoutAltText: {
    id: 'timeline_filters.show_media_without_alt_text',
    defaultMessage: 'Show media without description',
  },
  filterReblogs: {
    id: 'column.deck.timeline.heading.reblogs',
    defaultMessage: 'reblogs',
  },
  filterSelfReblogs: {
    id: 'column.deck.timeline.heading.self_reblogs',
    defaultMessage: 'self-reblogs',
  },
  filterReplies: {
    id: 'column.deck.timeline.heading.replies',
    defaultMessage: 'replies',
  },
  filterQuotes: {
    id: 'column.deck.timeline.heading.quotes',
    defaultMessage: 'quotes',
  },
  filterDirect: {
    id: 'column.deck.timeline.heading.direct',
    defaultMessage: 'direct messages',
  },
  filterNonMedia: {
    id: 'column.deck.timeline.heading.non_media',
    defaultMessage: 'posts without media',
  },
  filterMediaWithoutAltText: {
    id: 'column.deck.timeline.heading.media_without_alt_text',
    defaultMessage: 'media without description',
  },
});

export { messages as deckMessages };
