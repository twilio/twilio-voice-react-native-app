import { AudioDevice as TwilioAudioDevice } from '@twilio/voice-react-native-sdk';
import React from 'react';
import { match, P } from 'ts-pattern';
import { type Dispatch } from '../../store/app';
import { useTypedDispatch } from '../../store/common';
import {
  type ActiveCall,
  disconnectActiveCall,
  muteActiveCall,
  sendDigitsActiveCall,
} from '../../store/voice/call/activeCall';
import {
  type AudioDeviceInfo,
  type AudioDevicesState,
  getAudioDevices,
  selectAudioDevice,
} from '../../store/voice/audioDevices';
import {
  useActiveCall,
  useActiveCallRemoteParticipant,
  useActiveCallDuration,
} from '../../hooks/activeCall';
import { useAudioDevices } from '../../hooks/audioDevices';

/**
 * Hook for dialpad handlers and state.
 * @param activeCall - The active call.
 * @param dispatch - The dispatch function for the Redux store.
 * @returns - Handlers and state for the dialpad.
 */
const useDialpad = (
  activeCall: ActiveCall | undefined,
  dispatch: ReturnType<typeof useTypedDispatch>,
) => {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);

  const [handle, isDisabled] = React.useMemo(
    () =>
      match<typeof activeCall, [(s: string) => void, boolean]>(activeCall)
        .with({ info: { state: 'connected' } }, (c) => [
          (dialpadInput: string) => {
            dispatch(sendDigitsActiveCall({ id: c.id, digits: dialpadInput }));
          },
          false,
        ])
        .otherwise(() => [() => {}, true]),
    [dispatch, activeCall],
  );

  return { handle, isDisabled, isVisible, setIsVisible };
};

/**
 * Hook for mute button handlers and state.
 * @param activeCall - The active call.
 * @param dispatch - The dispatch function for the Redux store.
 * @returns - Handlers and state for the mute button.
 */
const useMute = (
  activeCall: ActiveCall | undefined,
  dispatch: ReturnType<typeof useTypedDispatch>,
) => {
  const [handle, isDisabled, isActive] = React.useMemo(
    () =>
      match<typeof activeCall, [() => void, boolean, boolean]>(activeCall)
        .with({ info: { state: 'connected' } }, (c) => {
          const isMuted = Boolean(c.info.isMuted);
          return [
            () => {
              dispatch(muteActiveCall({ id: c.id, shouldMute: !isMuted }));
            },
            false,
            isMuted,
          ];
        })
        .otherwise(() => [() => {}, true, false]),
    [dispatch, activeCall],
  );

  return { handle, isActive, isDisabled };
};

/**
 * Hook for hangup button handlers and state.
 * @param activeCall - The active call.
 * @param dispatch - The dispatch function for the Redux store.
 * @returns - Handlers and state for the hangup button.
 */
const useHangup = (
  activeCall: ActiveCall | undefined,
  dispatch: ReturnType<typeof useTypedDispatch>,
) => {
  const [handle, isDisabled] = React.useMemo(
    () =>
      match<typeof activeCall, [() => void, boolean]>(activeCall)
        .with({ info: { state: P.not('disconnected') } }, (c) => [
          () => {
            dispatch(disconnectActiveCall({ id: c.id }));
          },
          false,
        ])
        .otherwise(() => [() => {}, true]),
    [dispatch, activeCall],
  );

  return { handle, isDisabled };
};

const matchOnAudioDevices = (
  audioDevices: AudioDeviceInfo[],
  selectedDevice: AudioDeviceInfo | null,
  dispatch: Dispatch,
) => {
  const earpieceDevice = audioDevices.find(
    (dev) => dev.type === TwilioAudioDevice.Type.Earpiece,
  );

  const speakerDevice = audioDevices.find(
    (dev) => dev.type === TwilioAudioDevice.Type.Speaker,
  );

  return match<
    [typeof earpieceDevice, typeof speakerDevice, typeof selectedDevice],
    [() => void, boolean, boolean]
  >([earpieceDevice, speakerDevice, selectedDevice])
    .with(
      [P.not(undefined), P._, null],
      [P.not(undefined), P._, { type: TwilioAudioDevice.Type.Speaker }],
      ([{ uuid }]) => [
        () => {
          dispatch(selectAudioDevice({ audioDeviceUuid: uuid }));
        },
        false,
        true,
      ],
    )
    .with(
      [P._, P.not(undefined), null],
      [P._, P.not(undefined), { type: TwilioAudioDevice.Type.Earpiece }],
      ([_, { uuid }]) => [
        () => {
          dispatch(selectAudioDevice({ audioDeviceUuid: uuid }));
        },
        false,
        false,
      ],
    )
    .otherwise(() => [() => {}, true, false]);
};

/**
 * Hook for audio device selection button handlers and state.
 * @param activeCall - The active call.
 * @param audioDevices - The available audio devices.
 * @param dispatch - The dispatch function for the Redux store.
 * @returns - Handlers and state for the audio device selection button.
 */
const useSelectAudioOutputDevice = (
  activeCall: ActiveCall | undefined,
  audioDevices: AudioDevicesState,
  dispatch: ReturnType<typeof useTypedDispatch>,
) => {
  const [handle, isDisabled, isActive] = React.useMemo(
    () =>
      match<
        [typeof activeCall, typeof audioDevices],
        [() => void, boolean, boolean]
      >([activeCall, audioDevices])
        .with(
          [{ info: { state: 'connected' } }, { status: 'fulfilled' }],
          ([_, au]) =>
            matchOnAudioDevices(au.audioDevices, au.selectedDevice, dispatch),
        )
        .otherwise(() => [() => {}, false, false]),
    [dispatch, audioDevices, activeCall],
  );

  return { handle, isActive, isDisabled };
};

/**
 * Hook for the active call screen. Creates handlers and state for the active
 * call screen.
 * @returns - Handlers and state for the active call screen.
 */
const useActiveCallScreen = () => {
  const dispatch = useTypedDispatch();

  const audioDevices = useAudioDevices();

  const activeCall = useActiveCall();
  const remoteParticipant = useActiveCallRemoteParticipant(activeCall);
  const callStatus = useActiveCallDuration(activeCall);

  /**
   * Refresh the list of audio devices when the call screen is mounted.
   */
  React.useEffect(() => {
    const getAudioDevicesEffect = async () => {
      const getAudioDevicesAction = await dispatch(getAudioDevices());
      if (getAudioDevices.rejected.match(getAudioDevicesAction)) {
        console.error(
          getAudioDevicesAction.payload || getAudioDevicesAction.error,
        );
      }
    };
    getAudioDevicesEffect();
  }, [dispatch]);

  return {
    button: {
      dialpad: useDialpad(activeCall, dispatch),
      hangup: useHangup(activeCall, dispatch),
      mute: useMute(activeCall, dispatch),
      selectAudioOutputDevice: useSelectAudioOutputDevice(
        activeCall,
        audioDevices,
        dispatch,
      ),
    },
    callStatus,
    remoteParticipant,
  };
};

export default useActiveCallScreen;
