import { combineReducers } from '@reduxjs/toolkit';
import { tokenSlice } from './token';
import { outgoingCallSlice } from './outgoingCall';

export const voiceReducer = combineReducers({
  [tokenSlice.name]: tokenSlice.reducer,
  [outgoingCallSlice.name]: outgoingCallSlice.reducer,
});
