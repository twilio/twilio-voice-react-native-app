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

const Dialer: React.FC = () => {
  const dispatch = useTypedDispatch();
  const navigation = useNavigation<StackNavigationProp<'App'>>();
  const [outgoingPstn, setOutgoingPstn] = React.useState<string>('');
  const [outgoingIdentity, setOutgoingIdentity] = React.useState<string>('');
  const [isOutgoingClient, setIsOutgoingClient] =
    React.useState<boolean>(false);

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

  const disabledBackspaceButton = React.useMemo(() => {
    return isOutgoingClient || outgoingPstn.length === 0;
  }, [isOutgoingClient, outgoingPstn]);
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
      <Dialpad disabled={isOutgoingClient} onPress={handleDialpadInput} />
      <View style={styles.buttons}>
        <ToggleClientInputButton
          isOutgoingClient={isOutgoingClient}
          onPress={handleToggleClientInputPress}
        />
        <MakeOutgoingCallButton onPress={handleCallPress} />
        <BackspaceButton
          onPress={handleBackspacePress}
          disabled={disabledBackspaceButton}
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
