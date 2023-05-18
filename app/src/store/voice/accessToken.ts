import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetch, defaultUrl } from '../../util/fetch';
import { settlePromise } from '../../util/settlePromise';
import { type AsyncStoreSlice, type State, type Dispatch } from '../app';

export type GetAccessTokenRejectValue =
  | {
      reason: 'USER_NOT_FULFILLED';
    }
  | {
      reason: 'FETCH_ERROR';
      error: any;
    }
  | {
      reason: 'TOKEN_RESPONSE_NOT_OK';
      statusCode: number;
    }
  | {
      reason: 'FETCH_TEXT_ERROR';
      error: any;
    };

export const getAccessToken = createAsyncThunk<
  string,
  void,
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: GetAccessTokenRejectValue;
  }
>('voice/getAccessToken', async (_, { getState, rejectWithValue }) => {
  const user = getState().user;
  if (user?.status !== 'fulfilled') {
    return rejectWithValue({ reason: 'USER_NOT_FULFILLED' });
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
      error: fetchResult.reason,
    });
  }

  const tokenResponse = fetchResult.value;
  if (!tokenResponse.ok) {
    return rejectWithValue({
      reason: 'TOKEN_RESPONSE_NOT_OK',
      statusCode: tokenResponse.status,
    });
  }

  const tokenTextResult = await settlePromise(tokenResponse.text());
  if (tokenTextResult.status === 'rejected') {
    return rejectWithValue({
      reason: 'FETCH_TEXT_ERROR',
      error: tokenTextResult.reason,
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
