import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../../config';
import Auth0 from 'react-native-auth0';
import { type AsyncStoreSlice } from './app';

export type UserState = AsyncStoreSlice<{
  accessToken: string;
  email: string;
}>;

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
      });
    builder
      .addCase(login.pending, () => {
        return { status: 'pending' };
      })
      .addCase(login.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(login.rejected, (_, action) => {
        return { status: 'rejected', error: action.payload };
      });
    builder
      .addCase(logout.pending, () => {
        return { status: 'pending' };
      })
      .addCase(logout.fulfilled, (_, action) => {
        return { status: 'fulfilled', ...action.payload };
      })
      .addCase(logout.rejected, (_, action) => {
        return { status: 'rejected', error: action.payload };
      });
  },
});

const auth0 = new Auth0({
  domain: config.domain,
  clientId: config.clientId,
});

export const checkLoginStatus = createAsyncThunk<{
  accessToken: string;
  email: string;
}>('user/checkLoginStatus', async () => {
  const credentials = await auth0.credentialsManager.getCredentials();
  if (credentials) {
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

export const login = createAsyncThunk<{ accessToken: string; email: string }>(
  'user/login',
  async (_, { rejectWithValue }) => {
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: config.auth0Scope,
        audience: config.audience,
      });

      if (typeof credentials.idToken === 'undefined') {
        return rejectWithValue('ID_TOKEN_UNDEFINED');
      }

      auth0.credentialsManager.saveCredentials(credentials as any);

      const user = await auth0.auth.userInfo({
        token: credentials.accessToken,
      });
      return {
        accessToken: credentials.accessToken,
        email: user.email,
      };
    } catch (error) {
      return rejectWithValue('LOGIN_ERROR');
    }
  },
);

export const logout = createAsyncThunk<{ accessToken: string; email: string }>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await auth0.webAuth.clearSession();
      await auth0.credentialsManager.clearCredentials();
      return { accessToken: '', email: '' };
    } catch (error) {
      return rejectWithValue('LOGOUT_ERROR');
    }
  },
);
