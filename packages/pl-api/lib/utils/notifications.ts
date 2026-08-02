const PLEROMA_TYPES = [
  'chat_mention',
  'emoji_reaction',
  'report',
  'participation_accepted',
  'participation_request',
  'event_reminder',
  'event_update',
  'subscribed_reaction',
];

const fixNotificationTypes = (types: Array<string>) => {
  return [
    ...types,
    ...types.filter((type) => PLEROMA_TYPES.includes(type)).map((type) => `pleroma:${type}`),
  ];
};

const normalizeEmojiReaction: (
  notification: any,
) => { emoji: string; emoji_url: string | null; emoji_static_url: string | null } | undefined = (
  notification,
) => {
  if (typeof notification.reaction === 'object' && notification.reaction !== null) {
    return {
      emoji: notification.reaction.name,
      emoji_url: notification.reaction.url,
      emoji_static_url: notification.reaction.static_url,
    };
  }
};

export { fixNotificationTypes, normalizeEmojiReaction };
