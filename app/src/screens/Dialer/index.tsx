import React from 'react';
import { StyleSheet, View } from 'react-native';
import BackspaceButton from './BackspaceButton';
import MakeCallButton from '../../components/Call/MakeCallButton';
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
    <View style={styles.container} testID="dialer">
      <View style={styles.remoteParticipant}>
        <OutgoingRemoteParticipant
          outgoingIdentity={outgoing.client.value}
          outgoingNumber={outgoing.number.value}
          recipientType={recipientToggle.type}
          setOutgoingIdentity={outgoing.client.setValue}
        />
      </View>
      <View style={styles.dialpad}>
        <Dialpad
          disabled={dialpad.input.isDisabled}
          onPress={dialpad.input.handle}
        />
      </View>
      <View style={styles.buttons}>
        <ToggleClientInputButton
          disabled={recipientToggle.isDisabled}
          onPress={recipientToggle.handle}
          recipientType={recipientToggle.type}
        />
        <MakeCallButton
          disabled={makeCall.isDisabled}
          onPress={makeCall.handle}
        />
        {backspaceButton}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    height: '100%',
  },
  remoteParticipant: {
    padding: 16,
    height: '25%',
    flexDirection: 'column-reverse',
  },
  dialpad: {
    height: '55%',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    height: '20%',
  },
  emptyButton: {
    width: 96,
  },
});

export default Dialer;
