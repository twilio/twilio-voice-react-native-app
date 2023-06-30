import {
  miniSerializeError,
  nanoid,
  type SerializedError,
} from '@reduxjs/toolkit';
import { Voice, CallInvite } from '@twilio/voice-react-native-sdk';
import { createTypedAsyncThunk, generateThunkActionTypes } from './common';
import { checkLoginStatus } from './user';
import { getAccessToken } from './voice/accessToken';
import { getCallInviteInfo } from './voice/call';
import { setCallInvite } from './voice/call/callInvite';
import { register } from './voice/registration';
import { settlePromise } from '../util/settlePromise';
import { callInviteMap, voice } from '../util/voice';

/**
 * Bootstrap user action. Gets the login-state of the user, and if logged in
 * get an access token and register the user for incoming calls.
 */
export type BootstrapUserRejectValue =
  | {
      reason: 'CHECK_LOGIN_STATUS_REJECTED';
    }
  | {
      reason: 'GET_ACCESS_TOKEN_REJECTED';
    }
  | {
      reason: 'REGISTER_REJECTED';
    };
export type BootstrapUserFulfillValue = 'NOT_LOGGED_IN' | 'LOGGED_IN';
export const bootstrapUserActionTypes =
  generateThunkActionTypes('bootstrap/user');
export const bootstrapUser = createTypedAsyncThunk<
  BootstrapUserFulfillValue,
  void,
  { rejectValue: BootstrapUserRejectValue }
>(bootstrapUserActionTypes.prefix, async (_, { dispatch, rejectWithValue }) => {
  const checkLoginStatusResult = await dispatch(checkLoginStatus());
  if (checkLoginStatus.rejected.match(checkLoginStatusResult)) {
    return rejectWithValue({ reason: 'CHECK_LOGIN_STATUS_REJECTED' });
  }

  const getAccessTokenResult = await dispatch(getAccessToken());
  if (getAccessToken.rejected.match(getAccessTokenResult)) {
    return rejectWithValue({ reason: 'GET_ACCESS_TOKEN_REJECTED' });
  }

  const registerResult = await dispatch(register());
  if (register.rejected.match(registerResult)) {
    return rejectWithValue({ reason: 'REGISTER_REJECTED' });
  }

  return 'LOGGED_IN';
});

/**
 * Bootstrap call invites. Retreives all existing call invites.
 */
export type BootstrapCallInvitesRejectValue = {
  reason: 'NATIVE_MODULE_REJECTED';
  error: SerializedError;
};
export const bootstrapCallInvitesActionTypes = generateThunkActionTypes(
  'bootstrap/callInvites',
);
export const bootstrapCallInvites = createTypedAsyncThunk<
  void,
  void,
  { rejectValue: BootstrapCallInvitesRejectValue }
>(
  bootstrapCallInvitesActionTypes.prefix,
  async (_, { dispatch, rejectWithValue }) => {
    const handleCallInvite = (callInvite: CallInvite) => {
      const callInviteInfo = getCallInviteInfo(callInvite);
      const id = nanoid();
      callInviteMap.set(id, callInvite);
      dispatch(
        setCallInvite({
          id,
          info: callInviteInfo,
          status: 'idle',
        }),
      );
    };

    voice.on(Voice.Event.CallInvite, handleCallInvite);

    const callInvitesResult = await settlePromise(voice.getCallInvites());
    if (callInvitesResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
        error: miniSerializeError(callInvitesResult.reason),
      });
    }

    const callInvites = callInvitesResult.value;
    for (const callInvite of callInvites.values()) {
      handleCallInvite(callInvite);
    }
  },
);

/**
 * Bootstrap calls. Retrieves all existing calls.
 *
 * TODO(mhuynh):
 * Re-evaluate the "active calls" map that we use on the native layer. There
 * really only should be one active call, the Android/iOS SDKs do not support
 * multiple active calls.
 */
export type BootstrapCallsRejectValue = {
  reason: 'NATIVE_MODULE_REJECTED';
  error: SerializedError;
};
export const bootstrapCallsActionTypes =
  generateThunkActionTypes('bootstrap/call');
export const bootstrapCalls = createTypedAsyncThunk<
  void,
  void,
  { rejectValue: BootstrapCallsRejectValue }
>(bootstrapCallsActionTypes.prefix, async (_, { rejectWithValue }) => {
  const callsResult = await settlePromise(voice.getCalls());

  if (callsResult.status === 'rejected') {
    return rejectWithValue({
      reason: 'NATIVE_MODULE_REJECTED',
      error: miniSerializeError(callsResult.reason),
    });
  }

  // TODO(mhuynh): [VBLOCKS-1676] Dispatch the existing calls to the application state.
});
