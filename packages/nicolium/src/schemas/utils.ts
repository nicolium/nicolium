import * as v from 'valibot';

/** Validates individual items in an array, dropping any that aren't valid. */
const filteredArray = <T>(schema: v.BaseSchema<any, T, v.BaseIssue<unknown>>) =>
  v.pipe(
    v.fallback(v.array(v.any()), []),
    v.transform((arr) =>
      arr
        .map((item) => {
          const parsed = v.safeParse(schema, item);
          return parsed.success ? parsed.output : undefined;
        })
        .filter((item): item is T => Boolean(item)),
    ),
  );

/** Validates the keys and values of an object, dropping any that aren't valid. */
const filteredRecord = <K extends string, T>(
  keySchema: v.BaseSchema<any, K, v.BaseIssue<unknown>>,
  valueSchema: v.BaseSchema<any, T, v.BaseIssue<unknown>>,
) =>
  v.pipe(
    v.fallback(v.any(), {}),
    v.transform((input): Partial<Record<K, T>> => {
      if (typeof input !== 'object' || Array.isArray(input) || input === null) return {};

      return Object.fromEntries(
        Object.entries(input).flatMap(([key, value]) => {
          const parsedKey = v.safeParse(keySchema, key);
          const parsedValue = v.safeParse(valueSchema, value);
          return parsedKey.success && parsedValue.success
            ? [[parsedKey.output, parsedValue.output]]
            : [];
        }),
      ) as Partial<Record<K, T>>;
    }),
  );

/** valibot schema to force the value into an object, if it isn't already. */
const coerceObject = <T extends v.ObjectEntries>(shape: T) =>
  v.optional(
    v.pipe(
      v.any(),
      v.transform((input) =>
        typeof input === 'object' && !Array.isArray(input) && input !== null ? input : {},
      ),
      v.object(shape),
    ),
    {},
  );

export { filteredArray, filteredRecord, coerceObject };
