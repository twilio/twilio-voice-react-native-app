import { type Middleware } from '@reduxjs/toolkit';
import { match, P } from 'ts-pattern';
import { createStore, type Store } from '../../../app';
import { makeOutgoingCall } from '../../../voice/call/outgoingCall';
import { getAccessToken } from '../../../voice/accessToken';
import { login } from '../../../../util/auth';
import * as mockVoiceSdk from '../../../../../__mocks__/@twilio/voice-react-native-sdk';
import * as voiceUtil from '../../../../util/voice';

jest.mock('../../../../util/fetch', () => ({
  fetch: jest.fn().mockResolvedValue({
    ok: true,
    text: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('store', () => {
  let store: Store;
  const dispatchedActions: any[] = [];

  beforeEach(async () => {
    const logAction: Middleware = () => (next) => (action) => {
      dispatchedActions.push(action);
      next(action);
    };

    store = createStore(logAction);
    dispatchedActions.splice(0);
    jest.clearAllMocks();
  });

  const matchDispatchedActions = (actions: any[], actionCreators: any[]) => {
    expect(actionCreators.map((ac) => ac.type)).toStrictEqual(
      actions.map((a) => a.type),
    );
  };

  const deferNative = (native: any, fnName: any) => {
    const defer: {
      resolve: (...args: any[]) => void;
      reject: (...args: any[]) => void;
    } = {
      resolve: () => {
        throw new Error('invoked unset deferred resolve');
      },
      reject: () => {
        throw new Error('invoked unset deferred reject');
      },
    };
    jest.spyOn(native, fnName).mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          defer.resolve = resolve;
          defer.reject = reject;
        }),
    );
    return defer;
  };

  describe('outgoingCall', () => {
    describe('action', () => {
      describe('makeOutgoingCall', () => {
        it('rejects when there is no token', async () => {
          const callResult = await store.dispatch(
            makeOutgoingCall({ recipientType: 'client', to: 'foobar' }),
          );

          match(callResult)
            .with({ payload: { reason: 'TOKEN_UNFULFILLED' } }, () => {})
            .run();

          matchDispatchedActions(dispatchedActions, [
            makeOutgoingCall.pending,
            makeOutgoingCall.rejected,
          ]);
        });

        it('rejects when the native module throws', async () => {
          const defer = deferNative(voiceUtil.voice, 'connect');

          await store.dispatch(login());
          await store.dispatch(getAccessToken());
          dispatchedActions.splice(0);

          const callPromise = store.dispatch(
            makeOutgoingCall({ recipientType: 'client', to: 'foobar' }),
          );

          match(
            store.getState().voice.call.activeCall.entities[
              callPromise.requestId
            ],
          )
            .with({ status: 'pending' }, () => {})
            .run();

          defer.reject();

          const callResult = await callPromise;
          match(callResult)
            .with({ payload: { reason: 'NATIVE_MODULE_REJECTED' } }, () => {})
            .run();

          matchDispatchedActions(dispatchedActions, [
            makeOutgoingCall.pending,
            makeOutgoingCall.rejected,
          ]);
        });

        it('makes a call', async () => {
          const defer = deferNative(voiceUtil.voice, 'connect');

          await store.dispatch(login());
          await store.dispatch(getAccessToken());
          dispatchedActions.splice(0);

          const callPromise = store.dispatch(
            makeOutgoingCall({ recipientType: 'client', to: 'foobar' }),
          );

          match(
            store.getState().voice.call.activeCall.entities[
              callPromise.requestId
            ],
          )
            .with({ status: 'pending' }, () => {})
            .run();

          defer.resolve(mockVoiceSdk.createMockCall('foo'));

          const callResult = await callPromise;
          match(callResult)
            .with({ payload: P.select() }, (p) => {
              expect(p).toStrictEqual({
                from: 'mock from foo',
                isMuted: false,
                isOnHold: false,
                sid: 'mock sid foo',
                state: 'mock state foo',
                to: 'mock to foo',
              });
            })
            .run();

          matchDispatchedActions(dispatchedActions, [
            makeOutgoingCall.pending,
            makeOutgoingCall.fulfilled,
          ]);
        });
      });
    });
  });
});
