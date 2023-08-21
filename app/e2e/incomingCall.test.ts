import { by, element, expect, waitFor, device } from 'detox';
import twilio from 'twilio';

const bootstrap = () => {
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const mockClientId = process.env.CLIENT_IDENTITY;

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
  let registrationTimeout: Generator<number>;

  beforeAll(async () => {
    ({ twilioClient, clientId } = bootstrap());

    await device.launchApp({
      newInstance: true,
    });

    /**
     * We need to let the registration settle for a bit before attempting an
     * incoming call. However, we only need to do a larger wait initially, and
     * subsequent waits can be shorter.
     */
    registrationTimeout = (function* () {
      // The first timeout should be 10 minutes.
      yield 10 * 60 * 1000;
      while (true) {
        // All subsequent timeouts should be 10 seconds.
        yield 10 * 1000;
      }
    })();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await teardown();
  });

  /**
   * Login.
   */
  const login = async () => {
    await element(by.id('login_button')).tap();

    await expect(element(by.text('Ahoy!'))).toBeVisible();
    await expect(element(by.text('test_email@twilio.com'))).toBeVisible();
  };

  /**
   * Logout.
   */
  const logout = async () => {
    await element(by.id('logout_button')).tap();
  };

  /**
   * Login and register this device. Make a call to this device after
   * registering and letting the registration settle.
   */
  const setup = async () => {
    await login();

    await new Promise<void>(async (primaryResolve) => {
      const timeToWait = registrationTimeout.next().value;

      // issue secondary timeouts every minute until total time waited is
      // more than time to wait
      const minuteInMs = 60 * 1000;
      for (
        let timeWaited = 0;
        timeWaited < timeToWait;
        timeWaited += minuteInMs
      ) {
        await new Promise<void>((secondaryResolve) => {
          const minutesRemaining = (timeToWait - timeWaited) / minuteInMs;
          console.log(`remaining time to wait: ${minutesRemaining} minutes`);
          setTimeout(() => {
            secondaryResolve();
          }, minuteInMs);
        });
      }

      primaryResolve();
    });

    const testCall = await twilioClient.calls.create({
      twiml: '<Response><Say>Ahoy, world!</Say><Pause length="5" /></Response>',
      to: `client:${clientId}`,
      from: 'detox',
    });

    console.log(
      `Call created with SID: "${testCall.sid}" to identity "${clientId}".`,
    );
  };

  /**
   * Logout and unregister this device.
   */
  const teardown = async () => {
    /**
     * Hard refresh the app so it's in a consistent state.
     */
    await device.launchApp({
      newInstance: true,
    });
    await login();
    await logout();
  };

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
