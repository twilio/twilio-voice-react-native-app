import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Call as TwilioCall } from '@twilio/voice-react-native-sdk';
import { voice, callMap } from '../../util/voice';
import { AsyncStoreSlice, createTypedAsyncThunk } from '../common';

const getCallInfo = (call: TwilioCall): CallInfo => {
  const uuid = call['_uuid'];
  const sid = call.getSid();
  const state = call.getState();
  const to = call.getTo();
  const from = call.getFrom();

  return {
    uuid,
    sid,
    state,
    to,
    from,
  };
};

export const makeOutgoingCall = createTypedAsyncThunk(
  'voice/makeOutgoingCall',
  async ({ to }: { to: string }, { getState, dispatch }) => {
    const { voice: { token } } = getState();

    if (token?.status !== 'fulfilled') {
      throw new Error();
    }

    const outgoingCall = await voice.connect(token.value, { To: to });

    const uuid = outgoingCall['_uuid'];

    callMap.set(uuid, outgoingCall);

    Object.values(TwilioCall.Event).forEach((callEvent) => {
      outgoingCall.on(callEvent, () => {
        dispatch(setCallInfo(getCallInfo(outgoingCall)))
      });
    });

    return getCallInfo(outgoingCall);
  },
);

export const disconnectOutgoingCall = createTypedAsyncThunk(
  'voice/disconnectOutgoingCall',
  async (_, { getState }) => {
    const outgoingCall = getState().voice.outgoingCall;

    if (outgoingCall?.status !== 'fulfilled') {
      throw new Error();
    }

    const call = callMap.get(outgoingCall.value.uuid);

    if (typeof call === 'undefined') {
      throw new Error();
    }

    await call.disconnect();
  },
);

export type CallInfo = {
  uuid: string;
  sid?: string;
  state?: string;
  to?: string;
  from?: string;
};

export type OutgoingCallState = AsyncStoreSlice<{ value: CallInfo }>;

export const outgoingCallSlice = createSlice({
  name: 'outgoingCall',
  initialState: null as OutgoingCallState,
  reducers: {
    setCallInfo(_, action: PayloadAction<CallInfo>) {
      return { status: 'fulfilled', value: action.payload };
    }
  },
  extraReducers(builder) {
    builder
      .addCase(makeOutgoingCall.pending, () => {
        return { status: 'pending' };
      })
      .addCase(makeOutgoingCall.fulfilled, (_, action) => {
        return { status: 'fulfilled', value: action.payload };
      })
      .addCase(makeOutgoingCall.rejected, () => {
        return { status: 'rejected' };
      });
  },
});

const { setCallInfo } = outgoingCallSlice.actions;
