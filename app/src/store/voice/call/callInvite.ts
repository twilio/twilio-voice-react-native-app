import {
  createEntityAdapter,
  createSlice,
  miniSerializeError,
  type PayloadAction,
  type SerializedError,
} from '@reduxjs/toolkit';
import {
  Call as TwilioCall,
  type CallInvite as TwilioCallInvite,
} from '@twilio/voice-react-native-sdk';
import { match } from 'ts-pattern';
import {
  getCallInfo,
  getCallInviteInfo,
  type CallInfo,
  type CallInviteInfo,
} from './';
import { setActiveCallInfo } from './activeCall';
import { type AsyncStoreSlice } from '../../app';
import { createTypedAsyncThunk, generateThunkActionTypes } from '../../common';
import { navigateToCallInviteScreen } from '../../../util/behavior';
import { callMap, callInviteMap } from '../../../util/voice';
import { settlePromise } from '../../../util/settlePromise';
import { getNavigate } from '../../../util/navigation';

const sliceName = 'callInvite' as const;

/**
 * Receive call invite action.
 */
export const receiveActionTypes = generateThunkActionTypes(
  `${sliceName}/receive`,
);
export const receiveCallInvite = createTypedAsyncThunk<
  string,
  TwilioCallInvite
>(receiveActionTypes.prefix, async (callInvite, { dispatch, requestId }) => {
  callInviteMap.set(requestId, callInvite);

  dispatch(
    setCallInvite({
      id: requestId,
      info: getCallInviteInfo(callInvite),
      status: 'idle',
    }),
  );

  /**
   * Hard-code navigation to the Incoming Call screen for tests.
   */
  if (navigateToCallInviteScreen) {
    getNavigate()?.('Incoming Call');
  }

  return requestId;
});

/**
 * Accept call invite action.
 */
export type AcceptCallInviteRejectValue =
  | {
      reason: 'ID_NOT_FOUND_MAP';
    }
  | {
      reason: 'ID_NOT_FOUND_STATE';
    }
  | {
      reason: 'STATUS_NOT_IDLE';
    }
  | {
      reason: 'NATIVE_MODULE_REJECTED';
      error: SerializedError;
    };
export const acceptActionTypes = generateThunkActionTypes(
  `${sliceName}/accept`,
);
export const acceptCallInvite = createTypedAsyncThunk<
  CallInfo,
  { id: string },
  { rejectValue: AcceptCallInviteRejectValue }
>(
  acceptActionTypes.prefix,
  async ({ id }, { dispatch, getState, rejectWithValue }) => {
    const callInvite = callInviteMap.get(id);
    if (typeof callInvite === 'undefined') {
      return rejectWithValue({ reason: 'ID_NOT_FOUND_MAP' });
    }

    const callInviteEntity = getState().voice.call.callInvite.entities[id];
    if (typeof callInviteEntity === 'undefined') {
      return rejectWithValue({ reason: 'ID_NOT_FOUND_STATE' });
    }

    if (callInviteEntity.status !== 'idle') {
      return rejectWithValue({ reason: 'STATUS_NOT_IDLE' });
    }

    dispatch(
      setCallInvite({
        action: 'accept',
        id: callInviteEntity.id,
        info: callInviteEntity.info,
        status: 'pending',
      }),
    );

    const acceptResult = await settlePromise(callInvite.accept());
    if (acceptResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
        error: miniSerializeError(acceptResult.reason),
      });
    }

    dispatch(removeCallInvite(id));

    const call = acceptResult.value;
    const callInfo = getCallInfo(call);
    callMap.set(id, call);

    call.on(TwilioCall.Event.ConnectFailure, (error) =>
      console.error('ConnectFailure:', error),
    );
    call.on(TwilioCall.Event.Reconnecting, (error) =>
      console.error('Reconnecting:', error),
    );
    call.on(TwilioCall.Event.Disconnected, (error) => {
      // The type of error here is "TwilioError | undefined".
      if (error) {
        console.error('Disconnected:', error);
      }
    });

    Object.values(TwilioCall.Event).forEach((callEvent) => {
      call.on(callEvent, () => {
        dispatch(setActiveCallInfo({ id, info: getCallInfo(call) }));
      });
    });

    return callInfo;
  },
);

/**
 * Reject call invite action.
 */
export type RejectCallInviteRejectValue =
  | {
      reason: 'ID_NOT_FOUND_MAP';
    }
  | {
      reason: 'ID_NOT_FOUND_STATE';
    }
  | {
      reason: 'STATUS_NOT_IDLE';
    }
  | {
      reason: 'NATIVE_MODULE_REJECTED';
      error: SerializedError;
    };
export const rejectActionTypes = generateThunkActionTypes(
  `${sliceName}/reject`,
);
export const rejectCallInvite = createTypedAsyncThunk<
  void,
  { id: string },
  { rejectValue: RejectCallInviteRejectValue }
>(
  rejectActionTypes.prefix,
  async ({ id }, { dispatch, getState, rejectWithValue }) => {
    const callInvite = callInviteMap.get(id);
    if (typeof callInvite === 'undefined') {
      return rejectWithValue({ reason: 'ID_NOT_FOUND_MAP' });
    }

    const callInviteEntity = getState().voice.call.callInvite.entities[id];
    if (typeof callInviteEntity === 'undefined') {
      return rejectWithValue({ reason: 'ID_NOT_FOUND_STATE' });
    }

    if (callInviteEntity.status !== 'idle') {
      return rejectWithValue({ reason: 'STATUS_NOT_IDLE' });
    }

    dispatch(
      setCallInvite({
        action: 'reject',
        id: callInviteEntity.id,
        info: callInviteEntity.info,
        status: 'pending',
      }),
    );

    const rejectResult = await settlePromise(callInvite.reject());
    if (rejectResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
        error: miniSerializeError(rejectResult.reason),
      });
    }

    dispatch(removeCallInvite(id));
  },
);

/**
 * Slice configuration.
 */
type BaseCallInviteEntity = {
  id: string;
  info: CallInviteInfo;
};
type CallInviteAcceptEntity = BaseCallInviteEntity &
  AsyncStoreSlice<
    { action: 'accept'; callInfo: CallInfo }, // fulfilled
    { action: 'accept' } & (
      | AcceptCallInviteRejectValue
      | { error: SerializedError }
    ), // rejected
    { action: 'accept' } // pending
  >;
type CallInviteRejectEntity = BaseCallInviteEntity &
  AsyncStoreSlice<
    { action: 'reject' }, // fulfilled
    { action: 'reject' } & (
      | RejectCallInviteRejectValue
      | { error: SerializedError }
    ), // rejected
    { action: 'reject' } // pending
  >;
export type CallInviteEntity = CallInviteAcceptEntity | CallInviteRejectEntity;
export const callInviteAdapter = createEntityAdapter<CallInviteEntity>();
export const callInviteSlice = createSlice({
  name: sliceName,
  initialState: callInviteAdapter.getInitialState(),
  reducers: {
    removeCallInvite(state, action: PayloadAction<CallInviteEntity['id']>) {
      callInviteAdapter.removeOne(state, action.payload);
    },
    setCallInvite(state, action: PayloadAction<CallInviteEntity>) {
      callInviteAdapter.setOne(state, action.payload);
    },
  },
  extraReducers(builder) {
    /**
     * Handle accepting a call invite.
     */
    builder.addCase(acceptCallInvite.fulfilled, (state, action) => {
      match(state.entities[action.meta.arg.id])
        .with({ action: 'accept', status: 'pending' }, (call) => {
          callInviteAdapter.setOne(state, {
            action: call.action,
            callInfo: action.payload,
            id: call.id,
            info: call.info,
            status: action.meta.requestStatus,
          });
        })
        .otherwise(() => {});
    });

    builder.addCase(acceptCallInvite.rejected, (state, action) => {
      match(state.entities[action.meta.arg.id])
        .with({ action: 'accept', status: 'pending' }, (call) => {
          callInviteAdapter.setOne(state, {
            action: call.action,
            id: call.id,
            info: call.info,
            status: action.meta.requestStatus,
            ...(action.payload || { error: action.error }),
          });
        })
        .otherwise(() => {});
    });

    /**
     * Handle rejecting a call invite.
     */
    builder.addCase(rejectCallInvite.fulfilled, (state, action) => {
      match(state.entities[action.meta.arg.id])
        .with({ action: 'reject', status: 'pending' }, (call) => {
          callInviteAdapter.setOne(state, {
            action: call.action,
            id: call.id,
            info: call.info,
            status: action.meta.requestStatus,
          });
        })
        .otherwise(() => {});
    });

    builder.addCase(rejectCallInvite.rejected, (state, action) => {
      match(state.entities[action.meta.arg.id])
        .with({ action: 'reject', status: 'pending' }, (call) => {
          callInviteAdapter.setOne(state, {
            action: call.action,
            id: call.id,
            info: call.info,
            status: action.meta.requestStatus,
            ...(action.payload || { error: action.error }),
          });
        })
        .otherwise(() => {});
    });
  },
});

export const { removeCallInvite, setCallInvite } = callInviteSlice.actions;
