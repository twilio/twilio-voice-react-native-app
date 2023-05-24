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
