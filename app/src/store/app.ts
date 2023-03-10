import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { voiceReducer } from './voice';

export const store = configureStore({
  reducer: {
    voice: voiceReducer,
  },
});

export type State = ReturnType<typeof store.getState>;

export type Dispatch = typeof store.dispatch;

export type AsyncStoreSlice<R = {}, S = {}, T = {}> =
  | null
  | ({ status: 'fulfilled' } & R)
  | ({ status: 'rejected' } & S)
  | ({ status: 'pending' } & T);

export const useTypedDispatch: () => Dispatch = useDispatch;
