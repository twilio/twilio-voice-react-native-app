import { combineReducers } from '@reduxjs/toolkit';
import { tokenSlice } from './token';
import { audioDevicesSlice } from './audioDevices';
import { callReducer } from './call';
import { userSlice } from '../user';

export const voiceReducer = combineReducers({
  [tokenSlice.name]: tokenSlice.reducer,
  [audioDevicesSlice.name]: audioDevicesSlice.reducer,
  call: callReducer,
  [userSlice.name]: userSlice.reducer,
});
