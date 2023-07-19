import * as audioDevices from '../voice/audioDevices';
import { createStore, Store } from '../app';
import { voice, audioDeviceMap } from '../../util/voice';
import { miniSerializeError } from '@reduxjs/toolkit';

let MockCall: { Event: Record<string, string> };

class MockAudioDevice {
  uuid = 'foo-uuid';
  type = 'speaker';
  name = 'bar-name';
  select = jest.fn().mockResolvedValue('hi');
  constructor(uuid: string, type: string, name: string) {
    this.uuid = uuid;
    this.type = type;
    this.name = name;
  }
}

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
    audioDeviceMap.clear();
    store = createStore();
  });

  describe('getAudioDevices', () => {
    it('gets an audio device', async () => {
      await store.dispatch(audioDevices.getAudioDevices());
      expect(store.getState().voice.audioDevices?.status).toEqual('fulfilled');
    });

    it('handles audio device fetch error', async () => {
      jest.spyOn(voice, 'getAudioDevices').mockRejectedValue('foo');
      await store.dispatch(audioDevices.getAudioDevices());
      expect(store.getState().voice.audioDevices).toEqual({
        reason: 'NATIVE_MODULE_REJECTED',
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
        reason: 'AUDIO_DEVICES_UNDEFINED',
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
        reason: 'AUDIO_DEVICE_UUID_UNDEFINED',
      });
    });

    it('handles an unexpected error', async () => {
      const error = new Error('bye');
      delete error.stack;
      jest.spyOn(audioDeviceMap, 'set').mockImplementationOnce(() => {
        throw error;
      });

      const result = await store.dispatch(audioDevices.getAudioDevices());
      if (!audioDevices.getAudioDevices.rejected.match(result)) {
        throw new Error('dispatch result should be rejected');
      }

      expect(result.payload).toBeUndefined();
      expect(result.error).toEqual({
        message: 'bye',
        name: 'Error',
      });
    });
  });

  describe('selectAudioDevice', () => {
    it('selects the device', async () => {
      const audioDevicesMap = [
        { uuid: '1111', type: 'speaker', name: 'device1' },
        { uuid: '2323', type: 'bluetooth', name: 'device2' },
        { uuid: '3333', type: 'earpiece', name: 'device3' },
      ] as const;

      for (const d of audioDevicesMap) {
        audioDeviceMap.set(
          d.uuid,
          new MockAudioDevice(d.uuid, d.type, d.name) as any,
        );
      }

      const result = await store.dispatch(
        audioDevices.selectAudioDevice({ audioDeviceUuid: '2323' }),
      );
      expect(result.type).toMatch(/fulfilled/);
      expect(result.payload).toBeUndefined();
    });

    it('handles the device not being found in the map', async () => {
      const result = await store.dispatch(
        audioDevices.selectAudioDevice({ audioDeviceUuid: '2323' }),
      );
      expect(result.type).toMatch(/rejected/);
      expect(result.payload).toEqual({
        reason: 'AUDIO_DEVICE_UUID_NOT_FOUND',
      });
    });

    it('handles the native module rejecting', async () => {
      const audioDevicesMap = [
        { uuid: '1111', type: 'speaker', name: 'device1' },
        { uuid: '2323', type: 'bluetooth', name: 'device2' },
        { uuid: '3333', type: 'earpiece', name: 'device3' },
      ] as const;

      for (const d of audioDevicesMap) {
        const device = new MockAudioDevice(d.uuid, d.type, d.name);
        jest.spyOn(device, 'select').mockRejectedValue('bye');
        audioDeviceMap.set(d.uuid, device as any);
      }

      const result = await store.dispatch(
        audioDevices.selectAudioDevice({ audioDeviceUuid: '2323' }),
      );
      expect(result.type).toMatch(/rejected/);
      expect(result.payload).toEqual({
        reason: 'NATIVE_MODULE_REJECTED',
      });
    });
  });
});
