import type { ChatMessage as BaseChatMessage } from 'pl-api';

const normalizeChatMessage = (
  chatMessage: BaseChatMessage & { pending?: boolean; deleting?: boolean },
) => ({
  type: 'message' as const,
  pending: false,
  deleting: false,
  ...chatMessage,
});

type ChatMessage = ReturnType<typeof normalizeChatMessage>;

export { normalizeChatMessage, type ChatMessage };
