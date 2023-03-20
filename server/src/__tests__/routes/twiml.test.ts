import { createTwimlRoute } from '../../routes/twiml';
import { twiml } from 'twilio';

const mockedVoiceResponse = jest.mocked(twiml.VoiceResponse);

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

describe('createTwimlRoute()', () => {
  it('returns a route function', () => {
    const twimlRoute = createTwimlRoute(mockServerConfig);
    expect(typeof twimlRoute).toBe('function');
  });

  describe('twimlRoute()', () => {
    let twimlRoute: ReturnType<typeof createTwimlRoute>;
    let mockReq: {
      headers: Record<any, any>;
      body: Record<any, any>;
    };
    let mockRes: {
      header: jest.Mock;
      locals: Record<any, any>;
      status: jest.Mock;
      send: jest.Mock;
    };
    let mockNext: jest.Mock;

    beforeEach(() => {
      twimlRoute = createTwimlRoute(mockServerConfig);
      mockReq = {
        headers: {
          'x-twilio-signature': 'mock-x-twilio-signature',
        },
        body: {
          To: 'mock-req-to-foobar',
          recipientType: 'client',
        },
      };
      mockRes = {
        header: jest.fn(() => mockRes),
        locals: {},
        status: jest.fn(() => mockRes),
        send: jest.fn(() => mockRes),
      };
      mockNext = jest.fn();
    });

    it('responds with status code 400 if "To" is missing', () => {
      mockReq.body.To = undefined;

      twimlRoute(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status.mock.calls).toEqual([[400]]);
      expect(mockRes.send.mock.calls).toEqual([['Missing "To".']]);
    });

    it('responds with status code 400 if "recipientType" is invalid', () => {
      mockReq.body.recipientType = undefined;

      twimlRoute(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status.mock.calls).toEqual([[400]]);
      expect(mockRes.send.mock.calls).toEqual([['Invalid "recipientType".']]);
    });

    describe('when all body values are present', () => {
      it('constructs a voice response', () => {
        twimlRoute(mockReq as any, mockRes as any, mockNext);
        expect(mockedVoiceResponse.mock.calls).toEqual([[]]);
      });

      it('dials a client', () => {
        mockReq.body.recipientType = 'client';
        twimlRoute(mockReq as any, mockRes as any, mockNext);
        expect(mockedVoiceResponse.mock.results).toHaveLength(1);

        const mockVoiceResponse = mockedVoiceResponse.mock.results[0].value;
        const mockDialFn = mockVoiceResponse.dial;
        expect(mockDialFn.mock.calls).toEqual([
          [
            {
              answerOnBridge: true,
              callerId: undefined,
            },
          ],
        ]);
        expect(mockDialFn.mock.results).toHaveLength(1);

        const mockDial = mockDialFn.mock.results[0].value;
        const mockClientFn = mockDial.client;
        expect(mockClientFn.mock.calls).toEqual([[mockReq.body.To]]);
      });

      it('dials a number', () => {
        mockReq.body.recipientType = 'number';
        twimlRoute(mockReq as any, mockRes as any, mockNext);
        expect(mockedVoiceResponse.mock.results).toHaveLength(1);

        const mockVoiceResponse = mockedVoiceResponse.mock.results[0].value;
        const mockDialFn = mockVoiceResponse.dial;
        expect(mockDialFn.mock.calls).toEqual([
          [
            {
              answerOnBridge: true,
              callerId: 'mock-twiliocredentials-phonenumber',
            },
          ],
        ]);
        expect(mockDialFn.mock.results).toHaveLength(1);

        const mockDial = mockDialFn.mock.results[0].value;
        const mockNumberFn = mockDial.number;
        expect(mockNumberFn.mock.calls).toEqual([[mockReq.body.To]]);
      });

      it('responds with twiml', () => {
        twimlRoute(mockReq as any, mockRes as any, mockNext);

        expect(mockedVoiceResponse.mock.results).toHaveLength(1);
        const mockVoiceResponse = mockedVoiceResponse.mock.results[0].value;
        const mockVoiceResponseToString = mockVoiceResponse.toString;
        expect(mockVoiceResponseToString.mock.calls).toEqual([[]]);
        const toStringRes = mockVoiceResponseToString.mock.results[0].value;

        expect(mockRes.header.mock.calls).toEqual([
          ['Content-Type', 'text/xml'],
        ]);
        expect(mockRes.status.mock.calls).toEqual([[200]]);
        expect(mockRes.send.mock.calls).toEqual([[toStringRes]]);
      });
    });
  });
});
