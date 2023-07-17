import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import RemoteParticipant from '../../components/Call/RemoteParticipant';
import MakeCallButton from '../../components/Call/MakeCallButton';
import EndCallButton from '../../components/Call/EndCallButton';
import { useCallInvite } from './hooks';

const TwilioLogo = require('../../../assets/icons/twilio-logo.png');

const CallInvite: React.FC = () => {
  const { callInviteEntity, handleAccept, handleReject } = useCallInvite();

  /**
   * Display nothing if there is no call invite and we're somehow on this
   * screen. This should not happen because we only render this screen in the
   * navigator when there is a call invite in the app state.
   */
  if (!callInviteEntity) {
    return null;
  }

  return (
    <View style={styles.container} testID="call_invite">
      <Image style={styles.logo} source={TwilioLogo} resizeMode="contain" />
      <RemoteParticipant
        title={callInviteEntity.info.from}
        subtitle="Incoming Call"
      />
      <View />
      <View style={styles.buttonContainer}>
        <MakeCallButton onPress={handleAccept} />
        <EndCallButton onPress={handleReject} />
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
