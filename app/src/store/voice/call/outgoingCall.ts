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
    rejectValue: {
      reason: 'TOKEN_UNFULFILLED' | 'OUTGOING_CALL_ERROR';
      error: any;
    };
  }
>(
  'voice/makeOutgoingCall',
  async ({ to, recipientType }, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().voice.token;

      if (token?.status !== 'fulfilled') {
        return rejectWithValue({ reason: 'TOKEN_UNFULFILLED', error: null });
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

      outgoingCall.on(TwilioCall.Event.ConnectFailure, (error) =>
        console.error('ConnectFailure:', error),
      );
      outgoingCall.on(TwilioCall.Event.Reconnecting, (error) =>
        console.error('Reconnecting:', error),
      );
      outgoingCall.on(TwilioCall.Event.Disconnected, (error) =>
        console.error('Disconnected:', error),
      );

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
    } catch (error) {
      return rejectWithValue({ reason: 'OUTGOING_CALL_ERROR', error });
    }
  },
);

export type OutgoingCallState = AsyncStoreSlice<
  {
    initialConnectTimestamp?: number;
    callInfo: CallInfo;
    to: string;
  },
  {
    reason: 'OUTGOING_CALL_ERROR' | 'TOKEN_UNFULFILLED' | undefined;
    error: any;
  }
>;

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
      if (state?.status === 'fulfilled' && !state.initialConnectTimestamp) {
        state.initialConnectTimestamp = action.payload.time;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(makeOutgoingCall.pending, () => {
        return { status: 'pending' };
      })
      .addCase(makeOutgoingCall.rejected, (_, action) => {
        return {
          status: 'rejected',
          reason: action.payload?.reason,
          error: action.payload?.error || action.error,
        };
      });
  },
});

const { handleConnectEvent, setOutgoingCallInfo } = outgoingCallSlice.actions;

export { setOutgoingCallInfo };
