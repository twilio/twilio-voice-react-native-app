import { type Middleware } from '@reduxjs/toolkit';
import { createStore, Store } from '../app';
import { bootstrapUser, bootstrapCallInvites } from '../bootstrap';
import { checkLoginStatus } from '../user';
import { getAccessToken } from '../voice/accessToken';
import { receiveCallInvite, setCallInvite } from '../voice/call/callInvite';
import { register } from '../voice/registration';
import * as auth0 from '../../../__mocks__/react-native-auth0';
import * as voiceSdk from '../../../__mocks__/@twilio/voice-react-native-sdk';

let fetchMock: jest.Mock;

jest.mock('../../../src/util/fetch', () => ({
  fetch: (fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    text: jest.fn().mockResolvedValue('some mock token'),
  })),
}));

describe('bootstrap', () => {
  let store: Store;
  const dispatchedActions: any[] = [];

  beforeEach(() => {
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
});
