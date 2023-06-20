import '@testing-library/jest-native/extend-expect';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Home from '..';
import { createStore } from '../../../store/app';

describe('<Home />', () => {
  let wrapper: React.ComponentType<any>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show the logout button', () => {
    const store = createStore();
    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
    render(<Home />, { wrapper });
    expect(screen.getByText('Log out')).toBeOnTheScreen();
  });

  it('should display the user', () => {
    const mockStore = configureStore();
    const initialState = {
      user: {
        status: 'fulfilled',
        email: 'vblocks@gmail.com',
      },
    };
    const store = mockStore(initialState);
    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
    render(<Home />, { wrapper });
    expect(screen.getByText('vblocks@gmail.com')).toBeOnTheScreen();
  });
});
