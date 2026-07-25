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

export { fixNotificationTypes };
