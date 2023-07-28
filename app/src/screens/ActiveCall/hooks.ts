import { useNavigation } from '@react-navigation/native';
import { AudioDevice as TwilioAudioDevice } from '@twilio/voice-react-native-sdk';
import React from 'react';
import { match, P } from 'ts-pattern';
import { useTypedDispatch } from '../../store/common';
import {
  type ActiveCall,
  disconnectActiveCall,
  muteActiveCall,
  sendDigitsActiveCall,
} from '../../store/voice/call/activeCall';
import {
  type AudioDevicesState,
  getAudioDevices,
  selectAudioDevice,
} from '../../store/voice/audioDevices';
import { StackNavigationProp } from '../types';
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

/**
 * Hook for audio device selection button handlers and state.
 * @param activeCall - The active call.
 * @param audioDevices - The available audio devices.
 * @param dispatch - The dispatch function for the Redux store.
 * @returns - Handlers and state for the audio device selection button.
 */
const useAudio = (
  activeCall: ActiveCall | undefined,
  audioDevices: AudioDevicesState,
  dispatch: ReturnType<typeof useTypedDispatch>,
): {
  selectedType?: TwilioAudioDevice.Type;
  onPressSpeaker?: () => void;
  onPressBluetooth?: () => void;
} => {
  const selectedType = React.useMemo((): TwilioAudioDevice.Type | undefined => {
    if (audioDevices.status !== 'fulfilled') {
      return;
    }
    return audioDevices.selectedDevice?.type;
  }, [audioDevices]);

  const bindDevice = React.useCallback(
    (type: TwilioAudioDevice.Type): (() => void) | undefined => {
      if (audioDevices.status !== 'fulfilled') {
        return;
      }

      const device = audioDevices.audioDevices.find((d) => d.type === type);
      if (typeof device === 'undefined') {
        return;
      }

      return () =>
        dispatch(selectAudioDevice({ audioDeviceUuid: device.uuid }));
    },
    [audioDevices, dispatch],
  );

  const selectEarpiece = React.useMemo(() => {
    return bindDevice(TwilioAudioDevice.Type.Earpiece);
  }, [bindDevice]);

  const selectSpeaker = React.useMemo(() => {
    return bindDevice(TwilioAudioDevice.Type.Speaker);
  }, [bindDevice]);

  const selectBluetooth = React.useMemo(() => {
    return bindDevice(TwilioAudioDevice.Type.Bluetooth);
  }, [bindDevice]);

  const onPressSpeaker = React.useMemo(() => {
    return selectedType === TwilioAudioDevice.Type.Speaker
      ? selectEarpiece
      : selectSpeaker;
  }, [selectEarpiece, selectSpeaker, selectedType]);

  const onPressBluetooth = React.useMemo(() => {
    return selectedType === TwilioAudioDevice.Type.Bluetooth
      ? selectEarpiece
      : selectBluetooth;
  }, [selectEarpiece, selectBluetooth, selectedType]);

  if (
    typeof activeCall === 'undefined' ||
    audioDevices.status !== 'fulfilled'
  ) {
    return {};
  }

  return {
    selectedType: audioDevices.selectedDevice?.type,
    onPressSpeaker,
    onPressBluetooth,
  };
};

/**
 * Hook for the active call screen. Creates handlers and state for the active
 * call screen.
 * @returns - Handlers and state for the active call screen.
 */
const useActiveCallScreen = (callSid?: string) => {
  const dispatch = useTypedDispatch();
  const navigation = useNavigation<StackNavigationProp<'App'>>();

  const audioDevices = useAudioDevices();

  const activeCall = useActiveCall(callSid);
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

  /**
   * Return to the prior screen when the call is disconnected.
   */
  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (
      activeCall?.status === 'fulfilled' &&
      activeCall.info.state === 'disconnected'
    ) {
      timeoutId = setTimeout(() => {
        navigation.navigate('App');
      }, 1000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [activeCall, navigation]);

  return {
    button: {
      dialpad: useDialpad(activeCall, dispatch),
      hangup: useHangup(activeCall, dispatch),
      mute: useMute(activeCall, dispatch),
      audio: useAudio(activeCall, audioDevices, dispatch),
    },
    callStatus,
    remoteParticipant,
  };
};

export default useActiveCallScreen;
