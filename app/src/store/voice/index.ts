import { combineReducers } from '@reduxjs/toolkit';
import { tokenSlice } from './token';
import { callReducer } from './call';

export const voiceReducer = combineReducers({
  [tokenSlice.name]: tokenSlice.reducer,
  call: callReducer,
});
