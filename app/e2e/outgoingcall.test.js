import { by, element, expect, waitFor, device } from 'detox';

describe('Outgoing Call', () => {
  beforeAll(async () => {
    await global.device.launchApp();
  });

  const navigateToDialer = async () => {
    await element(by.id('login_button')).tap();
    await element(by.id('dialer_button')).tap();
  };

  beforeEach(async () => {
    await global.device.reloadReactNative();
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
    describe('Android: successful connect', () => {
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
        await element(by.id('call_button')).tap();
        await waitFor(element(by.id('active_call'))).toBeVisible();
        await waitFor(element(by.id('call_status'))).toHaveText('ringing');
        await waitFor(element(by.id('call_status'))).toHaveText('00:05');
        await waitFor(element(by.id('active_call'))).not.toBeVisible();
      });
    });

    describe('disconnect', () => {
      it('should disconnect if invalid number', async () => {
        await element(by.id('dialpad_button_1')).tap();
        await element(by.id('dialpad_button_2')).tap();
        await element(by.id('dialpad_button_3')).tap();
        await element(by.id('call_button')).tap();
        await waitFor(element(by.id('active_call'))).toBeVisible();
        await waitFor(element(by.id('call_status'))).toHaveText('ringing');
        await waitFor(element(by.id('call_status'))).toHaveText('disconnected');
        await waitFor(element(by.id('active_call'))).not.toBeVisible();
      });

      it('should disconnect if invalid Client-ID', async () => {
        await element(by.text('Client')).tap();
        await element(by.id('client_text_input')).typeText('hi\n');
        await element(by.id('call_button')).tap();
        await waitFor(element(by.id('active_call'))).toBeVisible();
        await waitFor(element(by.id('call_status'))).toHaveText('ringing');
        await waitFor(element(by.id('call_status'))).toHaveText('disconnected');
        await waitFor(element(by.id('active_call'))).not.toBeVisible();
      });
    });
  }
});
