import * as app from '../src/store/app';
import * as token from '../src/store/voice/token';
import * as outgoingCall from '../src/store/voice/call/outgoingCall';
import * as activeCall from '../src/store/voice/call/activeCall';

let fetchMock: jest.Mock;
let voiceConnectMock: jest.Mock;
let MockCall: { Event: Record<string, string> };

jest.mock('../src/util/fetch', () => ({
  fetch: (fetchMock = jest.fn()),
}));

jest.mock('../src/util/voice', () => ({
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

it('works good', async () => {
  console.log(app.store.getState());

  fetchMock.mockResolvedValueOnce({
    text: jest.fn().mockResolvedValueOnce('foo'),
  });
  const getTokenAction = token.getToken();
  await app.store.dispatch(getTokenAction);

  console.log(app.store.getState());

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
  await app.store.dispatch(makeOutgoingCallAction);

  console.log(app.store.getState());

  const muteActiveCallAction = activeCall.muteActiveCall({ mute: true });
  await app.store.dispatch(muteActiveCallAction);

  console.log(app.store.getState().voice.call.outgoingCall);
});
