import { type ChatMessage as BaseChatMessage, PaginatedResponse } from 'pl-api';

const normalizeChatMessage = (
  chatMessage: BaseChatMessage & { pending?: boolean; deleting?: boolean },
) => ({
  type: 'message' as const,
  pending: false,
  deleting: false,
  ...chatMessage,
});

type ChatMessage = ReturnType<typeof normalizeChatMessage>;

const normalizeChatMessagesList = ({
  previous,
  next,
  items,
  ...response
}: PaginatedResponse<BaseChatMessage>): PaginatedResponse<ChatMessage> =>
  new PaginatedResponse(items.map(normalizeChatMessage), {
    ...response,
    previous: previous ? () => previous().then((res) => normalizeChatMessagesList(res)) : null,
    next: next ? () => next().then((res) => normalizeChatMessagesList(res)) : null,
  });

export { normalizeChatMessage, normalizeChatMessagesList, type ChatMessage };
