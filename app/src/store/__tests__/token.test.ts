import * as token from '../voice/token';
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
  it('successfully gets a token', async () => {
    fetchMock.mockResolvedValueOnce({
      text: jest.fn().mockResolvedValueOnce('foo'),
    });
    await app.store.dispatch(user.login());
    await app.store.dispatch(token.getToken());
    expect(fetchMock).toBeCalledTimes(1);
    expect(app.store.getState().voice.token).toEqual({
      status: 'fulfilled',
      value: 'foo',
    });
  });

  it('returns empty string if no user', async () => {
    jest.spyOn(auth0, 'authorize').mockReturnValue({ undefined });
    await app.store.dispatch(user.login());
    await app.store.dispatch(token.getToken());
    expect(app.store.getState().voice.token).toEqual({
      status: 'fulfilled',
      value: '',
    });
  });

  it('handles rejected case for fetch error', async () => {
    jest.spyOn(auth0, 'authorize').mockReturnValue({
      accessToken: 'test token',
      idToken: 'test id token',
    });
    fetchMock.mockRejectedValueOnce(new Error('error'));
    await app.store.dispatch(user.login());
    await app.store.dispatch(token.getToken());
    expect(app.store.getState().voice.token?.status).toEqual('rejected');
  });
});
