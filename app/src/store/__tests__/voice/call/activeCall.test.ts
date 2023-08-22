import { type Middleware } from '@reduxjs/toolkit';
import { match, P } from 'ts-pattern';
import { createStore, type Store } from '../../../app';
import * as activeCall from '../../../voice/call/activeCall';
import { makeOutgoingCall } from '../../../voice/call/outgoingCall';
import { getAccessToken } from '../../../voice/accessToken';
import { login } from '../../../user';
import * as mockVoiceSdk from '../../../../../__mocks__/@twilio/voice-react-native-sdk';
import * as asyncStorage from '../../../../../__mocks__/@react-native-async-storage/async-storage';

jest.mock('../../../../util/fetch', () => ({
  fetch: jest.fn().mockResolvedValue({
    ok: true,
    text: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('store', () => {
  let id: string;
  let call: ReturnType<typeof mockVoiceSdk.createMockCall>;
  let store: Store;
  const dispatchedActions: any[] = [];

  beforeEach(async () => {
    jest.clearAllMocks();

    const logAction: Middleware = () => (next) => (action) => {
      dispatchedActions.push(action);
      next(action);
    };

    store = createStore(logAction);

    if (login.rejected.match(await store.dispatch(login()))) {
      throw Error('set up failed; login');
    }

    if (getAccessToken.rejected.match(await store.dispatch(getAccessToken()))) {
      throw Error('set up failed; getAccessToken');
    }

    const callResult = await store.dispatch(
      makeOutgoingCall({ recipientType: 'client', to: 'foobar' }),
    );
    if (makeOutgoingCall.rejected.match(callResult)) {
      throw Error('set up failed');
    }
    id = callResult.meta.requestId;
    expect(mockVoiceSdk.createMockCall.mock.calls).toHaveLength(1);
    call = mockVoiceSdk.createMockCall.mock.results[0].value;

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
      resolve: () => void;
      reject: () => void;
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

  describe('activeCall', () => {
    describe('action', () => {
      describe('disconnect', () => {
        it('rejects when the id is not in the call map', async () => {
          const disconnectPromise = await store.dispatch(
            activeCall.disconnectActiveCall({ id: 'not a real id' }),
          );

          expect(
            activeCall.disconnectActiveCall.rejected.match(disconnectPromise),
          ).toBe(true);

          expect(store.getState().voice.call.activeCall.ids).not.toContain(
            'not a real id',
          );
        });

        it('sets the status to pending and then rejected', async () => {
          const defer = deferNative(call, 'disconnect');

          const disconnectPromise = store.dispatch(
            activeCall.disconnectActiveCall({ id }),
          );

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { disconnect: { status: 'pending' } } }, () => {})
            .run();

          defer.reject();
          await disconnectPromise;

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { disconnect: { status: 'rejected' } } }, () => {})
            .run();

          matchDispatchedActions(dispatchedActions, [
            activeCall.disconnectActiveCall.pending,
            activeCall.disconnectActiveCall.rejected,
          ]);
        });

        it('sets the status to pending and then fulfilled', async () => {
          const defer = deferNative(call, 'disconnect');

          const disconnectPromise = store.dispatch(
            activeCall.disconnectActiveCall({ id }),
          );

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { disconnect: { status: 'pending' } } }, () => {})
            .run();

          defer.resolve();
          await disconnectPromise;

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { disconnect: { status: 'fulfilled' } } }, () => {})
            .run();

          matchDispatchedActions(dispatchedActions, [
            activeCall.disconnectActiveCall.pending,
            activeCall.disconnectActiveCall.fulfilled,
          ]);
        });
      });

      describe('hold', () => {
        it('rejects when the id is not in the call map', async () => {
          const holdPromise = await store.dispatch(
            activeCall.holdActiveCall({
              id: 'not a real id',
              shouldHold: true,
            }),
          );

          expect(activeCall.holdActiveCall.rejected.match(holdPromise)).toBe(
            true,
          );

          expect(store.getState().voice.call.activeCall.ids).not.toContain(
            'not a real id',
          );
        });

        it('sets the status to pending and then rejected', async () => {
          const defer = deferNative(call, 'hold');

          const holdPromise = store.dispatch(
            activeCall.holdActiveCall({ id, shouldHold: true }),
          );

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { hold: { status: 'pending' } } }, () => {})
            .run();

          defer.reject();
          await holdPromise;

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { hold: { status: 'rejected' } } }, () => {})
            .run();

          matchDispatchedActions(dispatchedActions, [
            activeCall.holdActiveCall.pending,
            activeCall.holdActiveCall.rejected,
          ]);
        });

        it('sets the status to pending and then fulfilled', async () => {
          const defer = deferNative(call, 'hold');

          const holdPromise = store.dispatch(
            activeCall.holdActiveCall({ id, shouldHold: true }),
          );

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { hold: { status: 'pending' } } }, () => {})
            .run();

          defer.resolve();
          await holdPromise;

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { hold: { status: 'fulfilled' } } }, () => {})
            .run();

          matchDispatchedActions(dispatchedActions, [
            activeCall.holdActiveCall.pending,
            activeCall.setActiveCallInfo,
            activeCall.holdActiveCall.fulfilled,
          ]);
        });
      });

      describe('mute', () => {
        it('rejects when the id is not in the call map', async () => {
          const mutePromise = await store.dispatch(
            activeCall.muteActiveCall({
              id: 'not a real id',
              shouldMute: true,
            }),
          );

          expect(activeCall.muteActiveCall.rejected.match(mutePromise)).toBe(
            true,
          );

          expect(store.getState().voice.call.activeCall.ids).not.toContain(
            'not a real id',
          );
        });

        it('sets the status to pending and then rejected', async () => {
          const defer = deferNative(call, 'mute');

          const mutePromise = store.dispatch(
            activeCall.muteActiveCall({ id, shouldMute: true }),
          );

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { mute: { status: 'pending' } } }, () => {})
            .run();

          defer.reject();
          await mutePromise;

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { mute: { status: 'rejected' } } }, () => {})
            .run();

          matchDispatchedActions(dispatchedActions, [
            activeCall.muteActiveCall.pending,
            activeCall.muteActiveCall.rejected,
          ]);
        });

        it('sets the status to pending and then fulfilled', async () => {
          const defer = deferNative(call, 'mute');

          const mutePromise = store.dispatch(
            activeCall.muteActiveCall({ id, shouldMute: true }),
          );

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { mute: { status: 'pending' } } }, () => {})
            .run();

          defer.resolve();
          await mutePromise;

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { mute: { status: 'fulfilled' } } }, () => {})
            .run();

          matchDispatchedActions(dispatchedActions, [
            activeCall.muteActiveCall.pending,
            activeCall.setActiveCallInfo,
            activeCall.muteActiveCall.fulfilled,
          ]);
        });
      });

      describe('sendDtmf', () => {
        it('rejects when the id is not in the call map', async () => {
          const sendDtmfPromise = await store.dispatch(
            activeCall.sendDigitsActiveCall({
              id: 'not a real id',
              digits: '1234',
            }),
          );

          expect(
            activeCall.sendDigitsActiveCall.rejected.match(sendDtmfPromise),
          ).toBe(true);

          expect(store.getState().voice.call.activeCall.ids).not.toContain(
            'not a real id',
          );
        });

        it('sets the status to pending and then rejected', async () => {
          const defer = deferNative(call, 'sendDigits');

          const disconnectPromise = store.dispatch(
            activeCall.sendDigitsActiveCall({ id, digits: '1234' }),
          );

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { sendDigits: { status: 'pending' } } }, () => {})
            .run();

          defer.reject();
          await disconnectPromise;

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { sendDigits: { status: 'rejected' } } }, () => {})
            .run();

          matchDispatchedActions(dispatchedActions, [
            activeCall.sendDigitsActiveCall.pending,
            activeCall.sendDigitsActiveCall.rejected,
          ]);
        });

        it('sets the status to pending and then fulfilled', async () => {
          const defer = deferNative(call, 'sendDigits');

          const disconnectPromise = store.dispatch(
            activeCall.sendDigitsActiveCall({ id, digits: '1234' }),
          );

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { sendDigits: { status: 'pending' } } }, () => {})
            .run();

          defer.resolve();
          await disconnectPromise;

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ action: { sendDigits: { status: 'fulfilled' } } }, () => {})
            .run();

          matchDispatchedActions(dispatchedActions, [
            activeCall.sendDigitsActiveCall.pending,
            activeCall.sendDigitsActiveCall.fulfilled,
          ]);
        });
      });

      describe('setActiveCallInfo', () => {
        it('updates call info', () => {
          const info = {
            from: 'new mock from',
            isMuted: true,
            isOnHold: true,
            sid: 'new mock sid',
            state: 'new mock state',
            to: 'new mock to',
          };

          store.dispatch(
            activeCall.setActiveCallInfo({
              id,
              info,
            }),
          );

          match(store.getState().voice.call.activeCall.entities[id])
            .with({ info: P.select() }, (i) => expect(i).toEqual(info))
            .run();

          matchDispatchedActions(dispatchedActions, [
            activeCall.setActiveCallInfo,
          ]);
        });
      });

      describe('handleCall', () => {
        // TODO(mhuynh): [VBLOCKS-2078] Increase coverage.
        it('reads from the async storage', async () => {
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

          const res = await store.dispatch(
            activeCall.handleCall({
              call: mockVoiceSdk.createMockCall('3') as any,
            }),
          );

          if (activeCall.handleCall.rejected.match(res)) {
            throw new Error('handle call should have fulfilled');
          }
          expect(res.payload.customParameters).toStrictEqual({
            to: 'biff to',
            recipientType: 'number',
          });

          const { entities, ids } = store.getState().voice.call.activeCall;
          const callEntity = entities[ids[1]];

          if (callEntity?.status !== 'fulfilled') {
            throw new Error('call entity should be fulfilled');
          }
          if (callEntity?.direction !== 'outgoing') {
            throw new Error('call entity should be outgoing');
          }
          expect(callEntity.params).toStrictEqual({
            to: 'biff to',
            recipientType: 'number',
          });
        });

        it('handles when the async storage throws', async () => {
          const err = new Error('get item error');
          delete err.stack;
          asyncStorage.getItem.mockRejectedValueOnce(err);

          const res = await store.dispatch(
            activeCall.handleCall({
              call: mockVoiceSdk.createMockCall('3') as any,
            }),
          );

          if (activeCall.handleCall.fulfilled.match(res)) {
            throw new Error('handle call should have rejected');
          }
          expect(res.payload).toStrictEqual({
            reason: 'ASYNC_STORAGE_GET_ITEM_REJECTED',
            error: {
              name: err.name,
              message: err.message,
            },
          });
        });

        it('handles when the async storage holds invalid json', async () => {
          asyncStorage.getItem.mockResolvedValueOnce('foobar');

          const res = await store.dispatch(
            activeCall.handleCall({
              call: mockVoiceSdk.createMockCall('3') as any,
            }),
          );

          if (activeCall.handleCall.fulfilled.match(res)) {
            throw new Error('handle call should have rejected');
          }
          expect(res.payload?.reason).toStrictEqual('JSON_PARSE_THREW');
          expect(res.payload?.error.name).toStrictEqual('SyntaxError');
          expect(res.payload?.error.message).toStrictEqual(
            'Unexpected token o in JSON at position 1',
          );
        });

        it('handles when the async storage does not contain an entry', async () => {
          asyncStorage.keyValueStore.clear();

          const res = await store.dispatch(
            activeCall.handleCall({
              call: mockVoiceSdk.createMockCall('3') as any,
            }),
          );

          if (activeCall.handleCall.rejected.match(res)) {
            throw new Error('handle call should have fulfilled');
          }
          expect(res.payload.customParameters).toBeUndefined();

          const { entities, ids } = store.getState().voice.call.activeCall;
          const callEntity = entities[ids[1]];

          if (callEntity?.status !== 'fulfilled') {
            throw new Error('call entity should be fulfilled');
          }
          if (callEntity?.direction !== 'incoming') {
            throw new Error('call entity should be incoming');
          }
        });

        it('removes from the storage when the call is disconnected', async () => {
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

          const mockCall = mockVoiceSdk.createMockCall('3') as any;

          await store.dispatch(
            activeCall.handleCall({
              call: mockCall,
            }),
          );

          mockCall.emit('disconnected');

          expect(
            Array.from(asyncStorage.keyValueStore.entries()),
          ).toStrictEqual([
            [
              'mock sid 1',
              JSON.stringify({ to: 'foo to', recipientType: 'client' }),
            ],
            [
              'mock sid 2',
              JSON.stringify({ to: 'bar to', recipientType: 'client' }),
            ],
          ]);
        });
      });
    });
  });
});
