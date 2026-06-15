import {
  type QueryClient,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { create } from 'mutative';
import { mediaAttachmentSchema } from 'pl-api';
import * as v from 'valibot';

import { isServo } from '@/features/compose/components/compose-form';
import { useOwnAccount } from '@/hooks/use-own-account';
import { filteredArray } from '@/schemas/utils';
import KVStore from '@/storage/kv-store';
import { useComposeActions } from '@/stores/compose';
import { useSettings } from '@/stores/settings';

import { queryKeys } from '../keys';

const draftStatusSchema = v.pipe(
  v.any(),
  v.transform((draft) => ({
    content_type: draft.contentType,
    draft_id: draft.draftId,
    group_id: draft.groupId,
    in_reply_to: draft.inReplyToId,
    media_attachments: draft.mediaAttachments,
    spoiler_text: draft.spoilerText,
    spoiler_text_map: draft.spoilerTextMap,
    text: draft.text,
    text_map: draft.textMap,
    language: draft.language,
    quote: draft.quoteId,
    ...draft,
  })),
  v.object({
    content_type: v.fallback(v.string(), 'text/plain'),
    draft_id: v.string(),
    editorState: v.fallback(v.nullable(v.string()), null),
    group_id: v.fallback(v.nullable(v.string()), null),
    in_reply_to: v.fallback(v.nullable(v.string()), null),
    media_attachments: filteredArray(mediaAttachmentSchema),
    poll: v.fallback(v.nullable(v.record(v.string(), v.any())), null),
    privacy: v.fallback(v.string(), 'public'),
    quote: v.fallback(v.nullable(v.string()), null),
    schedule: v.fallback(v.nullable(v.string()), null),
    sensitive: v.fallback(v.boolean(), false),
    spoiler_text: v.fallback(v.string(), ''),
    spoiler_text_map: v.fallback(v.nullable(v.record(v.string(), v.string())), null),
    text: v.fallback(v.string(), ''),
    text_map: v.fallback(v.nullable(v.record(v.string(), v.string())), null),
    language: v.fallback(v.string(), ''),
  }),
);

type DraftStatus = v.InferOutput<typeof draftStatusSchema>;

const getDrafts = async (accountUrl: string) => {
  const drafts = (await KVStore.getItem<Array<unknown>>(`drafts:${accountUrl}`)) ?? [];

  return Object.fromEntries(
    Object.values(drafts)
      .map((draft) => v.safeParse(draftStatusSchema, draft).output as DraftStatus)
      .filter((draft) => draft)
      .map((draft) => [draft.draft_id, draft]),
  );
};

const persistDrafts = (accountUrl: string, drafts: Record<string, DraftStatus>) =>
  KVStore.setItem(`drafts:${accountUrl}`, Object.values(drafts));

function useDraftStatusesQuery<T>(
  select: (data: Record<string, DraftStatus>) => T,
): UseQueryResult<T, Error>;
function useDraftStatusesQuery(): UseQueryResult<Record<string, DraftStatus>, Error>;
function useDraftStatusesQuery<T = Record<string, DraftStatus>>(
  select?: (data: Record<string, DraftStatus>) => T,
) {
  const { data: account } = useOwnAccount();

  return useQuery({
    queryKey: queryKeys.draftStatuses.all,
    queryFn: () => getDrafts(account!.url),
    enabled: !!account,
    select,
  });
}

const useDraftStatusQuery = (draftStatusId: string) =>
  useDraftStatusesQuery((data) => data[draftStatusId]);

const useDraftStatusesCountQuery = () =>
  useDraftStatusesQuery((data) => Object.values(data).length);

const usePersistDraftStatus = () => {
  const { data: account } = useOwnAccount();
  const queryClient = useQueryClient();
  const { getCompose } = useComposeActions();
  const { defaultContentType, defaultPrivacy } = useSettings();

  return (composeId: string) => {
    const compose = getCompose(composeId);

    let contentType = compose.contentType;
    if (contentType === 'default') contentType = defaultContentType;
    if (contentType === 'wysiwyg' && !isServo) contentType = 'text/markdown';

    let visibility = compose.visibility;
    if (visibility === 'default') visibility = defaultPrivacy;

    const draft = {
      ...compose,
      content_type: contentType,
      visibility,
      draft_id: compose.draftId ?? crypto.randomUUID(),
    };

    const drafts = queryClient.getQueryData(queryKeys.draftStatuses.all) ?? {};

    const newDrafts: Record<string, DraftStatus> = create(drafts, (oldDrafts) => {
      oldDrafts[draft.draft_id] = v.parse(draftStatusSchema, draft);
    });
    return persistDrafts(account!.url, newDrafts).then(() =>
      queryClient.invalidateQueries({ queryKey: queryKeys.draftStatuses.all }),
    );
  };
};

const cancelDraftStatus = (queryClient: QueryClient, accountUrl: string, draftId: string) => {
  const drafts = queryClient.getQueryData(queryKeys.draftStatuses.all) ?? {};

  const newDrafts: Record<string, DraftStatus> = create(drafts, (oldDrafts) => {
    delete oldDrafts[draftId];
  });
  return persistDrafts(accountUrl, newDrafts).then(() =>
    queryClient.invalidateQueries({ queryKey: queryKeys.draftStatuses.all }),
  );
};

const useCancelDraftStatus = () => {
  const { data: account } = useOwnAccount();
  const queryClient = useQueryClient();

  return (draftId: string) => cancelDraftStatus(queryClient, account!.url, draftId);
};

export {
  draftStatusSchema,
  useDraftStatusesQuery,
  useDraftStatusQuery,
  useDraftStatusesCountQuery,
  usePersistDraftStatus,
  cancelDraftStatus,
  useCancelDraftStatus,
  type DraftStatus,
};
