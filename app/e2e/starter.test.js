describe('Example', () => {
  beforeAll(async () => {
    await global.device.launchApp();
  });

  beforeEach(async () => {
    await global.device.reloadReactNative();
  });

  it('should do nothing?', async () => {});
});
