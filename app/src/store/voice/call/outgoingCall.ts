import { miniSerializeError, type SerializedError } from '@reduxjs/toolkit';
import { Call as TwilioCall } from '@twilio/voice-react-native-sdk';
import { voice, callMap } from '../../../util/voice';
import { settlePromise } from '../../../util/settlePromise';
import { createTypedAsyncThunk, generateThunkActionTypes } from '../../common';
import { type CallInfo, getCallInfo, type RecipientType } from './';
import { connectEvent, setActiveCallInfo } from './activeCall';

export type MakeOutgoingCallRejectValue =
  | {
      reason: 'TOKEN_UNFULFILLED';
    }
  | {
      reason: 'NATIVE_MODULE_REJECTED';
      error: SerializedError;
    };
export const makeOutgoingCallActionTypes =
  generateThunkActionTypes('call/makeOutgoing');
export const makeOutgoingCall = createTypedAsyncThunk<
  CallInfo,
  { recipientType: RecipientType; to: string },
  { rejectValue: MakeOutgoingCallRejectValue }
>(
  makeOutgoingCallActionTypes.prefix,
  async (
    { to, recipientType },
    { getState, dispatch, rejectWithValue, requestId },
  ) => {
    const token = getState().voice.accessToken;
    if (token?.status !== 'fulfilled') {
      return rejectWithValue({ reason: 'TOKEN_UNFULFILLED' });
    }

    const outgoingCallResult = await settlePromise(
      voice.connect(token.value, {
        params: {
          To: to,
          recipientType,
        },
      }),
    );
    if (outgoingCallResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
        error: miniSerializeError(outgoingCallResult.reason),
      });
    }

    const outgoingCall = outgoingCallResult.value;

    const callInfo = getCallInfo(outgoingCall);
    callMap.set(requestId, outgoingCall);

    outgoingCall.on(TwilioCall.Event.ConnectFailure, (error) =>
      console.error('ConnectFailure:', error),
    );
    outgoingCall.on(TwilioCall.Event.Reconnecting, (error) =>
      console.error('Reconnecting:', error),
    );
    outgoingCall.on(TwilioCall.Event.Disconnected, (error) => {
      // The type of error here is "TwilioError | undefined".
      if (error) {
        console.error('Disconnected:', error);
      }
    });

    Object.values(TwilioCall.Event).forEach((callEvent) => {
      outgoingCall.on(callEvent, () => {
        dispatch(
          setActiveCallInfo({ id: requestId, info: getCallInfo(outgoingCall) }),
        );
      });
    });

    outgoingCall.once(TwilioCall.Event.Connected, () => {
      dispatch(connectEvent({ id: requestId, timestamp: Date.now() }));
    });

    return callInfo;
  },
);
