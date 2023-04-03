import * as user from '../user';
import * as app from '../app';
import * as auth0 from '../../../__mocks__/react-native-auth0';

let MockCall: { Event: Record<string, string> };

jest.mock('../../../src/util/fetch', () => ({
  fetch: jest.fn(),
}));

jest.mock('../../../src/util/voice', () => ({
  voice: {
    connect: jest.fn(),
  },
  callMap: new Map(),
}));

jest.mock('@twilio/voice-react-native-sdk', () => {
  MockCall = {
    Event: {
      Connected: 'connected',
      ConnectFailure: 'connectFailure',
      Disconnected: 'disconnected',
      Reconnecting: 'reconnecting',
      Reconnected: 'reconnected',
      Ringing: 'ringing',
      QualityWarningsChanged: 'qualityWarningsChanged',
    },
  };
  return { Call: MockCall };
});

describe('user store', () => {
  it('should initially be null', () => {
    const userState = app.store.getState().voice.user;
    expect(userState).toEqual(null);
  });

  it('should login a user', async () => {
    await app.store.dispatch(user.login());
    const userState = app.store.getState().voice.user;
    expect(userState).toEqual({
      status: 'fulfilled',
      accessToken: 'test token',
      email: 'test email',
    });
  });

  it('should logout a user', async () => {
    await app.store.dispatch(user.login());
    await app.store.dispatch(user.logout());
    const userState = app.store.getState().voice.user;
    expect(userState).toEqual({
      status: 'fulfilled',
      accessToken: '',
      email: '',
    });
  });

  it('should check if a user is NOT logged in', async () => {
    jest.spyOn(auth0, 'getCredentials').mockReturnValueOnce(undefined);
    await app.store.dispatch(user.checkLoginStatus());
    const userState = app.store.getState().voice.user;
    expect(userState).toEqual({
      status: 'fulfilled',
      accessToken: '',
      email: '',
    });
  });

  it('should check if a user IS logged in', async () => {
    await app.store.dispatch(user.login());
    await app.store.dispatch(user.checkLoginStatus());
    const userState = app.store.getState().voice.user;
    expect(userState).toEqual({
      status: 'fulfilled',
      accessToken: 'test token',
      email: 'test email',
    });
  });

  it('should handle login error', async () => {
    jest.spyOn(auth0, 'authorize').mockRejectedValue(new Error('login failed'));
    await app.store.dispatch(user.login());
    const userState = app.store.getState().voice.user;
    expect(userState).toEqual({ status: 'rejected', error: 'LOGIN_ERROR' });
  });

  it('should handle logout error', async () => {
    jest
      .spyOn(auth0, 'clearSession')
      .mockRejectedValue(new Error('logout failed'));
    await app.store.dispatch(user.login());
    await app.store.dispatch(user.logout());
    const userState = app.store.getState().voice.user;
    expect(userState).toEqual({
      status: 'rejected',
      error: 'LOGOUT_ERROR',
    });
  });
});
