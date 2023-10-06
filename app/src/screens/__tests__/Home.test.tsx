import { NavigationContainer } from '@react-navigation/native';
import '@testing-library/jest-native/extend-expect';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import Home from '../Home';
import { createStore } from '../../store/app';
import { login } from '../../store/user';

jest.unmock('@react-navigation/native');

describe('<Home />', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    const store = createStore();
    await store.dispatch(login());

    render(
      <Provider store={store}>
        <NavigationContainer>
          <Home />
        </NavigationContainer>
      </Provider>,
    );
  });

  it('should show the logout button', () => {
    expect(screen.getByText('Log out')).toBeOnTheScreen();
  });

  it('should display the user', () => {
    expect(screen.getByText('test email')).toBeOnTheScreen();
  });
});
