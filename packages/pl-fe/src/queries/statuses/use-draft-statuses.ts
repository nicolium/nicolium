import { type QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { create } from 'mutative';
import { mediaAttachmentSchema } from 'pl-api';
import * as v from 'valibot';

import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useOwnAccount } from '@/hooks/use-own-account';
import { filteredArray } from '@/schemas/utils';
import KVStore from '@/storage/kv-store';
import { APIEntity } from '@/types/entities';

const draftStatusSchema = v.pipe(
  v.any(),
  v.transform((draft) => ({
    content_type: draft.contentType,
    draft_id: draft.draftId,
    group_id: draft.groupId,
    in_reply_to: draft.inReplyTo,
    media_attachments: draft.mediaAttachments,
    spoiler_text: draft.spoilerText,
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
    text: v.fallback(v.string(), ''),
  }),
);

type DraftStatus = v.InferOutput<typeof draftStatusSchema>;

const getDrafts = async (accountUrl: string) => {
  const drafts = (await KVStore.getItem<Array<APIEntity>>(`drafts:${accountUrl}`)) ?? [];

  return Object.fromEntries(
    Object.values(drafts)
      .map((draft) => v.safeParse(draftStatusSchema, draft).output as DraftStatus)
      .filter((draft) => draft)
      .map((draft) => [draft.draft_id, draft]),
  );
};

const persistDrafts = (accountUrl: string, drafts: Record<string, APIEntity>) =>
  KVStore.setItem(`drafts:${accountUrl}`, Object.values(drafts));

const useDraftStatusesQuery = <T>(select?: (data: Record<string, DraftStatus>) => T) => {
  const { data: account } = useOwnAccount();

  return useQuery({
    queryKey: ['draftStatuses'],
    queryFn: () => getDrafts(account!.url),
    enabled: !!account,
    select,
  });
};

const useDraftStatusQuery = (draftStatusId: string) =>
  useDraftStatusesQuery((data) => data[draftStatusId]);

const useDraftStatusesCountQuery = () =>
  useDraftStatusesQuery((data) => Object.values(data).length);

const usePersistDraftStatus = () => {
  const { data: account } = useOwnAccount();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return (composeId: string) => {
    dispatch((_, getState) => {
      const compose = getState().compose[composeId];

      const draft = {
        ...compose,
        draft_id: compose.draftId ?? crypto.randomUUID(),
      };

      const drafts = queryClient.getQueryData<Record<string, DraftStatus>>(['draftStatuses']) ?? {};

      const newDrafts: Record<string, DraftStatus> = create(drafts, (oldDrafts) => {
        oldDrafts[draft.draft_id] = v.parse(draftStatusSchema, draft);
      });
      return persistDrafts(account!.url, newDrafts).then(() =>
        queryClient.invalidateQueries({ queryKey: ['draftStatuses'] }),
      );
    });
  };
};

const cancelDraftStatus = (queryClient: QueryClient, accountUrl: string, draftId: string) => {
  const drafts = queryClient.getQueryData<Record<string, DraftStatus>>(['draftStatuses']) ?? {};

  const newDrafts: Record<string, DraftStatus> = create(drafts, (oldDrafts) => {
    delete oldDrafts[draftId];
  });
  return persistDrafts(accountUrl, newDrafts).then((drafts) =>
    queryClient.invalidateQueries({ queryKey: ['draftStatuses'] }),
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
