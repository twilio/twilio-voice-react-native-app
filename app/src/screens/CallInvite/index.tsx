import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import RemoteParticipant from '../../components/Call/RemoteParticipant';
import MakeCallButton from '../../components/Call/MakeCallButton';
import EndCallButton from '../../components/Call/EndCallButton';
import { useIncomingCall } from './hooks';

const TwilioLogo = require('../../../assets/icons/twilio-logo.png');

const CallInvite: React.FC = () => {
  const { remoteParticipant } = useIncomingCall();

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={TwilioLogo} resizeMode="contain" />
      <RemoteParticipant {...remoteParticipant} />
      <View />
      <View style={styles.buttonContainer}>
        <MakeCallButton />
        <EndCallButton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'space-around',
  },
  logo: {
    maxHeight: '25%',
  },
});

export default CallInvite;
