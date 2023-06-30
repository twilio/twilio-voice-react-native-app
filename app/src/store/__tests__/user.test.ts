import { miniSerializeError } from '@reduxjs/toolkit';
import * as auth0 from '../../../__mocks__/react-native-auth0';
import * as app from '../app';
import * as user from '../user';

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

  it('should initially be idle', () => {
    const userState = store.getState().user;
    expect(userState).toEqual({ status: 'idle' });
  });

  it('should login a user', async () => {
    await store.dispatch(user.login());
    const userState = store.getState().user;
    expect(userState).toEqual({
      action: 'login',
      status: 'fulfilled',
      accessToken: 'test token',
      email: 'test email',
    });
  });

  it('should logout a user', async () => {
    await store.dispatch(user.login());
    await store.dispatch(user.logout());
    const userState = store.getState().user;
    expect(userState).toEqual({
      action: 'logout',
      status: 'fulfilled',
      accessToken: '',
      email: '',
    });
  });

  it('should check if a user is NOT logged in', async () => {
    const error = new Error('not logged in');
    error.stack = undefined; // makes test failure messsages messy

    jest.spyOn(auth0, 'getCredentials').mockRejectedValueOnce(error);
    await store.dispatch(user.checkLoginStatus());
    const userState = store.getState().user;
    expect(userState).toEqual({
      action: 'checkLoginStatus',
      status: 'rejected',
      reason: 'AUTH_REJECTED',
      error: miniSerializeError(error),
    });
  });

  it('should check if a user IS logged in', async () => {
    await store.dispatch(user.checkLoginStatus());
    const userState = store.getState().user;
    expect(userState).toEqual({
      action: 'checkLoginStatus',
      status: 'fulfilled',
      accessToken: 'test token',
      email: 'test email',
    });
  });

  it('should handle login error', async () => {
    const authorizeError = new Error('login failed');
    authorizeError.stack = undefined; // makes test failure messsages messy

    jest.spyOn(auth0, 'authorize').mockRejectedValue(authorizeError);
    await store.dispatch(user.login());
    const userState = store.getState().user;
    expect(userState).toEqual({
      action: 'login',
      status: 'rejected',
      error: miniSerializeError(authorizeError),
      reason: 'AUTH_REJECTED',
    });
  });

  it('should handle logout error', async () => {
    const error = new Error('logout failed');
    error.stack = undefined;

    jest.spyOn(auth0, 'clearSession').mockRejectedValue(error);
    await store.dispatch(user.login());
    await store.dispatch(user.logout());
    const userState = store.getState().user;
    expect(userState).toEqual({
      action: 'logout',
      status: 'rejected',
      error: miniSerializeError(error),
      reason: 'AUTH_REJECTED',
    });
  });
});
