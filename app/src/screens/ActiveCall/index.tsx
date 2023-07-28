import { AudioDevice as TwilioAudioDevice } from '@twilio/voice-react-native-sdk';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Dialpad from '../../components/Dialpad';
import RemoteParticipant from '../../components/Call/RemoteParticipant';
import EndCallButton from '../../components/Call/EndCallButton';
import { type StackScreenProps } from '../types';
import MuteButton from './MuteButton';
import SpeakerButton from './SpeakerButton';
import BluetoothButton from './BluetoothButton';
import ShowDialpadButton from './ShowDialpadButton';
import HideDialpadButton from './HideDialpadButton';
import useActiveCallScreen from './hooks';

export type Props = StackScreenProps<'Call'>;

const ActiveCall: React.FC<Props> = (props) => {
  const callSid = props.route.params?.callSid;

  const {
    button: { dialpad, hangup, mute, audio },
    callStatus,
    remoteParticipant,
  } = useActiveCallScreen(callSid);

  const dialpadView = React.useMemo(
    () => (
      <>
        <Dialpad disabled={dialpad.isDisabled} onPress={dialpad.handle} />
        <View style={styles.buttonBox}>
          <HideDialpadButton onPress={() => dialpad.setIsVisible(false)} />
          <EndCallButton disabled={hangup.isDisabled} onPress={hangup.handle} />
          <View style={styles.buttonSpacer} />
        </View>
      </>
    ),
    [dialpad, hangup],
  );

  const callControlView = React.useMemo(
    () => (
      <>
        <View style={styles.buttonBox}>
          <MuteButton
            active={mute.isActive}
            disabled={mute.isDisabled}
            onPress={mute.handle}
          />
          <ShowDialpadButton
            disabled={dialpad.isDisabled}
            onPress={() => dialpad.setIsVisible(true)}
          />
          <SpeakerButton
            active={audio.selectedType === TwilioAudioDevice.Type.Speaker}
            disabled={typeof audio.onPressSpeaker === 'undefined'}
            onPress={audio.onPressSpeaker}
          />
        </View>
        <View style={styles.buttonBox}>
          <BluetoothButton
            active={audio.selectedType === TwilioAudioDevice.Type.Bluetooth}
            disabled={typeof audio.onPressBluetooth === 'undefined'}
            onPress={audio.onPressBluetooth}
          />
        </View>
        <EndCallButton disabled={hangup.isDisabled} onPress={hangup.handle} />
      </>
    ),
    [dialpad, hangup, mute, audio],
  );

  return (
    <View style={styles.container} testID="active_call">
      <View style={styles.containerSpacer} />
      <View style={styles.remoteParticipant}>
        <RemoteParticipant title={remoteParticipant} subtitle={callStatus} />
      </View>
      {dialpad.isVisible ? dialpadView : callControlView}
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

export default ActiveCall;
