import { NavigationContainer } from '@react-navigation/native';
import '@testing-library/jest-native/extend-expect';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import CallInvite from '../';
import { createStore } from '../../../store/app';
import { setCallInvite } from '../../../store/voice/call/callInvite';

describe('<CallInvite />', () => {
  let store: ReturnType<typeof createStore>;
  let wrapper: React.ComponentType<any>;

  beforeEach(async () => {
    store = createStore();
    wrapper = ({ children }) => (
      <NavigationContainer>
        <Provider store={store}>{children}</Provider>
      </NavigationContainer>
    );
    store.dispatch(
      setCallInvite({
        id: 'foobar-id',
        info: {
          callSid: 'foobar-callsid',
          customParameters: {},
          from: 'foobar-from',
          state: 'connecting',
          to: 'foobar-to',
        },
        status: 'idle',
      }),
    );
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
    expect(screen.getByText('foobar-from')).toBeOnTheScreen();
    expect(screen.getByText('Incoming Call')).toBeOnTheScreen();
  });
});
