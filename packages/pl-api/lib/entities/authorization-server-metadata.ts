import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/methods/oauth/#response-4}
 */
const authorizationServerMetadataSchema = v.object({
  issuer: v.string(),
  service_documentation: v.string(),
  authorization_endpoint: v.string(),
  token_endpoint: v.string(),
  app_registration_endpoint: v.string(),
  revocation_endpoint: v.string(),
  userinfo_endpoint: v.string(),
  scopes_supported: v.array(v.string()),
  response_types_supported: v.array(v.string()),
  response_modes_supported: v.array(v.string()),
  code_challenge_methods_supported: v.array(v.string()),
  grant_types_supported: v.array(v.string()),
  token_endpoint_auth_methods_supported: v.array(v.string()),
});

/**
 * @category Entity types
 */
type AuthorizationServerMetadata = v.InferOutput<typeof authorizationServerMetadataSchema>;

export { authorizationServerMetadataSchema, type AuthorizationServerMetadata };
