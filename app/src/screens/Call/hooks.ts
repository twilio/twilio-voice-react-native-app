import { AudioDevice as TwilioAudioDevice } from '@twilio/voice-react-native-sdk';
import React from 'react';
import { useTypedDispatch } from '../../store/app';
import {
  type ActiveCall,
  disconnectActiveCall,
  muteActiveCall,
  sendDtmfActiveCall,
} from '../../store/voice/call/activeCall';
import {
  type AudioDevicesState,
  getAudioDevices,
  selectAudioDevice,
} from '../../store/voice/audioDevices';
import {
  useActiveCall,
  useActiveCallRemoteParticipant,
  useActiveCallStatus,
} from '../../hooks/activeCall';
import { useAudioDevices } from '../../hooks/audioDevices';

/**
 * Hook for dialpad handlers and state.
 * @param activeCall - The active call.
 * @param dispatch - The dispatch function for the Redux store.
 * @returns - Handlers and state for the dialpad.
 */
const useCallDialpad = (
  activeCall: ActiveCall,
  dispatch: ReturnType<typeof useTypedDispatch>,
) => {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);

  const [handle, isDisabled] = React.useMemo(() => {
    if (activeCall?.status !== 'fulfilled') {
      return [undefined, true];
    }

    if (activeCall.callInfo.state === 'disconnected') {
      return [undefined, true];
    }

    return [
      (dialpadInput: string) => {
        dispatch(sendDtmfActiveCall({ dtmf: dialpadInput }));
      },
      false,
    ];
  }, [dispatch, activeCall]);

  return { handle, isDisabled, isVisible, setIsVisible };
};

/**
 * Hook for mute button handlers and state.
 * @param activeCall - The active call.
 * @param dispatch - The dispatch function for the Redux store.
 * @returns - Handlers and state for the mute button.
 */
const useCallMute = (
  activeCall: ActiveCall,
  dispatch: ReturnType<typeof useTypedDispatch>,
) => {
  const [handle, isDisabled, isActive] = React.useMemo(() => {
    if (activeCall?.status !== 'fulfilled') {
      return [undefined, true, false];
    }

    if (activeCall.callInfo.state === 'disconnected') {
      return [undefined, true, false];
    }

    const isMuted = activeCall.callInfo.isMuted;
    if (typeof isMuted === 'undefined') {
      return [undefined, true, false];
    }

    return [() => dispatch(muteActiveCall({ mute: !isMuted })), false, isMuted];
  }, [dispatch, activeCall]);

  return { handle, isActive, isDisabled };
};

/**
 * Hook for hangup button handlers and state.
 * @param activeCall - The active call.
 * @param dispatch - The dispatch function for the Redux store.
 * @returns - Handlers and state for the hangup button.
 */
const useCallHangup = (
  activeCall: ActiveCall,
  dispatch: ReturnType<typeof useTypedDispatch>,
) => {
  const [handle, isDisabled] = React.useMemo(() => {
    if (activeCall?.status !== 'fulfilled') {
      return [undefined, true];
    }

    if (activeCall.callInfo.state === 'disconnected') {
      return [undefined, true];
    }

    return [() => dispatch(disconnectActiveCall()), false];
  }, [dispatch, activeCall]);

  return { handle, isDisabled };
};

/**
 * Hook for audio device selection button handlers and state.
 * @param activeCall - The active call.
 * @param audioDevices - The available audio devices.
 * @param dispatch - The dispatch function for the Redux store.
 * @returns - Handlers and state for the audio device selection button.
 */
const useSelectAudioOutputDevice = (
  activeCall: ActiveCall,
  audioDevices: AudioDevicesState,
  dispatch: ReturnType<typeof useTypedDispatch>,
) => {
  const [handle, isDisabled, isActive] = React.useMemo(() => {
    if (activeCall?.status !== 'fulfilled') {
      return [undefined, true, false];
    }

    if (activeCall.callInfo.state === 'disconnected') {
      return [undefined, true, false];
    }

    if (audioDevices?.status !== 'fulfilled') {
      return [undefined, true, false];
    }

    const earpieceDevice = audioDevices.audioDevices.find(
      (dev) => dev.type === TwilioAudioDevice.Type.Earpiece,
    );

    const speakerDevice = audioDevices.audioDevices.find(
      (dev) => dev.type === TwilioAudioDevice.Type.Speaker,
    );

    if (
      typeof earpieceDevice === 'undefined' ||
      typeof speakerDevice === 'undefined'
    ) {
      return [undefined, true, false];
    }

    if (audioDevices.selectedDevice === null) {
      return [
        () =>
          dispatch(selectAudioDevice({ audioDeviceUuid: earpieceDevice.uuid })),
        false,
        false,
      ];
    }

    if (audioDevices.selectedDevice.type === TwilioAudioDevice.Type.Speaker) {
      return [
        () =>
          dispatch(selectAudioDevice({ audioDeviceUuid: earpieceDevice.uuid })),
        false,
        false,
      ];
    }

    if (audioDevices.selectedDevice.type === TwilioAudioDevice.Type.Earpiece) {
      return [
        () =>
          dispatch(selectAudioDevice({ audioDeviceUuid: speakerDevice.uuid })),
        false,
        true,
      ];
    }

    return [undefined, false, false];
  }, [dispatch, audioDevices, activeCall]);

  /**
   * Refresh the list of audio devices when the call screen is mounted.
   */
  React.useEffect(() => {
    dispatch(getAudioDevices());
  }, [dispatch]);

  return { handle, isActive, isDisabled };
};

/**
 * Hook for the active call screen. Creates handlers and state for the active
 * call screen.
 * @returns - Handlers and state for the active call screen.
 */
const useCall = () => {
  const dispatch = useTypedDispatch();

  const audioDevices = useAudioDevices();

  const activeCall = useActiveCall();
  const remoteParticipant = useActiveCallRemoteParticipant(activeCall);
  const callStatus = useActiveCallStatus(activeCall);

  return {
    button: {
      dialpad: useCallDialpad(activeCall, dispatch),
      hangup: useCallHangup(activeCall, dispatch),
      mute: useCallMute(activeCall, dispatch),
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

export default useCall;
