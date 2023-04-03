import request from 'supertest';
import { createExpressApp } from '../server';
import * as auth0JwtCheck from 'express-oauth2-jwt-bearer';
import { validateExpressRequest } from 'twilio';

jest.unmock('express');

jest.mock('../utils/log');
jest.mock('express-oauth2-jwt-bearer');
jest.mocked(validateExpressRequest);

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

  describe('responds with status code 200', () => {
    it('if a valid username and password are present', async () => {
      const auth = jest.spyOn(auth0JwtCheck, 'auth');
      const response = await tokenRouteTest().send({
        username: 'alice',
        password: 'supersecretpassword1234',
      });
      expect(auth).toBeCalledTimes(1);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBeDefined();
      expect(response.text).not.toBe('');
    });
  });

  describe('responds with status code 401', () => {
    it('if auth0 middleware returns 401', async () => {
      jest.spyOn(auth0JwtCheck, 'auth').mockImplementation(() =>
        jest.fn((req: any, res: any, next: any) => {
          throw Error(res.status(401));
        }),
      );
      const response = await tokenRouteTest().send({
        username: 'alice',
        password: 'supersecretpassword1234',
      });
      expect(response.status).toBe(401);
    });
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
      const response = await twimlRouteTest().send({
        username: 'alice',
        password: 'supersecretpassword1234',
      });
      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBe('Missing "To".');
    });

    it('if "recipientType" is missing', async () => {
      const response = await twimlRouteTest().send({
        username: 'alice',
        password: 'supersecretpassword1234',
        To: 'bob',
      });
      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBe('Invalid "recipientType".');
    });

    it('if "recipientType" is invalid', async () => {
      const response = await twimlRouteTest().send({
        username: 'alice',
        password: 'supersecretpassword1234',
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
        username: 'alice',
        password: 'supersecretpassword1234',
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
      jest.mocked(validateExpressRequest).mockReturnValue(false);
      const response = await twimlRouteTest().send({
        username: 'alice',
        password: 'supersecretpassword1234',
        To: 'bob',
        recipientType: 'client',
      });
      expect(response.status).toBe(401);
      expect(response.text).toBe('Unauthorized Twilio signature');
    });
  });
});
