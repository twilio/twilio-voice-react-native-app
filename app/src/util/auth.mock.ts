import Config from 'react-native-config';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { State, Dispatch } from '../store/app';
import { settlePromise } from './settlePromise';

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
      fetch(Config.AUTH0_URL as string, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'password',
          username: Config.AUTH0_USERNAME,
          password: Config.AUTH0_PASSWORD,
          audience: Config.AUTH0_AUDIENCE,
          scope: 'openid profile email',
          client_id: Config.AUTH0_CLIENT_ID,
          client_secret: Config.AUTH0_CLIENT_SECRET,
        }),
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
