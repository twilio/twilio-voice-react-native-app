import { configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { Dispatch, State } from './app';

export type AsyncStoreSlice<R = {}, S = {}, T = {}> =
  null |
  { status: 'fulfilled' } & R |
  { status: 'rejected' } & S |
  { status: 'pending' } & T;

export const createTypedAsyncThunk = createAsyncThunk.withTypes<{
  state: State;
  dispatch: Dispatch;
}>();

export const useTypedDispatch: () => Dispatch = useDispatch;
