import { createTokenRoute } from '../../routes/token';
import { jwt } from 'twilio';

jest.mock('../../utils/auth');

const mockedAccessToken = jest.mocked(jwt.AccessToken);
const mockedVoiceGrant = jest.mocked(jwt.AccessToken.VoiceGrant);

const mockServerConfig = {
  ACCOUNT_SID: 'mock-twiliocredentials-accountsid',
  AUTH_TOKEN: 'mock-twiliocredentials-authtoken',
  API_KEY_SID: 'mock-twiliocredentials-apikeysid',
  API_KEY_SECRET: 'mock-twiliocredentials-apikeysecret',
  TWIML_APP_SID: 'mock-twiliocredentials-outgoingapplicationsid',
  CALLER_ID: 'mock-twiliocredentials-phonenumber',
  PUSH_CREDENTIAL_SID: 'mock-twiliocredentials-pushcredentialsid',
  AUTH0_AUDIENCE: 'mock-auth0-audience',
  AUTH0_ISSUER_BASE_URL: 'mock-auth0-issuer-base-url',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createTokenRoute()', () => {
  it('returns a route function', () => {
    const tokenRoute = createTokenRoute(mockServerConfig);
    expect(typeof tokenRoute).toBe('function');
  });

  describe('tokenRoute()', () => {
    let tokenRoute: ReturnType<typeof createTokenRoute>;
    let mockReq: {
      auth: {
        token: string;
      };
    };
    let mockRes: {
      header: jest.Mock;
      locals: Record<any, any>;
      status: jest.Mock;
      send: jest.Mock;
    };

    beforeEach(() => {
      tokenRoute = createTokenRoute(mockServerConfig);
      mockReq = {
        auth: {
          token: 'mock-token',
        },
      };
      mockRes = {
        header: jest.fn(() => mockRes),
        locals: {},
        status: jest.fn(() => mockRes),
        send: jest.fn(() => mockRes),
      };
    });

    it('constructs an access token', async () => {
      await tokenRoute(mockReq as any, mockRes as any);

      expect(mockedAccessToken.mock.calls).toEqual([
        [
          mockServerConfig.ACCOUNT_SID,
          mockServerConfig.API_KEY_SID,
          mockServerConfig.API_KEY_SECRET,
          {
            identity: 'mock-email',
          },
        ],
      ]);
    });

    it('constructs a voice grant', async () => {
      await tokenRoute(mockReq as any, mockRes as any);

      expect(mockedVoiceGrant.mock.calls).toEqual([
        [
          {
            incomingAllow: true,
            outgoingApplicationSid: mockServerConfig.TWIML_APP_SID,
            pushCredentialSid: mockServerConfig.PUSH_CREDENTIAL_SID,
          },
        ],
      ]);
    });

    it('adds the voice grant to the access token', async () => {
      mockedVoiceGrant.mockImplementationOnce(
        () =>
          ({
            'i am': 'a mock voice grant',
          } as any),
      );
      await tokenRoute(mockReq as any, mockRes as any);

      expect(mockedVoiceGrant.mock.results).toHaveLength(1);
      const mockVoiceGrant = mockedVoiceGrant.mock.results[0].value;
      expect(mockedAccessToken.mock.results).toHaveLength(1);
      const mockAddGrant = mockedAccessToken.mock.results[0].value.addGrant;
      expect(mockAddGrant.mock.calls[0][0]).toBe(mockVoiceGrant);
    });

    it('returns an access token', async () => {
      await tokenRoute(mockReq as any, mockRes as any);

      expect(mockRes.status.mock.calls).toEqual([[200]]);
      const mockToJwt = mockedAccessToken.mock.results[0].value.toJwt;
      expect(mockToJwt.mock.calls).toEqual([[]]);
      expect(mockRes.send.mock.calls).toEqual([
        ['mock-accesstoken-tojwt-foobar'],
      ]);
    });
  });
});
