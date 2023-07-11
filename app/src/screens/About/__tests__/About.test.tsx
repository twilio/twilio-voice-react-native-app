import '@testing-library/jest-native/extend-expect';
import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import About from '..';
import { createStore } from '../../../store/app';
import { Linking } from 'react-native';

describe('<About />', () => {
  let wrapper: React.ComponentType<any>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the about page text', () => {
    const store = createStore();
    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
    render(<About />, { wrapper });
    expect(screen.getByText('About')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'This app is maintained by the Twilio Voice Access group',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText('Report an Issue')).toBeOnTheScreen();
    expect(screen.getByText('#test-channel')).toBeOnTheScreen();
    expect(screen.getByText('Version')).toBeOnTheScreen();
  });

  it('should allow user to click #test-channel to be redirected to the slack channel', () => {
    const store = createStore();
    const openURL = jest
      .spyOn(Linking, 'openURL')
      .mockImplementation(() => Promise.resolve(true));
    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
    render(<About />, { wrapper });
    fireEvent.press(screen.getByText('#test-channel'));
    expect(openURL).toBeCalledTimes(1);
  });
});
