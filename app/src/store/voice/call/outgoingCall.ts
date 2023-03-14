import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { Call as TwilioCall } from '@twilio/voice-react-native-sdk';
import { voice, callMap } from '../../../util/voice';
import { type AsyncStoreSlice, type State, type Dispatch } from '../../app';
import { getCallInfo, type CallInfo } from './';

export type RecipientType = 'client' | 'number';

export const makeOutgoingCall = createAsyncThunk<
  CallInfo,
  { recipientType: RecipientType; to: string },
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: 'TOKEN_UNFULFILLED';
  }
>(
  'voice/makeOutgoingCall',
  async ({ to, recipientType }, { getState, dispatch, rejectWithValue }) => {
    const token = getState().voice.token;

    if (token?.status !== 'fulfilled') {
      return rejectWithValue('TOKEN_UNFULFILLED');
    }

    const outgoingCall = await voice.connect(token.value, {
      params: {
        To: to,
        recipientType,
      },
    });

    // eslint-disable-next-line dot-notation
    const uuid = outgoingCall['_uuid'];

    callMap.set(uuid, outgoingCall);

    Object.values(TwilioCall.Event).forEach((callEvent) => {
      outgoingCall.on(callEvent, () => {
        console.log('dispatching', callEvent);
        const callInfo = getCallInfo(outgoingCall);
        dispatch(setOutgoingCallInfo({ to, callInfo }));
      });
    });

    outgoingCall.once(TwilioCall.Event.Connected, () => {
      console.log('dispatching initial connect');
      dispatch(handleConnectEvent({ time: Date.now() }));
    });

    const callInfo = getCallInfo(outgoingCall);
    dispatch(setOutgoingCallInfo({ to, callInfo }));
    return callInfo;
  },
);

export type OutgoingCallState = AsyncStoreSlice<{
  initialConnectTimestamp?: number;
  callInfo: CallInfo;
  to: string;
}>;

export const outgoingCallSlice = createSlice({
  name: 'outgoingCall',
  initialState: null as OutgoingCallState,
  reducers: {
    setOutgoingCallInfo(
      state,
      action: PayloadAction<{ to: string; callInfo: CallInfo }>,
    ) {
      return {
        status: 'fulfilled',
        to: action.payload.to,
        callInfo: action.payload.callInfo,
        ...(state?.status === 'fulfilled'
          ? { initialConnectTimestamp: state.initialConnectTimestamp }
          : {}),
      };
    },
    handleConnectEvent(state, action: PayloadAction<{ time: number }>) {
      if (state?.status === 'fulfilled') {
        state.initialConnectTimestamp ??= action.payload.time;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(makeOutgoingCall.pending, () => {
        return { status: 'pending' };
      })
      .addCase(makeOutgoingCall.rejected, () => {
        return { status: 'rejected' };
      });
  },
});

const { handleConnectEvent, setOutgoingCallInfo } = outgoingCallSlice.actions;

export { setOutgoingCallInfo };
