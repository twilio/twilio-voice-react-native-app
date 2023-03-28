import * as audioDevices from '../voice/audioDevices';
import * as app from '../app';
import { voice } from '../../util/voice';

let MockCall: { Event: Record<string, string> };

jest.mock('../../../src/util/fetch', () => ({
  fetch: jest.fn(),
}));

jest.mock('../../../src/util/voice', () => ({
  voice: {
    connect: jest.fn(),
    getAudioDevices: jest.fn().mockReturnValue({
      audioDevices: [
        { uuid: '1111', type: 'speaker', name: 'device1' },
        { uuid: '2222', type: 'bluetooth', name: 'device2' },
        { uuid: '3333', type: 'earpiece', name: 'device3' },
      ],
      selectedDevice: { uuid: '3333', type: 'earpiece', name: 'device3' },
    }),
  },
  callMap: new Map(),
  audioDeviceMap: new Map(),
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

describe('audioDevices store', () => {
  it('gets an audio device', async () => {
    await app.store.dispatch(audioDevices.getAudioDevices());
    expect(app.store.getState().voice.audioDevices?.status).toEqual(
      'fulfilled',
    );
  });

  it('handles audio device error', async () => {
    jest
      .spyOn(voice, 'getAudioDevices')
      .mockRejectedValue(new Error('audio device error'));
    await app.store.dispatch(audioDevices.getAudioDevices());
    expect(app.store.getState().voice.audioDevices?.status).toEqual('rejected');
  });
});
