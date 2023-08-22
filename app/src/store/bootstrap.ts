import { miniSerializeError, type SerializedError } from '@reduxjs/toolkit';
import {
  Voice,
  Call as TwilioCall,
  CallInvite as TwilioCallInvite,
} from '@twilio/voice-react-native-sdk';
import { Platform } from 'react-native';
import { createTypedAsyncThunk, generateThunkActionTypes } from './common';
import { checkLoginStatus } from './user';
import { getAccessToken } from './voice/accessToken';
import { handleCall } from './voice/call/activeCall';
import { updateAudioDevices } from './voice/audioDevices';
import { receiveCallInvite, removeCallInvite } from './voice/call/callInvite';
import { register } from './voice/registration';
import { getNavigate } from '../util/navigation';
import { settlePromise } from '../util/settlePromise';
import { voice } from '../util/voice';

const sliceName = 'bootstrap';

/**
 * Bootstrap push registration. This action is applicable only to the iOS
 * platform. This action is a no-op on all other platforms.
 */
type BootstrapPushRegistryRejectValue = {
  reason: 'INITIALIZE_PUSH_REGISTRY_REJECTED';
  error: SerializedError;
};
const bootstrapPushRegistryActionTypes = generateThunkActionTypes(
  `${sliceName}/pushRegistry`,
);
export const bootstrapPushRegistry = createTypedAsyncThunk<
  void,
  void,
  { rejectValue: BootstrapPushRegistryRejectValue }
>(bootstrapPushRegistryActionTypes.prefix, async (_, { rejectWithValue }) => {
  if (Platform.OS !== 'ios') {
    return;
  }

  const initializeResult = await settlePromise(voice.initializePushRegistry());
  if (initializeResult.status === 'rejected') {
    return rejectWithValue({
      reason: 'INITIALIZE_PUSH_REGISTRY_REJECTED',
      error: miniSerializeError(initializeResult.reason),
    });
  }
});

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
  async (_, { dispatch, getState, rejectWithValue }) => {
    const navigate = await getNavigate();

    /**
     * Handle an incoming, pending, call invite.
     */
    const handlePendingCallInvite = async (callInvite: TwilioCallInvite) => {
      await dispatch(receiveCallInvite(callInvite));
    };
    voice.on(Voice.Event.CallInvite, handlePendingCallInvite);

    /**
     * Handle the settling of a pending call invite.
     */
    const handleSettledCallInvite = (callInvite: TwilioCallInvite) => {
      const callSid = callInvite.getCallSid();

      const callInviteEntities = getState().voice.call.callInvite.entities;
      const callInviteEntity = Object.values(callInviteEntities).find(
        (entity) => {
          if (typeof entity === 'undefined') {
            return false;
          }
          return entity.info.callSid === callSid;
        },
      );
      if (typeof callInviteEntity === 'undefined') {
        return;
      }

      dispatch(removeCallInvite(callInviteEntity.id));
    };

    voice.on(
      Voice.Event.CallInviteAccepted,
      (callInvite: TwilioCallInvite, call: TwilioCall) => {
        // dispatch the new call
        dispatch(handleCall({ call }));
        handleSettledCallInvite(callInvite);

        const callSid = callInvite.getCallSid();
        navigate('Call', { callSid });
      },
    );

    voice.on(Voice.Event.CallInviteRejected, (callInvite: TwilioCallInvite) => {
      handleSettledCallInvite(callInvite);
    });

    voice.on(
      Voice.Event.CancelledCallInvite,
      (callInvite: TwilioCallInvite) => {
        handleSettledCallInvite(callInvite);
      },
    );

    /**
     * Handle existing pending call invites.
     */
    const callInvitesResult = await settlePromise(voice.getCallInvites());
    if (callInvitesResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
        error: miniSerializeError(callInvitesResult.reason),
      });
    }

    const callInvites = callInvitesResult.value;
    for (const callInvite of callInvites.values()) {
      handlePendingCallInvite(callInvite);
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
  async (_, { dispatch, rejectWithValue }) => {
    const callsResult = await settlePromise(voice.getCalls());
    if (callsResult.status === 'rejected') {
      return rejectWithValue({
        reason: 'NATIVE_MODULE_REJECTED',
        error: miniSerializeError(callsResult.reason),
      });
    }

    const calls = callsResult.value;
    for (const call of calls.values()) {
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
export const bootstrapNavigation = createTypedAsyncThunk(
  bootstrapNavigationActionTypes.prefix,
  async (_, { getState }) => {
    const navigate = await getNavigate();

    const state = getState();

    /**
     * If the call invite notification body is tapped, navigate to the call
     * invite screen.
     */
    voice.on(Voice.Event.CallInviteNotificationTapped, () => {
      navigate('Incoming Call');
    });

    if (state.voice.call.activeCall.ids.length) {
      navigate('Call', {});
      return 'Call';
    }
  },
);

/**
 * Bootstrap audio devices.
 */
export const bootstrapAudioDevicesActionTypes = generateThunkActionTypes(
  'bootstrap/audioDevices',
);
export const bootstrapAudioDevices = createTypedAsyncThunk(
  bootstrapAudioDevicesActionTypes.prefix,
  (_, { dispatch }) => {
    const handleAudioDevicesUpdated: Voice.Listener.AudioDevicesUpdated = (
      audioDevices,
      selectedDevice,
    ) => {
      dispatch(
        updateAudioDevices({
          audioDevices,
          selectedDevice: selectedDevice === null ? undefined : selectedDevice,
        }),
      );
    };

    voice.on(Voice.Event.AudioDevicesUpdated, handleAudioDevicesUpdated);
  },
);
