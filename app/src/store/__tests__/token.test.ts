import * as token from '../voice/accessToken';
import * as auth from '../../util/auth';
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
    await store.dispatch(auth.login());
    await store.dispatch(token.getAccessToken());
    expect(fetchMock).toBeCalledTimes(1);
    expect(store.getState().voice.accessToken).toEqual({
      status: 'fulfilled',
      value: 'foo',
    });
  });

  it('rejects if no user', async () => {
    jest.spyOn(auth0, 'authorize').mockResolvedValueOnce({ undefined });
    await store.dispatch(auth.login());
    await store.dispatch(token.getAccessToken());
    expect(store.getState().voice.accessToken).toEqual({
      status: 'rejected',
      reason: 'USER_NOT_FULFILLED',
    });
  });

  it('handles rejected case for fetch error', async () => {
    jest.spyOn(auth0, 'authorize').mockResolvedValueOnce({
      accessToken: 'test token',
      idToken: 'test id token',
    });
    fetchMock.mockRejectedValueOnce(new Error('error'));
    await store.dispatch(auth.login());
    await store.dispatch(token.getAccessToken());
    expect(store.getState().voice.accessToken?.status).toEqual('rejected');
  });
});
