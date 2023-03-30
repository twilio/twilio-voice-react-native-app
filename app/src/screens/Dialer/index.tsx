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

  const isOutgoingCallButtonDisabled =
    dialpad.outgoingNumber === '' || isDisabled;

  const isBackSpaceVisible = dialpad.outgoingNumber !== '';

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
          disabled={isOutgoingCallButtonDisabled}
          onPress={makeOutgoingCall.handle}
        />
        {isBackSpaceVisible ? (
          <BackspaceButton
            disabled={isDisabled}
            onPress={dialpad.handleBackspace}
          />
        ) : (
          <View style={styles.emptyButton} />
        )}
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
