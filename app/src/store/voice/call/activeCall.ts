import { createAsyncThunk } from '@reduxjs/toolkit';
import { getCallInfo, type CallInfo } from './';
import { setOutgoingCallInfo } from './outgoingCall';
import { type State, type Dispatch } from '../../app';
import { callMap } from '../../../util/voice';

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
    rejectValue:
      | 'CALL_NOT_FULFILLED'
      | 'CALL_UUID_NOT_FOUND'
      | 'CALL_INFO_NOT_FOUND';
  }
>(
  'voice/disconnectActiveCall',
  async (_state, { getState, rejectWithValue }) => {
    const outgoingCall = getState().voice.call.outgoingCall;

    // todo heuristic to determine active call
    const activeCall = outgoingCall;

    if (activeCall?.status !== 'fulfilled') {
      return rejectWithValue('CALL_NOT_FULFILLED');
    }

    if (!activeCall?.callInfo) {
      return rejectWithValue('CALL_INFO_NOT_FOUND');
    }

    const call = callMap.get(activeCall.callInfo.uuid);
    if (!call) {
      return rejectWithValue('CALL_UUID_NOT_FOUND');
    }

    await call.disconnect();
  },
);

export const muteActiveCall = createAsyncThunk<
  void,
  { mute: boolean },
  {
    state: State;
    dispatch: Dispatch;
    rejectValue:
      | 'CALL_NOT_FULFILLED'
      | 'CALL_UUID_NOT_FOUND'
      | 'CALL_INFO_NOT_FOUND';
  }
>(
  'voice/muteActiveCall',
  async ({ mute }, { dispatch, getState, rejectWithValue }) => {
    const outgoingCall = getState().voice.call.outgoingCall;

    // todo heuristic to determine active call
    const activeCall = outgoingCall;

    if (activeCall?.status !== 'fulfilled') {
      return rejectWithValue('CALL_NOT_FULFILLED');
    }

    if (!activeCall?.callInfo) {
      return rejectWithValue('CALL_INFO_NOT_FOUND');
    }

    const call = callMap.get(activeCall.callInfo.uuid);
    if (!call) {
      return rejectWithValue('CALL_UUID_NOT_FOUND');
    }

    await call.mute(mute);

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
    rejectValue:
      | 'CALL_NOT_FULFILLED'
      | 'CALL_UUID_NOT_FOUND'
      | 'CALL_INFO_NOT_FOUND';
  }
>(
  'voice/sendDtmfActiveCall',
  async ({ dtmf }, { getState, rejectWithValue }) => {
    const outgoingCall = getState().voice.call.outgoingCall;

    // todo heuristic to determine active call
    const activeCall = outgoingCall;

    if (activeCall?.status !== 'fulfilled') {
      return rejectWithValue('CALL_NOT_FULFILLED');
    }

    if (!activeCall?.callInfo) {
      return rejectWithValue('CALL_INFO_NOT_FOUND');
    }

    const call = callMap.get(activeCall.callInfo.uuid);
    if (!call) {
      return rejectWithValue('CALL_UUID_NOT_FOUND');
    }

    await call.sendDigits(dtmf);
  },
);
