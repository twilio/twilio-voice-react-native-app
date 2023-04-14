import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { type AudioDevice as TwilioAudioDevice } from '@twilio/voice-react-native-sdk';
import { voice, audioDeviceMap } from '../../util/voice';
import { type AsyncStoreSlice, type State, type Dispatch } from '../app';

export const selectAudioDevice = createAsyncThunk<
  void,
  { audioDeviceUuid: string },
  { state: State; dispatch: Dispatch }
>('voice/selectAudioDevice', async () => {});

export const getAudioDevices = createAsyncThunk<
  { audioDevices: AudioDeviceInfo[]; selectedDevice: AudioDeviceInfo | null },
  void,
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: { reason: 'VOICE_GET_AUDIO_DEVICES_ERROR'; error: any };
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
    return rejectWithValue({ reason: 'VOICE_GET_AUDIO_DEVICES_ERROR', error });
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
    reason: 'VOICE_GET_AUDIO_DEVICES_ERROR' | undefined;
    error: any;
  }
>;

export const audioDevicesSlice = createSlice({
  name: 'audioDevices',
  initialState: null as AudioDevicesState,
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
        return {
          status: 'rejected',
          reason: action.payload?.reason,
          error: action.payload?.error || action.error,
        };
      });
  },
});
