import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../../config';
import Auth0 from 'react-native-auth0';

export interface UserState {
  accessToken: string;
  email: string;
}

const initialState = {
  accessToken: '',
  email: '',
} as UserState;

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.accessToken =
        action.payload?.accessToken === undefined
          ? ''
          : action.payload?.accessToken;
      state.email =
        action.payload?.email === undefined ? '' : action.payload?.email;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.accessToken = '';
    });
    builder.addCase(checkLoginStatus.fulfilled, (state, action) => {
      state.accessToken =
        action.payload?.accessToken === undefined
          ? ''
          : action.payload.accessToken;
      state.email =
        action.payload?.email === undefined ? '' : action.payload.email;
    });
  },
});

const auth0 = new Auth0({
  domain: config.domain,
  clientId: config.clientId,
});

interface LoginResponse {
  accessToken: string;
  email: string;
}

export const checkLoginStatus = createAsyncThunk<LoginResponse | undefined>(
  'user/checkLoginStatus',
  async () => {
    const credentials = await auth0.credentialsManager.getCredentials();
    if (credentials) {
      const user = await auth0.auth.userInfo({
        token: credentials.accessToken,
      });
      return {
        accessToken: credentials.accessToken,
        email: user.email,
      };
    }
  },
);

export const login = createAsyncThunk<LoginResponse | undefined>(
  'user/login',
  async () => {
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: config.auth0Scope,
        audience: config.audience,
      });

      if (typeof credentials.idToken === 'undefined') {
        throw new Error('ID_TOKEN_UNDEFINED');
      }

      auth0.credentialsManager.saveCredentials(credentials as any);

      const user = await auth0.auth.userInfo({
        token: credentials.accessToken,
      });
      return {
        accessToken: credentials.accessToken,
        email: user.email,
      };
    } catch (e) {
      console.error(e);
    }
  },
);

export const logout = createAsyncThunk<void>('user/logout', async () => {
  try {
    await auth0.webAuth.clearSession();
    await auth0.credentialsManager.clearCredentials();
  } catch (e) {
    console.error(e);
  }
});
