import { configureStore, Middleware } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { voiceReducer } from './voice';

export const logActionType: Middleware = () => (next) => (action) => {
  console.log(
    action.type.match(/\/rejected$/g)
      ? `${action.type} ${JSON.stringify(action.payload, null, 2)}`
      : action.type,
  );

  return next(action);
};

export const createStore = (...middlewares: Middleware[]) =>
  configureStore({
    reducer: {
      voice: voiceReducer,
    },
    middleware(getDefaultMiddleware) {
      return getDefaultMiddleware().concat(...middlewares);
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
