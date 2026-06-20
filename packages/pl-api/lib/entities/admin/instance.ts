import * as v from 'valibot';

import { datetimeSchema, filteredArray } from '../utils';

/**
 * @category Admin schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
 */
const adminInstanceDeliveryErrorSchema = v.object({
  error: v.fallback(v.string(), ''),
  time: v.fallback(v.optional(datetimeSchema), undefined),
});

/**
 * @category Admin schemas
 * @see {@link https://docs.gotosocial.org/en/latest/api/swagger/}
 */
const adminInstanceSchema = v.object({
  id: v.fallback(v.string(), ''),
  domain: v.fallback(v.string(), ''),
  first_seen: v.fallback(v.optional(datetimeSchema), undefined),
  latest_successful_delivery: v.fallback(v.optional(datetimeSchema), undefined),
  software: v.fallback(v.optional(v.string()), undefined),
  delivery_errors: filteredArray(adminInstanceDeliveryErrorSchema),
});

/**
 * @category Admin entity types
 */
type AdminInstanceDeliveryError = v.InferOutput<typeof adminInstanceDeliveryErrorSchema>;

/**
 * @category Admin entity types
 */
type AdminInstance = v.InferOutput<typeof adminInstanceSchema>;

export {
  adminInstanceDeliveryErrorSchema,
  adminInstanceSchema,
  type AdminInstanceDeliveryError,
  type AdminInstance,
};
