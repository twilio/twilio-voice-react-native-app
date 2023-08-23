import { by, element, expect, waitFor, device } from 'detox';

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

describe('Outgoing Call', () => {
  const checkDuration = (callStartTime: number, expectedDuration: number) => {
    const callEndTime = Date.now();
    const measuredDuration = callEndTime - callStartTime;

    const isDurationErroneous = measuredDuration > expectedDuration;

    if (isDurationErroneous) {
      throw new Error(
        'Call duration too long.\n' +
          `Expected duration is about ${expectedDuration}ms.\n` +
          `Measured duration is ${measuredDuration}ms`,
      );
    }
  };

  const navigateToDialer = async () => {
    await element(by.id('login_button')).tap();
    await element(by.id('dialer_button')).tap();
  };

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await createTimerPromise(10 * 1000, 'device.launchApp');
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await createTimerPromise(10 * 1000, 'device.reloadReactNative');

    await navigateToDialer();
  });

  it('should allow user to enter PTSN number', async () => {
    await element(by.id('dialpad_button_1')).tap();
    await element(by.id('dialpad_button_2')).tap();
    await element(by.id('dialpad_button_3')).tap();
    await element(by.id('dialpad_button_4')).tap();
    await element(by.id('dialpad_button_4')).tap();
    await element(by.id('dialpad_button_4')).tap();
    await element(by.id('dialpad_button_8')).tap();
    await element(by.id('dialpad_button_8')).tap();
    await element(by.id('dialpad_button_8')).tap();
    await element(by.id('dialpad_button_8')).tap();
    await expect(element(by.id('formatted_number'))).toHaveText('+1234448888');
  });

  it('should allow user to enter Client-ID', async () => {
    await element(by.text('Client')).tap();
    await element(by.id('client_text_input')).typeText('Client-Web');
    await expect(element(by.id('client_text_input'))).toHaveText('Client-Web');
  });

  if (device.getPlatform() === 'android') {
    // Note: Call to 3156703541 has TwiML response length of 10s
    describe('Android:', () => {
      describe('Connect', () => {
        it('should make a successful PTSN call', async () => {
          await element(by.id('dialpad_button_3')).tap();
          await element(by.id('dialpad_button_1')).tap();
          await element(by.id('dialpad_button_5')).tap();
          await element(by.id('dialpad_button_6')).tap();
          await element(by.id('dialpad_button_7')).tap();
          await element(by.id('dialpad_button_0')).tap();
          await element(by.id('dialpad_button_3')).tap();
          await element(by.id('dialpad_button_5')).tap();
          await element(by.id('dialpad_button_4')).tap();
          await element(by.id('dialpad_button_1')).tap();

          /**
           * The call duration label constantly changing will throw Detox
           * synchronization off. Detox will stop while the app is not idle.
           */
          await device.disableSynchronization();
          await element(by.id('call_button')).tap();

          await waitFor(element(by.id('active_call')))
            .toBeVisible()
            .withTimeout(10000);

          // after we detect the call screen we can re-enable synchronization
          await device.enableSynchronization();

          await waitFor(element(by.id('active_call')))
            .not.toBeVisible()
            .withTimeout(30000);
        });

        it('should allow user to disconnect the call', async () => {
          await element(by.id('dialpad_button_3')).tap();
          await element(by.id('dialpad_button_1')).tap();
          await element(by.id('dialpad_button_5')).tap();
          await element(by.id('dialpad_button_6')).tap();
          await element(by.id('dialpad_button_7')).tap();
          await element(by.id('dialpad_button_0')).tap();
          await element(by.id('dialpad_button_3')).tap();
          await element(by.id('dialpad_button_5')).tap();
          await element(by.id('dialpad_button_4')).tap();
          await element(by.id('dialpad_button_1')).tap();

          await device.disableSynchronization();
          await element(by.id('call_button')).tap();

          await waitFor(element(by.id('end_call_button')))
            .toBeVisible()
            .withTimeout(10000);
          await element(by.id('end_call_button')).tap();

          await device.enableSynchronization();
          await waitFor(element(by.id('active_call')))
            .not.toBeVisible()
            .withTimeout(10000);
        });
      });

      describe('Disconnect', () => {
        it('should disconnect if invalid number', async () => {
          await element(by.id('dialpad_button_1')).tap();
          await element(by.id('dialpad_button_2')).tap();
          await element(by.id('dialpad_button_3')).tap();

          await device.disableSynchronization();
          await element(by.id('call_button')).tap();

          await waitFor(element(by.id('active_call')))
            .toExist()
            .withTimeout(10000);

          const callStartTime = Date.now();

          await waitFor(element(by.id('call_status')))
            .toHaveText('ringing')
            .withTimeout(10000);
          await waitFor(element(by.id('call_status')))
            .toHaveText('disconnected')
            .withTimeout(10000);

          await device.enableSynchronization();
          await waitFor(element(by.id('active_call')))
            .not.toExist()
            .withTimeout(10000);

          checkDuration(callStartTime, 10000);
        });

        it('should disconnect if invalid Client-ID', async () => {
          await element(by.text('Client')).tap();
          await element(by.id('client_text_input')).typeText('hi\n');

          await device.disableSynchronization();
          await element(by.id('call_button')).tap();

          await waitFor(element(by.id('active_call')))
            .toBeVisible()
            .withTimeout(10000);

          const callStartTime = Date.now();

          await waitFor(element(by.id('call_status')))
            .toHaveText('ringing')
            .withTimeout(10000);
          await waitFor(element(by.id('call_status')))
            .toHaveText('disconnected')
            .withTimeout(10000);

          await device.enableSynchronization();
          await waitFor(element(by.id('active_call')))
            .not.toBeVisible()
            .withTimeout(10000);

          checkDuration(callStartTime, 10000);
        });
      });
    });
  }
});
