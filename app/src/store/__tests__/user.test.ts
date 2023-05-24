import * as app from '../app';
import * as auth0 from '../../../__mocks__/react-native-auth0';
import * as auth from '../../util/auth';

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
  let store: app.Store;

  beforeEach(() => {
    store = app.createStore();
  });

  it('should initially be null', () => {
    const userState = store.getState().voice.user;
    expect(userState).toEqual(null);
  });

  it('should login a user', async () => {
    await store.dispatch(auth.login());
    const userState = store.getState().voice.user;
    expect(userState).toEqual({
      status: 'fulfilled',
      accessToken: 'test token',
      email: 'test email',
    });
  });

  it('should logout a user', async () => {
    await store.dispatch(auth.login());
    await store.dispatch(auth.logout());
    const userState = store.getState().voice.user;
    expect(userState).toEqual({
      status: 'fulfilled',
      accessToken: '',
      email: '',
    });
  });

  it('should check if a user is NOT logged in', async () => {
    jest.spyOn(auth0, 'getCredentials').mockRejectedValueOnce(undefined);
    await store.dispatch(auth.checkLoginStatus());
    const userState = store.getState().voice.user;
    expect(userState).toEqual({
      status: 'fulfilled',
      accessToken: '',
      email: '',
    });
  });

  it('should check if a user IS logged in', async () => {
    await store.dispatch(auth.checkLoginStatus());
    const userState = store.getState().voice.user;
    expect(userState).toEqual({
      status: 'fulfilled',
      accessToken: 'test token',
      email: 'test email',
    });
  });

  it('should handle login error', async () => {
    const authorizeError = new Error('login failed');
    jest.spyOn(auth0, 'authorize').mockRejectedValue(authorizeError);
    await store.dispatch(auth.login());
    const userState = store.getState().voice.user;
    expect(userState).toEqual({
      status: 'rejected',
      error: authorizeError,
      reason: 'LOGIN_ERROR',
    });
  });

  it('should handle logout error', async () => {
    jest
      .spyOn(auth0, 'clearSession')
      .mockRejectedValue(new Error('logout failed'));
    await store.dispatch(auth.login());
    await store.dispatch(auth.logout());
    const userState = store.getState().voice.user;
    expect(userState).toEqual({
      status: 'rejected',
      error: new Error('logout failed'),
      reason: 'LOGOUT_ERROR',
    });
  });
});
