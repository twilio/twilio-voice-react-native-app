import '@testing-library/jest-native/extend-expect';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import SignIn from '..';
import { createStore } from '../../../store/app';

describe('<SignIn />', () => {
  let store: ReturnType<typeof createStore>;
  let wrapper: React.ComponentType<any>;

  beforeEach(() => {
    store = createStore();
    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  });

  it('should show the login button', () => {
    render(<SignIn />, { wrapper });
    expect(screen.getByText('Log in')).toBeOnTheScreen();
  });

  it('should show the Welcome Text', () => {
    render(<SignIn />, { wrapper });
    expect(
      screen.getByText(
        "Welcome to Twilio's Voice SDK Reference App. Log in to get started!",
      ),
    ).toBeOnTheScreen();
  });
});
