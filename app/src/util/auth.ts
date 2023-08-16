import { getEnvVariable } from './env';
import Auth0, { type Credentials } from 'react-native-auth0';

export function initializeAuth() {
  const domain = getEnvVariable('DOMAIN_NAME');
  const clientId = getEnvVariable('CLIENT_ID');
  const scope = getEnvVariable('AUTH0_SCOPE');
  const audience = getEnvVariable('AUTH0_AUDIENCE');

  const auth0 = new Auth0({
    domain,
    clientId,
  });

  const checkLoginStatus = async (): Promise<{
    accessToken: string;
    email: string;
  }> => {
    const { accessToken } = await auth0.credentialsManager.getCredentials();
    const { email } = await auth0.auth.userInfo({ token: accessToken });
    if (typeof email === 'undefined') {
      throw new Error('EMAIL_UNDEFINED');
    }
    return {
      accessToken,
      email,
    };
  };

  const login = async (): Promise<{ accessToken: string; email: string }> => {
    const credentials = await auth0.webAuth.authorize({ audience, scope });
    if (!credentials.idToken) {
      throw new Error('ID_TOKEN_UNDEFINED');
    }
    const { accessToken } = credentials;
    await auth0.credentialsManager.saveCredentials(credentials as Credentials);
    const { email } = await auth0.auth.userInfo({
      token: credentials.accessToken,
    });
    if (typeof email === 'undefined') {
      throw new Error('EMAIL_UNDEFINED');
    }
    return {
      accessToken,
      email,
    };
  };

  const logout = async () => {
    await auth0.webAuth.clearSession({ federated: true });
    await auth0.credentialsManager.clearCredentials();
  };

  return {
    checkLoginStatus,
    login,
    logout,
  };
}

export const auth = initializeAuth();
