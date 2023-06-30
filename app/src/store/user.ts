import {
  createSlice,
  miniSerializeError,
  type SerializedError,
} from '@reduxjs/toolkit';
import { match } from 'ts-pattern';
import { type AsyncStoreSlice } from './app';
import { createTypedAsyncThunk, generateThunkActionTypes } from './common';
import { auth } from '../util/auth';
import { settlePromise } from '../util/settlePromise';

export const sliceName = 'user' as const;

/**
 * Reusable type for all actions.
 */
export type RejectValue = {
  reason: 'AUTH_REJECTED';
  error: SerializedError;
};

/**
 * Check login status action.
 */
export const checkLoginStatusActionTypes = generateThunkActionTypes(
  `${sliceName}/checkLoginStatus`,
);
export const checkLoginStatus = createTypedAsyncThunk<
  { accessToken: string; email: string },
  void,
  { rejectValue: RejectValue }
>(checkLoginStatusActionTypes.prefix, async (_, { rejectWithValue }) => {
  const checkLoginStatusResult = await settlePromise(auth.checkLoginStatus());
  if (checkLoginStatusResult.status === 'rejected') {
    return rejectWithValue({
      reason: 'AUTH_REJECTED',
      error: miniSerializeError(checkLoginStatusResult.reason),
    });
  }

  return checkLoginStatusResult.value;
});

/**
 * Login action.
 */
export const loginActionTypes = generateThunkActionTypes(`${sliceName}/login`);
export const login = createTypedAsyncThunk<
  { accessToken: string; email: string },
  void,
  { rejectValue: RejectValue }
>(loginActionTypes.prefix, async (_, { rejectWithValue }) => {
  const loginResult = await settlePromise(auth.login());
  if (loginResult.status === 'rejected') {
    return rejectWithValue({
      reason: 'AUTH_REJECTED',
      error: miniSerializeError(loginResult.reason),
    });
  }

  return loginResult.value;
});

/**
 * Logout action.
 */
export const logoutActionTypes = generateThunkActionTypes(
  `${sliceName}/logout`,
);
export const logout = createTypedAsyncThunk<
  void,
  void,
  { rejectValue: RejectValue }
>(logoutActionTypes.prefix, async (_, { rejectWithValue }) => {
  const clearSessionResult = await settlePromise(auth.logout());
  if (clearSessionResult.status === 'rejected') {
    return rejectWithValue({
      reason: 'AUTH_REJECTED',
      error: miniSerializeError(clearSessionResult.reason),
    });
  }
});

/**
 * User slice configuration.
 */
type UserRejectState = RejectValue | { error: SerializedError };

export type UserState = {
  action: 'checkLoginStatus' | 'login' | 'logout';
} & AsyncStoreSlice<{ accessToken: string; email: string }, UserRejectState>;

export const userSlice = createSlice({
  name: 'user',
  initialState: { status: 'idle' } as UserState,
  reducers: {},
  extraReducers: (builder) => {
    /**
     * Check login action handling.
     */
    builder.addCase(checkLoginStatus.pending, () => {
      return { action: 'checkLoginStatus', status: 'pending' };
    });

    builder.addCase(checkLoginStatus.fulfilled, (_, action) => {
      return {
        action: 'checkLoginStatus',
        status: 'fulfilled',
        accessToken: action.payload.accessToken,
        email: action.payload.email,
      };
    });

    builder.addCase(checkLoginStatus.rejected, (_, action) => {
      const actionType = 'checkLoginStatus' as const;

      const { requestStatus } = action.meta;

      return match(action.payload)
        .with({ reason: 'AUTH_REJECTED' }, ({ reason, error }) => ({
          action: actionType,
          status: requestStatus,
          reason,
          error,
        }))
        .with(undefined, () => ({
          action: actionType,
          status: requestStatus,
          error: action.error,
        }))
        .exhaustive();
    });

    /**
     * Login action handling.
     */
    builder.addCase(login.pending, () => {
      return { action: 'login', status: 'pending' };
    });

    builder.addCase(login.fulfilled, (_, action) => {
      return {
        action: 'login',
        status: 'fulfilled',
        accessToken: action.payload.accessToken,
        email: action.payload.email,
      };
    });

    builder.addCase(login.rejected, (_, action) => {
      const actionType = 'login' as const;

      const { requestStatus } = action.meta;

      return match(action.payload)
        .with({ reason: 'AUTH_REJECTED' }, ({ reason, error }) => ({
          action: actionType,
          status: requestStatus,
          reason,
          error,
        }))
        .with(undefined, () => ({
          action: actionType,
          status: requestStatus,
          error: action.error,
        }))
        .exhaustive();
    });

    /**
     * Logout action handling.
     */
    builder.addCase(logout.pending, () => {
      return { action: 'logout', status: 'pending' };
    });
    builder.addCase(logout.fulfilled, () => {
      return {
        action: 'logout',
        status: 'fulfilled',
        accessToken: '',
        email: '',
      };
    });
    builder.addCase(logout.rejected, (_, action) => {
      const actionType = 'logout' as const;

      const { requestStatus } = action.meta;

      return match(action.payload)
        .with({ reason: 'AUTH_REJECTED' }, ({ reason, error }) => ({
          action: actionType,
          status: requestStatus,
          reason,
          error,
        }))
        .with(undefined, () => ({
          action: actionType,
          status: requestStatus,
          error: action.error,
        }))
        .exhaustive();
    });
  },
});
