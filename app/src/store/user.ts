import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEnvVariable } from '../util/env';
import Auth0, { type SaveCredentialsParams } from 'react-native-auth0';
import { State, Dispatch, type AsyncStoreSlice } from './app';
import { settlePromise } from '../util/settlePromise';

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

const auth0 = new Auth0({
  domain: getEnvVariable('DOMAIN_NAME'),
  clientId: getEnvVariable('CLIENT_ID'),
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
  const getCredentialsResult = await settlePromise(
    auth0.credentialsManager.getCredentials(),
  );

  if (getCredentialsResult.status === 'fulfilled') {
    const credentials = getCredentialsResult.value;
    const user = await auth0.auth.userInfo({
      token: credentials.accessToken,
    });
    return {
      accessToken: credentials.accessToken,
      email: user.email,
    };
  } else {
    return { accessToken: '', email: '' };
  }
});

export const login = createAsyncThunk<
  { accessToken: string; email: string },
  void,
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: { reason: 'ID_TOKEN_UNDEFINED' | 'LOGIN_ERROR'; error?: any };
  }
>('user/login', async (_, { rejectWithValue }) => {
  try {
    const credentials = await auth0.webAuth.authorize({
      scope: getEnvVariable('AUTH0_SCOPE'),
      audience: getEnvVariable('AUDIENCE'),
    });

    if (typeof credentials.idToken === 'undefined') {
      return rejectWithValue({ reason: 'ID_TOKEN_UNDEFINED' });
    }

    auth0.credentialsManager.saveCredentials(
      credentials as SaveCredentialsParams,
    );

    const user = await auth0.auth.userInfo({
      token: credentials.accessToken,
    });
    return {
      accessToken: credentials.accessToken,
      email: user.email,
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
>('user/logout', async (_, { rejectWithValue }) => {
  try {
    await auth0.webAuth.clearSession();
    await auth0.credentialsManager.clearCredentials();
    return { accessToken: '', email: '' };
  } catch (error) {
    return rejectWithValue({ reason: 'LOGOUT_ERROR', error });
  }
});
