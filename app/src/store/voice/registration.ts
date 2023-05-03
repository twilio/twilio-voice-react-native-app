import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AsyncStoreSlice, type Dispatch, type State } from '../app';
import { voice } from '../../util/voice';
import { settlePromise } from '../../util/settlePromise';
import { login } from '../user';
import { getAccessToken } from './accessToken';

export type RegisterRejectValue =
  | {
      reason: 'ACCESS_TOKEN_NOT_FULFILLED';
    }
  | {
      reason: 'NO_ACCESS_TOKEN';
    }
  | {
      reason: 'NATIVE_MODULE_REJECTED';
      error: any;
    };

export const register = createAsyncThunk<
  void,
  void,
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: RegisterRejectValue;
  }
>('registration/register', async (_, { getState, rejectWithValue }) => {
  const { accessToken } = getState().voice;

  if (accessToken?.status !== 'fulfilled') {
    return rejectWithValue({ reason: 'ACCESS_TOKEN_NOT_FULFILLED' });
  }

  if (accessToken.value === '') {
    return rejectWithValue({ reason: 'NO_ACCESS_TOKEN' });
  }

  const voiceRegisterResult = await settlePromise(
    voice.register(accessToken.value),
  );
  if (voiceRegisterResult.status === 'rejected') {
    return rejectWithValue({
      reason: 'NATIVE_MODULE_REJECTED',
      error: voiceRegisterResult.reason,
    });
  }
});

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

export const loginAndRegister = createAsyncThunk<
  void,
  void,
  {
    state: State;
    dispatch: Dispatch;
    rejectValue: LoginAndRegisterRejectValue;
  }
>('registration/loginAndRegister', async (_, { dispatch, rejectWithValue }) => {
  const loginActionResult = await dispatch(login());
  if (login.rejected.match(loginActionResult)) {
    return rejectWithValue({ reason: 'LOGIN_REJECTED' });
  }

  const getAccessTokenResult = await dispatch(getAccessToken());
  if (getAccessToken.rejected.match(getAccessTokenResult)) {
    return rejectWithValue({ reason: 'GET_ACCESS_TOKEN_REJECTED' });
  }

  const registerActionResult = await dispatch(register());
  if (register.rejected.match(registerActionResult)) {
    return rejectWithValue({ reason: 'REGISTER_REJECTED' });
  }
});

export type RegistrationSlice = AsyncStoreSlice<
  {},
  RegisterRejectValue | { error: any }
>;

export const registrationSlice = createSlice({
  name: 'registration',
  initialState: null as RegistrationSlice,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(register.pending, () => ({ status: 'pending' }));

    builder.addCase(register.fulfilled, () => ({ status: 'fulfilled' }));

    builder.addCase(register.rejected, (_, action) => {
      switch (action.payload?.reason) {
        case 'NATIVE_MODULE_REJECTED':
          return {
            status: 'rejected',
            reason: action.payload.reason,
            error: action.payload.error,
          };
        case 'ACCESS_TOKEN_NOT_FULFILLED':
        case 'NO_ACCESS_TOKEN':
          return {
            status: 'rejected',
            reason: action.payload.reason,
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
