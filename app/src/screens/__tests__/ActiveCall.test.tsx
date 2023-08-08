import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import '@testing-library/jest-native/extend-expect';
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import ActiveCall from '../ActiveCall';
import { type StackParamList } from '../types';
import { type State } from '../../store/app';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('<ActiveCall />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderActiveCallScreen = () => {
    const mockStore = configureStore();

    const initialState: State = {
      voice: {
        accessToken: {
          status: 'idle',
        },
        audioDevices: {
          status: 'fulfilled',
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
          callInvite: { entities: {}, ids: [] },
        },
        registration: {
          status: 'idle',
        },
      },
      user: {
        status: 'idle',
        action: 'login',
      },
      loginAndRegister: {
        status: 'idle',
      },
    };

    const store = mockStore(initialState);
    const dispatch = jest
      .spyOn(store, 'dispatch')
      .mockImplementation((() => {}) as any);

    const Stack = createNativeStackNavigator<StackParamList>();

    const screen = render(
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Call" component={ActiveCall} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>,
    );

    return { screen, dispatch };
  };

  it('shows the active call screen', () => {
    const { screen } = renderActiveCallScreen();

    expect(screen.getByTestId('active_call')).toBeVisible();
    expect(screen.getByTestId('call_status')).toBeVisible();

    expect(screen.getByTestId('mute_button')).toBeVisible();
    expect(screen.getByTestId('show_dialpad_button')).toBeVisible();
    expect(screen.getByTestId('speaker_button')).toBeVisible();

    expect(screen.getByTestId('end_call_button')).toBeVisible();
  });

  describe('dialpad', () => {
    it('shows the dialpad', async () => {
      const { screen } = renderActiveCallScreen();

      const showDialpadButton = screen.getByTestId('show_dialpad_button');
      expect(showDialpadButton).toBeVisible();

      fireEvent.press(showDialpadButton);

      for (let i = 0; i < 10; i++) {
        const label = String(i);
        const button = screen.getByText(label);
        expect(button).toBeVisible();
      }

      const hideDialpadButton = screen.getByTestId('hide_dialpad_button');
      expect(hideDialpadButton).toBeVisible();
    });

    it('presses each dialpad button', async () => {
      // TODO(mhuynh): increase test coverage.
    });

    it('hides the dialpad', async () => {
      // TODO(mhuynh): increase test coverage.
    });
  });

  describe('audio device buttons', () => {
    it('should select the speaker', () => {
      const { screen } = renderActiveCallScreen();

      const speakerButton = screen.getByTestId('speaker_button');
      expect(speakerButton).toBeVisible();

      fireEvent.press(speakerButton);

      // TODO(mhuynh): hook up an actual store similarly to the store tests
    });
  });
});
