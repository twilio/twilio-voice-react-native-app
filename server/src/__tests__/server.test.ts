import { createExpressApp } from '../server';

jest.unmock('express');

const mockTwilioCredentials = {
  accountSid: 'f',
  apiKeySid: 'o',
  apiKeySecret: 'o',
  outgoingApplicationSid: 'b',
  pushCredentialSid: 'ar',
}

it('works?', () => {
  const app = createExpressApp(mockTwilioCredentials);
  console.log(app);
});
