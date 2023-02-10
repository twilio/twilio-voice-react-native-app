import { Call as TwilioCall } from '@twilio/voice-react-native-sdk';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import BackspaceButton from './BackspaceButton';
import MakeOutgoingCallButton from './MakeOutgoingCallButton';
import ToggleClientInputButton from './ToggleClientInputButton';
import Dialpad from '../../components/Dialpad';
import OutgoingRemoteParticipant from './OutgoingRemoteParticipant';
import { useTypedDispatch } from '../../store/app';
import { makeOutgoingCall } from '../../store/voice/call/outgoingCall';
import { getToken } from '../../store/voice/token';
import { type StackNavigationProp } from '../../types';
import { useActiveCall } from '../../hooks/activeCall';

const Dialer: React.FC = () => {
  const dispatch = useTypedDispatch();
  const navigation = useNavigation<StackNavigationProp<'App'>>();
  const [outgoingPstn, setOutgoingPstn] = React.useState<string>('');
  const [outgoingIdentity, setOutgoingIdentity] = React.useState<string>('');
  const [isOutgoingClient, setIsOutgoingClient] =
    React.useState<boolean>(false);
  const { activeCall } = useActiveCall();

  const handleDialpadInput = React.useCallback(
    (dialpadInput: string) => {
      if (isOutgoingClient) {
        return;
      }
      setOutgoingPstn(
        (currentOutgoingPstn) => currentOutgoingPstn + dialpadInput,
      );
    },
    [isOutgoingClient],
  );

  const handleToggleClientInputPress = React.useCallback(() => {
    setIsOutgoingClient((currentIsOutgoingClient) => !currentIsOutgoingClient);
  }, []);

  const isCallDisabled = React.useMemo(() => {
    switch (activeCall?.status) {
      case undefined:
        return false;
      case 'fulfilled':
        return activeCall.callInfo.state !== TwilioCall.State.Disconnected;
      case 'pending':
        return true;
      case 'rejected':
        return false;
    }
  }, [activeCall]);

  const isDialpadDisabled = React.useMemo(() => {
    return isCallDisabled || isOutgoingClient;
  }, [isCallDisabled, isOutgoingClient]);

  const handleCallPress = React.useCallback(async () => {
    const to = isOutgoingClient ? outgoingIdentity : outgoingPstn;

    const tokenAction = await dispatch(getToken());
    if (getToken.rejected.match(tokenAction)) {
      console.error(tokenAction.payload || tokenAction.error);
      return;
    }

    const callAction = await dispatch(
      makeOutgoingCall({
        recipientType: isOutgoingClient ? 'client' : 'pstn',
        to,
      }),
    );
    if (makeOutgoingCall.fulfilled.match(callAction)) {
      navigation.navigate('Call');
    } else {
      console.error(callAction.payload || callAction.error);
    }
  }, [dispatch, navigation, isOutgoingClient, outgoingPstn, outgoingIdentity]);

  const isBackspaceDisabled = React.useMemo(() => {
    return isCallDisabled || isOutgoingClient || outgoingPstn.length === 0;
  }, [isCallDisabled, isOutgoingClient, outgoingPstn]);

  const handleBackspacePress = React.useCallback(() => {
    setOutgoingPstn((currentOutgoingPstn) =>
      currentOutgoingPstn.length > 0
        ? currentOutgoingPstn.slice(0, currentOutgoingPstn.length - 1)
        : currentOutgoingPstn,
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <View style={styles.remoteParticipant}>
        <OutgoingRemoteParticipant
          isOutgoingClient={isOutgoingClient}
          setOutgoingIdentity={setOutgoingIdentity}
          outgoingPstn={outgoingPstn}
          outgoingIdentity={outgoingIdentity}
        />
      </View>
      <Dialpad disabled={isDialpadDisabled} onPress={handleDialpadInput} />
      <View style={styles.buttons}>
        <ToggleClientInputButton
          disabled={isCallDisabled}
          isOutgoingClient={isOutgoingClient}
          onPress={handleToggleClientInputPress}
        />
        <MakeOutgoingCallButton
          disabled={isCallDisabled}
          onPress={handleCallPress}
        />
        <BackspaceButton
          onPress={handleBackspacePress}
          disabled={isBackspaceDisabled}
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
