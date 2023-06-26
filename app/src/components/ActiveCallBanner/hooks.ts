import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { match } from 'ts-pattern';
import {
  useActiveCall,
  useActiveCallRemoteParticipant,
  useActiveCallDuration,
} from '../../hooks/activeCall';
import { type StackNavigationProp } from '../../screens/types';

export const useConnectedActiveCallBanner = () => {
  const navigation = useNavigation<StackNavigationProp<'App'>>();

  const onPress = React.useCallback(() => {
    navigation.navigate('Call');
  }, [navigation]);

  const activeCall = useActiveCall();
  const participant = useActiveCallRemoteParticipant(activeCall);
  const callDuration = useActiveCallDuration(activeCall);
  const hidden = match(activeCall)
    .with({ info: { state: 'connected' } }, () => false)
    .otherwise(() => true);

  return { hidden, onPress, participant, callDuration };
};
