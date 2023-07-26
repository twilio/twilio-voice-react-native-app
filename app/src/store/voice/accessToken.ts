import {
  createSlice,
  miniSerializeError,
  type SerializedError,
} from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import { fetch, defaultUrl } from '../../util/fetch';
import { settlePromise } from '../../util/settlePromise';
import { type AsyncStoreSlice } from '../app';
import { createTypedAsyncThunk } from '../common';

export type GetAccessTokenRejectValue =
  | {
      reason: 'USER_NOT_FULFILLED';
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
    });
  }

  const fetchResult = await settlePromise(
    fetch(`${defaultUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({
        platform: Platform.OS,
      }),
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

  if (!tokenResponse.ok) {
    const error =
      tokenTextResult.status === 'fulfilled'
        ? new Error(tokenTextResult.value)
        : tokenTextResult.reason;
    return rejectWithValue({
      reason: 'TOKEN_RESPONSE_NOT_OK',
      statusCode: tokenResponse.status,
      error: miniSerializeError(error),
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
  GetAccessTokenRejectValue | { error: any; reason: 'UNEXPECTED_ERROR' }
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

    builder.addCase(getAccessToken.rejected, (_, action) => {
      switch (action.payload?.reason) {
        case 'USER_NOT_FULFILLED':
          return {
            status: 'rejected',
            reason: action.payload.reason,
          };
        case 'TOKEN_RESPONSE_NOT_OK':
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
            reason: 'UNEXPECTED_ERROR',
          };
      }
    });
  },
});
