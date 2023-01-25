import { createSlice } from '@reduxjs/toolkit';
import { AsyncStoreSlice } from '../../app';
import { type CallInfo } from './';

export type IncomingCallState = AsyncStoreSlice<{ value: CallInfo }>;

export const incomingCallSlice = createSlice({
  name: 'incomingCall',
  initialState: null as IncomingCallState,
  reducers: {},
});
