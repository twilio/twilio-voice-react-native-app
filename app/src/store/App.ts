import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from './user';
import { voiceReducer } from './voice';

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    voice: voiceReducer,
  },
});

export type State = ReturnType<typeof store.getState>;

export type Dispatch = typeof store.dispatch;
