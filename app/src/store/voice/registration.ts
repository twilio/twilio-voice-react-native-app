import {
  createAsyncThunk,
  createSlice,
  miniSerializeError,
  type SerializedError,
} from '@reduxjs/toolkit';
import { match } from 'ts-pattern';
import { AsyncStoreSlice, type Dispatch, type State } from '../app';
import { voice } from '../../util/voice';
import { settlePromise } from '../../util/settlePromise';
import { login } from '../../util/auth';
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
      error: SerializedError;
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
      error: miniSerializeError(voiceRegisterResult.reason),
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
  RegisterRejectValue | { error: SerializedError }
>;

export const registrationSlice = createSlice({
  name: 'registration',
  initialState: { status: 'idle' } as RegistrationSlice,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(register.pending, () => ({ status: 'pending' }));

    builder.addCase(register.fulfilled, () => ({ status: 'fulfilled' }));

    builder.addCase(register.rejected, (_, action) => {
      const { requestStatus } = action.meta;

      return match(action.payload)
        .with({ reason: 'NATIVE_MODULE_REJECTED' }, ({ reason, error }) => ({
          status: requestStatus,
          reason,
          error,
        }))
        .with(
          { reason: 'ACCESS_TOKEN_NOT_FULFILLED' },
          { reason: 'NO_ACCESS_TOKEN' },
          ({ reason }) => ({
            status: requestStatus,
            reason,
          }),
        )
        .with(undefined, () => ({
          status: requestStatus,
          error: action.error,
        }))
        .exhaustive();
    });
  },
});
