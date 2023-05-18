import { Call as TwilioCall } from '@twilio/voice-react-native-sdk';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { match } from 'ts-pattern';
import { useTypedDispatch } from '../../store/common';
import { makeOutgoingCall as makeOutgoingCallAction } from '../../store/voice/call/outgoingCall';
import { type RecipientType } from '../../store/voice/call';
import { getAccessToken } from '../../store/voice/accessToken';
import { type StackNavigationProp } from '../types';
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
  outgoingNumber: string,
  setOutgoingNumber: React.Dispatch<React.SetStateAction<string>>,
  isDialerDisabled: boolean,
) => {
  const isRecipientTypeNumber = recipientType === 'number';

  const handleInput = React.useCallback(
    (dialpadInput: string) => {
      if (!isRecipientTypeNumber) {
        return;
      }
      setOutgoingNumber(
        (currentOutgoingNumber) => currentOutgoingNumber + dialpadInput,
      );
    },
    [isRecipientTypeNumber, setOutgoingNumber],
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
  }, [setOutgoingNumber]);

  return {
    input: {
      handle: handleInput,
      isDisabled: isInputDisabled,
    },
    backspace: {
      handle: handleBackspace,
      isDisabled: isBackspaceDisabled,
    },
  };
};

/**
 * Hook for the recipient type.
 * @returns - Handlers and state for the recipient type.
 */
const useToggleRecipientType = (isDialerDisabled: boolean) => {
  const [type, setType] = React.useState<RecipientType>('number');

  const handle = React.useCallback(() => {
    setType((currentType) => (currentType === 'client' ? 'number' : 'client'));
  }, []);

  return { isDisabled: isDialerDisabled, handle, type };
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
  outgoingClient: string,
  outgoingNumber: string,
  isDialerDisabled: boolean,
) => {
  const to = recipientType === 'client' ? outgoingClient : outgoingNumber;

  const handle = React.useCallback(async () => {
    const tokenAction = await dispatch(getAccessToken());
    if (getAccessToken.rejected.match(tokenAction)) {
      console.error(tokenAction.payload || tokenAction.error);
      return;
    }

    const callAction = await dispatch(
      makeOutgoingCallAction({
        recipientType,
        to,
      }),
    );
    if (makeOutgoingCallAction.rejected.match(callAction)) {
      console.error(callAction.payload || callAction.error);
      return;
    }

    navigation.navigate('Call');
  }, [dispatch, navigation, recipientType, to]);

  const isDisabled = React.useMemo(() => {
    return isDialerDisabled || recipientType === 'client'
      ? outgoingClient.length === 0
      : outgoingNumber.length === 0;
  }, [isDialerDisabled, outgoingClient, outgoingNumber, recipientType]);

  return { handle, isDisabled };
};

/**
 * Hook for the dialer.
 * @returns - Handlers and state for the dialer.
 */
const useDialer = () => {
  const dispatch = useTypedDispatch();
  const navigation = useNavigation<StackNavigationProp<'App'>>();

  const activeCall = useActiveCall();

  const isDialerDisabled = React.useMemo(
    () =>
      match(activeCall)
        .with({ status: 'pending' }, () => true)
        .with(
          { status: 'fulfilled' },
          (c) => c.info.state !== TwilioCall.State.Disconnected,
        )
        .otherwise(() => false),
    [activeCall],
  );

  const [outgoingClient, setOutgoingClient] = React.useState<string>('');
  const [outgoingNumber, setOutgoingNumber] = React.useState<string>('');

  const recipientToggle = useToggleRecipientType(isDialerDisabled);
  const dialpad = useDialpad(
    recipientToggle.type,
    outgoingNumber,
    setOutgoingNumber,
    isDialerDisabled,
  );
  const makeCall = useMakeOutgoingCall(
    dispatch,
    navigation,
    recipientToggle.type,
    outgoingClient,
    outgoingNumber,
    isDialerDisabled,
  );

  return {
    dialpad,
    makeCall,
    recipientToggle,
    outgoing: {
      client: {
        value: outgoingClient,
        setValue: setOutgoingClient,
      },
      number: {
        value: outgoingNumber,
        setValue: setOutgoingNumber,
      },
    },
  };
};

export default useDialer;
