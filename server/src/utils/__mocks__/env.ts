export const getPort = jest.fn().mockReturnValue(3003);
export const getServerCredentials = jest.fn().mockReturnValue({
  accountSid: 'mock-accountsid-foobar',
  authToken: 'mock-authtoken-foobar',
  apiKeySid: 'mock-apikeysid-foobar',
  apiKeySecret: 'mock-apikeysecret-foobar',
  callerId: 'mock-callerid-foobar',
  outgoingApplicationSid: 'mock-outgoingapplicationsid-foobar',
  pushCredentialSid: 'mock-pushcredentialsid-foobar',
  auth0Audience: 'mock-auth0audience-foobar',
  auth0IssuerBaseUrl: 'mock-auth0IssuerBaseUrl-foobar',
  auth0Url: 'mock-auth0Url-foobar',
  auth0Username: 'mock-auth0Username-foobar',
  auth0Password: 'mock-auth0Password-foobar',
  auth0ClientID: 'mock-auth0ClientID-foobar',
  auth0ClientSecret: 'mock-auth0ClientSecret-foobar',
});
