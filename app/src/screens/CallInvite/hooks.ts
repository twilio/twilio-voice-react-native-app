import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useSelector } from 'react-redux';
import { type State } from '../../store/app';
import { useTypedDispatch } from '../../store/common';
import {
  acceptCallInvite,
  type CallInviteEntity,
  rejectCallInvite,
} from '../../store/voice/call/callInvite';
import { StackNavigationProp } from '../types';

type HookReturnValue = {
  callInviteEntity?: CallInviteEntity;
  handleAccept: () => Promise<void>;
  handleReject: () => Promise<void>;
};

export const useCallInvite = (): HookReturnValue => {
  const dispatch = useTypedDispatch();
  const navigation = useNavigation<StackNavigationProp<'Incoming Call'>>();

  // Get the first incoming call invite.
  const callInviteEntity: CallInviteEntity | undefined = useSelector(
    (state: State) => {
      if (state.voice.call.callInvite.ids.length === 0) {
        return undefined;
      }
      const [id] = state.voice.call.callInvite.ids;
      return state.voice.call.callInvite.entities[id];
    },
  );

  const handleAccept = React.useCallback(async () => {
    if (callInviteEntity?.id) {
      await dispatch(acceptCallInvite({ id: callInviteEntity.id }));
      navigation.navigate('Call', {});
    }
  }, [callInviteEntity, dispatch, navigation]);

  const handleReject = React.useCallback(async () => {
    if (callInviteEntity?.id) {
      await dispatch(rejectCallInvite({ id: callInviteEntity.id }));
    }
  }, [callInviteEntity, dispatch]);

  React.useEffect(() => {
    if (typeof callInviteEntity !== 'undefined') {
      return;
    }

    navigation.goBack();
  }, [callInviteEntity, navigation]);

  return {
    callInviteEntity,
    handleAccept,
    handleReject,
  };
};
