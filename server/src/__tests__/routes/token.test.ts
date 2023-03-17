import { createTokenRoute } from '../../routes/token';
import { jwt } from 'twilio';

const mockedAccessToken = jest.mocked(jwt.AccessToken);
const mockedVoiceGrant = jest.mocked(jwt.AccessToken.VoiceGrant);

const mockServerConfig = {
  ACCOUNT_SID: 'mock-twiliocredentials-accountsid',
  AUTH_TOKEN: 'mock-twiliocredentials-authtoken',
  API_KEY_SID: 'mock-twiliocredentials-apikeysid',
  API_KEY_SECRET: 'mock-twiliocredentials-apikeysecret',
  OUTGOING_APPLICATION_SID: 'mock-twiliocredentials-outgoingapplicationsid',
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
    let mockReq: {};
    let mockRes: {
      header: jest.Mock;
      locals: Record<any, any>;
      status: jest.Mock;
      send: jest.Mock;
    };
    let mockNext: jest.Mock;

    beforeEach(() => {
      tokenRoute = createTokenRoute(mockServerConfig);
      mockReq = {};
      mockRes = {
        header: jest.fn(() => mockRes),
        locals: {},
        status: jest.fn(() => mockRes),
        send: jest.fn(() => mockRes),
      };
      mockNext = jest.fn();
    });

    it('constructs an access token', () => {
      tokenRoute(mockReq as any, mockRes as any, mockNext);

      expect(mockedAccessToken.mock.calls).toEqual([
        [
          mockServerConfig.ACCOUNT_SID,
          mockServerConfig.API_KEY_SID,
          mockServerConfig.API_KEY_SECRET,
        ],
      ]);
    });

    it('constructs a voice grant', () => {
      tokenRoute(mockReq as any, mockRes as any, mockNext);

      expect(mockedVoiceGrant.mock.calls).toEqual([
        [
          {
            incomingAllow: true,
            outgoingApplicationSid: mockServerConfig.OUTGOING_APPLICATION_SID,
            pushCredentialSid: mockServerConfig.PUSH_CREDENTIAL_SID,
          },
        ],
      ]);
    });

    it('adds the voice grant to the access token', () => {
      mockedVoiceGrant.mockImplementationOnce(
        () =>
          ({
            'i am': 'a mock voice grant',
          } as any),
      );
      tokenRoute(mockReq as any, mockRes as any, mockNext);

      expect(mockedVoiceGrant.mock.results).toHaveLength(1);
      const mockVoiceGrant = mockedVoiceGrant.mock.results[0].value;
      expect(mockedAccessToken.mock.results).toHaveLength(1);
      const mockAddGrant = mockedAccessToken.mock.results[0].value.addGrant;
      expect(mockAddGrant.mock.calls[0][0]).toBe(mockVoiceGrant);
    });

    it('returns an access token', () => {
      tokenRoute(mockReq as any, mockRes as any, mockNext);

      expect(mockNext.mock.calls).toEqual([]);
      expect(mockRes.status.mock.calls).toEqual([[200]]);
      const mockToJwt = mockedAccessToken.mock.results[0].value.toJwt;
      expect(mockToJwt.mock.calls).toEqual([[]]);
      expect(mockRes.send.mock.calls).toEqual([
        ['mock-accesstoken-tojwt-foobar'],
      ]);
    });
  });
});
