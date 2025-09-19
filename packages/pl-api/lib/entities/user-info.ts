import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/methods/oauth/#response-3}
 */
const userInfoSchema = v.object({
  iss: v.string(),
  sub: v.string(),
  name: v.string(),
  preferred_username: v.string(),
  profile: v.string(),
  picture: v.fallback(v.string(), ''),
});

/**
 * @category Entity types
 */
type UserInfo = v.InferOutput<typeof userInfoSchema>;

export { userInfoSchema, type UserInfo };
