import { createSlice } from '@reduxjs/toolkit';
import { type AsyncStoreSlice } from './app';
import * as auth from '../util/auth';

export type UserState = AsyncStoreSlice<
  {
    accessToken: string;
    email: string;
  },
  {
    reason:
      | 'ID_TOKEN_UNDEFINED'
      | 'LOGIN_ERROR'
      | 'LOGOUT_ERROR'
      | 'CHECK_LOGIN_STATUS'
      | undefined;
    error?: any;
  }
>;

export const userSlice = createSlice({
  name: 'user',
  initialState: null as UserState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(auth.checkLoginStatus.pending, () => {
        return { status: 'pending' };
      })
      .addCase(auth.checkLoginStatus.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(auth.checkLoginStatus.rejected, () => {
        return { status: 'rejected', reason: 'CHECK_LOGIN_STATUS' };
      });
    builder
      .addCase(auth.login.pending, () => {
        return { status: 'pending' };
      })
      .addCase(auth.login.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(auth.login.rejected, (_, action) => {
        return {
          status: 'rejected',
          reason: action.payload?.reason,
          error: action.payload?.error || action.error,
        };
      });
    builder
      .addCase(auth.logout.pending, () => {
        return { status: 'pending' };
      })
      .addCase(auth.logout.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(auth.logout.rejected, (_, action) => {
        return {
          status: 'rejected',
          reason: action.payload?.reason,
          error: action.payload?.error || action.error,
        };
      });
  },
});
