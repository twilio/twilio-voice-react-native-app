import { Middleware } from '@reduxjs/toolkit';
import { createStore, Store } from '../app';
import * as authStoreModule from '../../util/auth';
import * as accessTokenStoreModule from '../voice/accessToken';
import * as registrationStoreModule from '../voice/registration';
import * as auth0 from '../../../__mocks__/react-native-auth0';
import * as voiceSdk from '../../../__mocks__/@twilio/voice-react-native-sdk';
import * as fetchUtil from '../../util/fetch';

let fetchMock: jest.Mock;

jest.mock('../../../src/util/fetch', () => ({
  fetch: (fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    text: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('registration', () => {
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

  describe('loginAndRegister', () => {
    it('resolves when all sub-actions resolve', async () => {
      const loginAndRegisterResult = await store.dispatch(
        registrationStoreModule.loginAndRegister(),
      );
      expect(loginAndRegisterResult.type).toEqual(
        'registration/loginAndRegister/fulfilled',
      );
      expect(loginAndRegisterResult.payload).toEqual(undefined);

      matchDispatchedActions(dispatchedActions, [
        registrationStoreModule.loginAndRegister.pending,
        authStoreModule.login.pending,
        authStoreModule.login.fulfilled,
        accessTokenStoreModule.getAccessToken.pending,
        accessTokenStoreModule.getAccessToken.fulfilled,
        registrationStoreModule.register.pending,
        registrationStoreModule.register.fulfilled,
        registrationStoreModule.loginAndRegister.fulfilled,
      ]);
    });

    describe('handles rejection', () => {
      it('login', async () => {
        jest.spyOn(auth0, 'authorize').mockRejectedValueOnce(undefined);

        const loginAndRegisterResult = await store.dispatch(
          registrationStoreModule.loginAndRegister(),
        );
        expect(loginAndRegisterResult.type).toEqual(
          'registration/loginAndRegister/rejected',
        );
        expect(loginAndRegisterResult.payload).toEqual({
          reason: 'LOGIN_REJECTED',
        });

        matchDispatchedActions(dispatchedActions, [
          registrationStoreModule.loginAndRegister.pending,
          authStoreModule.login.pending,
          authStoreModule.login.rejected,
          registrationStoreModule.loginAndRegister.rejected,
        ]);
      });

      it('getAccessToken', async () => {
        fetchMock.mockRejectedValueOnce(undefined);

        const loginAndRegisterResult = await store.dispatch(
          registrationStoreModule.loginAndRegister(),
        );
        expect(loginAndRegisterResult.type).toEqual(
          'registration/loginAndRegister/rejected',
        );
        expect(loginAndRegisterResult.payload).toEqual({
          reason: 'GET_ACCESS_TOKEN_REJECTED',
        });

        matchDispatchedActions(dispatchedActions, [
          registrationStoreModule.loginAndRegister.pending,
          authStoreModule.login.pending,
          authStoreModule.login.fulfilled,
          accessTokenStoreModule.getAccessToken.pending,
          accessTokenStoreModule.getAccessToken.rejected,
          registrationStoreModule.loginAndRegister.rejected,
        ]);
      });

      it('register', async () => {
        jest.spyOn(voiceSdk, 'register').mockRejectedValueOnce(undefined);

        const loginAndRegisterResult = await store.dispatch(
          registrationStoreModule.loginAndRegister(),
        );
        expect(loginAndRegisterResult.type).toEqual(
          'registration/loginAndRegister/rejected',
        );
        expect(loginAndRegisterResult.payload).toEqual({
          reason: 'REGISTER_REJECTED',
        });

        matchDispatchedActions(dispatchedActions, [
          registrationStoreModule.loginAndRegister.pending,
          authStoreModule.login.pending,
          authStoreModule.login.fulfilled,
          accessTokenStoreModule.getAccessToken.pending,
          accessTokenStoreModule.getAccessToken.fulfilled,
          registrationStoreModule.register.pending,
          registrationStoreModule.register.rejected,
          registrationStoreModule.loginAndRegister.rejected,
        ]);
      });

      it('handles "ACCESS_TOKEN_NOT_FULFILLED"', async () => {
        const register = await store.dispatch(
          registrationStoreModule.register(),
        );
        expect(register.payload).toEqual({
          reason: 'ACCESS_TOKEN_NOT_FULFILLED',
        });
      });

      it('handles "NO_ACCESS_TOKEN"', async () => {
        jest.spyOn(fetchUtil, 'fetch').mockImplementation(
          jest.fn().mockResolvedValue({
            ok: true,
            text: jest.fn().mockResolvedValue(''),
          }),
        );
        await store.dispatch(registrationStoreModule.loginAndRegister());
        const register = await store.dispatch(
          registrationStoreModule.register(),
        );
        expect(register.payload).toEqual({
          reason: 'NO_ACCESS_TOKEN',
        });
      });
    });
  });
});
