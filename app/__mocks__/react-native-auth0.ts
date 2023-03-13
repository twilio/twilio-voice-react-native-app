const authorize = jest.fn().mockReturnValue({
  accessToken: 'test token',
  idToken: 'test id token',
});

const userInfo = jest.fn().mockReturnValue({
  email: 'test email',
});

export const getCredentials = jest.fn().mockReturnValue({
  accessToken: 'test token',
  idToken: 'test id token',
});

const mockAuth0 = jest.fn().mockImplementation(() => ({
  credentialsManager: {
    getCredentials,
    clearCredentials: jest.fn(),
    saveCredentials: jest.fn(),
  },
  auth: { userInfo },
  webAuth: { authorize, clearSession: jest.fn() },
}));

export default mockAuth0;
