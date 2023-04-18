import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetch, defaultUrl } from '../../util/fetch';
import { type AsyncStoreSlice, type State, type Dispatch } from '../app';

export const getAccessToken = createAsyncThunk<
  string,
  void,
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: {
      reason: 'GET_TOKEN_ERROR';
      error: any;
    };
  }
>('voice/getToken', async (_, { getState, rejectWithValue }) => {
  try {
    const user = getState().voice.user;
    if (user?.status !== 'fulfilled') {
      return '';
    }
    const res = await fetch(`${defaultUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({
        username: 'alice',
        password: 'supersecretpassword1234',
      }),
    });

    const token: string = await res.text();

    return token;
  } catch (error) {
    return rejectWithValue({ reason: 'GET_TOKEN_ERROR', error });
  }
});

export type AccessTokenState = AsyncStoreSlice<
  { value: string },
  {
    reason: 'GET_TOKEN_ERROR' | undefined;
    error: any;
  }
>;

export const accessTokenSlice = createSlice({
  name: 'accessToken',
  initialState: null as AccessTokenState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getAccessToken.pending, () => {
        return { status: 'pending' };
      })
      .addCase(getAccessToken.fulfilled, (_, action) => {
        return { status: 'fulfilled', value: action.payload };
      })
      .addCase(getAccessToken.rejected, (_, action) => {
        return {
          status: 'rejected',
          reason: action.payload?.reason,
          error: action.payload?.error || action.error,
        };
      });
  },
});
