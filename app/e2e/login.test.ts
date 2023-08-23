import { by, device, element, expect } from 'detox';

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

describe('Login', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await createTimerPromise(10 * 1000, 'device.launchApp');
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await createTimerPromise(10 * 1000, 'device.reloadReactNative');
  });

  it('should land on the login screen', async () => {
    await expect(
      element(
        by.text(
          "Welcome to Twilio's Voice SDK Reference App. Log in to get started!",
        ),
      ),
    ).toBeVisible();
  });

  it('should login the user', async () => {
    await element(by.id('login_button')).tap();
    await expect(element(by.text('Ahoy!'))).toBeVisible();
    await expect(element(by.text('test_email@twilio.com'))).toBeVisible();
  });

  it('should navigate to the dialer tab', async () => {
    await element(by.id('login_button')).tap();
    await element(by.id('dialer_button')).tap();
    await expect(element(by.id('dialer'))).toBeVisible();
  });
});
