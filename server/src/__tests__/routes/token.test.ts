/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTokenRoute } from '../../routes/token';
import { jwt } from 'twilio';
import * as auth from '../../utils/auth';

jest.mock('../../utils/log');

const mockedAccessToken = jest.mocked(jwt.AccessToken);
const mockedVoiceGrant = jest.mocked(jwt.AccessToken.VoiceGrant);

const mockServerConfig = {
  ACCOUNT_SID: 'mock-twiliocredentials-accountsid',
  AUTH_TOKEN: 'mock-twiliocredentials-authtoken',
  API_KEY_SID: 'mock-twiliocredentials-apikeysid',
  API_KEY_SECRET: 'mock-twiliocredentials-apikeysecret',
  TWIML_APP_SID: 'mock-twiliocredentials-outgoingapplicationsid',
  CALLER_ID: 'mock-twiliocredentials-phonenumber',
  APN_PUSH_CREDENTIAL_SID: 'mock-twiliocredentials-apnpushcredentialsid',
  FCM_PUSH_CREDENTIAL_SID: 'mock-twiliocredentials-fcmpushcredentialsid',
  AUTH0_AUDIENCE: 'mock-auth0-audience',
  AUTH0_ISSUER_BASE_URL: 'mock-auth0-issuer-base-url',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(auth, 'getUserInfo').mockImplementation(
    jest.fn().mockResolvedValue({
      success: true,
      userInfo: {
        email: 'mock-email@test.com',
        email_verified: 'mock-email-verified',
        name: 'mock-name',
        nickname: 'mock-nickname',
        picture: 'mock-picture',
        sub: 'mock-sub',
        updated_at: 'mock-updated-at',
      },
    }),
  );
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
      body: {
        platform?: string;
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
        body: {
          platform: 'android',
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
            identity: 'mock-email@test.com',
          },
        ],
      ]);
    });

    it('uses the override client identity env var', async () => {
      (mockServerConfig as any).CLIENT_IDENTITY = 'foobar';

      await tokenRoute(mockReq as any, mockRes as any);

      expect(mockedAccessToken.mock.calls).toEqual([
        [
          mockServerConfig.ACCOUNT_SID,
          mockServerConfig.API_KEY_SID,
          mockServerConfig.API_KEY_SECRET,
          {
            identity: 'foobar',
          },
        ],
      ]);
    })

    it('constructs a voice grant', async () => {
      await tokenRoute(mockReq as any, mockRes as any);

      expect(mockedVoiceGrant.mock.calls).toEqual([
        [
          {
            incomingAllow: true,
            outgoingApplicationSid: mockServerConfig.TWIML_APP_SID,
            pushCredentialSid: mockServerConfig.FCM_PUSH_CREDENTIAL_SID,
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

    describe('Verify Twilio Email', () => {
      it('returns 401 when EMAIL_VERIFICATION_REGEX is provided, and email is NOT @twilio.com', async () => {
        tokenRoute = createTokenRoute({
          ...mockServerConfig,
          EMAIL_VERIFICATION_REGEX: '@twilio.com',
        });

        await tokenRoute(mockReq as any, mockRes as any);

        expect(mockRes.status.mock.calls).toEqual([[401]]);
      });

      it('returns 200 when EMAIL_VERIFICATION_REGEX is provided, and email is @twilio.com', async () => {
        jest.spyOn(auth, 'getUserInfo').mockImplementation(
          jest.fn().mockResolvedValue({
            success: true,
            userInfo: {
              email: 'mock-email@twilio.com',
              email_verified: 'mock-email-verified',
              name: 'mock-name',
              nickname: 'mock-nickname',
              picture: 'mock-picture',
              sub: 'mock-sub',
              updated_at: 'mock-updated-at',
            },
          }),
        );
        tokenRoute = createTokenRoute({
          ...mockServerConfig,
          EMAIL_VERIFICATION_REGEX: '@twilio.com',
        });

        await tokenRoute(mockReq as any, mockRes as any);

        expect(mockRes.status.mock.calls).toEqual([[200]]);
      });
    });
  });
});
