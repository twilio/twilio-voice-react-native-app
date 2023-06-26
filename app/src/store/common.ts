import { createAsyncThunk as untypedCreateAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { type Dispatch, type State } from './app';

export const useTypedDispatch: () => Dispatch = useDispatch;

export const createTypedAsyncThunk = untypedCreateAsyncThunk.withTypes<{
  state: State;
  dispatch: Dispatch;
}>();

/**
 * Redux Toolkit thunk actions use a string type, and postfix "/pending",
 * "/fulfilled", and "/rejected" to the action string type. Those "action
 * variants" are then dispatched to the Redux store.
 */
export type PendingThunkActionType<T extends string> = `${T}/pending`;
export type FulfilledThunkActionType<T extends string> = `${T}/fulfilled`;
export type RejectedThunkActionType<T extends string> = `${T}/rejected`;
export type ThunkActionTypeVariants<T extends string> =
  | PendingThunkActionType<T>
  | FulfilledThunkActionType<T>
  | RejectedThunkActionType<T>;
export function generateThunkActionTypes<T extends string>(typePrefix: T) {
  const pending: PendingThunkActionType<T> = `${typePrefix}/pending`;
  const fulfilled: FulfilledThunkActionType<T> = `${typePrefix}/fulfilled`;
  const rejected: RejectedThunkActionType<T> = `${typePrefix}/rejected`;
  return {
    prefix: typePrefix,
    variants: {
      pending,
      fulfilled,
      rejected,
    },
  };
}
