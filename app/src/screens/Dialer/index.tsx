import React from 'react';
import { StyleSheet, View } from 'react-native';
import BackspaceButton from './BackspaceButton';
import MakeOutgoingCallButton from './MakeOutgoingCallButton';
import ToggleClientInputButton from './ToggleClientInputButton';
import Dialpad from '../../components/Dialpad';
import OutgoingRemoteParticipant from './OutgoingRemoteParticipant';
import useDialer from './hooks';

const Dialer: React.FC = () => {
  const {
    dialpad,
    isDisabled,
    outgoingRemoteParticipant,
    makeOutgoingCall,
    recipient,
  } = useDialer();

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <View style={styles.remoteParticipant}>
        <OutgoingRemoteParticipant
          outgoingIdentity={outgoingRemoteParticipant.clientIdentity}
          outgoingNumber={dialpad.outgoingNumber}
          recipientType={recipient.type}
          setOutgoingIdentity={outgoingRemoteParticipant.setClientIdentity}
        />
      </View>
      <Dialpad
        disabled={dialpad.isInputDisabled}
        onPress={dialpad.handleInput}
      />
      <View style={styles.buttons}>
        <ToggleClientInputButton
          disabled={isDisabled}
          onPress={recipient.handleToggle}
          recipientType={recipient.type}
        />
        <MakeOutgoingCallButton
          disabled={isDisabled}
          onPress={makeOutgoingCall.handle}
        />
        <BackspaceButton
          disabled={isDisabled}
          onPress={dialpad.handleBackspace}
        />
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
});

export default Dialer;
