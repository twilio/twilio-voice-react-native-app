import { by, element, expect, waitFor, device } from 'detox';
import twilio from 'twilio';

const bootstrap = () => {
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const mockClientId = process.env.MOCK_CLIENT_ID;

  if (
    [accountSid, authToken, mockClientId].some((v) => typeof v !== 'string')
  ) {
    throw new Error('Missing env var.');
  }

  const twilioClient = twilio(accountSid, authToken);

  return { twilioClient, clientId: mockClientId as string };
};

describe('Incoming Call', () => {
  let twilioClient: ReturnType<typeof twilio>;
  let clientId: string;

  const setup = async () => {
    await element(by.id('login_button')).tap();

    await expect(element(by.text('Ahoy!'))).toBeVisible();
    await expect(element(by.text('test_email@twilio.com'))).toBeVisible();

    /**
     * Wait for 10 seconds to let the registration settle.
     *
     * Duration chosen through local testing as the minimum value that seems to
     * stabilize tests.
     */
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const testCall = await twilioClient.calls.create({
      twiml: '<Response><Say>Ahoy, world!</Say><Pause length="5" /></Response>',
      to: `client:${clientId}`,
      from: 'detox',
    });

    console.log(`Call created with SID: "${testCall.sid}".`);
  };

  beforeAll(async () => {
    ({ twilioClient, clientId } = bootstrap());

    await device.launchApp({
      newInstance: true,
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterEach(async () => {
    /**
     * Wait for 10 seconds to let the call settle.
     *
     * Duration chosen through local testing as the minimum value that seems to
     * stabilize tests.
     */
    await new Promise((resolve) => setTimeout(resolve, 10000));
  });

  describe(':android:', () => {
    it('should answer the call', async () => {
      await setup();

      /**
       * Wait up to two minutes for the incoming call.
       */
      await waitFor(element(by.id('call_invite')))
        .toBeVisible()
        .withTimeout(2 * 60 * 1000);

      await device.disableSynchronization();
      await element(by.id('call_button')).tap();

      await waitFor(element(by.id('active_call')))
        .toBeVisible()
        .withTimeout(10000);

      await device.enableSynchronization();
      await waitFor(element(by.id('active_call')))
        .not.toBeVisible()
        .withTimeout(10000);
    });

    it('should decline the call', async () => {
      await setup();

      /**
       * Wait up to two minutes for the incoming call.
       */
      await waitFor(element(by.id('call_invite')))
        .toBeVisible()
        .withTimeout(2 * 60 * 1000);

      await element(by.id('end_call_button')).tap();

      await waitFor(element(by.id('call_invite')))
        .not.toBeVisible()
        .withTimeout(10000);
    });

    it('should let the call time out', async () => {
      await setup();

      /**
       * Wait up to 2 minutes for the incoming call.
       */
      await waitFor(element(by.id('call_invite')))
        .toBeVisible()
        .withTimeout(2 * 60 * 1000);

      /**
       * Wait up to 2 minutes for the call to time out.
       */
      await waitFor(element(by.id('call_invite')))
        .not.toBeVisible()
        .withTimeout(2 * 60 * 1000);
    });
  });
});
