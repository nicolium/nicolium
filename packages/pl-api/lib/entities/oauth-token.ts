import * as v from 'valibot';

import { datetimeSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apioauth_tokens}
 */
const oauthTokenSchema = v.pipe(
  v.any(),
  v.transform((token: any) => {
    if (token.application) {
      return {
        ...token,
        app_name: token.application.name,
        app_website: token.application.website,
        scopes: token.scope.split(' '),
      };
    }

    return {
      ...token,
      valid_until: token?.valid_until?.padEnd(27, 'Z'),
    };
  }),
  v.object({
    app_name: v.string(),
    app_website: v.fallback(v.string(), ''),
    id: v.pipe(v.unknown(), v.transform(String)),
    created_at: v.fallback(v.nullable(datetimeSchema), null),
    valid_until: v.fallback(v.nullable(datetimeSchema), null),
    last_used: v.fallback(v.nullable(datetimeSchema), null),
    scopes: v.fallback(v.array(v.string()), []),
  }),
);

/**
 * @category Entity types
 */
type OauthToken = v.InferOutput<typeof oauthTokenSchema>;

export { oauthTokenSchema, type OauthToken };
