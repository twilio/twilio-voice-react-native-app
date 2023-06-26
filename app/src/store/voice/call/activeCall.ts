import {
  createEntityAdapter,
  createSlice,
  miniSerializeError,
  type PayloadAction,
  type SerializedError,
} from '@reduxjs/toolkit';
import { match } from 'ts-pattern';
import {
  type CallInfo,
  getCallInfo,
  type IncomingCall,
  type OutgoingCall,
} from './';
import { createTypedAsyncThunk, generateThunkActionTypes } from '../../common';
import { callMap } from '../../../util/voice';
import { settlePromise } from '../../../util/settlePromise';
import { makeOutgoingCall } from './outgoingCall';
import { acceptCallInvite } from './callInvite';

const sliceName = 'activeCall' as const;

/**
 * Disconnect active call action.
 */
export const disconnectActionType = generateThunkActionTypes(
  `${sliceName}/disconnect`,
);
export type DisconnectRejectValue =
  | {
      reason: 'CALL_ID_NOT_FOUND';
    }
  | {
      reason: 'NATIVE_MODULE_REJECTED';
      error: SerializedError;
    };
export const disconnectActiveCall = createTypedAsyncThunk<
  void,
  { id: string },
  { rejectValue: DisconnectRejectValue }
>(disconnectActionType.prefix, async ({ id }, { rejectWithValue }) => {
  const call = callMap.get(id);
  if (typeof call === 'undefined') {
    return rejectWithValue({ reason: 'CALL_ID_NOT_FOUND' });
  }

  const disconnectResult = await settlePromise(call.disconnect());
  if (disconnectResult.status === 'rejected') {
    return rejectWithValue({
      reason: 'NATIVE_MODULE_REJECTED',
      error: miniSerializeError(disconnectResult.reason),
    });
  }
});

/**
 * Mute active call action.
 */
export const muteActionType = generateThunkActionTypes(`${sliceName}/mute`);
export type MuteRejectValue =
  | {
      reason: 'CALL_ID_NOT_FOUND';
    }
  | {
      reason: 'NATIVE_MODULE_REJECTED';
      error: SerializedError;
    };
export const muteActiveCall = createTypedAsyncThunk<
  void,
  { id: string; shouldMute: boolean },
  { rejectValue: MuteRejectValue }
>(
  muteActionType.prefix,
  async ({ id, shouldMute }, { dispatch, rejectWithValue }) => {
    const call = callMap.get(id);
    if (typeof call === 'undefined') {
      return rejectWithValue({ reason: 'CALL_ID_NOT_FOUND' });
    }

    const muteResult = await settlePromise(call.mute(shouldMute));
    if (muteResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
        error: miniSerializeError(muteResult.reason),
      });
    }

    dispatch(setActiveCallInfo({ id, info: getCallInfo(call) }));
  },
);

/**
 * Hold active call action.
 */
export const holdActionType = generateThunkActionTypes(`${sliceName}/hold`);
export type HoldRejectValue =
  | {
      reason: 'CALL_ID_NOT_FOUND';
    }
  | {
      reason: 'NATIVE_MODULE_REJECTED';
      error: SerializedError;
    };
export const holdActiveCall = createTypedAsyncThunk<
  void,
  { id: string; shouldHold: boolean },
  { rejectValue: MuteRejectValue }
>(
  holdActionType.prefix,
  async ({ id, shouldHold }, { dispatch, rejectWithValue }) => {
    const call = callMap.get(id);
    if (typeof call === 'undefined') {
      return rejectWithValue({ reason: 'CALL_ID_NOT_FOUND' });
    }

    const holdResult = await settlePromise(call.hold(shouldHold));
    if (holdResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
        error: miniSerializeError(holdResult.reason),
      });
    }

    dispatch(setActiveCallInfo({ id, info: getCallInfo(call) }));
  },
);

/**
 * Action to send DTMF tones over active call.
 */
export const sendDigitsActionType = generateThunkActionTypes(
  `${sliceName}/sendDigits`,
);
export type SendDigitsRejectValue =
  | {
      reason: 'CALL_ID_NOT_FOUND';
    }
  | {
      reason: 'NATIVE_MODULE_REJECTED';
      error: SerializedError;
    };
export const sendDigitsActiveCall = createTypedAsyncThunk<
  void,
  { id: string; digits: string },
  { rejectValue: SendDigitsRejectValue }
>(sendDigitsActionType.prefix, async ({ id, digits }, { rejectWithValue }) => {
  const call = callMap.get(id);
  if (typeof call === 'undefined') {
    return rejectWithValue({ reason: 'CALL_ID_NOT_FOUND' });
  }

  const sendDigitsResult = await settlePromise(call.sendDigits(digits));
  if (sendDigitsResult.status === 'rejected') {
    return rejectWithValue({
      reason: 'NATIVE_MODULE_REJECTED',
      error: miniSerializeError(sendDigitsResult.reason),
    });
  }
});

/**
 * Slice configuration.
 */
export type ActiveCall = OutgoingCall | IncomingCall;
export const activeCallAdapter = createEntityAdapter<ActiveCall>();
export const activeCallSlice = createSlice({
  name: 'activeCall',
  initialState: activeCallAdapter.getInitialState(),
  reducers: {
    /**
     * Updates the info of a call.
     */
    setActiveCallInfo(
      state,
      action: PayloadAction<{ id: string; info: CallInfo }>,
    ) {
      match(state.entities[action.payload.id])
        .with({ status: 'fulfilled' }, (call) => {
          call.info = action.payload.info;
        })
        .otherwise(() => {});
    },
    /**
     * Sets the initial connection timestamp.
     *
     * This should be bound to a `.once` listener and therefore should only fire
     * once and only once a call is connected, but in the off-chance it is
     * called multiple times for the same call, the sequential calls are no-op.
     */
    connectEvent(
      state,
      action: PayloadAction<{ id: string; timestamp: number }>,
    ) {
      match(state.entities[action.payload.id])
        .with({ initialConnectTimestamp: undefined }, (call) => {
          activeCallAdapter.setOne(state, {
            ...call,
            initialConnectTimestamp: action.payload.timestamp,
          });
        })
        .otherwise(() => {});
    },
  },
  extraReducers(builder) {
    /**
     * Handle the "makeOutgoingCall" actions.
     */
    builder.addCase(makeOutgoingCall.pending, (state, action) => {
      const { arg, requestId, requestStatus } = action.meta;

      match(state.entities[requestId])
        .with(undefined, () => {
          activeCallAdapter.setOne(state, {
            direction: 'outgoing',
            id: requestId,
            recipientType: arg.recipientType,
            status: requestStatus,
            to: arg.to,
          });
        })
        .otherwise(() => {});
    });

    builder.addCase(makeOutgoingCall.fulfilled, (state, action) => {
      const { requestId, requestStatus } = action.meta;

      match(state.entities[requestId])
        .with(
          { direction: 'outgoing', status: 'pending' },
          ({ direction, recipientType, to }) => {
            activeCallAdapter.setOne(state, {
              action: {
                disconnect: { status: 'idle' },
                hold: { status: 'idle' },
                mute: { status: 'idle' },
                sendDigits: { status: 'idle' },
              },
              direction,
              id: requestId,
              info: action.payload,
              initialConnectTimestamp: undefined,
              recipientType,
              status: requestStatus,
              to,
            });
          },
        )
        .otherwise(() => {});
    });

    builder.addCase(makeOutgoingCall.rejected, (state, action) => {
      const { requestId, requestStatus } = action.meta;

      match(state.entities[requestId])
        .with(
          { direction: 'outgoing', status: 'pending' },
          ({ direction, recipientType, to }) => {
            activeCallAdapter.setOne(state, {
              direction,
              id: requestId,
              recipientType,
              status: requestStatus,
              to,
            });
          },
        )
        .otherwise(() => {});
    });

    /**
     * Handle accepting a call invite.
     *
     * Note that the ID we use here is provided by argument, not the request ID.
     * This enforces the active call to have the same ID as the call invite.
     * Since both active calls and call invites are in different state slices,
     * duplicate IDs do not matter and can help map call invites to active
     * calls.
     */
    builder.addCase(acceptCallInvite.pending, (state, action) => {
      const { arg, requestStatus } = action.meta;

      match(state.entities[arg.id])
        .with(undefined, () => {
          activeCallAdapter.setOne(state, {
            direction: 'incoming',
            id: arg.id,
            status: requestStatus,
          });
        })
        .otherwise(() => {});
    });

    builder.addCase(acceptCallInvite.fulfilled, (state, action) => {
      const { arg, requestStatus } = action.meta;

      match(state.entities[arg.id])
        .with({ direction: 'incoming', status: 'pending' }, ({ direction }) => {
          activeCallAdapter.setOne(state, {
            action: {
              disconnect: { status: 'idle' },
              hold: { status: 'idle' },
              mute: { status: 'idle' },
              sendDigits: { status: 'idle' },
            },
            direction,
            id: arg.id,
            info: action.payload,
            initialConnectTimestamp: undefined,
            status: requestStatus,
          });
        })
        .otherwise(() => {});
    });

    builder.addCase(acceptCallInvite.rejected, (state, action) => {
      const { arg, requestStatus } = action.meta;

      match(state.entities[arg.id])
        .with({ direction: 'incoming', status: 'pending' }, ({ direction }) => {
          activeCallAdapter.setOne(state, {
            direction,
            id: arg.id,
            status: requestStatus,
          });
        })
        .otherwise(() => {});
    });

    /**
     * Handle call interactivity actions.
     */
    (
      [
        [disconnectActiveCall, 'disconnect'],
        [holdActiveCall, 'hold'],
        [muteActiveCall, 'mute'],
        [sendDigitsActiveCall, 'sendDigits'],
      ] as const
    ).forEach(([thunk, sliceKey]) => {
      builder.addCase(thunk.pending, (state, action) => {
        match(state.entities[action.meta.arg.id])
          .with({ action: { [sliceKey]: { status: 'idle' } } }, (call) => {
            call.action[sliceKey] = { status: 'pending' };
          })
          .otherwise(() => {});
      });

      builder.addCase(thunk.fulfilled, (state, action) => {
        match(state.entities[action.meta.arg.id])
          .with({ action: { [sliceKey]: { status: 'pending' } } }, (call) => {
            call.action[sliceKey].status = 'fulfilled';
          })
          .otherwise(() => {});
      });

      builder.addCase(thunk.rejected, (state, action) => {
        match(state.entities[action.meta.arg.id])
          .with({ action: { [sliceKey]: { status: 'pending' } } }, (call) => {
            call.action[sliceKey].status = 'rejected';
          })
          .otherwise(() => {});
      });
    });
  },
});

export const { connectEvent, setActiveCallInfo } = activeCallSlice.actions;
