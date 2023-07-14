import { by, element, expect, waitFor, device } from 'detox';
import twilio from 'twilio';

const createTwilioClient = () => {
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;

  return twilio(accountSid, authToken);
};

describe('Incoming Call', () => {
  let client: ReturnType<typeof twilio>;

  beforeAll(async () => {
    client = createTwilioClient();

    await device.launchApp({
      newInstance: true,
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe(':android:', () => {
    it('should answer the call', async () => {
      await element(by.id('login_button')).tap();

      await expect(element(by.text('Ahoy!'))).toBeVisible();
      await expect(element(by.text('test_email@twilio.com'))).toBeVisible();

      await client.calls.create({
        twiml:
          '<Response><Say>Ahoy, world!</Say><Pause length="5" /></Response>',
        to: 'client:detoxtestidmhuynh',
        from: 'detox',
      });

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
      await element(by.id('login_button')).tap();

      await expect(element(by.text('Ahoy!'))).toBeVisible();
      await expect(element(by.text('test_email@twilio.com'))).toBeVisible();

      await client.calls.create({
        twiml:
          '<Response><Say>Ahoy, world!</Say><Pause length="5" /></Response>',
        to: 'client:detoxtestidmhuynh',
        from: 'detox',
      });

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
      await element(by.id('login_button')).tap();

      await expect(element(by.text('Ahoy!'))).toBeVisible();
      await expect(element(by.text('test_email@twilio.com'))).toBeVisible();

      await client.calls.create({
        twiml:
          '<Response><Say>Ahoy, world!</Say><Pause length="5" /></Response>',
        to: 'client:detoxtestidmhuynh',
        from: 'detox',
      });

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
