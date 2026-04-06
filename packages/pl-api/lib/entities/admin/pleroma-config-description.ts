import * as v from 'valibot';

/**
 * @category Admin schemas
 */
const pleromaConfigDescriptionChildSchema: v.GenericSchema<PleromaConfigDescriptionChild> =
  v.looseObject({
    key: v.optional(v.string()),
    type: v.union([v.string(), v.array(v.union([v.string(), v.array(v.string())]))]),
    description: v.optional(v.string()),
    label: v.optional(v.string()),
    suggestions: v.optional(v.array(v.any())),
    children: v.optional(v.lazy(() => v.array(pleromaConfigDescriptionChildSchema))),
    group: v.optional(v.union([v.string(), v.array(v.string())])),
  });

/**
 * @category Admin schemas
 */
const pleromaConfigDescriptionSchema = v.object({
  group: v.optional(v.string()),
  key: v.optional(v.string()),
  type: v.union([v.string(), v.array(v.string())]),
  description: v.optional(v.string()),
  label: v.optional(v.string()),
  children: v.array(pleromaConfigDescriptionChildSchema),
  tab: v.optional(v.string()),
  related_policy: v.optional(v.string()),
});

/**
 * @category Admin entity types
 */
type PleromaConfigDescription = v.InferOutput<typeof pleromaConfigDescriptionSchema>;

/**
 * @category Admin entity types
 */
type PleromaConfigDescriptionChild = {
  key?: string;
  type: string | Array<string | Array<string>>;
  description?: string;
  label?: string;
  suggestions?: Array<unknown>;
  children?: Array<PleromaConfigDescriptionChild>;
  group?: string | Array<string>;
};

export {
  pleromaConfigDescriptionSchema,
  pleromaConfigDescriptionChildSchema,
  type PleromaConfigDescription,
  type PleromaConfigDescriptionChild,
};
