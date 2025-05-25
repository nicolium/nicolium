import * as v from 'valibot';

/** Validate to Mastodon's date format, or use the current date. */
const datetimeSchema = v.pipe(
  v.string(),
  // Adapted from Zod
  // https://github.com/colinhacks/zod/blob/main/src/types.ts#L619
  // at least it's not chatgpt
  v.regex(/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?(([+-]\d{2}:?\d{2})|(Z)?)$/),
);

const dateSchema = v.pipe(v.string(), v.transform((value) => value.slice(0, 10)), v.regex(/^\d{4}-\d{2}-\d{2}$/));

/** Validates individual items in an array, dropping any that aren't valid. */
const filteredArray = <T>(schema: v.BaseSchema<any, T, v.BaseIssue<unknown>>) =>
  v.pipe(
    v.fallback(v.array(v.any()), []),
    v.transform((arr) => (
      (arr || []).map((item) => {
        const parsed = v.safeParse(schema, item);
        return parsed.success ? parsed.output : undefined;
      }).filter((item): item is T => Boolean(item))
    )),
  );

/** Validates the string as an emoji. */
const emojiSchema = v.pipe(v.string(), v.emoji());

/** MIME schema, eg `image/png`. */
const mimeSchema = v.pipe(v.string(), v.regex(/^\w+\/[-+.\w]+$/));

/** valibot schema to force the value into an object, if it isn't already. */
const coerceObject = <T extends v.ObjectEntries>(shape: T): v.ObjectSchema<T, undefined> =>
  v.optional(
    v.pipe(
      v.any(),
      v.transform((input) => typeof input === 'object' && input !== null ? input : {}),
      v.object(shape),
    ),
    {},
  ) as any;

export { filteredArray, emojiSchema, datetimeSchema, dateSchema, mimeSchema, coerceObject };
