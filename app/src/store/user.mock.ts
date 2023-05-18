import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetch, defaultUrl } from '../util/fetch';

import { State, Dispatch, type AsyncStoreSlice } from './app';
import { settlePromise } from '../util/settlePromise';

export type UserState = AsyncStoreSlice<
  {
    accessToken: string;
    email: string;
  },
  {
    reason:
      | 'LOGIN_ERROR'
      | 'LOGOUT_ERROR'
      | 'CHECK_LOGIN_STATUS'
      | 'FETCH_ERROR'
      | 'AUTH0_TOKEN_RESPONSE_NOT_OK'
      | 'FETCH_JSON_ERROR'
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
      .addCase(checkLoginStatus.pending, () => {
        return { status: 'pending' };
      })
      .addCase(checkLoginStatus.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(checkLoginStatus.rejected, () => {
        return { status: 'rejected', reason: 'CHECK_LOGIN_STATUS' };
      });
    builder
      .addCase(login.pending, () => {
        return { status: 'pending' };
      })
      .addCase(login.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(login.rejected, (_, action) => {
        return {
          status: 'rejected',
          reason: action.payload?.reason,
          error: action.payload?.error || action.error,
        };
      });
    builder
      .addCase(logout.pending, () => {
        return { status: 'pending' };
      })
      .addCase(logout.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(logout.rejected, (_, action) => {
        return {
          status: 'rejected',
          reason: action.payload?.reason,
          error: action.payload?.error || action.error,
        };
      });
  },
});

export const checkLoginStatus = createAsyncThunk<
  {
    accessToken: string;
    email: string;
  },
  void,
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: undefined;
  }
>('user/checkLoginStatus', async () => {
  return { accessToken: '', email: '' };
});

export const login = createAsyncThunk<
  { accessToken: string; email: string },
  void,
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: {
      reason:
        | 'FETCH_ERROR'
        | 'AUTH0_TOKEN_RESPONSE_NOT_OK'
        | 'FETCH_JSON_ERROR'
        | 'LOGIN_ERROR';
      error?: any;
    };
  }
>('user/login', async (_, { rejectWithValue }) => {
  try {
    const fetchResult = await settlePromise(
      fetch(`${defaultUrl}/auth0`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    if (fetchResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'FETCH_ERROR',
        error: fetchResult.reason,
      });
    }

    const auth0TokenResponse = fetchResult.value;
    if (!auth0TokenResponse.ok) {
      return rejectWithValue({
        reason: 'AUTH0_TOKEN_RESPONSE_NOT_OK',
      });
    }

    const auth0TokenResult = await settlePromise(fetchResult.value.json());
    if (auth0TokenResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'FETCH_JSON_ERROR',
        error: auth0TokenResult.reason,
      });
    }

    return {
      accessToken: auth0TokenResult.value.access_token,
      email: 'test_email@twilio.com',
    };
  } catch (error) {
    return rejectWithValue({ reason: 'LOGIN_ERROR', error });
  }
});

export const logout = createAsyncThunk<
  { accessToken: string; email: string },
  void,
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: { reason: 'LOGOUT_ERROR'; error: any };
  }
>('user/logout', async () => {
  return { accessToken: '', email: '' };
});
