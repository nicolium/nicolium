import { interactionPolicySchema, locationSchema, mediaAttachmentSchema } from 'pl-api';
import * as v from 'valibot';

import { filteredArray } from '@/schemas/utils';

import type { Compose, RestoredDraft } from '@/stores/compose';

const preprocess = (draft: any) => {
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return draft;

  return {
    ...draft,
    content_type: draft.content_type ?? draft.contentType,
    contentType:
      draft.contentType ??
      (draft.content_type === 'text/markdown' &&
      (Boolean(draft.editorState) || Object.values(draft.editorStateMap ?? {}).some(Boolean))
        ? 'wysiwyg'
        : draft.content_type),
    draft_id: draft.draft_id ?? draft.draftId,
    group_id: draft.group_id ?? draft.groupId,
    edited_id: draft.edited_id ?? draft.editedId,
    in_reply_to: draft.in_reply_to ?? draft.inReplyToId,
    media_attachments: draft.media_attachments ?? draft.mediaAttachments,
    privacy: draft.visibility ?? draft.privacy,
    schedule: (() => {
      const schedule = draft.scheduledAt ?? draft.schedule;
      return schedule instanceof Date && !Number.isNaN(schedule.getTime())
        ? schedule.toISOString()
        : schedule;
    })(),
    spoiler_text: draft.spoiler_text ?? draft.spoilerText,
    spoiler_text_map: draft.spoiler_text_map ?? draft.spoilerTextMap,
    text_map: draft.text_map ?? draft.textMap,
    quote: draft.quote ?? draft.quoteId,
  };
};

const baseDraftStatusSchema = v.object({
  content_type: v.fallback(v.string(), 'text/plain'),
  contentType: v.optional(v.string()),
  draft_id: v.string(),
  editorState: v.fallback(v.nullable(v.string()), null),
  editorStateMap: v.fallback(v.nullable(v.record(v.string(), v.nullable(v.string()))), null),
  group_id: v.fallback(v.nullable(v.string()), null),
  edited_id: v.fallback(v.nullable(v.string()), null),
  in_reply_to: v.fallback(v.nullable(v.string()), null),
  media_attachments: filteredArray(mediaAttachmentSchema),
  poll: v.fallback(v.nullable(v.record(v.string(), v.any())), null),
  privacy: v.fallback(v.string(), 'public'),
  quote: v.fallback(v.nullable(v.string()), null),
  schedule: v.fallback(v.nullable(v.string()), null),
  location: v.fallback(v.nullable(locationSchema), null),
  interactionPolicy: v.fallback(v.nullable(interactionPolicySchema), null),
  quoteApprovalPolicy: v.fallback(v.nullable(v.picklist(['public', 'followers', 'nobody'])), null),
  localOnly: v.fallback(v.boolean(), false),
  sensitive: v.fallback(v.boolean(), false),
  spoiler_text: v.fallback(v.string(), ''),
  spoiler_text_map: v.fallback(v.nullable(v.record(v.string(), v.string())), null),
  text: v.fallback(v.string(), ''),
  text_map: v.fallback(v.nullable(v.record(v.string(), v.string())), null),
  language: v.fallback(v.nullable(v.string()), null),
  to: v.fallback(v.array(v.string()), []),
  parentRebloggedById: v.fallback(v.nullable(v.string()), null),
  sourceInReplyToId: v.fallback(v.nullable(v.tuple([v.string(), v.string()])), null),
  sourceQuoteId: v.fallback(v.nullable(v.tuple([v.string(), v.string()])), null),
  sourceParentRebloggedById: v.fallback(v.nullable(v.tuple([v.string(), v.string()])), null),
  modifiedLanguage: v.fallback(v.nullable(v.string()), null),
  approvalRequired: v.fallback(v.boolean(), false),
  suggestedLanguage: v.fallback(v.nullable(v.string()), null),
  redacting: v.fallback(v.boolean(), false),
  redactingOverwrite: v.fallback(v.boolean(), false),
});

type DraftStatus = v.InferOutput<typeof baseDraftStatusSchema> & {
  children: Array<DraftStatus>;
};

const draftStatusSchema: v.BaseSchema<any, DraftStatus, v.BaseIssue<unknown>> = v.pipe(
  v.any(),
  v.transform(preprocess),
  v.object({
    ...baseDraftStatusSchema.entries,
    children: filteredArray(v.lazy(() => draftStatusSchema)),
  }),
);
const draftStatusToCompose = (draft: DraftStatus): RestoredDraft => ({
  editorState: draft.editorState,
  editorStateMap: draft.editorStateMap ?? {},
  spoilerText: draft.spoiler_text,
  spoilerTextMap: draft.spoiler_text_map ?? {},
  text: draft.text,
  textMap: draft.text_map ?? {},
  mediaAttachments: draft.media_attachments,
  poll: draft.poll as Compose['poll'],
  location: draft.location,
  showLocationPicker: Boolean(draft.location),
  contentType: draft.contentType ?? draft.content_type,
  interactionPolicy: draft.interactionPolicy,
  quoteApprovalPolicy: draft.quoteApprovalPolicy,
  language: draft.language,
  localOnly: draft.localOnly,
  scheduledAt: draft.schedule ? new Date(draft.schedule) : null,
  sensitive: draft.sensitive,
  visibility: draft.privacy,
  draftId: draft.draft_id,
  groupId: draft.group_id,
  editedId: draft.edited_id,
  inReplyToId: draft.in_reply_to,
  quoteId: draft.quote,
  to: draft.to,
  parentRebloggedById: draft.parentRebloggedById,
  sourceInReplyToId: draft.sourceInReplyToId,
  sourceQuoteId: draft.sourceQuoteId,
  sourceParentRebloggedById: draft.sourceParentRebloggedById,
  modifiedLanguage: draft.modifiedLanguage,
  approvalRequired: draft.approvalRequired,
  suggestedLanguage: draft.suggestedLanguage,
  redacting: draft.redacting,
  redactingOverwrite: draft.redactingOverwrite,
  children: draft.children.map(draftStatusToCompose),
});

export { draftStatusSchema, draftStatusToCompose, type DraftStatus };
