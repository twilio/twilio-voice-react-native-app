import { miniSerializeError } from '@reduxjs/toolkit';
import * as token from '../voice/accessToken';
import * as user from '../user';
import * as app from '../app';
import * as auth0 from '../../../__mocks__/react-native-auth0';

let MockCall: { Event: Record<string, string> };
let fetchMock: jest.Mock;

jest.mock('../../../src/util/fetch', () => ({
  fetch: (fetchMock = jest.fn()),
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

describe('token store', () => {
  let store: app.Store;

  beforeEach(() => {
    store = app.createStore();
  });

  it('successfully gets a token', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValueOnce('foo'),
    });
    await store.dispatch(user.login());
    await store.dispatch(token.getAccessToken());
    expect(fetchMock).toBeCalledTimes(1);
    expect(store.getState().voice.accessToken).toEqual({
      status: 'fulfilled',
      value: 'foo',
    });
  });

  it('rejects if no user', async () => {
    jest.spyOn(auth0, 'authorize').mockResolvedValueOnce({ undefined });
    await store.dispatch(user.login());
    await store.dispatch(token.getAccessToken());
    expect(store.getState().voice.accessToken).toEqual({
      status: 'rejected',
      reason: 'USER_NOT_FULFILLED',
    });
  });

  it('rejects if "FETCH_ERROR"', async () => {
    jest.spyOn(auth0, 'authorize').mockResolvedValueOnce({
      accessToken: 'test token',
      idToken: 'test id token',
    });
    const error = new Error('error');
    fetchMock.mockRejectedValueOnce(error);
    await store.dispatch(user.login());
    await store.dispatch(token.getAccessToken());
    expect(store.getState().voice.accessToken).toEqual({
      status: 'rejected',
      reason: 'FETCH_ERROR',
      error: miniSerializeError(error),
    });
  });

  it('rejects if "TOKEN_RESPONSE_NOT_OK"', async () => {
    jest.spyOn(auth0, 'authorize').mockResolvedValueOnce({
      accessToken: 'test token',
      idToken: 'test id token',
    });
    fetchMock.mockResolvedValueOnce({
      ok: false,
    });
    await store.dispatch(user.login());
    await store.dispatch(token.getAccessToken());
    expect(store.getState().voice.accessToken).toEqual({
      reason: 'TOKEN_RESPONSE_NOT_OK',
      status: 'rejected',
    });
  });

  it('rejects if "FETCH_TEXT_ERROR"', async () => {
    jest.spyOn(auth0, 'authorize').mockResolvedValueOnce({
      accessToken: 'test token',
      idToken: 'test id token',
    });
    const error = new Error('foobar');
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockRejectedValueOnce(error),
    });
    await store.dispatch(user.login());
    await store.dispatch(token.getAccessToken());
    expect(store.getState().voice.accessToken).toEqual({
      status: 'rejected',
      reason: 'FETCH_TEXT_ERROR',
      error: miniSerializeError(error),
    });
  });
});
