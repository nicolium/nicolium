import * as v from 'valibot';

import { datetimeSchema } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apioauth_tokens}
 */
const oauthTokenSchema: v.BaseSchema<any, OauthToken, v.BaseIssue<unknown>> = v.pipe(
  v.any(),
  v.transform((token: any) => {
    if (!token) return null;

    if (token.createdAt) {
      return {
        name: token.id,
        ...token,
        app_name: token.app,
        created_at: token.createdAt,
        last_used: token.lastActive,
        is_current: token.current,
        linked_session: token.linkedSession,
      };
    }

    if (token.client_name) {
      return {
        ...token,
        app_name: token.client_name,
      };
    }

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
    is_current: v.fallback(v.nullable(v.boolean()), null),
    is_active: v.fallback(v.nullable(v.boolean()), null),
    linked_session: v.fallback(v.nullable(v.lazy(() => oauthTokenSchema)), null),
  }),
);

/**
 * @category Entity types
 */
interface OauthToken {
  app_name: string;
  app_website: string;
  id: string;
  created_at: string | null;
  valid_until: string | null;
  last_used: string | null;
  scopes: string[];
  is_current: boolean | null;
  is_active: boolean | null;
  linked_session: OauthToken | null;
}

export { oauthTokenSchema, type OauthToken };
