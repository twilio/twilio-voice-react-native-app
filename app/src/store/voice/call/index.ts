import { combineReducers } from '@reduxjs/toolkit';
import { type Call as TwilioCall } from '@twilio/voice-react-native-sdk';
import { incomingCallSlice } from './incomingCall';
import { outgoingCallSlice } from './outgoingCall';

export type CallInfo = {
  uuid: string;
  sid?: string;
  state?: string;
  to?: string;
  from?: string;
  isMuted?: boolean;
  isOnHold?: boolean;
};

export const getCallInfo = (call: TwilioCall): CallInfo => {
  // eslint-disable-next-line dot-notation
  const uuid = call['_uuid'];
  const sid = call.getSid();
  const state = call.getState();
  const to = call.getTo();
  const from = call.getFrom();

  const isMuted = Boolean(call.isMuted());
  const isOnHold = Boolean(call.isOnHold());

  return {
    uuid,
    sid,
    state,
    to,
    from,
    isMuted,
    isOnHold,
  };
};

export const callReducer = combineReducers({
  [incomingCallSlice.name]: incomingCallSlice.reducer,
  [outgoingCallSlice.name]: outgoingCallSlice.reducer,
});
