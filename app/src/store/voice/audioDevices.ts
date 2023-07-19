import {
  createSlice,
  miniSerializeError,
  type SerializedError,
} from '@reduxjs/toolkit';
import { type AudioDevice as TwilioAudioDevice } from '@twilio/voice-react-native-sdk';
import { match } from 'ts-pattern';
import { voice, audioDeviceMap } from '../../util/voice';
import { type AsyncStoreSlice } from '../app';
import { createTypedAsyncThunk } from '../common';
import { settlePromise } from '../../util/settlePromise';

export type SelectAudioDeviceRejectValue =
  | { reason: 'AUDIO_DEVICE_UUID_NOT_FOUND' }
  | { reason: 'NATIVE_MODULE_REJECTED' };
export const selectAudioDevice = createTypedAsyncThunk<
  void,
  { audioDeviceUuid: string },
  { rejectValue: SelectAudioDeviceRejectValue }
>(
  'voice/selectAudioDevice',
  async ({ audioDeviceUuid }, { rejectWithValue }) => {
    const audioDevice = audioDeviceMap.get(audioDeviceUuid);
    if (typeof audioDevice === 'undefined') {
      return rejectWithValue({
        reason: 'AUDIO_DEVICE_UUID_NOT_FOUND',
      });
    }

    const selectResult = await settlePromise(audioDevice.select());
    if (selectResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
      });
    }
  },
);

export type GetAudioDeviceRejectValue =
  | { reason: 'AUDIO_DEVICES_UNDEFINED' }
  | { reason: 'AUDIO_DEVICE_UUID_UNDEFINED' }
  | { reason: 'NATIVE_MODULE_REJECTED'; error: SerializedError };
export const getAudioDevices = createTypedAsyncThunk<
  { audioDevices: AudioDeviceInfo[]; selectedDevice: AudioDeviceInfo | null },
  void,
  { rejectValue: GetAudioDeviceRejectValue }
>('voice/getAudioDevices', async (_, { rejectWithValue }) => {
  const fetchAudioDevices = await settlePromise(voice.getAudioDevices());
  if (fetchAudioDevices?.status === 'rejected') {
    return rejectWithValue({
      reason: 'NATIVE_MODULE_REJECTED',
      error: miniSerializeError(fetchAudioDevices.reason),
    });
  }

  const { audioDevices, selectedDevice } = fetchAudioDevices.value;
  if (typeof audioDevices === 'undefined') {
    return rejectWithValue({ reason: 'AUDIO_DEVICES_UNDEFINED' });
  }

  for (const audioDevice of audioDevices) {
    if (typeof audioDevice.uuid === 'undefined') {
      return rejectWithValue({ reason: 'AUDIO_DEVICE_UUID_UNDEFINED' });
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
  | GetAudioDeviceRejectValue
  | {
      error: SerializedError;
    }
>;

export const audioDevicesSlice = createSlice({
  name: 'audioDevices',
  initialState: { status: 'idle' } as AudioDevicesState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getAudioDevices.pending, () => {
      return { status: 'pending' };
    });

    builder.addCase(getAudioDevices.fulfilled, (_, action) => {
      return { status: 'fulfilled', ...action.payload };
    });

    builder.addCase(getAudioDevices.rejected, (_, action) => {
      const { requestStatus } = action.meta;
      return match(action.payload)
        .with({ reason: 'NATIVE_MODULE_REJECTED' }, ({ reason, error }) => ({
          status: requestStatus,
          reason,
          error,
        }))
        .with(
          { reason: 'AUDIO_DEVICES_UNDEFINED' },
          { reason: 'AUDIO_DEVICE_UUID_UNDEFINED' },
          ({ reason }) => ({
            status: requestStatus,
            reason,
          }),
        )
        .with(undefined, () => ({ status: requestStatus, error: action.error }))
        .exhaustive();
    });
  },
});
