import { createSlice, type SerializedError } from '@reduxjs/toolkit';
import { match } from 'ts-pattern';
import { getAccessToken } from './voice/accessToken';
import { register } from './voice/registration';
import { type AsyncStoreSlice } from './app';
import { createTypedAsyncThunk } from './common';
import { login, logout } from './user';

export type LoginAndRegisterRejectValue =
  | {
      reason: 'LOGIN_REJECTED';
    }
  | {
      reason: 'GET_ACCESS_TOKEN_REJECTED';
    }
  | {
      reason: 'REGISTER_REJECTED';
    };

export const loginAndRegister = createTypedAsyncThunk<
  void,
  void,
  {
    rejectValue: LoginAndRegisterRejectValue;
  }
>('registration/loginAndRegister', async (_, { dispatch, rejectWithValue }) => {
  const loginActionResult = await dispatch(login());
  if (login.rejected.match(loginActionResult)) {
    return rejectWithValue({ reason: 'LOGIN_REJECTED' });
  }

  const getAccessTokenResult = await dispatch(getAccessToken());
  if (getAccessToken.rejected.match(getAccessTokenResult)) {
    await dispatch(logout());
    return rejectWithValue({
      reason: 'GET_ACCESS_TOKEN_REJECTED',
    });
  }

  const registerActionResult = await dispatch(register());
  if (register.rejected.match(registerActionResult)) {
    return rejectWithValue({ reason: 'REGISTER_REJECTED' });
  }
});

export type LoginAndRegisterSlice = AsyncStoreSlice<
  {},
  LoginAndRegisterRejectValue | { error: SerializedError }
>;

export const loginAndRegisterSlice = createSlice({
  name: 'loginAndRegister',
  initialState: { status: 'idle' } as LoginAndRegisterSlice,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(loginAndRegister.pending, () => ({ status: 'pending' }));

    builder.addCase(loginAndRegister.fulfilled, () => ({
      status: 'fulfilled',
    }));

    builder.addCase(loginAndRegister.rejected, (_, action) => {
      const { requestStatus } = action.meta;

      return match(action.payload)
        .with(
          { reason: 'LOGIN_REJECTED' },
          { reason: 'GET_ACCESS_TOKEN_REJECTED' },
          { reason: 'REGISTER_REJECTED' },
          ({ reason }) => ({ status: requestStatus, reason }),
        )
        .with(undefined, () => ({
          status: requestStatus,
          error: action.error,
          reason: 'UNEXPECTED_ERROR',
        }))
        .exhaustive();
    });
  },
});
