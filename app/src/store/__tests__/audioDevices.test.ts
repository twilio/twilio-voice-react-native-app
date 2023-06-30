import * as audioDevices from '../voice/audioDevices';
import { createStore, Store } from '../app';
import { voice } from '../../util/voice';
import { miniSerializeError } from '@reduxjs/toolkit';

let MockCall: { Event: Record<string, string> };

jest.mock('../../../src/util/fetch', () => ({
  fetch: jest.fn(),
}));

jest.mock('../../../src/util/voice', () => ({
  voice: {
    connect: jest.fn(),
    getAudioDevices: jest.fn().mockResolvedValue({
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
  let store: Store;

  beforeEach(() => {
    store = createStore();
  });

  it('gets an audio device', async () => {
    await store.dispatch(audioDevices.getAudioDevices());
    expect(store.getState().voice.audioDevices?.status).toEqual('fulfilled');
  });

  it('handles audio device fetch error', async () => {
    jest.spyOn(voice, 'getAudioDevices').mockRejectedValue('foo');
    await store.dispatch(audioDevices.getAudioDevices());
    expect(store.getState().voice.audioDevices).toEqual({
      reason: 'GET_AUDIO_DEVICES_ERROR',
      status: 'rejected',
      error: miniSerializeError('foo'),
    });
  });

  it('handles no selected device', async () => {
    const audioDevicesMap = [
      { uuid: '1111', type: 'speaker', name: 'device1' },
      { uuid: '2222', type: 'bluetooth', name: 'device2' },
      { uuid: '3333', type: 'earpiece', name: 'device3' },
    ];
    jest.spyOn(voice, 'getAudioDevices').mockImplementation(
      jest.fn().mockResolvedValue({
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

  it('handles audio device undefined', async () => {
    jest.spyOn(voice, 'getAudioDevices').mockImplementation(
      jest.fn().mockResolvedValue({
        audioDevices: undefined,
      }),
    );
    await store.dispatch(audioDevices.getAudioDevices());
    expect(store.getState().voice.audioDevices).toEqual({
      status: 'rejected',
      reason: 'AUDIO_DEVICES_NOT_FOUND',
    });
  });

  it('handles uuid undefined', async () => {
    const audioDevicesMap = [
      { uuid: '1111', type: 'speaker', name: 'device1' },
      { uuid: undefined, type: 'bluetooth', name: 'device2' },
      { uuid: '3333', type: 'earpiece', name: 'device3' },
    ];
    jest.spyOn(voice, 'getAudioDevices').mockImplementation(
      jest.fn().mockResolvedValue({
        audioDevices: audioDevicesMap,
      }),
    );
    await store.dispatch(audioDevices.getAudioDevices());
    expect(store.getState().voice.audioDevices).toEqual({
      status: 'rejected',
      reason: 'MISSING_AUDIO_DEVICE_UUID',
    });
  });
});
