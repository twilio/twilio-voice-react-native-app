import { type Middleware } from '@reduxjs/toolkit';
import { match } from 'ts-pattern';
import { createStore, type Store } from '../../../app';
import {
  acceptCallInvite,
  receiveCallInvite,
  removeCallInvite,
  rejectCallInvite,
  setCallInvite,
} from '../../../voice/call/callInvite';
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

    voiceUtil.callInviteMap.clear();

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

  describe('callInvite', () => {
    describe('action', () => {
      describe('receiveCallInvite', () => {
        it('resolves', async () => {
          await store
            .dispatch(
              receiveCallInvite(mockVoiceSdk.createMockCallInvite('0') as any),
            )
            .unwrap();

          const { entities, ids } = store.getState().voice.call.callInvite;
          expect(entities[ids[0]]).toStrictEqual({
            id: ids[0],
            info: {
              callSid: 'mock call sid 0',
              customParameters: 'mock custom parameters 0',
              from: 'mock from 0',
              state: 'mock state 0',
              to: 'mock to 0',
            },
            status: 'idle',
          });
        });
      });

      describe('acceptCallInvite', () => {
        let id: string;
        let mockCallInvite: ReturnType<
          typeof mockVoiceSdk.createMockCallInvite
        >;

        beforeEach(async () => {
          mockCallInvite = mockVoiceSdk.createMockCallInvite('0');
          id = await store
            .dispatch(receiveCallInvite(mockCallInvite as any))
            .unwrap();
          dispatchedActions.splice(0);
        });

        it('rejects when the id is not in the map', async () => {
          const acceptResult = await store.dispatch(
            acceptCallInvite({ id: 'mock id' }),
          );

          match(acceptResult)
            .with({ payload: { reason: 'ID_NOT_FOUND_MAP' } }, () => {})
            .run();
        });

        it('rejects when the id is not in the state', async () => {
          voiceUtil.callInviteMap.set('mock id', {} as any);

          const acceptResult = await store.dispatch(
            acceptCallInvite({ id: 'mock id' }),
          );

          match(acceptResult)
            .with({ payload: { reason: 'ID_NOT_FOUND_STATE' } }, () => {})
            .run();
        });

        it('rejects when the call invite is not idle', async () => {
          const defer = deferNative(mockCallInvite, 'accept');

          store.dispatch(acceptCallInvite({ id }));

          const acceptPromise = store.dispatch(acceptCallInvite({ id }));

          defer.resolve();

          const acceptResult = await acceptPromise;

          match(acceptResult)
            .with({ payload: { reason: 'STATUS_NOT_IDLE' } }, () => {})
            .run();
        });

        it('rejects when the native module rejects', async () => {
          const defer = deferNative(mockCallInvite, 'accept');

          const acceptPromise = store.dispatch(acceptCallInvite({ id }));

          defer.reject(new Error('native module rejection error'));

          const acceptResult = await acceptPromise;
          match(acceptResult)
            .with(
              {
                payload: {
                  reason: 'NATIVE_MODULE_REJECTED',
                  error: { message: 'native module rejection error' },
                },
              },
              () => {},
            )
            .run();
        });

        it('resolves', async () => {
          const acceptResult = await store
            .dispatch(acceptCallInvite({ id }))
            .unwrap();

          expect(acceptResult).toStrictEqual({
            from: 'mock from 0',
            initialConnectedTimestamp: 42,
            isMuted: false,
            isOnHold: false,
            sid: 'mock sid 0',
            state: 'mock state 0',
            to: 'mock to 0',
          });

          expect(
            store.getState().voice.call.callInvite.entities[id],
          ).toBeUndefined();

          matchDispatchedActions(dispatchedActions, [
            acceptCallInvite.pending,
            setCallInvite,
            removeCallInvite,
            acceptCallInvite.fulfilled,
          ]);
        });
      });

      describe('rejectCallInvite', () => {
        let id: string;
        let mockCallInvite: ReturnType<
          typeof mockVoiceSdk.createMockCallInvite
        >;

        beforeEach(async () => {
          mockCallInvite = mockVoiceSdk.createMockCallInvite('0');
          id = await store
            .dispatch(receiveCallInvite(mockCallInvite as any))
            .unwrap();
          dispatchedActions.splice(0);
        });

        it('rejects when the id is not in the map', async () => {
          const rejectResult = await store.dispatch(
            rejectCallInvite({ id: 'mock id' }),
          );

          match(rejectResult)
            .with({ payload: { reason: 'ID_NOT_FOUND_MAP' } }, () => {})
            .run();
        });

        it('rejects when the id is not in the state', async () => {
          voiceUtil.callInviteMap.set('mock id', {} as any);

          const rejectResult = await store.dispatch(
            rejectCallInvite({ id: 'mock id' }),
          );

          match(rejectResult)
            .with({ payload: { reason: 'ID_NOT_FOUND_STATE' } }, () => {})
            .run();
        });

        it('rejects when the call invite is not idle', async () => {
          const defer = deferNative(mockCallInvite, 'reject');

          store.dispatch(rejectCallInvite({ id }));

          const rejectPromise = store.dispatch(rejectCallInvite({ id }));

          defer.resolve();

          const rejectResult = await rejectPromise;

          match(rejectResult)
            .with({ payload: { reason: 'STATUS_NOT_IDLE' } }, () => {})
            .run();
        });

        it('rejects when the native module rejects', async () => {
          const defer = deferNative(mockCallInvite, 'reject');

          const rejectPromise = store.dispatch(rejectCallInvite({ id }));

          defer.reject(new Error('native module rejection error'));

          const rejectResult = await rejectPromise;
          match(rejectResult)
            .with(
              {
                payload: {
                  reason: 'NATIVE_MODULE_REJECTED',
                  error: { message: 'native module rejection error' },
                },
              },
              () => {},
            )
            .run();
        });

        it('resolves', async () => {
          const rejectResult = await store
            .dispatch(rejectCallInvite({ id }))
            .unwrap();

          expect(rejectResult).toBeUndefined();

          expect(
            store.getState().voice.call.callInvite.entities[id],
          ).toBeUndefined();

          matchDispatchedActions(dispatchedActions, [
            rejectCallInvite.pending,
            setCallInvite,
            removeCallInvite,
            rejectCallInvite.fulfilled,
          ]);
        });
      });
    });
  });
});
