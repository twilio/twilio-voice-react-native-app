import '@testing-library/jest-native/extend-expect';
import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { NavigationContainer } from '@react-navigation/native';
import Dialer from '..';

describe('<Dialer />', () => {
  let wrapper: React.ComponentType<any>;

  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

  beforeEach(() => {
    jest.clearAllMocks();
    const mockStore = configureStore();
    const initialState = {
      voice: { call: { activeCall: { entities: {}, ids: [] } } },
    };
    const store = mockStore(initialState);
    wrapper = ({ children }) => (
      <Provider store={store}>
        <NavigationContainer>{children}</NavigationContainer>
      </Provider>
    );
  });

  describe('call a phone number', () => {
    beforeEach(() => {
      render(<Dialer />, { wrapper });
    });

    describe('UI layout', () => {
      it('should display the enabled dialpad buttons', () => {
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].forEach(
          (digit) => {
            const digitButton = screen.getByTestId(`dialpad_button_${digit}`);
            expect(digitButton).toBeOnTheScreen();
            expect(digitButton.props.accessibilityState.disabled).toBe(false);
          },
        );
      });

      it('should display a disabled call button', () => {
        const callButton = screen.getByTestId('call_button');
        expect(callButton).toBeOnTheScreen();
        expect(callButton.props.accessibilityState.disabled).toBe(true);
      });

      it('should display an enabled client button', () => {
        const clientButton = screen.getByTestId('client_button');
        expect(clientButton).toBeOnTheScreen();
        expect(clientButton.props.accessibilityState.disabled).toBe(false);
        expect(clientButton.findByType(Text).props.children).toBe('Client');
      });

      it('should hide the backspace button', () => {
        expect(screen.queryByTestId('back_space_button')).not.toBeOnTheScreen();
      });
    });

    describe('press the first dialpad button', () => {
      beforeEach(() => {
        fireEvent.press(screen.getByText('4'));
      });

      it('should display "+" followed by the digit of the dialpad button', () => {
        const display = screen.getByTestId('formatted_number');
        expect(display.props.children).toBe('+4');
      });

      it('should enable the call button', () => {
        const callButton = screen.getByTestId('call_button');
        expect(callButton.props.accessibilityState.disabled).toBe(false);
      });

      it('should show the backspace button', () => {
        expect(screen.getByTestId('back_space_button')).toBeOnTheScreen();
      });

      describe('press the backspace button', () => {
        beforeEach(() => {
          fireEvent.press(screen.getByTestId('back_space_button'));
        });

        it('should clear the display', () => {
          const display = screen.getByTestId('formatted_number');
          expect(display.props.children).toBe('');
        });

        it('should hide the backspace button', () => {
          expect(
            screen.queryByTestId('back_space_button'),
          ).not.toBeOnTheScreen();
        });

        it('should disable the call button', () => {
          const callButton = screen.getByTestId('call_button');
          expect(callButton.props.accessibilityState.disabled).toBe(true);
        });
      });
    });

    describe('press more dialpad buttons', () => {
      beforeEach(() => {
        ['4', '1', '5', '6', '5', '0', '2', '8', '9', '0'].forEach((digit) => {
          fireEvent.press(screen.getByText(digit));
        });
      });

      it('should append the pressed dialpad digits to the display', () => {
        expect(screen.getByTestId('formatted_number').props.children).toBe(
          '+4156502890',
        );
      });

      describe('press the backspace button', () => {
        it('should remove the most recent digit added to the display', () => {
          fireEvent.press(screen.getByTestId('back_space_button'));
          expect(screen.getByTestId('formatted_number').props.children).toBe(
            '+415650289',
          );
        });
      });
    });

    describe('press the call button', () => {
      beforeEach(() => {
        ['4', '1', '5', '6', '5', '0', '2', '8', '9', '0'].forEach((digit) => {
          fireEvent.press(screen.getByText(digit));
        });
        fireEvent.press(screen.getByTestId('call_button'));
      });

      it('should dispatch the "makeOutgoingCall" action', () => {
        // TODO(mmalavalli)
      });

      it('should transition to the "ActiveCallScreen" component', () => {
        // TODO(mmalavalli)
      });
    });
  });

  describe('call a client identifier', () => {
    beforeEach(() => {
      render(<Dialer />, { wrapper });
      fireEvent.press(screen.getByTestId('client_button'));
    });

    describe('UI layout', () => {
      it('should display the disabled dialpad buttons', () => {
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].forEach(
          (digit) => {
            const digitButton = screen.getByTestId(`dialpad_button_${digit}`);
            expect(digitButton).toBeOnTheScreen();
            expect(digitButton.props.accessibilityState.disabled).toBe(true);
          },
        );
      });

      it('should display a disabled call button', () => {
        const callButton = screen.getByTestId('call_button');
        expect(callButton).toBeOnTheScreen();
        expect(callButton.props.accessibilityState.disabled).toBe(true);
      });

      it('should display an enabled number button', () => {
        const clientButton = screen.getByTestId('client_button');
        expect(clientButton).toBeOnTheScreen();
        expect(clientButton.props.accessibilityState.disabled).toBe(false);
        expect(clientButton.findByType(Text).props.children).toBe('Number');
      });

      it('should hide the backspace button', () => {
        expect(screen.queryByTestId('back_space_button')).not.toBeOnTheScreen();
      });
    });

    describe('enter client identifier input', () => {
      beforeEach(() => {
        fireEvent.changeText(screen.getByTestId('client_text_input'), 'foo');
      });

      it('should enable the call button', () => {
        expect(
          screen.getByTestId('call_button').props.accessibilityState.disabled,
        ).toBe(false);
      });

      describe('clear client identifier input', () => {
        beforeEach(() => {
          fireEvent.changeText(screen.getByTestId('client_text_input'), '');
        });

        it('should disable the call button', () => {
          expect(
            screen.getByTestId('call_button').props.accessibilityState.disabled,
          ).toBe(true);
        });
      });
    });

    describe('press the call button', () => {
      beforeEach(() => {
        fireEvent.changeText(screen.getByTestId('client_text_input'), 'foo');
        fireEvent.press(screen.getByTestId('call_button'));
      });

      it('should dispatch the "makeOutgoingCall" action', () => {
        // TODO(mmalavalli)
      });

      it('should transition to the "ActiveCallScreen" component', () => {
        // TODO(mmalavalli)
      });
    });
  });
});
