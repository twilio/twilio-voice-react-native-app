import '@testing-library/jest-native/extend-expect';
import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';
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

  it('should display the dialpad buttons', () => {
    render(<Dialer />, { wrapper });
    expect(screen.getByText('1')).toBeOnTheScreen();
    expect(screen.getByText('2')).toBeOnTheScreen();
    expect(screen.getByText('3')).toBeOnTheScreen();
    expect(screen.getByText('4')).toBeOnTheScreen();
    expect(screen.getByText('5')).toBeOnTheScreen();
    expect(screen.getByText('6')).toBeOnTheScreen();
    expect(screen.getByText('7')).toBeOnTheScreen();
    expect(screen.getByText('8')).toBeOnTheScreen();
    expect(screen.getByText('9')).toBeOnTheScreen();
    expect(screen.getByText('*')).toBeOnTheScreen();
    expect(screen.getByText('0')).toBeOnTheScreen();
    expect(screen.getByText('#')).toBeOnTheScreen();
  });

  it('should allow user to enter a phone number', () => {
    render(<Dialer />, { wrapper });
    fireEvent.press(screen.getByText('4'));
    fireEvent.press(screen.getByText('1'));
    fireEvent.press(screen.getByText('5'));
    fireEvent.press(screen.getByText('7'));
    fireEvent.press(screen.getByText('2'));
    fireEvent.press(screen.getByText('4'));
    fireEvent.press(screen.getByText('5'));
    fireEvent.press(screen.getByText('6'));
    fireEvent.press(screen.getByText('3'));
    fireEvent.press(screen.getByText('8'));
    expect(screen.getByText('+4157245638')).toBeOnTheScreen();
  });

  it('should allow user to use the backspace button', () => {
    render(<Dialer />, { wrapper });
    fireEvent.press(screen.getByText('4'));
    fireEvent.press(screen.getByText('1'));
    fireEvent.press(screen.getByText('5'));
    expect(screen.getByText('+415')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('back_space_button'));
    expect(screen.getByText('+41')).toBeOnTheScreen();
  });

  it('should allow user to switch to client input', () => {
    render(<Dialer />, { wrapper });
    fireEvent.press(screen.getByText('Client'));
    expect(screen.getByText('Number')).toBeOnTheScreen();
  });
});
