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

const createTimerPromise = async (
  durationMs: number,
  reason: string = 'not given',
) => {
  const SECOND_IN_MS = 1000;
  const MINUTE_IN_MS = 60 * SECOND_IN_MS;

  for (
    let remainingTimeMs = durationMs;
    remainingTimeMs > 0;
    remainingTimeMs -= MINUTE_IN_MS
  ) {
    await new Promise<void>((resolve) => {
      const nextIntervalMs = Math.min(MINUTE_IN_MS, remainingTimeMs);
      const remainingTimeSec = remainingTimeMs / SECOND_IN_MS;
      console.log('waiting', { reason, remainingTimeSec });
      setTimeout(() => {
        resolve();
      }, nextIntervalMs);
    });
  }
};

describe('Incoming Call', () => {
  let twilioClient: ReturnType<typeof twilio>;
  let clientId: string;
  let registrationTimeout: Generator<number>;

  beforeAll(async () => {
    ({ twilioClient, clientId } = bootstrap());

    await device.launchApp({ newInstance: true });
    await createTimerPromise(10 * 1000, 'device.launchApp');

    /**
     * We need to let the registration settle for a bit before attempting an
     * incoming call. However, we only need to do a larger wait initially, and
     * subsequent waits can be shorter.
     */
    registrationTimeout = (function* () {
      // The first timeout should be 5 minutes.
      yield 5 * 60 * 1000;
      while (true) {
        // All subsequent timeouts should be 10 seconds.
        yield 10 * 1000;
      }
    })();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await createTimerPromise(10 * 1000, 'device.reloadReactNative');
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

    await createTimerPromise(registrationTimeout.next().value, 'setup');

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
    await device.reloadReactNative();

    // Let the teardown process settle.
    await createTimerPromise(10 * 1000, 'teardown device.reloadReactNative');

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
