import {
  createSlice,
  createAsyncThunk,
  miniSerializeError,
  type SerializedError,
} from '@reduxjs/toolkit';
import { type AudioDevice as TwilioAudioDevice } from '@twilio/voice-react-native-sdk';
import { match } from 'ts-pattern';
import { voice, audioDeviceMap } from '../../util/voice';
import { type AsyncStoreSlice, type State, type Dispatch } from '../app';

export const selectAudioDevice = createAsyncThunk<
  void,
  { audioDeviceUuid: string },
  { state: State; dispatch: Dispatch }
>('voice/selectAudioDevice', async () => {
  // TODO(mhuynh): VBLOCKS-1830; Implement this feature.
});

export const getAudioDevices = createAsyncThunk<
  { audioDevices: AudioDeviceInfo[]; selectedDevice: AudioDeviceInfo | null },
  void,
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: {
      reason: 'VOICE_GET_AUDIO_DEVICES_ERROR';
      error: SerializedError;
    };
  }
>('voice/getAudioDevices', async (_, { rejectWithValue }) => {
  try {
    const { audioDevices, selectedDevice } = await voice.getAudioDevices();

    for (const audioDevice of audioDevices) {
      audioDeviceMap.set(audioDevice.uuid, audioDevice);
    }

    return {
      audioDevices: audioDevices.map(getAudioDeviceInfo),
      selectedDevice: selectedDevice
        ? getAudioDeviceInfo(selectedDevice)
        : null,
    };
  } catch (error) {
    return rejectWithValue({
      reason: 'VOICE_GET_AUDIO_DEVICES_ERROR',
      error: miniSerializeError(error),
    });
  }
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
  {
    reason?: 'VOICE_GET_AUDIO_DEVICES_ERROR';
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
        .with(
          { reason: 'VOICE_GET_AUDIO_DEVICES_ERROR' },
          ({ reason, error }) => ({ status: requestStatus, reason, error }),
        )
        .with(undefined, () => ({ status: requestStatus, error: action.error }))
        .exhaustive();
    });
  },
});
