import { combineReducers } from '@reduxjs/toolkit';
import { accessTokenSlice } from './accessToken';
import { audioDevicesSlice } from './audioDevices';
import { activeCallSlice } from './call/activeCall';
import { callInviteSlice } from './call/callInvite';
import { registrationSlice } from './registration';

export const voiceReducer = combineReducers({
  [accessTokenSlice.name]: accessTokenSlice.reducer,
  [audioDevicesSlice.name]: audioDevicesSlice.reducer,
  call: combineReducers({
    [activeCallSlice.name]: activeCallSlice.reducer,
    [callInviteSlice.name]: callInviteSlice.reducer,
  }),
  [registrationSlice.name]: registrationSlice.reducer,
});
