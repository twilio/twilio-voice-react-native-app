import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { voiceReducer } from './voice';

export const createStore = () =>
  configureStore({
    reducer: {
      voice: voiceReducer,
    },
  });

export type Store = ReturnType<typeof createStore>;

export type State = ReturnType<Store['getState']>;

export type Dispatch = Store['dispatch'];

export type AsyncStoreSlice<R = {}, S = {}, T = {}> =
  | null
  | ({ status: 'fulfilled' } & R)
  | ({ status: 'rejected' } & S)
  | ({ status: 'pending' } & T);

export const useTypedDispatch: () => Dispatch = useDispatch;
