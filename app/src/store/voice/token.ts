import { createSlice } from '@reduxjs/toolkit';
import { fetch, defaultUrl } from '../../util/fetch';
import { AsyncStoreSlice, createTypedAsyncThunk } from '../common';

export const getToken = createTypedAsyncThunk(
  'voice/getToken',
  async (_, { getState }) => {
    const { user } = getState();
    if (user?.status !== 'fulfilled') {
      console.log(user?.status);
      throw new Error();
    }

    const { username, password } = user;
    const res = await fetch(`${defaultUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const token: string = await res.text();
    return token;
  },
);

export type TokenState = AsyncStoreSlice<{ value: string }>;

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
      .addCase(getToken.rejected, () => {
        return { status: 'rejected' };
      });
  },
});
