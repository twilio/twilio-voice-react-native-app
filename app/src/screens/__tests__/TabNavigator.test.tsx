import '@testing-library/jest-native/extend-expect';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import TabNavigator from '../TabNavigator';
import configureStore from 'redux-mock-store';
import { NavigationContainer } from '@react-navigation/native';
import Config from '../../../__mocks__/react-native-config';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('<TabNavigator />', () => {
  let wrapper: React.ComponentType<any>;

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

  it('should NOT render <About/> tab when flag disabled', () => {
    render(<TabNavigator />, { wrapper });
    expect(screen.getByText('Home')).toBeOnTheScreen();
    expect(screen.getByText('Dialer')).toBeOnTheScreen();
    expect(screen.queryByText('About')).toBeNull();
  });

  it('should render <About/> Tab when flag enabled', () => {
    Config.ENABLE_ABOUT_PAGE = 'true';
    render(<TabNavigator />, { wrapper });
    expect(screen.getByText('Home')).toBeOnTheScreen();
    expect(screen.getByText('Dialer')).toBeOnTheScreen();
    expect(screen.getByText('About')).toBeOnTheScreen();
  });
});
