import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Dialpad from '../../components/Dialpad';
import RemoteParticipant from '../../components/Call/RemoteParticipant';
import EndCallButton from '../../components/Call/EndCallButton';
import MuteButton from './MuteButton';
import SelectAudioOutputDeviceButton from './SelectAudioOutputDeviceButton';
import ShowDialpadButton from './ShowDialpadButton';
import HideDialpadButton from './HideDialpadButton';
import useActiveCallScreen from './hooks';
import { useNavigation } from '@react-navigation/native';
import { type StackNavigationProp } from '../types';
import { Call as TwilioCall } from '@twilio/voice-react-native-sdk';

const ActiveCall: React.FC = () => {
  const {
    button: { dialpad, hangup, mute, selectAudioOutputDevice },
    callStatus,
    remoteParticipant,
  } = useActiveCallScreen();

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
          <SelectAudioOutputDeviceButton
            active={selectAudioOutputDevice.isActive}
            disabled={selectAudioOutputDevice.isDisabled}
            onPress={selectAudioOutputDevice.handle}
          />
        </View>
        <EndCallButton disabled={hangup.isDisabled} onPress={hangup.handle} />
      </>
    ),
    [dialpad, hangup, mute, selectAudioOutputDevice],
  );

  const navigation = useNavigation<StackNavigationProp<'App'>>();

  useEffect(() => {
    if (callStatus === TwilioCall.State.Disconnected) {
      setTimeout(() => navigation.navigate('Dialer'), 1000);
    }
  }, [callStatus, navigation]);

  return (
    <View style={styles.container}>
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
