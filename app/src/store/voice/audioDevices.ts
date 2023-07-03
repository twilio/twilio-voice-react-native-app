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

export type AudioDeviceRejectValue =
  | { reason: 'AUDIO_DEVICES_NOT_FOUND' }
  | { reason: 'MISSING_AUDIO_DEVICE_UUID' }
  | { reason: 'GET_AUDIO_DEVICES_ERROR'; error: SerializedError };

export const selectAudioDevice = createTypedAsyncThunk<
  void,
  { audioDeviceUuid: string }
>('voice/selectAudioDevice', async () => {
  // TODO(mhuynh): VBLOCKS-1830; Implement this feature.
});

export const getAudioDevices = createTypedAsyncThunk<
  { audioDevices: AudioDeviceInfo[]; selectedDevice: AudioDeviceInfo | null },
  void,
  {
    rejectValue: AudioDeviceRejectValue;
  }
>('voice/getAudioDevices', async (_, { rejectWithValue }) => {
  const fetchAudioDevices = await settlePromise(voice.getAudioDevices());
  if (fetchAudioDevices?.status === 'rejected') {
    return rejectWithValue({
      reason: 'GET_AUDIO_DEVICES_ERROR',
      error: miniSerializeError(fetchAudioDevices.reason),
    });
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
  | AudioDeviceRejectValue
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
        .with({ reason: 'GET_AUDIO_DEVICES_ERROR' }, ({ reason, error }) => ({
          status: requestStatus,
          reason,
          error,
        }))
        .with(
          { reason: 'AUDIO_DEVICES_NOT_FOUND' },
          { reason: 'MISSING_AUDIO_DEVICE_UUID' },
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
