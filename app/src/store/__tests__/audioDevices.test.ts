import { type Middleware } from '@reduxjs/toolkit';
import * as audioDevices from '../voice/audioDevices';
import { createStore, Store } from '../app';
import { voice, audioDeviceMap } from '../../util/voice';

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
  let dispatchedActions: any[] = [];

  beforeEach(() => {
    audioDeviceMap.clear();

    const logAction: Middleware = () => (next) => (action) => {
      dispatchedActions.push(action);
      next(action);
    };

    store = createStore(logAction);

    dispatchedActions.splice(0);
    jest.clearAllMocks();
  });

  const matchDispatchedActions = (actions: any[], actionCreators: any[]) => {
    expect(actionCreators.map((ac) => ac.type)).toStrictEqual(
      actions.map((a) => a.type),
    );
  };

  describe('updateAudioDevices', () => {
    it('gets an audio device', async () => {
      const mockAudioDevices = [
        { uuid: '1111', type: 'speaker', name: 'device1' },
        { uuid: '2222', type: 'bluetooth', name: 'device2' },
        { uuid: '3333', type: 'earpiece', name: 'device3' },
      ];

      await store.dispatch(
        audioDevices.updateAudioDevices({
          audioDevices: mockAudioDevices as any,
          selectedDevice: mockAudioDevices[1] as any,
        }),
      );

      expect(store.getState().voice.audioDevices).toEqual({
        status: 'fulfilled',
        audioDevices: mockAudioDevices,
        selectedDevice: mockAudioDevices[1],
      });
      matchDispatchedActions(dispatchedActions, [
        audioDevices.updateAudioDevices.pending,
        audioDevices.updateAudioDevices.fulfilled,
      ]);
    });

    it('handles no selected device', async () => {
      const mockAudioDevices = [
        { uuid: '1111', type: 'speaker', name: 'device1' },
        { uuid: '2222', type: 'bluetooth', name: 'device2' },
        { uuid: '3333', type: 'earpiece', name: 'device3' },
      ];

      await store.dispatch(
        audioDevices.updateAudioDevices({
          audioDevices: mockAudioDevices as any,
          selectedDevice: undefined,
        }),
      );

      expect(store.getState().voice.audioDevices).toEqual({
        status: 'fulfilled',
        audioDevices: mockAudioDevices,
        selectedDevice: undefined,
      });
      matchDispatchedActions(dispatchedActions, [
        audioDevices.updateAudioDevices.pending,
        audioDevices.updateAudioDevices.fulfilled,
      ]);
    });

    it('handles audio device undefined', async () => {
      await store.dispatch(
        audioDevices.updateAudioDevices({ audioDevices: undefined as any }),
      );

      expect(store.getState().voice.audioDevices).toEqual({
        status: 'rejected',
        reason: 'AUDIO_DEVICES_UNDEFINED',
      });
      matchDispatchedActions(dispatchedActions, [
        audioDevices.updateAudioDevices.pending,
        audioDevices.updateAudioDevices.rejected,
      ]);
    });

    it('handles uuid undefined', async () => {
      const mockAudioDevices = [
        { uuid: '1111', type: 'speaker', name: 'device1' },
        { uuid: undefined, type: 'bluetooth', name: 'device2' },
        { uuid: '3333', type: 'earpiece', name: 'device3' },
      ];

      await store.dispatch(
        audioDevices.updateAudioDevices({
          audioDevices: mockAudioDevices as any,
        }),
      );

      expect(store.getState().voice.audioDevices).toEqual({
        status: 'rejected',
        reason: 'AUDIO_DEVICE_UUID_UNDEFINED',
      });
      matchDispatchedActions(dispatchedActions, [
        audioDevices.updateAudioDevices.pending,
        audioDevices.updateAudioDevices.rejected,
      ]);
    });

    it('handles an unexpected error', async () => {
      const mockAudioDevices = [
        { uuid: '1111', type: 'speaker', name: 'device1' },
        { uuid: '2222', type: 'bluetooth', name: 'device2' },
        { uuid: '3333', type: 'earpiece', name: 'device3' },
      ];

      const error = new Error('bye');
      delete error.stack;
      jest.spyOn(audioDeviceMap, 'set').mockImplementationOnce(() => {
        throw error;
      });

      const result = await store.dispatch(
        audioDevices.updateAudioDevices({
          audioDevices: mockAudioDevices as any,
        }),
      );
      if (!audioDevices.updateAudioDevices.rejected.match(result)) {
        throw new Error('dispatch result should be rejected');
      }

      expect(result.error).toEqual({
        message: 'bye',
        name: 'Error',
      });
      matchDispatchedActions(dispatchedActions, [
        audioDevices.updateAudioDevices.pending,
        audioDevices.updateAudioDevices.rejected,
      ]);
    });
  });

  describe('getAudioDevices', () => {
    it('gets an audio device', async () => {
      const audioDevicesMap = [
        { uuid: '1111', type: 'speaker', name: 'device1' },
        { uuid: '2222', type: 'bluetooth', name: 'device2' },
        { uuid: '3333', type: 'earpiece', name: 'device3' },
      ];
      jest.spyOn(voice, 'getAudioDevices').mockImplementation(
        jest.fn().mockResolvedValue({
          audioDevices: audioDevicesMap,
          selectedDevice: audioDevicesMap[1],
        }),
      );

      await store.dispatch(audioDevices.getAudioDevices());

      expect(store.getState().voice.audioDevices).toEqual({
        status: 'fulfilled',
        selectedDevice: audioDevicesMap[1],
        audioDevices: audioDevicesMap,
      });
      matchDispatchedActions(dispatchedActions, [
        audioDevices.getAudioDevices.pending,
        audioDevices.updateAudioDevices.pending,
        audioDevices.updateAudioDevices.fulfilled,
        audioDevices.getAudioDevices.fulfilled,
      ]);
    });

    it('handles audio device fetch error', async () => {
      jest.spyOn(voice, 'getAudioDevices').mockRejectedValue('foo');

      await store.dispatch(audioDevices.getAudioDevices());

      expect(store.getState().voice.audioDevices).toEqual({
        status: 'idle',
      });
      matchDispatchedActions(dispatchedActions, [
        audioDevices.getAudioDevices.pending,
        audioDevices.getAudioDevices.rejected,
      ]);
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
        selectedDevice: undefined,
        audioDevices: audioDevicesMap,
      });
      matchDispatchedActions(dispatchedActions, [
        audioDevices.getAudioDevices.pending,
        audioDevices.updateAudioDevices.pending,
        audioDevices.updateAudioDevices.fulfilled,
        audioDevices.getAudioDevices.fulfilled,
      ]);
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
      matchDispatchedActions(dispatchedActions, [
        audioDevices.getAudioDevices.pending,
        audioDevices.updateAudioDevices.pending,
        audioDevices.updateAudioDevices.rejected,
        audioDevices.getAudioDevices.rejected,
      ]);
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
      matchDispatchedActions(dispatchedActions, [
        audioDevices.getAudioDevices.pending,
        audioDevices.updateAudioDevices.pending,
        audioDevices.updateAudioDevices.rejected,
        audioDevices.getAudioDevices.rejected,
      ]);
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

      expect(result.payload).toEqual({
        error: {
          message: 'bye',
          name: 'Error',
        },
        reason: 'UPDATE_AUDIO_DEVICES_REJECTED',
        rejectValue: undefined,
      });
      matchDispatchedActions(dispatchedActions, [
        audioDevices.getAudioDevices.pending,
        audioDevices.updateAudioDevices.pending,
        audioDevices.updateAudioDevices.rejected,
        audioDevices.getAudioDevices.rejected,
      ]);
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
      matchDispatchedActions(dispatchedActions, [
        audioDevices.selectAudioDevice.pending,
        audioDevices.selectAudioDevice.fulfilled,
      ]);
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
