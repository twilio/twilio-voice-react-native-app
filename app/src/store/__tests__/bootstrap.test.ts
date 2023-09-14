import { type Middleware } from '@reduxjs/toolkit';
import { createStore, Store } from '../app';
import {
  bootstrapPushRegistry,
  bootstrapUser,
  bootstrapCallInvites,
  bootstrapCalls,
  bootstrapNavigation,
} from '../bootstrap';
import { checkLoginStatus } from '../user';
import { getAccessToken } from '../voice/accessToken';
import { receiveCallInvite, setCallInvite } from '../voice/call/callInvite';
import { register } from '../voice/registration';
import * as auth0 from '../../../__mocks__/react-native-auth0';
import * as voiceSdk from '../../../__mocks__/@twilio/voice-react-native-sdk';
import * as asyncStorage from '../../../__mocks__/@react-native-async-storage/async-storage';
import * as voiceUtil from '../../../src/util/voice';
import * as navigationUtil from '../../../src/util/navigation';

let fetchMock: jest.Mock;
let mockPlatform: {
  OS: string;
};

jest.mock('../../../src/util/fetch', () => ({
  fetch: (fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    text: jest.fn().mockResolvedValue('some mock token'),
  })),
}));

jest.mock('react-native', () => {
  return {
    Platform: (mockPlatform = { OS: 'ios' }),
  };
});

describe('bootstrap', () => {
  let store: Store;
  const dispatchedActions: any[] = [];

  beforeEach(() => {
    jest.spyOn(navigationUtil, 'getNavigate').mockResolvedValue(jest.fn());

    dispatchedActions.splice(0);
    const logAction: Middleware = () => (next) => (action) => {
      dispatchedActions.push(action);
      next(action);
    };
    store = createStore(logAction);
    jest.clearAllMocks();
  });

  const matchDispatchedActions = (actions: any[], actionCreators: any[]) => {
    if (actions.length !== actionCreators.length) {
      throw new Error('different lengths of actions and actionCreators');
    }

    for (let idx = 0; idx < actions.length; idx++) {
      const action = actions[idx];
      const creator = actionCreators[idx];

      if (!creator.match(action)) {
        throw new Error('action does not match creator');
      }
    }
  };

  describe('bootstrapPushRegistry', () => {
    it('succeeds', async () => {
      const { type, payload } = await store.dispatch(bootstrapPushRegistry());
      expect(type).toStrictEqual('bootstrap/pushRegistry/fulfilled');
      expect(payload).toBeUndefined();

      expect(voiceSdk.voiceInitializePushRegistry.mock.calls).toStrictEqual([
        [],
      ]);
    });

    it('handles the voice module rejecting', async () => {
      const error = new Error('foobar');
      delete error.stack;
      voiceSdk.voiceInitializePushRegistry.mockRejectedValueOnce(error);

      const { type, payload } = await store.dispatch(bootstrapPushRegistry());
      expect(type).toStrictEqual('bootstrap/pushRegistry/rejected');
      expect(payload?.error).toStrictEqual({
        name: error.name,
        message: error.message,
      });

      expect(voiceSdk.voiceInitializePushRegistry.mock.calls).toStrictEqual([
        [],
      ]);
    });

    it('does nothing on platforms other than ios', async () => {
      mockPlatform.OS = 'android';

      const { type, payload } = await store.dispatch(bootstrapPushRegistry());
      expect(type).toStrictEqual('bootstrap/pushRegistry/fulfilled');
      expect(payload).toBeUndefined();

      expect(voiceSdk.voiceInitializePushRegistry.mock.calls).toStrictEqual([]);
    });
  });

  describe('bootstrapUser', () => {
    it('succeeds', async () => {
      const { type, payload } = await store.dispatch(bootstrapUser());
      expect(type).toStrictEqual('bootstrap/user/fulfilled');
      expect(payload).toStrictEqual('LOGGED_IN');

      expect(store.getState().user).toStrictEqual({
        action: 'checkLoginStatus',
        accessToken: 'test token',
        email: 'test email',
        status: 'fulfilled',
      });

      expect(store.getState().voice.accessToken).toStrictEqual({
        status: 'fulfilled',
        value: 'some mock token',
      });

      expect(store.getState().voice.registration).toStrictEqual({
        status: 'fulfilled',
      });

      matchDispatchedActions(dispatchedActions, [
        bootstrapUser.pending,
        checkLoginStatus.pending,
        checkLoginStatus.fulfilled,
        getAccessToken.pending,
        getAccessToken.fulfilled,
        register.pending,
        register.fulfilled,
        bootstrapUser.fulfilled,
      ]);
    });

    describe('handles rejection of', () => {
      it('checkLoginStatus', async () => {
        auth0.userInfo.mockRejectedValueOnce('foobar');

        const { type, payload } = await store.dispatch(bootstrapUser());
        expect(type).toStrictEqual('bootstrap/user/rejected');
        expect(payload).toStrictEqual({
          reason: 'CHECK_LOGIN_STATUS_REJECTED',
        });

        matchDispatchedActions(dispatchedActions, [
          bootstrapUser.pending,
          checkLoginStatus.pending,
          checkLoginStatus.rejected,
          bootstrapUser.rejected,
        ]);
      });

      it('getAccessToken', async () => {
        fetchMock.mockRejectedValueOnce('foobar');

        const { type, payload } = await store.dispatch(bootstrapUser());
        expect(type).toStrictEqual('bootstrap/user/rejected');
        expect(payload).toStrictEqual({ reason: 'GET_ACCESS_TOKEN_REJECTED' });

        matchDispatchedActions(dispatchedActions, [
          bootstrapUser.pending,
          checkLoginStatus.pending,
          checkLoginStatus.fulfilled,
          getAccessToken.pending,
          getAccessToken.rejected,
          bootstrapUser.rejected,
        ]);
      });

      it('register', async () => {
        voiceSdk.voiceRegister.mockRejectedValueOnce('foobar');

        const { type, payload } = await store.dispatch(bootstrapUser());
        expect(type).toStrictEqual('bootstrap/user/rejected');
        expect(payload).toStrictEqual({ reason: 'REGISTER_REJECTED' });

        matchDispatchedActions(dispatchedActions, [
          bootstrapUser.pending,
          checkLoginStatus.pending,
          checkLoginStatus.fulfilled,
          getAccessToken.pending,
          getAccessToken.fulfilled,
          register.pending,
          register.rejected,
          bootstrapUser.rejected,
        ]);
      });
    });
  });

  describe('bootstrapCallInvites', () => {
    it('handles rejection of native module', async () => {
      voiceSdk.voiceGetCallInvites.mockRejectedValueOnce('foobar');

      const { type, payload } = await store.dispatch(bootstrapCallInvites());
      expect(type).toStrictEqual('bootstrap/callInvites/rejected');
      expect(payload).toStrictEqual({
        reason: 'NATIVE_MODULE_REJECTED',
        error: { message: 'foobar' },
      });

      matchDispatchedActions(dispatchedActions, [
        bootstrapCallInvites.pending,
        bootstrapCallInvites.rejected,
      ]);
    });

    it('succeeds', async () => {
      const { type, payload } = await store.dispatch(bootstrapCallInvites());
      expect(type).toStrictEqual('bootstrap/callInvites/fulfilled');
      expect(payload).toStrictEqual(undefined);

      const { entities, ids } = store.getState().voice.call.callInvite;
      expect(ids).toHaveLength(2);
      expect(entities).toStrictEqual({
        [ids[0]]: {
          id: ids[0],
          info: {
            callSid: 'mock call sid 1',
            customParameters: 'mock custom parameters 1',
            from: 'mock from 1',
            state: 'mock state 1',
            to: 'mock to 1',
          },
          status: 'idle',
        },
        [ids[1]]: {
          id: ids[1],
          info: {
            callSid: 'mock call sid 2',
            customParameters: 'mock custom parameters 2',
            from: 'mock from 2',
            state: 'mock state 2',
            to: 'mock to 2',
          },
          status: 'idle',
        },
      });

      matchDispatchedActions(dispatchedActions, [
        bootstrapCallInvites.pending,
        receiveCallInvite.pending,
        setCallInvite,
        receiveCallInvite.pending,
        setCallInvite,
        receiveCallInvite.fulfilled,
        receiveCallInvite.fulfilled,
        bootstrapCallInvites.fulfilled,
      ]);
    });
  });

  describe('bootstrapCalls', () => {
    // TODO(mhuynh): [VBLOCKS-2078] Increase coverage.

    beforeEach(() => {
      voiceSdk.voiceGetCalls.mockImplementationOnce(() => {
        return Promise.resolve(new Map([['1', voiceSdk.createMockCall('1')]]));
      });
      asyncStorage.keyValueStore.clear();
      const mockAsyncStorage = [
        [
          'mock sid 1',
          JSON.stringify({ to: 'foo to', recipientType: 'client' }),
        ],
        [
          'mock sid 2',
          JSON.stringify({ to: 'bar to', recipientType: 'client' }),
        ],
        [
          'mock sid 3',
          JSON.stringify({ to: 'biff to', recipientType: 'number' }),
        ],
      ];
      for (const [k, v] of mockAsyncStorage) {
        asyncStorage.keyValueStore.set(k, v);
      }
    });

    it('should read from async storage for an outgoing call', async () => {
      const { type, payload } = await store.dispatch(bootstrapCalls());
      expect(type).toMatch(/fulfilled/);
      expect(payload).toBeUndefined();

      expect(asyncStorage.getAllKeys.mock.calls).toStrictEqual([[]]);
      expect(asyncStorage.getItem.mock.calls).toStrictEqual([['mock sid 1']]);

      const { ids, entities } = store.getState().voice.call.activeCall;
      const callEntity = entities[ids[0]];

      if (callEntity?.status !== 'fulfilled') {
        throw new Error('call entity not fulfilled');
      }
      if (callEntity?.direction !== 'outgoing') {
        throw new Error('call direction should be outgoing');
      }
      expect(callEntity?.params).toStrictEqual({
        to: 'foo to',
        recipientType: 'client',
      });
    });

    it('should clear values out of async storage if not active', async () => {
      const { type, payload } = await store.dispatch(bootstrapCalls());
      expect(type).toMatch(/fulfilled/);
      expect(payload).toBeUndefined();

      expect(asyncStorage.multiRemove.mock.calls).toStrictEqual([
        [['mock sid 2', 'mock sid 3']],
      ]);
      expect(Array.from(asyncStorage.keyValueStore.entries())).toStrictEqual([
        [
          'mock sid 1',
          JSON.stringify({
            to: 'foo to',
            recipientType: 'client',
          }),
        ],
      ]);
    });
  });

  describe('bootstrapNavigation', () => {
    // TODO(mhuynh): increase coverage. See JIRA VBLOCKS-2078.

    it('listens for call invite notification tapped events', async () => {
      const onSpy = jest.spyOn(voiceUtil.voice, 'on');
      jest
        .spyOn(navigationUtil, 'getNavigate')
        .mockResolvedValueOnce(jest.fn());

      const { type, payload } = await store.dispatch(bootstrapNavigation());

      expect(type).toMatch(/fulfilled/);
      expect(payload).toBeUndefined();

      expect(onSpy.mock.calls).toHaveLength(1);
      const [[event]] = onSpy.mock.calls;
      expect(event).toStrictEqual('callInviteNotificationTapped');
    });

    it('navigates to the call invite screen', async () => {
      const navigateSpy = jest.fn();
      jest
        .spyOn(navigationUtil, 'getNavigate')
        .mockResolvedValueOnce(navigateSpy);

      const { type, payload } = await store.dispatch(bootstrapNavigation());

      expect(type).toMatch(/fulfilled/);
      expect(payload).toBeUndefined();

      voiceUtil.voice.emit('callInviteNotificationTapped' as any);

      expect(navigateSpy.mock.calls).toStrictEqual([['Incoming Call']]);
    });
  });
});
