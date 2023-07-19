import {
  createSlice,
  miniSerializeError,
  type SerializedError,
} from '@reduxjs/toolkit';
import { fetch, defaultUrl } from '../../util/fetch';
import { settlePromise } from '../../util/settlePromise';
import { type AsyncStoreSlice } from '../app';
import { createTypedAsyncThunk } from '../common';

export type GetAccessTokenRejectValue =
  | {
      reason: 'USER_NOT_FULFILLED';
      error: SerializedError;
    }
  | {
      reason: 'FETCH_ERROR';
      error: SerializedError;
    }
  | {
      reason: 'TOKEN_RESPONSE_NOT_OK';
      statusCode: number;
      error: SerializedError;
    }
  | {
      reason: 'FETCH_TEXT_ERROR';
      error: SerializedError;
    };

export const getAccessToken = createTypedAsyncThunk<
  string,
  void,
  {
    rejectValue: GetAccessTokenRejectValue;
  }
>('voice/getAccessToken', async (_, { getState, rejectWithValue }) => {
  const user = getState().user;
  if (user?.status !== 'fulfilled') {
    return rejectWithValue({
      reason: 'USER_NOT_FULFILLED',
      error: miniSerializeError(null),
    });
  }

  const fetchResult = await settlePromise(
    fetch(`${defaultUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
    }),
  );
  if (fetchResult.status === 'rejected') {
    return rejectWithValue({
      reason: 'FETCH_ERROR',
      error: miniSerializeError(fetchResult.reason),
    });
  }

  const tokenResponse = fetchResult.value;

  const tokenTextResult = await settlePromise(tokenResponse.text());

  if (!tokenResponse.ok && tokenTextResult.status === 'fulfilled') {
    return rejectWithValue({
      reason: 'TOKEN_RESPONSE_NOT_OK',
      statusCode: tokenResponse.status,
      error: miniSerializeError(tokenTextResult.value),
    });
  }

  if (!tokenResponse.ok) {
    return rejectWithValue({
      reason: 'TOKEN_RESPONSE_NOT_OK',
      statusCode: tokenResponse.status,
      error: miniSerializeError(null),
    });
  }

  if (tokenTextResult.status === 'rejected') {
    return rejectWithValue({
      reason: 'FETCH_TEXT_ERROR',
      error: miniSerializeError(tokenTextResult.reason),
    });
  }

  const token = tokenTextResult.value;
  return token;
});

export type AccessTokenState = AsyncStoreSlice<
  { value: string },
  GetAccessTokenRejectValue | { error: any }
>;

export const accessTokenSlice = createSlice({
  name: 'accessToken',
  initialState: { status: 'idle' } as AccessTokenState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getAccessToken.pending, () => {
      return { status: 'pending' };
    });

    builder.addCase(getAccessToken.fulfilled, (_, action) => {
      return { status: 'fulfilled', value: action.payload };
    });

    builder.addCase(getAccessToken.rejected, (state, action) => {
      switch (action.payload?.reason) {
        case 'USER_NOT_FULFILLED':
          return {
            status: 'rejected',
            reason: action.payload.reason,
            error: action.payload.error,
          };
        case 'TOKEN_RESPONSE_NOT_OK':
          state = {
            ...state,
            status: 'rejected',
            reason: action.payload.reason,
            statusCode: action.payload.statusCode,
            error: action.payload.error,
          };
          return {
            status: 'rejected',
            reason: action.payload.reason,
            statusCode: action.payload.statusCode,
            error: action.payload.error,
          };
        case 'FETCH_ERROR':
        case 'FETCH_TEXT_ERROR':
          return {
            status: 'rejected',
            reason: action.payload.reason,
            error: action.payload.error,
          };
        default:
          return {
            status: 'rejected',
            error: action.error,
          };
      }
    });
  },
});
