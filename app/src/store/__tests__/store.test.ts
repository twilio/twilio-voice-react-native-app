import * as app from '../app';
import * as token from '../voice/accessToken';
import * as outgoingCall from '../voice/call/outgoingCall';
import * as user from '../user';

let fetchMock: jest.Mock;
let voiceConnectMock: jest.Mock;
let MockCall: { Event: Record<string, string> };

jest.mock('../../../src/util/fetch', () => ({
  fetch: (fetchMock = jest.fn()),
}));

jest.mock('../../../src/util/voice', () => ({
  voice: {
    connect: (voiceConnectMock = jest.fn()),
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

it('should export a default store', () => {
  expect(app.defaultStore).toBeDefined();

  expect(app.defaultStore.dispatch).toBeDefined();
  expect(app.defaultStore.getState).toBeDefined();
  expect(app.defaultStore.replaceReducer).toBeDefined();
  expect(app.defaultStore.subscribe).toBeDefined();
});

it('should make an outgoing call and mute it', async () => {
  const store: app.Store = app.createStore();

  await store.dispatch(user.checkLoginStatus());

  fetchMock.mockResolvedValueOnce({
    ok: true,
    text: jest.fn().mockResolvedValueOnce('foo'),
  });
  const getTokenAction = token.getAccessToken();
  await store.dispatch(getTokenAction);

  expect(store.getState().voice.accessToken?.status).toEqual('fulfilled');

  voiceConnectMock.mockResolvedValueOnce({
    _uuid: 'mock uuid',
    on: jest.fn(),
    once: jest.fn(),
    getSid: jest.fn().mockReturnValue('sid'),
    getState: jest.fn().mockReturnValue('state'),
    getTo: jest.fn().mockReturnValue('to'),
    getFrom: jest.fn().mockReturnValue('from'),
    isMuted: jest.fn().mockReturnValue(false),
    isOnHold: jest.fn().mockReturnValue(false),
    mute: jest.fn(),
    hold: jest.fn(),
  });
  const makeOutgoingCallAction = outgoingCall.makeOutgoingCall({
    recipientType: 'client',
    to: 'bob',
  });
  await store.dispatch(makeOutgoingCallAction);

  // TODO(mhuynh): perform actions on the call
});
