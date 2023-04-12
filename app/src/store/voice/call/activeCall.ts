import { createAsyncThunk } from '@reduxjs/toolkit';
import { getCallInfo, type CallInfo } from './';
import { setOutgoingCallInfo } from './outgoingCall';
import { type State, type Dispatch } from '../../app';
import { callMap } from '../../../util/voice';

/**
 * NOTE(mhuynh):
 * This typing is subject to change once we determine active call heuristics
 * with the completion of incoming call.
 */
export type ActiveCall = State['voice']['call']['outgoingCall'];

export type ActiveCallState = null | {
  initialConnectTimestamp?: number;
  callInfo: CallInfo;
};

export const disconnectActiveCall = createAsyncThunk<
  void,
  void,
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: {
      reason:
        | 'CALL_NOT_FULFILLED'
        | 'CALL_UUID_NOT_FOUND'
        | 'CALL_INFO_NOT_FOUND'
        | 'CALL_DISCONNECT_ERROR';
      error: any;
    };
  }
>(
  'voice/disconnectActiveCall',
  async (_state, { getState, rejectWithValue }) => {
    const outgoingCall = getState().voice.call.outgoingCall;

    // todo heuristic to determine active call
    const activeCall = outgoingCall;

    if (activeCall?.status !== 'fulfilled') {
      return rejectWithValue({ reason: 'CALL_NOT_FULFILLED', error: null });
    }

    if (!activeCall?.callInfo) {
      return rejectWithValue({ reason: 'CALL_INFO_NOT_FOUND', error: null });
    }

    const call = callMap.get(activeCall.callInfo.uuid);
    if (!call) {
      return rejectWithValue({ reason: 'CALL_UUID_NOT_FOUND', error: null });
    }
    try {
      await call.disconnect();
    } catch (error) {
      rejectWithValue({ reason: 'CALL_DISCONNECT_ERROR', error });
    }
  },
);

export const muteActiveCall = createAsyncThunk<
  void,
  { mute: boolean },
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: {
      reason:
        | 'CALL_NOT_FULFILLED'
        | 'CALL_UUID_NOT_FOUND'
        | 'CALL_INFO_NOT_FOUND'
        | 'MUTE_CALL_ERROR';
      error: any;
    };
  }
>(
  'voice/muteActiveCall',
  async ({ mute }, { dispatch, getState, rejectWithValue }) => {
    const outgoingCall = getState().voice.call.outgoingCall;

    // todo heuristic to determine active call
    const activeCall = outgoingCall;

    if (activeCall?.status !== 'fulfilled') {
      return rejectWithValue({ reason: 'CALL_NOT_FULFILLED', error: null });
    }

    if (!activeCall?.callInfo) {
      return rejectWithValue({ reason: 'CALL_INFO_NOT_FOUND', error: null });
    }

    const call = callMap.get(activeCall.callInfo.uuid);
    if (!call) {
      return rejectWithValue({ reason: 'CALL_UUID_NOT_FOUND', error: null });
    }

    try {
      await call.mute(mute);
    } catch (error) {
      rejectWithValue({ reason: 'MUTE_CALL_ERROR', error });
    }

    // todo use active call heuristic
    dispatch(
      setOutgoingCallInfo({ to: activeCall.to, callInfo: getCallInfo(call) }),
    );
  },
);

export const sendDtmfActiveCall = createAsyncThunk<
  void,
  { dtmf: string },
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: {
      reason:
        | 'CALL_NOT_FULFILLED'
        | 'CALL_UUID_NOT_FOUND'
        | 'CALL_INFO_NOT_FOUND'
        | 'ACTIVE_CALL_ERROR';
      error: any;
    };
  }
>(
  'voice/sendDtmfActiveCall',
  async ({ dtmf }, { getState, rejectWithValue }) => {
    const outgoingCall = getState().voice.call.outgoingCall;

    // todo heuristic to determine active call
    const activeCall = outgoingCall;

    if (activeCall?.status !== 'fulfilled') {
      return rejectWithValue({ reason: 'CALL_NOT_FULFILLED', error: null });
    }

    if (!activeCall?.callInfo) {
      return rejectWithValue({ reason: 'CALL_INFO_NOT_FOUND', error: null });
    }

    const call = callMap.get(activeCall.callInfo.uuid);
    if (!call) {
      return rejectWithValue({ reason: 'CALL_UUID_NOT_FOUND', error: null });
    }
    try {
      await call.sendDigits(dtmf);
    } catch (error) {
      rejectWithValue({ reason: 'ACTIVE_CALL_ERROR', error });
    }
  },
);
