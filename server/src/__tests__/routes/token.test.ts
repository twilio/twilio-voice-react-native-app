import { createTokenRoute } from '../../routes/token';
import { retrieveAuthentication } from '../../middlewares/sample-auth';
import { jwt } from 'twilio';

jest.mock('../../middlewares/sample-auth');

const mockedRetrieveAuthentication = jest.mocked(retrieveAuthentication);
const mockedAccessToken = jest.mocked(jwt.AccessToken);
const mockedVoiceGrant = jest.mocked(jwt.AccessToken.VoiceGrant);

const mockTwilioCredentials = {
  ACCOUNT_SID: 'mock-twiliocredentials-accountsid',
  API_KEY_SID: 'mock-twiliocredentials-apikeysid',
  API_KEY_SECRET: 'mock-twiliocredentials-apikeysecret',
  OUTGOING_APPLICATION_SID: 'mock-twiliocredentials-outgoingapplicationsid',
  CALLER_ID: 'mock-twiliocredentials-phonenumber',
  PUSH_CREDENTIAL_SID: 'mock-twiliocredentials-pushcredentialsid',
};

beforeEach(() => {
  mockedRetrieveAuthentication.mockReset();
  jest.clearAllMocks();
});

describe('createTokenRoute()', () => {
  it('returns a route function', () => {
    const tokenRoute = createTokenRoute(mockTwilioCredentials);
    expect(typeof tokenRoute).toBe('function');
  });

  describe('tokenRoute()', () => {
    let tokenRoute: ReturnType<typeof createTokenRoute>;
    let mockReq: {};
    let mockRes: {
      header: jest.Mock;
      locals: Record<any, any>,
      status: jest.Mock;
      send: jest.Mock;
    };
    let mockNext: jest.Mock;

    beforeEach(() => {
      tokenRoute = createTokenRoute(mockTwilioCredentials);
      mockReq = {};
      mockRes = {
        header: jest.fn(() => mockRes),
        locals: {},
        status: jest.fn(() => mockRes),
        send: jest.fn(() => mockRes),
      };
      mockNext = jest.fn();
    });

    describe('for unauthenticated requests', () => {
      it('returns status code 403', () => {
        tokenRoute(mockReq as any, mockRes as any, mockNext);

        expect(mockedRetrieveAuthentication.mock.calls).toHaveLength(1);
        expect(mockedRetrieveAuthentication.mock.calls[0][0]).toBe(mockRes);
        expect(mockNext.mock.calls).toEqual([]);
        expect(mockRes.status.mock.calls).toEqual([[403]]);
        expect(mockRes.send.mock.calls).toEqual([['Unauthenticated request.']]);
      });
    });

    describe('for authenticated requests', () => {
      beforeEach(() => {
        mockedRetrieveAuthentication.mockImplementationOnce(() => ({
          username: 'foobar',
        }));
      })

      it('constructs an access token', () => {
        tokenRoute(mockReq as any, mockRes as any, mockNext);

        expect(mockedAccessToken.mock.calls).toEqual([[
          mockTwilioCredentials.ACCOUNT_SID,
          mockTwilioCredentials.API_KEY_SID,
          mockTwilioCredentials.API_KEY_SECRET,
          {
            identity: 'foobar',
          }
        ]]);
      });

      it('constructs a voice grant', () => {
        tokenRoute(mockReq as any, mockRes as any, mockNext);

        expect(mockedVoiceGrant.mock.calls).toEqual([[{
          incomingAllow: true,
          outgoingApplicationSid:
            mockTwilioCredentials.OUTGOING_APPLICATION_SID,
          pushCredentialSid: mockTwilioCredentials.PUSH_CREDENTIAL_SID,
        }]]);
      });

      it('adds the voice grant to the access token', () => {
        mockedVoiceGrant.mockImplementationOnce(() => ({
          'i am': 'a mock voice grant',
        }) as any);
        tokenRoute(mockReq as any, mockRes as any, mockNext);

        expect(mockedVoiceGrant.mock.results).toHaveLength(1);
        const mockVoiceGrant = mockedVoiceGrant.mock.results[0].value;
        expect(mockedAccessToken.mock.results).toHaveLength(1);
        const mockAddGrant = mockedAccessToken.mock.results[0].value.addGrant;
        expect(mockAddGrant.mock.calls[0][0]).toBe(mockVoiceGrant);
      });

      it('returns an access token', () => {
        tokenRoute(mockReq as any, mockRes as any, mockNext);

        expect(mockedRetrieveAuthentication.mock.calls).toEqual([[mockRes]]);
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
});
