import '@testing-library/jest-native/extend-expect';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import CallInvite from '../';
import { createStore } from '../../../store/app';

describe('<CallInvite />', () => {
  let store: ReturnType<typeof createStore>;
  let wrapper: React.ComponentType<any>;

  beforeEach(() => {
    store = createStore();
    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  });

  it('should have a "make call" button', () => {
    render(<CallInvite />, { wrapper });
    expect(screen.getByLabelText('make call')).toBeOnTheScreen();
  });

  it('should have a "end call" button', () => {
    render(<CallInvite />, { wrapper });
    expect(screen.getByLabelText('end call')).toBeOnTheScreen();
  });

  it('should show the incoming call details', () => {
    render(<CallInvite />, { wrapper });
    expect(screen.getByText('foo')).toBeOnTheScreen();
    expect(screen.getByText('Incoming Call')).toBeOnTheScreen();
  });
});
