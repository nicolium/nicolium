import * as v from 'valibot';

/** Validates individual items in an array, dropping any that aren't valid. */
const filteredArray = <T>(schema: v.BaseSchema<any, T, v.BaseIssue<unknown>>) =>
  v.pipe(
    v.fallback(v.array(v.any()), []),
    v.transform((arr) =>
      (arr || [])
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
    v.transform((input): Record<K, T> => {
      if (typeof input !== 'object' || Array.isArray(input) || input === null)
        return {} as Record<K, T>;

      return Object.fromEntries(
        Object.entries(input).flatMap(([key, value]) => {
          const parsedKey = v.safeParse(keySchema, key);
          const parsedValue = v.safeParse(valueSchema, value);
          return parsedKey.success && parsedValue.success
            ? [[parsedKey.output, parsedValue.output]]
            : [];
        }),
      ) as Record<K, T>;
    }),
  );

export { filteredArray, filteredRecord };
