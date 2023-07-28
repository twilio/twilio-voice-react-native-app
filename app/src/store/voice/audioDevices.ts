import {
  createSlice,
  miniSerializeError,
  type SerializedError,
} from '@reduxjs/toolkit';
import { type AudioDevice as TwilioAudioDevice } from '@twilio/voice-react-native-sdk';
import { match } from 'ts-pattern';
import { voice, audioDeviceMap } from '../../util/voice';
import { type AsyncStoreSlice } from '../app';
import { createTypedAsyncThunk, generateThunkActionTypes } from '../common';
import { settlePromise } from '../../util/settlePromise';

export const sliceName = 'audioDevice' as const;

/**
 * Select audio device action.
 */
export const selectAudioDeviceActionTypes = generateThunkActionTypes(
  `${sliceName}/select`,
);
export type SelectAudioDeviceRejectValue =
  | { reason: 'AUDIO_DEVICE_UUID_NOT_FOUND' }
  | { reason: 'NATIVE_MODULE_REJECTED' };
export const selectAudioDevice = createTypedAsyncThunk<
  void,
  { audioDeviceUuid: string },
  { rejectValue: SelectAudioDeviceRejectValue }
>(
  selectAudioDeviceActionTypes.prefix,
  async ({ audioDeviceUuid }, { rejectWithValue }) => {
    const audioDevice = audioDeviceMap.get(audioDeviceUuid);
    if (typeof audioDevice === 'undefined') {
      return rejectWithValue({
        reason: 'AUDIO_DEVICE_UUID_NOT_FOUND',
      });
    }

    /**
     * After the native module successfully handles audio device selection, it
     * will fire `Voice.Event.AudioDevicesUpdated`.
     */
    const selectResult = await settlePromise(audioDevice.select());
    if (selectResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
      });
    }
  },
);

/**
 * Update audio device action. This action is dispatched when the native layer
 * notifies the app that audio devices have been changed through listener bound
 * to the following event:
 *
 * Voice.on(Voice.Event.AudioDevicesUpdated, listener)
 */
export const updateAudioDevicesActionTypes = generateThunkActionTypes(
  `${sliceName}/update`,
);
export type UpdateAudioDevicesRejectValue =
  | { reason: 'AUDIO_DEVICES_UNDEFINED' }
  | { reason: 'AUDIO_DEVICE_UUID_UNDEFINED' };
export const updateAudioDevices = createTypedAsyncThunk<
  { audioDevices: AudioDeviceInfo[]; selectedDevice?: AudioDeviceInfo },
  { audioDevices: TwilioAudioDevice[]; selectedDevice?: TwilioAudioDevice },
  { rejectValue: UpdateAudioDevicesRejectValue }
>(
  updateAudioDevicesActionTypes.prefix,
  async ({ audioDevices, selectedDevice }, { rejectWithValue }) => {
    /**
     * The native layer will give us an entirely fresh set of audio devices
     * every time the event fires.
     */
    audioDeviceMap.clear();

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
      selectedDevice:
        typeof selectedDevice === 'undefined'
          ? undefined
          : getAudioDeviceInfo(selectedDevice),
    };
  },
);

/**
 * Get audio devices action.
 */
export const getAudioDevicesActionTypes = generateThunkActionTypes(
  `${sliceName}/get`,
);
export type GetAudioDevicesRejectValue =
  | {
      reason: 'UPDATE_AUDIO_DEVICES_REJECTED';
      rejectValue?: UpdateAudioDevicesRejectValue;
      error: SerializedError;
    }
  | { reason: 'NATIVE_MODULE_REJECTED'; error: SerializedError };
export const getAudioDevices = createTypedAsyncThunk<
  void,
  void,
  { rejectValue: GetAudioDevicesRejectValue }
>(
  getAudioDevicesActionTypes.prefix,
  async (_, { dispatch, rejectWithValue }) => {
    const fetchAudioDevices = await settlePromise(voice.getAudioDevices());
    if (fetchAudioDevices?.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
        error: miniSerializeError(fetchAudioDevices.reason),
      });
    }

    const updateResult = await dispatch(
      updateAudioDevices(fetchAudioDevices.value),
    );
    if (updateAudioDevices.rejected.match(updateResult)) {
      return rejectWithValue({
        reason: 'UPDATE_AUDIO_DEVICES_REJECTED',
        rejectValue: updateResult.payload,
        error: updateResult.error,
      });
    }
  },
);

/**
 * Helper functions and types.
 */
export type AudioDeviceInfo = {
  uuid: string;
  type: TwilioAudioDevice.Type;
  name: string;
};

const getAudioDeviceInfo = (
  audioDevice: TwilioAudioDevice,
): AudioDeviceInfo => {
  const uuid = audioDevice.uuid;

  /**
   * TODO(mhuynh): we can remove this workaround after the next RN SDK release.
   * See VBLOCKS-1787 - "iOS discrepancy with audio device types".
   */
  const type = audioDevice.type.toLowerCase() as TwilioAudioDevice.Type;
  const name = audioDevice.name;

  return {
    uuid,
    type,
    name,
  };
};

/**
 * Audio device state.
 */
export type AudioDevicesState = AsyncStoreSlice<
  {
    audioDevices: AudioDeviceInfo[];
    selectedDevice?: AudioDeviceInfo;
  },
  | UpdateAudioDevicesRejectValue
  | {
      reason: 'UNEXPECTED_ERROR_OCCURRED';
      error: SerializedError;
    }
>;
export const audioDevicesSlice = createSlice({
  name: 'audioDevices',
  initialState: { status: 'idle' } as AudioDevicesState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(updateAudioDevices.pending, (): AudioDevicesState => {
      return { status: 'pending' };
    });

    builder.addCase(
      updateAudioDevices.fulfilled,
      (_, action): AudioDevicesState => {
        return {
          status: 'fulfilled',
          audioDevices: action.payload.audioDevices,
          selectedDevice: action.payload.selectedDevice,
        };
      },
    );

    builder.addCase(
      updateAudioDevices.rejected,
      (_, action): AudioDevicesState => {
        const {
          error,
          meta: { requestStatus: status },
        } = action;

        return match(action.payload)
          .with(
            { reason: 'AUDIO_DEVICES_UNDEFINED' },
            { reason: 'AUDIO_DEVICE_UUID_UNDEFINED' },
            (payload): AudioDevicesState => {
              return {
                status,
                reason: payload.reason,
              };
            },
          )
          .with(undefined, () => {
            return {
              status,
              reason: 'UNEXPECTED_ERROR_OCCURRED' as const,
              error,
            };
          })
          .exhaustive();
      },
    );
  },
});
