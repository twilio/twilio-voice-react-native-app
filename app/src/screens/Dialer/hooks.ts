import { Call as TwilioCall } from '@twilio/voice-react-native-sdk';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTypedDispatch } from '../../store/app';
import {
  makeOutgoingCall as makeOutgoingCallAction,
  type RecipientType,
} from '../../store/voice/call/outgoingCall';
import { getToken } from '../../store/voice/token';
import { type StackNavigationProp } from '../../types';
import { useActiveCall } from '../../hooks/activeCall';

/**
 * Hook for the dialpad.
 * @param recipientType - The recipient type. A string with value "client" or
 * "number".
 * @param isDialerDisabled - Boolean if the dialer is disabled entirely.
 * @returns - Handlers and state for the dialer screen.
 */
const useDialpad = (
  recipientType: RecipientType,
  isDialerDisabled: boolean,
) => {
  const isRecipientTypeNumber = recipientType === 'number';

  const [outgoingNumber, setOutgoingNumber] = React.useState<string>('');

  const handleInput = React.useCallback(
    (dialpadInput: string) => {
      if (!isRecipientTypeNumber) {
        return;
      }
      setOutgoingNumber(
        (currentOutgoingNumber) => currentOutgoingNumber + dialpadInput,
      );
    },
    [isRecipientTypeNumber],
  );

  const isInputDisabled = React.useMemo(() => {
    return isDialerDisabled || recipientType !== 'number';
  }, [isDialerDisabled, recipientType]);

  const isBackspaceDisabled = React.useMemo(() => {
    return (
      isDialerDisabled || !isRecipientTypeNumber || outgoingNumber.length === 0
    );
  }, [isDialerDisabled, isRecipientTypeNumber, outgoingNumber]);

  const handleBackspace = React.useCallback(() => {
    setOutgoingNumber((currentOutgoingNumber) =>
      currentOutgoingNumber.length > 0
        ? currentOutgoingNumber.slice(0, currentOutgoingNumber.length - 1)
        : currentOutgoingNumber,
    );
  }, []);

  return {
    handleInput,
    handleBackspace,
    isInputDisabled,
    isBackspaceDisabled,
    outgoingNumber,
  };
};

/**
 * Hook for the remote participant text field.
 * @returns - Handlers and state for the remote participant text field.
 */
const useOutgoingRemoteParticipant = () => {
  const [clientIdentity, setClientIdentity] = React.useState<string>('');

  return { clientIdentity, setClientIdentity };
};

/**
 * Hook for the recipient type.
 * @returns - Handlers and state for the recipient type.
 */
const useToggleRecipientType = () => {
  const [type, setType] = React.useState<RecipientType>('number');

  const handleToggle = React.useCallback(() => {
    setType((currentType) => (currentType === 'client' ? 'number' : 'client'));
  }, []);

  return { handleToggle, type };
};

/**
 * Hook for handling making outgoing calls. Hooks into Redux state to issue
 * thunk actions.
 * @param dispatch - A Redux dispatch function.
 * @param navigation - A React Navigation navigation function.
 * @param recipientType - The recipient type. A string with value "client" or
 * "number".
 * @param to - The recipient. Either a string of numbers for PSTN calls or
 * client identity string for client-to-client calls.
 * @returns - Handler for making an outgoing call.
 */
const useMakeOutgoingCall = (
  dispatch: ReturnType<typeof useTypedDispatch>,
  navigation: StackNavigationProp<'App'>,
  recipientType: RecipientType,
  to: string,
) => {
  const handle = React.useCallback(async () => {
    const tokenAction = await dispatch(getToken());
    if (getToken.rejected.match(tokenAction)) {
      console.error(tokenAction.payload || tokenAction.error);
      return;
    }

    const callAction = await dispatch(
      makeOutgoingCallAction({
        recipientType,
        to,
      }),
    );
    if (makeOutgoingCallAction.fulfilled.match(callAction)) {
      navigation.navigate('Call');
    } else {
      console.error(callAction.payload || callAction.error);
    }
  }, [dispatch, navigation, recipientType, to]);

  return { handle };
};

/**
 * Hook for the dialer.
 * @returns - Handlers and state for the dialer.
 */
const useDialer = () => {
  const dispatch = useTypedDispatch();
  const navigation = useNavigation<StackNavigationProp<'App'>>();

  const activeCall = useActiveCall();

  const isDisabled = React.useMemo(() => {
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

  const recipient = useToggleRecipientType();
  const dialpad = useDialpad(recipient.type, isDisabled);
  const outgoingRemoteParticipant = useOutgoingRemoteParticipant();

  const to = React.useMemo(() => {
    return recipient.type === 'client'
      ? outgoingRemoteParticipant.clientIdentity
      : dialpad.outgoingNumber;
  }, [
    recipient.type,
    outgoingRemoteParticipant.clientIdentity,
    dialpad.outgoingNumber,
  ]);

  const makeOutgoingCall = useMakeOutgoingCall(
    dispatch,
    navigation,
    recipient.type,
    to,
  );

  return {
    dialpad,
    isDisabled,
    makeOutgoingCall,
    outgoingRemoteParticipant,
    recipient,
  };
};

export default useDialer;