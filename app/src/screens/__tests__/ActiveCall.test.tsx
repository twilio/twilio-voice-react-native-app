import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import '@testing-library/jest-native/extend-expect';
import { fireEvent, render, RenderResult } from '@testing-library/react-native';
import React from 'react';
import configureStore, { MockStore } from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import ActiveCall from '../ActiveCall';
import { type StackParamList } from '../types';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('../../util/voice', () => ({
  ...jest.requireActual('../../util/voice'),
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

describe('<ActiveCall />', () => {
  let screen: RenderResult;
  let store: MockStore;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore([thunkMiddleware])({
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
                info: { state: 'connected' },
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

  describe('UI layout', () => {
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

    const buttonInfos: [string, string, boolean][] = [
      ['bluetooth', 'bluetooth_button', true],
      ['dialpad', 'show_dialpad_button', false],
      ['mute', 'mute_button', false],
      ['speaker', 'speaker_button', true],
      ['end call', 'end_call_button', false],
    ];

    buttonInfos.forEach(([name, testId, disabled]) => {
      it(`should show an ${
        disabled ? 'disabled' : 'enabled'
      } ${name} button`, () => {
        const button = screen.getByTestId(testId);
        expect(button).toBeOnTheScreen();
        expect(button.props.accessibilityState.disabled).toBe(disabled);
      });
    });
  });

  describe('press mute button', () => {
    beforeEach(() => {
      fireEvent.press(screen.getByTestId('mute_button'));
    });

    it('should dispatch the "muteActiveCall" action', async () => {
      const action = store
        .getActions()
        .find(({ type }) => type === 'activeCall/mute/pending');
      expect(action).not.toBeNull();
      expect(action.meta.arg).toStrictEqual({
        id: '1111',
        shouldMute: true,
      });
    });
  });
});
