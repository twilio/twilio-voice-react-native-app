import { getEnvVariable } from './env';
import Auth0, { type SaveCredentialsParams } from 'react-native-auth0';

export function initializeAuth() {
  const domain = getEnvVariable('DOMAIN_NAME');
  const clientId = getEnvVariable('CLIENT_ID');
  const scope = getEnvVariable('AUTH0_SCOPE');
  const audience = getEnvVariable('AUTH0_AUDIENCE');

  const auth0 = new Auth0({
    domain,
    clientId,
  });

  const checkLoginStatus = async () => {
    const { accessToken } = await auth0.credentialsManager.getCredentials();
    const { email } = await auth0.auth.userInfo({ token: accessToken });
    return {
      accessToken,
      email,
    };
  };

  const login = async () => {
    const credentials = await auth0.webAuth.authorize({ audience, scope });
    if (!credentials.idToken) {
      throw new Error('ID_TOKEN_UNDEFINED');
    }
    const { accessToken } = credentials;
    await auth0.credentialsManager.saveCredentials(
      credentials as SaveCredentialsParams,
    );
    const { email } = await auth0.auth.userInfo({
      token: credentials.accessToken,
    });
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
