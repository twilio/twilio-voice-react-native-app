import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackActions } from '@react-navigation/native';
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
export const bootstrapUserActionTypes =
  generateThunkActionTypes('bootstrap/user');
export const bootstrapUser = createTypedAsyncThunk<
  void,
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
    const {
      canGoBack,
      getCurrentRoute,
      goBack,
      dispatch: navDispatch,
      navigate,
    } = await getNavigate();

    /**
     * Handle an incoming, pending, call invite.
     */
    const handlePendingCallInvite = (callInvite: TwilioCallInvite) => {
      /**
       * Handle the call invite accepted event.
       */
      const handleCallInviteAccepted = (call: TwilioCall) => {
        // dispatch the new call
        dispatch(handleCall({ call }));
        handleSettledCallInvite(callInvite);

        const callSid = callInvite.getCallSid();
        const currentRoute = getCurrentRoute();
        if (currentRoute?.name !== 'Incoming Call') {
          navigate('Call', { callSid });
        } else {
          navDispatch(StackActions.replace('Call', { callSid }));
        }
      };
      callInvite.on(TwilioCallInvite.Event.Accepted, handleCallInviteAccepted);

      /**
       * Return to the previous screen if a call invite is cancelled/rejected
       * and there are no more call invites.
       */
      const maybeGoBack = () => {
        const shouldGoBack = getState().voice.call.callInvite.ids.length === 0;
        const currentRoute = getCurrentRoute();
        if (
          shouldGoBack &&
          currentRoute?.name === 'Incoming Call' &&
          canGoBack()
        ) {
          goBack();
        }
      };

      /**
       * Handle the call invite rejected event.
       */
      const handleCallInviteRejected = () => {
        handleSettledCallInvite(callInvite);
        maybeGoBack();
      };
      callInvite.on(TwilioCallInvite.Event.Rejected, handleCallInviteRejected);

      /**
       * Handle the call invite cancelled event.
       */
      const handleCallInviteCancelled = () => {
        handleSettledCallInvite(callInvite);
        maybeGoBack();
      };
      callInvite.on(
        TwilioCallInvite.Event.Cancelled,
        handleCallInviteCancelled,
      );

      /**
       * Handle the call invite notification tapped event.
       */
      const handleCallInviteNotificationTapped = () => {
        navigate('Incoming Call');
      };
      callInvite.on(
        TwilioCallInvite.Event.NotificationTapped,
        handleCallInviteNotificationTapped,
      );

      dispatch(receiveCallInvite(callInvite));
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
    // Get all the call sids stored in async storage.
    const storedCallSids = new Set(await AsyncStorage.getAllKeys());
    for (const call of calls.values()) {
      await dispatch(handleCall({ call }));

      // If the call is still active, the native layer will still have it
      // cached.
      const callSid = call.getSid();
      if (callSid) {
        // Mark a call as still active, and therefore keep it in async storage.
        storedCallSids.delete(callSid);
      }
    }

    /**
     * Free the AsyncStorage if there are some calls in AsyncStorage that are
     * no longer tracked by the native layer.
     */
    await AsyncStorage.multiRemove(Array.from(storedCallSids.values()));
  },
);

/**
 * Bootstrap proper screen. Navigate to the proper screen depending on
 * application state.
 *
 * For example, navigate to the call invite screen when there are call invites.
 */
type BootstrapNavigationReturnValue =
  | 'App'
  | 'Call'
  | 'Incoming Call'
  | 'Sign In';
export const bootstrapNavigationActionTypes = generateThunkActionTypes(
  'bootstrap/navigation',
);
export const bootstrapNavigation =
  createTypedAsyncThunk<BootstrapNavigationReturnValue>(
    bootstrapNavigationActionTypes.prefix,
    async (_, { getState }) => {
      const { reset } = await getNavigate();

      const state = getState();

      if (state.voice.call.activeCall.ids.length) {
        reset({ routes: [{ name: 'App' }, { name: 'Call' }] });
        return 'Call';
      }

      if (state.voice.call.callInvite.ids.length) {
        reset({ routes: [{ name: 'App' }, { name: 'Incoming Call' }] });
        return 'Incoming Call';
      }

      if (state.voice.accessToken.status !== 'fulfilled') {
        reset({ routes: [{ name: 'Sign In' }] });
        return 'Sign In';
      }

      reset({ routes: [{ name: 'App' }] });
      return 'App';
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
