import Config from 'react-native-config';

export function initializeAuth() {
  const grant_type = 'password';
  const scope = 'openid profile email';

  const url = Config.AUTH0_URL;
  const username = Config.AUTH0_USERNAME;
  const password = Config.AUTH0_PASSWORD;
  const audience = Config.AUTH0_AUDIENCE;
  const client_id = Config.AUTH0_CLIENT_ID;
  const client_secret = Config.AUTH0_CLIENT_SECRET;

  const undefinedConfigs = [
    url,
    username,
    password,
    audience,
    client_id,
    client_secret,
  ].filter((v) => typeof v === 'undefined');

  if (undefinedConfigs.length) {
    throw new Error('Undefined config value(s).');
  }

  const checkLoginStatus = async () => {
    return { accessToken: '', email: '' };
  };

  const login = async () => {
    const response = await fetch(url!, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type,
        username,
        password,
        audience,
        scope,
        client_id,
        client_secret,
      }),
    });
    if (!response.ok) {
      throw new Error('AUTH0_TOKEN_RESPONSE_NOT_OK');
    }
    const auth0Token = await response.json();
    return {
      accessToken: auth0Token.access_token,
      email: 'test_email@twilio.com',
    };
  };

  const logout = async () => {
    return { accessToken: '', email: '' };
  };

  return {
    checkLoginStatus,
    login,
    logout,
  };
}

export const auth = initializeAuth();
