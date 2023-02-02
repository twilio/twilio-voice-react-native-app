import { AudioDevice as TwilioAudioDevice } from '@twilio/voice-react-native-sdk';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import Dialpad from '../../components/Dialpad';
import { useTypedDispatch, type State } from '../../store/app';
import {
  disconnectActiveCall,
  muteActiveCall,
  sendDtmfActiveCall,
} from '../../store/voice/call/activeCall';
import {
  getAudioDevices,
  selectAudioDevice,
} from '../../store/voice/audioDevices';
import RemoteParticipant from './RemoteParticipant';
import HangupButton from './HangupButton';
import MuteButton from './MuteButton';
import SelectAudioOutputDeviceButton from './SelectAudioOutputDeviceButton';
import ShowDialpadButton from './ShowDialpadButton';
import HideDialpadButton from './HideDialpadButton';

const Call: React.FC = () => {
  const dispatch = useTypedDispatch();
  // todo determine active call heuristic
  const activeCall = useSelector<State, State['voice']['call']['outgoingCall']>(
    (store) => store.voice.call.outgoingCall,
  );
  const [activeCallTime, setActiveCallTime] = React.useState<number | null>(
    null,
  );
  const audioDevices = useSelector<State, State['voice']['audioDevices']>(
    (store) => store.voice.audioDevices,
  );
  const title = React.useMemo<string>(() => {
    if (activeCall?.status !== 'fulfilled') {
      return '';
    }

    return activeCall.to || '';
  }, [activeCall]);
  const subtitle = React.useMemo<string>(() => {
    if (activeCall?.status !== 'fulfilled') {
      return '';
    }

    const state = activeCall.callInfo.state;
    if (state !== 'connected') {
      return state || '';
    }

    if (!activeCallTime) {
      return '';
    }

    const totalSeconds = Math.floor(activeCallTime / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainderSeconds = Math.floor(totalSeconds % 60);

    const minutesRepr = String(totalMinutes).padStart(2, '0');
    const secondsRepr = String(remainderSeconds).padStart(2, '0');

    return `${String(minutesRepr)}:${secondsRepr}`;
  }, [activeCall, activeCallTime]);
  const [isDialpadVisible, setIsDialpadVisible] =
    React.useState<boolean>(false);

  const [handleDialpadInput, isDialpadDisabled] = React.useMemo(() => {
    const noOp = () => {};

    if (activeCall?.status !== 'fulfilled') {
      return [noOp, true];
    }

    if (activeCall.callInfo.state === 'disconnected') {
      return [noOp, true];
    }

    return [
      (dialpadInput: string) => {
        dispatch(sendDtmfActiveCall({ dtmf: dialpadInput }));
      },
      false,
    ];
  }, [dispatch, activeCall]);

  const [handleMute, isMuteButtonDisabled, isMuteActive] = React.useMemo(() => {
    const noOp = () => {};

    if (activeCall?.status !== 'fulfilled') {
      return [noOp, true, false];
    }

    if (activeCall.callInfo.state === 'disconnected') {
      return [noOp, true, false];
    }

    const isMuted = activeCall.callInfo.isMuted;
    if (typeof isMuted === 'undefined') {
      return [noOp, true, false];
    }

    return [() => dispatch(muteActiveCall({ mute: !isMuted })), false, isMuted];
  }, [dispatch, activeCall]);

  const [handleHangup, isHangupButtonDisabled] = React.useMemo(() => {
    const noOp = () => {};

    if (activeCall?.status !== 'fulfilled') {
      return [noOp, true];
    }

    if (activeCall.callInfo.state === 'disconnected') {
      return [noOp, true];
    }

    return [() => dispatch(disconnectActiveCall()), false];
  }, [dispatch, activeCall]);

  const [handleSpeaker, isSpeakerDisabled, isSpeakerActive] =
    React.useMemo(() => {
      const noOp = () => {};

      if (activeCall?.status !== 'fulfilled') {
        return [noOp, true, false];
      }

      if (activeCall.callInfo.state === 'disconnected') {
        return [noOp, true, false];
      }

      if (audioDevices?.status !== 'fulfilled') {
        return [noOp, true, false];
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
        return [noOp, true, false];
      }

      if (audioDevices.selectedDevice === null) {
        return [
          () =>
            dispatch(
              selectAudioDevice({ audioDeviceUuid: earpieceDevice.uuid }),
            ),
          false,
          false,
        ];
      }

      if (audioDevices.selectedDevice.type === TwilioAudioDevice.Type.Speaker) {
        return [
          () =>
            dispatch(
              selectAudioDevice({ audioDeviceUuid: earpieceDevice.uuid }),
            ),
          false,
          false,
        ];
      }

      if (
        audioDevices.selectedDevice.type === TwilioAudioDevice.Type.Earpiece
      ) {
        return [
          () =>
            dispatch(
              selectAudioDevice({ audioDeviceUuid: speakerDevice.uuid }),
            ),
          false,
          true,
        ];
      }

      return [noOp, false, false];
    }, [dispatch, audioDevices, activeCall]);

  React.useEffect(() => {
    let timeoutId: number | null;

    const animate = () =>
      requestAnimationFrame(() => {
        if (
          activeCall?.status !== 'fulfilled' ||
          typeof activeCall.initialConnectTimestamp === 'undefined'
        ) {
          return;
        }
        setActiveCallTime(Date.now() - activeCall.initialConnectTimestamp);
        timeoutId = setTimeout(animate, 250);
      });
    animate();

    return () => {
      if (timeoutId !== null) {
        clearInterval(timeoutId);
      }
    };
  }, [activeCall]);

  /**
   * Refresh the list of audio devices when the call screen is mounted.
   */
  React.useEffect(() => {
    dispatch(getAudioDevices());
  }, [dispatch]);

  const dialpadView = React.useMemo(
    () => (
      <>
        <Dialpad disabled={isDialpadDisabled} onPress={handleDialpadInput} />
        <View style={styles.buttonBox}>
          <HideDialpadButton onPress={() => setIsDialpadVisible(false)} />
          <HangupButton
            disabled={isHangupButtonDisabled}
            onPress={handleHangup}
          />
          <View style={styles.buttonSpacer} />
        </View>
      </>
    ),
    [
      isHangupButtonDisabled,
      handleHangup,
      isDialpadDisabled,
      handleDialpadInput,
    ],
  );

  const callControlView = React.useMemo(
    () => (
      <>
        <View style={styles.buttonBox}>
          <MuteButton
            active={isMuteActive}
            disabled={isMuteButtonDisabled}
            onPress={handleMute}
          />
          <ShowDialpadButton
            disabled={isDialpadDisabled}
            onPress={() => setIsDialpadVisible(true)}
          />
          <SelectAudioOutputDeviceButton
            active={isSpeakerActive}
            disabled={isSpeakerDisabled}
            onPress={handleSpeaker}
          />
        </View>
        <HangupButton
          disabled={isHangupButtonDisabled}
          onPress={handleHangup}
        />
      </>
    ),
    [
      isMuteActive,
      isMuteButtonDisabled,
      handleMute,
      isDialpadDisabled,
      isSpeakerDisabled,
      isSpeakerActive,
      handleSpeaker,
      isHangupButtonDisabled,
      handleHangup,
    ],
  );

  return (
    <View style={styles.container}>
      <View style={styles.containerSpacer} />
      <View style={styles.remoteParticipant}>
        <RemoteParticipant title={title} subtitle={subtitle} />
      </View>
      {isDialpadVisible ? dialpadView : callControlView}
      <View style={styles.containerSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  containerSpacer: {
    flexGrow: 1,
  },
  remoteParticipant: {
    padding: 16,
  },
  buttonBox: {
    display: 'flex',
    flexDirection: 'row',
  },
  buttonSpacer: {
    width: 96,
  },
});

export default Call;
