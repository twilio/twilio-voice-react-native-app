import { createSlice } from '@reduxjs/toolkit';
import { type AudioDevice as TwilioAudioDevice } from '@twilio/voice-react-native-sdk';
import { voice, audioDeviceMap } from '../../util/voice';
import { type AsyncStoreSlice } from '../app';
import { createTypedAsyncThunk } from '../common';
import { settlePromise } from '../../util/settlePromise';

export type AudioDeviceRejectValue =
  | { reason: 'AUDIO_DEVICES_NOT_FOUND' }
  | { reason: 'MISSING_AUDIO_DEVICE_UUID' }
  | { reason: 'AUDIO_DEVICES_NOT_FULFILLED' };

export const selectAudioDevice = createTypedAsyncThunk<
  void,
  { audioDeviceUuid: string }
>('voice/selectAudioDevice', async () => {});

export const getAudioDevices = createTypedAsyncThunk<
  { audioDevices: AudioDeviceInfo[]; selectedDevice: AudioDeviceInfo | null },
  void,
  {
    rejectValue: AudioDeviceRejectValue;
  }
>('voice/getAudioDevices', async (_, { rejectWithValue }) => {
  const fetchAudioDevices = await settlePromise(voice.getAudioDevices());
  if (fetchAudioDevices?.status !== 'fulfilled') {
    return rejectWithValue({ reason: 'AUDIO_DEVICES_NOT_FULFILLED' });
  }

  const { audioDevices, selectedDevice } = fetchAudioDevices.value;
  if (typeof audioDevices === 'undefined') {
    return rejectWithValue({ reason: 'AUDIO_DEVICES_NOT_FOUND' });
  }

  for (const audioDevice of audioDevices) {
    if (typeof audioDevice.uuid === 'undefined') {
      return rejectWithValue({ reason: 'MISSING_AUDIO_DEVICE_UUID' });
    }
    audioDeviceMap.set(audioDevice.uuid, audioDevice);
  }

  return {
    audioDevices: audioDevices.map(getAudioDeviceInfo),
    selectedDevice: selectedDevice ? getAudioDeviceInfo(selectedDevice) : null,
  };
});

const getAudioDeviceInfo = (audioDevice: TwilioAudioDevice) => {
  const uuid = audioDevice.uuid;
  const type = audioDevice.type;
  const name = audioDevice.name;

  return {
    uuid,
    type,
    name,
  };
};

export type AudioDeviceInfo = {
  uuid: string;
  type: TwilioAudioDevice.Type;
  name: string;
};

export type AudioDevicesState = AsyncStoreSlice<
  {
    audioDevices: AudioDeviceInfo[];
    selectedDevice: AudioDeviceInfo | null;
  },
  AudioDeviceRejectValue | { error: any }
>;

export const audioDevicesSlice = createSlice({
  name: 'audioDevices',
  initialState: { status: 'idle' } as AudioDevicesState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getAudioDevices.pending, () => {
        return { status: 'pending' };
      })
      .addCase(getAudioDevices.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(getAudioDevices.rejected, (_, action) => {
        switch (action.payload?.reason) {
          case 'AUDIO_DEVICES_NOT_FULFILLED':
            return {
              status: 'rejected',
              reason: action.payload.reason,
            };
          case 'AUDIO_DEVICES_NOT_FOUND':
            return {
              status: 'rejected',
              reason: action.payload.reason,
            };
          case 'MISSING_AUDIO_DEVICE_UUID':
            return {
              status: 'rejected',
              reason: action.payload.reason,
            };
          default:
            return {
              status: 'rejected',
              error: action.error,
            };
        }
      });
  },
});
