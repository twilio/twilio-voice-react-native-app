import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import '@testing-library/jest-native/extend-expect';
import { fireEvent, render, RenderResult } from '@testing-library/react-native';
import React from 'react';
import { Image } from 'react-native';
import configureStore, { MockStore } from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import ActiveCall from '../ActiveCall';
import { type StackParamList } from '../types';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('../../util/voice', () => ({
  ...jest.requireActual('../../util/voice'),
  callMap: new Map([
    [
      '1111',
      {
        getSid: jest.fn().mockReturnValue('1111'),
        getState: jest.fn().mockReturnValue('connected'),
        getFrom: jest.fn().mockReturnValue('foo-caller'),
        getTo: jest.fn().mockReturnValue('foobar-outgoing-client-to'),
        isOnHold: jest.fn().mockReturnValue(false),
        ...(() => {
          let muted = false;
          const mute = (shouldMute: boolean) =>
            Promise.resolve((muted = shouldMute));
          return {
            isMuted: () => muted,
            mute,
          };
        })(),
      },
    ],
  ]),
  voice: {
    getAudioDevices: jest.fn().mockResolvedValue({
      audioDevices: [
        { name: 'foo', type: 'earpiece' as any, uuid: '1111' },
        { name: 'foo', type: 'speaker' as any, uuid: '2222' },
        { name: 'foo', type: 'bluetooth' as any, uuid: '3333' },
      ],
      selectedDevice: {
        name: 'foo',
        type: 'earpiece' as any,
        uuid: '1111',
      },
    }),
  },
}));

const renderActiveCall = (store: MockStore): RenderResult => {
  const Stack = createNativeStackNavigator<StackParamList>();
  return render(
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Call" component={ActiveCall} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>,
  );
};

// Wait for an action of a particular type to be dispatched to the MockStore.
// TODO(mmalavalli): Explore using thunk middleware to wait for actions to dispatch.
// TODO(mmalavalli): Refactor to a util function for re-use in other tests.
const waitForActionType = (
  store: MockStore,
  actionType: string,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const timeoutMS = 2000;
    const pollIntervalMS = 100;

    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for action type: "${actionType}"`));
    }, timeoutMS);

    const poll = () => {
      const actions = store.getActions();
      const action = actions.find(({ type }) => type === actionType);
      if (action) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve(action);
      }
    };

    const interval = setInterval(poll, pollIntervalMS);
    poll();
  });
};

describe('<ActiveCall />', () => {
  let screen: RenderResult;
  let state: any;
  let store: MockStore;

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      voice: {
        audioDevices: {
          audioDevices: [
            { name: 'foo', type: 'earpiece' as any, uuid: '1111' },
            { name: 'foo', type: 'speaker' as any, uuid: '2222' },
            { name: 'foo', type: 'bluetooth' as any, uuid: '3333' },
          ],
        },
        call: {
          activeCall: {
            entities: {
              '1111': {
                action: {
                  disconnect: { status: 'idle' },
                  hold: { status: 'idle' },
                  mute: { status: 'idle' },
                  sendDigits: { status: 'idle' },
                },
                id: '1111',
                info: { isMuted: false, state: 'connected' },
                initialConnectTimestamp: undefined,
                recipientType: 'client',
                to: 'foobar-outgoing-client-to',
                direction: 'outgoing',
                status: 'fulfilled',
              },
            },
            ids: ['1111'],
          },
        },
      },
      loginAndRegister: {
        status: 'idle',
      },
    };

    store = configureStore([thunkMiddleware])((actions: any[]) => {
      const setActiveCallInfoAction = actions.find(
        ({ type }) => type === 'activeCall/setActiveCallInfo',
      );
      if (setActiveCallInfoAction) {
        state.voice.call.activeCall.entities['1111'] = {
          ...state.voice.call.activeCall.entities['1111'],
          info: { ...setActiveCallInfoAction.payload.info },
        };
      }
      return state;
    });

    const Stack = createNativeStackNavigator<StackParamList>();
    screen = render(
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Call" component={ActiveCall} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>,
    );
  });

  const activeCallLayoutTests = () => {
    it('should show the name of the recipient', () => {
      expect(screen.getByText('foobar-outgoing-client-to')).toBeOnTheScreen();
    });

    it('should show the status of the call', () => {
      const {
        voice: {
          call: {
            activeCall: { entities, ids },
          },
        },
      } = store.getState();
      expect(screen.getByText(entities[ids[0]].info.state)).toBeOnTheScreen();
    });

    [
      ['bluetooth', 'bluetooth_button', true],
      ['show dialpad', 'show_dialpad_button', false],
      ['mute', 'mute_button', false],
      ['speaker', 'speaker_button', true],
      ['end call', 'end_call_button', false],
    ].forEach(([name, testId, disabled]) => {
      it(`should show an ${
        disabled ? 'disabled' : 'enabled'
      } ${name} button`, () => {
        const button = screen.getByTestId(testId as string);
        expect(button).toBeOnTheScreen();
        expect(button.props.accessibilityState.disabled).toBe(disabled);
        if (name === 'mute') {
          expect(button.findByType(Image).props.accessibilityLabel).toBe(
            'mute_passive',
          );
        }
      });
    });

    it('should hide the hide dialpad button', () => {
      expect(screen.queryByTestId('hide_dialpad_button')).not.toBeOnTheScreen();
    });
  };

  describe('UI layout', activeCallLayoutTests);

  describe('press mute button', () => {
    beforeEach(async () => {
      fireEvent.press(screen.getByTestId('mute_button'));
      await waitForActionType(store, 'activeCall/setActiveCallInfo');
      screen = renderActiveCall(store);
    });

    it('should dispatch the "muteActiveCall" action with shouldMute = true', () => {
      const action = store
        .getActions()
        .find(({ type }) => type === 'activeCall/mute/pending');
      expect(action).not.toBeNull();
      expect(action.meta.arg).toStrictEqual({
        id: '1111',
        shouldMute: true,
      });
    });

    it('should activate the mute button', () => {
      expect(
        screen.getByTestId('mute_button').findByType(Image).props
          .accessibilityLabel,
      ).toBe('mute_active');
    });

    describe('press mute button again', () => {
      beforeEach(async () => {
        store.clearActions();
        fireEvent.press(screen.getByTestId('mute_button'));
        await waitForActionType(store, 'activeCall/setActiveCallInfo');
        screen = renderActiveCall(store);
      });

      it('should dispatch the "muteActiveCall" action with shouldMute = false', () => {
        const action = store
          .getActions()
          .find(({ type }) => type === 'activeCall/mute/pending');
        expect(action).not.toBeNull();
        expect(action.meta.arg).toStrictEqual({
          id: '1111',
          shouldMute: false,
        });
      });

      it('should de-activate the mute button', () => {
        expect(
          screen.getByTestId('mute_button').findByType(Image).props
            .accessibilityLabel,
        ).toBe('mute_passive');
      });
    });
  });

  describe('press show dialpad button', () => {
    beforeEach(() => {
      fireEvent.press(screen.getByTestId('show_dialpad_button'));
    });

    it('should display the enabled dialpad buttons', () => {
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].forEach(
        (digit) => {
          const digitButton = screen.getByTestId(`dialpad_button_${digit}`);
          expect(digitButton).toBeOnTheScreen();
          expect(digitButton.props.accessibilityState.disabled).toBe(false);
        },
      );
    });

    [
      ['hide dialpad', 'hide_dialpad_button'],
      ['end call', 'end_call_button'],
    ].forEach(([name, testId]) => {
      it(`should show the ${name} button`, () => {
        const button = screen.getByTestId(testId);
        expect(button).toBeOnTheScreen();
        expect(button.props.accessibilityState?.disabled).toBeFalsy();
      });
    });

    [
      ['bluetooth', 'bluetooth_button'],
      ['show dialpad', 'show_dialpad_button'],
      ['mute', 'mute_button'],
      ['speaker', 'speaker_button'],
    ].forEach(([name, testId]) => {
      it(`should hide the ${name} button`, () => {
        expect(screen.queryByTestId(testId)).not.toBeOnTheScreen();
      });
    });

    describe('press dialpad buttons', () => {
      beforeEach(() => {
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].forEach(
          (digit) => {
            fireEvent.press(screen.getByTestId(`dialpad_button_${digit}`));
          },
        );
      });

      it('should dispatch "sendDigitsActiveCall" actions for each digit', () => {
        const expectedActionArgs = [
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '*',
          '0',
          '#',
        ].map((digit) => ({
          id: '1111',
          digits: digit,
        }));
        const actionArgs = store
          .getActions()
          .filter(({ type }) => type === 'activeCall/sendDigits/pending')
          .map(({ meta: { arg } }) => arg);
        expect(actionArgs).toStrictEqual(expectedActionArgs);
      });
    });

    describe('press hide dialpad button', () => {
      beforeEach(() => {
        fireEvent.press(screen.getByTestId('hide_dialpad_button'));
      });

      describe('re-render active call screen', activeCallLayoutTests);
    });
  });

  describe('press end call button', () => {
    beforeEach(() => {
      fireEvent.press(screen.getByTestId('end_call_button'));
    });

    it('should dispatch "disconnectActiveCall" action', () => {
      const action = store
        .getActions()
        .find(({ type }) => type === 'activeCall/disconnect/pending');
      expect(action).not.toBeNull();
      expect(action.meta.arg).toStrictEqual({
        id: '1111',
      });
    });
  });
});
