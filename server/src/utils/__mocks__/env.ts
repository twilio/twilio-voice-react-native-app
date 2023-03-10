export const getPort = jest.fn().mockReturnValue(3003);
export const getTwilioCredentials = jest.fn().mockReturnValue({
  accountSid: 'mock-accountsid-foobar',
  apiKeySid: 'mock-apikeysid-foobar',
  apiKeySecret: 'mock-apikeysecret-foobar',
  callerId: 'mock-callerid-foobar',
  outgoingApplicationSid: 'mock-outgoingapplicationsid-foobar',
  pushCredentialSid: 'mock-pushcredentialsid-foobar',
});
