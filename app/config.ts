/**
 * Auth0 related configurations
 */
const config = {
  /**
   * The clientId and domain for your Auth0 (native) application.
   * See https://auth0.com/docs/get-started/applications/application-settings#basic-settings
   */
  clientId: '{ClientID}',
  domain: '{DomainName}',
  /**
   * The Open ID Connect Scopes for your Auth0 (native) application.
   * See https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes
   */
  auth0Scope: 'openid profile email',
  /**
   * The Identifier field on your Auth0 (server) API's settings tab.
   * See https://auth0.com/docs/secure/tokens/access-tokens/get-access-tokens
   */
  audience: '{yourApiIdentifier}',
};

export default config;
