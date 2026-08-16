import { type QueryClient, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { create } from 'mutative';
import * as v from 'valibot';

import { useOwnAccount } from '@/hooks/use-own-account';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';
import { draftStatusSchema, draftStatusToCompose, type DraftStatus } from '@/schemas/draft-status';
import KVStore from '@/storage/kv-store';
import { useComposeActions } from '@/stores/compose';
import { useSettings } from '@/stores/settings';
import { isServo } from '@/utils/browser';

import { queryKeys } from '../keys';

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

  return useAppQuery({
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
  const { getCompose, getThread, updateCompose } = useComposeActions();
  const { defaultContentType, defaultPrivacy } = useSettings();
  const scopeUrl = useScopeUrl();

  return async (composeId: string) => {
    const buildDraft = (id: string): DraftStatus => {
      const compose = getCompose(id);

      let contentType = compose.contentType;
      if (contentType === 'default') contentType = defaultContentType;
      if (contentType === 'wysiwyg' && !isServo) contentType = 'text/markdown';

      let visibility = compose.visibility;
      if (visibility === 'default') visibility = defaultPrivacy;

      return v.parse(draftStatusSchema, {
        ...compose,
        content_type: contentType,
        visibility,
        draft_id: compose.draftId ?? crypto.randomUUID(),
        children: getThread(id).map(buildDraft),
      });
    };

    const draft = buildDraft(composeId);

    const drafts =
      queryClient.getQueryData(scopedQueryKey(queryKeys.draftStatuses.all, scopeUrl)) ?? {};

    const newDrafts: Record<string, DraftStatus> = create(drafts, (oldDrafts) => {
      oldDrafts[draft.draft_id] = draft;
    });

    await persistDrafts(account!.url, newDrafts).then(() =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.draftStatuses.all, scopeUrl),
      }),
    );

    updateCompose(composeId, (composeDraft) => {
      composeDraft.draftId = draft.draft_id;
    });

    return draft.draft_id;
  };
};

const cancelDraftStatus = (
  queryClient: QueryClient,
  accountUrl: string,
  draftId: string,
  scopeUrl: string,
) => {
  const drafts =
    queryClient.getQueryData(scopedQueryKey(queryKeys.draftStatuses.all, scopeUrl)) ?? {};

  const newDrafts: Record<string, DraftStatus> = create(drafts, (oldDrafts) => {
    delete oldDrafts[draftId];
  });
  return persistDrafts(accountUrl, newDrafts).then(() =>
    queryClient.invalidateQueries({
      queryKey: scopedQueryKey(queryKeys.draftStatuses.all, scopeUrl),
    }),
  );
};

const useCancelDraftStatus = () => {
  const { data: account } = useOwnAccount();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return (draftId: string) => cancelDraftStatus(queryClient, account!.url, draftId, scopeUrl);
};

export {
  draftStatusSchema,
  draftStatusToCompose,
  useDraftStatusesQuery,
  useDraftStatusQuery,
  useDraftStatusesCountQuery,
  usePersistDraftStatus,
  cancelDraftStatus,
  useCancelDraftStatus,
  type DraftStatus,
};
