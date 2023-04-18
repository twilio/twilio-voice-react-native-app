import { combineReducers } from '@reduxjs/toolkit';
import { accessTokenSlice } from './accessToken';
import { audioDevicesSlice } from './audioDevices';
import { callReducer } from './call';
import { userSlice } from '../user';

export const voiceReducer = combineReducers({
  [accessTokenSlice.name]: accessTokenSlice.reducer,
  [audioDevicesSlice.name]: audioDevicesSlice.reducer,
  call: callReducer,
  [userSlice.name]: userSlice.reducer,
});
