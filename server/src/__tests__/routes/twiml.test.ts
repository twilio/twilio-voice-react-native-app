import { createTwimlRoute } from '../../routes/twiml';
import { retrieveAuthentication } from '../../middlewares/sample-auth';
import { twiml } from 'twilio';

jest.mock('../../middlewares/sample-auth');

const mockedRetrieveAuthentication = jest.mocked(retrieveAuthentication);
const mockedVoiceResponse = jest.mocked(twiml.VoiceResponse);

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

describe('createTwimlRoute()', () => {
  it('returns a route function', () => {
    const twimlRoute = createTwimlRoute(mockTwilioCredentials);
    expect(typeof twimlRoute).toBe('function');
  });

  describe('twimlRoute()', () => {
    let twimlRoute: ReturnType<typeof createTwimlRoute>;
    let mockReq: {
      body: Record<any, any>,
    };
    let mockRes: {
      header: jest.Mock;
      locals: Record<any, any>,
      status: jest.Mock;
      send: jest.Mock;
    };
    let mockNext: jest.Mock;

    beforeEach(() => {
      twimlRoute = createTwimlRoute(mockTwilioCredentials);
      mockReq = {
        body: {},
      };
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
        twimlRoute(mockReq as any, mockRes as any, mockNext);

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
      });

      it('responds with status code 401 if "to" is missing', () => {
        twimlRoute(mockReq as any, mockRes as any, mockNext);

        expect(mockRes.status.mock.calls).toEqual([[401]]);
        expect(mockRes.send.mock.calls).toEqual([['Missing "to".']]);
      });

      describe('when "to" is present', () => {
        beforeEach(() => {
          mockReq.body.to = 'mock-req-to-foobar';
        })

        it('constructs a voice response', () => {
          twimlRoute(mockReq as any, mockRes as any, mockNext);
          expect(mockedVoiceResponse.mock.calls).toEqual([[]]);
        });

        it('dials a client', () => {
          twimlRoute(mockReq as any, mockRes as any, mockNext);

          expect(mockedVoiceResponse.mock.results).toHaveLength(1);

          const mockVoiceResponse = mockedVoiceResponse.mock.results[0].value;
          const mockDialFn = mockVoiceResponse.dial;
          expect(mockDialFn.mock.calls).toEqual([[]]);
          expect(mockDialFn.mock.results).toHaveLength(1);

          const mockDial = mockDialFn.mock.results[0].value;
          const mockClientFn = mockDial.client;
          expect(mockClientFn.mock.calls).toEqual([[mockReq.body.to]]);
        });

        it('responds with twiml', () => {
          twimlRoute(mockReq as any, mockRes as any, mockNext);

          expect(mockedVoiceResponse.mock.results).toHaveLength(1);
          const mockVoiceResponse = mockedVoiceResponse.mock.results[0].value;
          const mockVoiceResponseToString = mockVoiceResponse.toString;
          expect(mockVoiceResponseToString.mock.calls).toEqual([[]]);
          const toStringRes = mockVoiceResponseToString.mock.results[0].value;

          expect(mockRes.header.mock.calls).toEqual([['Content-Type', 'text/xml']]);
          expect(mockRes.status.mock.calls).toEqual([[200]]);
          expect(mockRes.send.mock.calls).toEqual([[toStringRes]]);
        });
      });
    });
  });
});
