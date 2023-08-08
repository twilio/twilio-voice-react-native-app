import {
  createSlice,
  miniSerializeError,
  type SerializedError,
} from '@reduxjs/toolkit';
import { match } from 'ts-pattern';
import { type AsyncStoreSlice } from '../app';
import { createTypedAsyncThunk } from '../common';
import { settlePromise } from '../../util/settlePromise';
import { voice } from '../../util/voice';

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

export const register = createTypedAsyncThunk<
  void,
  void,
  {
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
