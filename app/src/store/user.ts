import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetch, defaultUrl } from '../util/fetch';
import { AsyncStoreSlice } from './app';

export const authenticateUser = createAsyncThunk(
  'user/authenticate',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue },
  ) => {
    const res = await fetch(`${defaultUrl}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (res.status === 200) {
      return { username, password };
    }

    return rejectWithValue(res.status);
  },
);

export type UserState = AsyncStoreSlice<{ username: string; password: string }>;

export const userSlice = createSlice({
  name: 'user',
  initialState: null as UserState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(authenticateUser.pending, () => {
        return { status: 'pending' };
      })
      .addCase(authenticateUser.fulfilled, (_, action) => {
        const { username, password } = action.payload;
        return { status: 'fulfilled', username, password };
      })
      .addCase(authenticateUser.rejected, () => {
        return { status: 'rejected' };
      });
  },
});
