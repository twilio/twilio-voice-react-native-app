import { createSlice } from '@reduxjs/toolkit';
import { type AsyncStoreSlice } from './app';
import * as Auth from '../util/auth';

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
      .addCase(Auth.checkLoginStatus.pending, () => {
        return { status: 'pending' };
      })
      .addCase(Auth.checkLoginStatus.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(Auth.checkLoginStatus.rejected, () => {
        return { status: 'rejected', reason: 'CHECK_LOGIN_STATUS' };
      });
    builder
      .addCase(Auth.login.pending, () => {
        return { status: 'pending' };
      })
      .addCase(Auth.login.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(Auth.login.rejected, (_, action) => {
        return {
          status: 'rejected',
          reason: action.payload?.reason,
          error: action.payload?.error || action.error,
        };
      });
    builder
      .addCase(Auth.logout.pending, () => {
        return { status: 'pending' };
      })
      .addCase(Auth.logout.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(Auth.logout.rejected, (_, action) => {
        return {
          status: 'rejected',
          reason: action.payload?.reason,
          error: action.payload?.error || action.error,
        };
      });
  },
});
