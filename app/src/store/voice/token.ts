import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetch, defaultUrl } from '../../util/fetch';
import { type AsyncStoreSlice, type State, type Dispatch } from '../app';

export const getToken = createAsyncThunk<
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

export type TokenState = AsyncStoreSlice<
  { value: string },
  {
    reason: 'GET_TOKEN_ERROR' | undefined;
    error: any;
  }
>;

export const tokenSlice = createSlice({
  name: 'token',
  initialState: null as TokenState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getToken.pending, () => {
        return { status: 'pending' };
      })
      .addCase(getToken.fulfilled, (_, action) => {
        return { status: 'fulfilled', value: action.payload };
      })
      .addCase(getToken.rejected, (_, action) => {
        return {
          status: 'rejected',
          reason: action.payload?.reason,
          error: action.payload?.error || action.error,
        };
      });
  },
});
