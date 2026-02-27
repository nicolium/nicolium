import * as v from 'valibot';

import { coerceObject } from './utils';

const mrfSimpleInstanceSchema = v.pipe(
  v.any(),
  v.transform((value) => {
    if (typeof value === 'string') return [value, ''];
    return value.tuple;
  }),
  v.tuple([v.string(), v.string()]),
);

const mrfSimpleSchema = coerceObject(
  v.entriesFromList(
    [
      'accept',
      'avatar_removal',
      'banner_removal',
      'federated_timeline_removal',
      'followers_only',
      'media_nsfw',
      'media_removal',
      'reject',
      'reject_deletes',
      'report_removal',
    ],
    v.fallback(v.array(mrfSimpleInstanceSchema), []),
  ),
);

type MRFSimple = v.InferOutput<typeof mrfSimpleSchema>;

export { mrfSimpleSchema, type MRFSimple };
