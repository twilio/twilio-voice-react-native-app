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
  return {
    Call: MockCall,
  };
});

describe('audioDevices store', () => {
  let store: app.Store;

  beforeEach(() => {
    store = app.createStore();
  });

  it('gets an audio device', async () => {
    await store.dispatch(audioDevices.getAudioDevices());
    expect(store.getState().voice.audioDevices?.status).toEqual('fulfilled');
  });

  it('handles audio device error', async () => {
    jest
      .spyOn(voice, 'getAudioDevices')
      .mockRejectedValue(new Error('audio device error'));
    await store.dispatch(audioDevices.getAudioDevices());
    expect(store.getState().voice.audioDevices?.status).toEqual('rejected');
  });

  it('handles no selected device', async () => {
    const audioDevicesMap = [
      { uuid: '1111', type: 'speaker', name: 'device1' },
      { uuid: '2222', type: 'bluetooth', name: 'device2' },
      { uuid: '3333', type: 'earpiece', name: 'device3' },
    ];
    jest.spyOn(voice, 'getAudioDevices').mockImplementation(
      jest.fn().mockReturnValue({
        audioDevices: audioDevicesMap,
      }),
    );
    await store.dispatch(audioDevices.getAudioDevices());
    expect(store.getState().voice.audioDevices).toEqual({
      status: 'fulfilled',
      selectedDevice: null,
      audioDevices: audioDevicesMap,
    });
  });
});
