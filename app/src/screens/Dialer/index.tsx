import React from 'react';
import { StyleSheet, View } from 'react-native';
import BackspaceButton from './BackspaceButton';
import MakeOutgoingCallButton from './MakeOutgoingCallButton';
import ToggleClientInputButton from './ToggleClientInputButton';
import Dialpad from '../../components/Dialpad';
import OutgoingRemoteParticipant from './OutgoingRemoteParticipant';
import useDialer from './hooks';

const Dialer: React.FC = () => {
  const { dialpad, makeCall, outgoing, recipientToggle } = useDialer();

  const backspaceButton = React.useMemo(
    () =>
      dialpad.backspace.isDisabled ? (
        <View style={styles.emptyButton} />
      ) : (
        <BackspaceButton onPress={dialpad.backspace.handle} />
      ),
    [dialpad.backspace.isDisabled, dialpad.backspace.handle],
  );

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <View style={styles.remoteParticipant}>
        <OutgoingRemoteParticipant
          outgoingIdentity={outgoing.client.value}
          outgoingNumber={outgoing.number.value}
          recipientType={recipientToggle.type}
          setOutgoingIdentity={outgoing.client.setValue}
        />
      </View>
      <Dialpad
        disabled={dialpad.input.isDisabled}
        onPress={dialpad.input.handle}
      />
      <View style={styles.buttons}>
        <ToggleClientInputButton
          disabled={recipientToggle.isDisabled}
          onPress={recipientToggle.handle}
          recipientType={recipientToggle.type}
        />
        <MakeOutgoingCallButton
          disabled={makeCall.isDisabled}
          onPress={makeCall.handle}
        />
        {backspaceButton}
      </View>
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  spacer: {
    flexGrow: 1,
  },
  remoteParticipant: {
    alignSelf: 'stretch',
    padding: 16,
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
  },
  emptyButton: {
    width: 96,
  },
});

export default Dialer;
