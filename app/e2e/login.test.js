import { by, element, expect } from 'detox';

describe('Login', () => {
  beforeAll(async () => {
    await global.device.launchApp();
  });

  beforeEach(async () => {
    await global.device.reloadReactNative();
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
});
