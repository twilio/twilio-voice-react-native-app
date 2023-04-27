import * as auth0JwtCheck from 'express-oauth2-jwt-bearer';
import request from 'supertest';
import { validateExpressRequest } from 'twilio';
import { createExpressApp } from '../server';
import * as authUtil from '../utils/auth';

jest.unmock('express');

jest.mock('../utils/log');
jest.mock('../utils/auth');

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

describe('/token', () => {
  function tokenRouteTest() {
    const app = createExpressApp(mockServerConfig);
    return request(app).post('/token');
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responds with 200 for a valid request', async () => {
    const auth = jest.spyOn(auth0JwtCheck, 'auth');
    const response = await tokenRouteTest().send();
    expect(auth).toBeCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text/);
    expect(response.text).toBe('mock-accesstoken-tojwt-foobar');
  });

  it('responds with 403 if the auth token is missing', async () => {
    const auth = jest.spyOn(auth0JwtCheck, 'auth').mockImplementationOnce(() =>
      jest.fn((_req: any, _res: any, next: any) => {
        next();
      }),
    );
    const response = await tokenRouteTest().send();
    expect(auth).toBeCalledTimes(1);
    expect(response.status).toBe(403);
    expect(response.headers['content-type']).toMatch(/text/);
    expect(response.text).toBe('No auth token.');
  });

  it('responds with 404 if user info cannot be found', async () => {
    const getUserInfo = jest.spyOn(authUtil, 'getUserInfo').mockResolvedValueOnce({
      success: false,
      reason: 'AXIOS_ERROR',
      error: new Error() as any,
    });
    const response = await tokenRouteTest().send();
    expect(getUserInfo.mock.calls).toEqual([
      ['mock-auth0-issuer-base-url', 'some valid token'],
    ]);
    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toMatch(/text/);
    expect(response.text).toBe('User info not found.');
  });

  it('responds with 401 if unauthorized', async () => {
    jest.spyOn(auth0JwtCheck, 'auth').mockImplementationOnce(() =>
      jest.fn((_req: any, res: any, _next: any) => {
        throw Error(res.status(401));
      }),
    );
    const response = await tokenRouteTest().send();
    expect(response.status).toBe(401);
  });
});

describe('/twiml', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function twimlRouteTest() {
    const app = createExpressApp(mockServerConfig);
    return request(app).post('/twiml');
  }

  describe('responds with status code 400', () => {
    it('if "to" is missing', async () => {
      const response = await twimlRouteTest().send();
      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBe('Missing "To".');
    });

    it('if "recipientType" is missing', async () => {
      const response = await twimlRouteTest().send({
        To: 'bob',
      });
      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBe('Invalid "recipientType".');
    });

    it('if "recipientType" is invalid', async () => {
      const response = await twimlRouteTest().send({
        To: 'bob',
        recipientType: 'foobar',
      });
      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBe('Invalid "recipientType".');
    });
  });

  describe('responds with status code 200', () => {
    it('if a valid username and password are present', async () => {
      const response = await twimlRouteTest().send({
        To: 'bob',
        recipientType: 'client',
      });
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/xml/);
      expect(response.text).toBeDefined();
      expect(response.text).not.toBe('');
    });
  });

  describe('responds with status code 401', () => {
    it('if the twilio signature is unauthorized', async () => {
      jest.mocked(validateExpressRequest).mockReturnValueOnce(false);
      const response = await twimlRouteTest().send({
        To: 'bob',
        recipientType: 'client',
      });
      expect(response.status).toBe(401);
      expect(response.text).toBe('Unauthorized Twilio signature');
    });
  });
});
