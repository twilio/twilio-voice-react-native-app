import '@testing-library/jest-native/extend-expect';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import SignIn from '..';
import { createStore } from '../../../store/app';
import * as auth0 from '../../../../__mocks__/react-native-auth0';
import * as user from '../../../store/user';
import * as token from '../../../store/voice/accessToken';

let fetchMock: jest.Mock;

jest.mock('../../../../src/util/fetch', () => ({
  fetch: (fetchMock = jest.fn()),
}));

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

  it('should show the accessToken error message', async () => {
    const errorMessage = 'wrong email';
    jest.spyOn(auth0, 'authorize').mockResolvedValueOnce({
      accessToken: 'test token',
      idToken: 'test id token',
    });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      text: jest.fn().mockResolvedValueOnce(errorMessage),
      status: 401,
    });
    await store.dispatch(user.login());
    await store.dispatch(token.getAccessToken());
    render(<SignIn />, { wrapper });
    expect(screen.getByText(errorMessage)).toBeOnTheScreen();
  });
});
