import { miniSerializeError, type SerializedError } from '@reduxjs/toolkit';
import {
  Voice,
  Call as TwilioCall,
  CallInvite as TwilioCallInvite,
} from '@twilio/voice-react-native-sdk';
import { createTypedAsyncThunk, generateThunkActionTypes } from './common';
import { checkLoginStatus } from './user';
import { getAccessToken } from './voice/accessToken';
import { handleCall } from './voice/call/activeCall';
import { receiveCallInvite, removeCallInvite } from './voice/call/callInvite';
import { register } from './voice/registration';
import { navigate } from '../util/navigation';
import { settlePromise } from '../util/settlePromise';
import { voice } from '../util/voice';
import { StackParamList } from '../screens/types';

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
    const handleCallInvite = async (callInvite: TwilioCallInvite) => {
      await dispatch(receiveCallInvite(callInvite));
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
>(
  bootstrapCallsActionTypes.prefix,
  async (_, { dispatch, getState, rejectWithValue }) => {
    // TODO(mhuynh): consider placing this logic somewhere else
    voice.on(
      Voice.Event.CallInviteAccepted,
      (callInvite: TwilioCallInvite, call: TwilioCall) => {
        // dispatch the new call
        dispatch(handleCall({ call }));

        // invalidate the existing call invite if it exists
        const callInvites = getState().voice.call.callInvite.entities;
        const callInviteEntity = Object.entries(callInvites).find(([__, e]) => {
          if (typeof e === 'undefined') {
            return false;
          }
          return e.info.callSid === callInvite.getCallSid();
        });
        if (typeof callInviteEntity === 'undefined') {
          return;
        }
        const [id] = callInviteEntity;
        dispatch(removeCallInvite(id));
        navigate('Call');
      },
    );

    voice.on(Voice.Event.CallInviteRejected, (callInvite: TwilioCallInvite) => {
      // invalidate the existing call invite if it exists
      const callInvites = getState().voice.call.callInvite.entities;
      const callInviteEntity = Object.entries(callInvites).find(([__, e]) => {
        if (typeof e === 'undefined') {
          return false;
        }
        return e.info.callSid === callInvite.getCallSid();
      });
      if (typeof callInviteEntity === 'undefined') {
        return;
      }
      const [id] = callInviteEntity;
      dispatch(removeCallInvite(id));
      navigate('App');
    });

    voice.on(
      Voice.Event.CancelledCallInvite,
      (callInvite: TwilioCallInvite) => {
        // invalidate the existing call invite if it exists
        const callInvites = getState().voice.call.callInvite.entities;
        const callInviteEntity = Object.entries(callInvites).find(([__, e]) => {
          if (typeof e === 'undefined') {
            return false;
          }
          return e.info.callSid === callInvite.getCallSid();
        });
        if (typeof callInviteEntity === 'undefined') {
          return;
        }
        const [id] = callInviteEntity;
        dispatch(removeCallInvite(id));
        navigate('App');
      },
    );

    const callsResult = await settlePromise(voice.getCalls());
    if (callsResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
        error: miniSerializeError(callsResult.reason),
      });
    }

    const calls = callsResult.value;
    for (const call of calls.values()) {
      console.log(call);
      await dispatch(handleCall({ call }));
    }
  },
);

/**
 * Bootstrap proper screen. Navigate to the proper screen depending on
 * application state.
 *
 * For example, navigate to the call invite screen when there are call invites.
 */
export const bootstrapNavigationActionTypes = generateThunkActionTypes(
  'bootstrap/navigation',
);
export const bootstrapNavigation = createTypedAsyncThunk<keyof StackParamList>(
  bootstrapNavigationActionTypes.prefix,
  (_, { getState }) => {
    const state = getState();

    if (state.voice.call.callInvite.ids.length) {
      navigate('Incoming Call');
      return 'Incoming Call';
    }

    if (state.voice.call.activeCall.ids.length) {
      navigate('Call');
      return 'Call';
    }

    navigate('App');
    return 'App';
  },
);
