import request from 'supertest';
import { createExpressApp } from '../server';

jest.unmock('express');
jest.unmock('twilio');

jest.mock('../utils/log');

const mockTwilioCredentials = {
  ACCOUNT_SID: 'mock-twiliocredentials-accountsid',
  API_KEY_SID: 'mock-twiliocredentials-apikeysid',
  API_KEY_SECRET: 'mock-twiliocredentials-apikeysecret',
  OUTGOING_APPLICATION_SID: 'mock-twiliocredentials-outgoingapplicationsid',
  CALLER_ID: 'mock-twiliocredentials-phonenumber',
  PUSH_CREDENTIAL_SID: 'mock-twiliocredentials-pushcredentialsid',
};

describe('/token', () => {
  function tokenRouteTest() {
    const app = createExpressApp(mockTwilioCredentials);
    return request(app).post('/token');
  }

  describe('responds with status code 403', () => {
    function expectTokenRouteFail(
      response: request.Response,
      responseText: string
    ) {
      expect(response.status).toBe(403);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBe(responseText);
    }

    it('if neither username or password are present', async () => {
      const response = await tokenRouteTest();
      expect(response.status).toBe(403);
    });

    it('if username is not present', async () => {
      const response = await tokenRouteTest()
        .send({ password: 'bar' });
      expectTokenRouteFail(response, 'Username invalid.');
    });

    it('if password is not present', async () => {
      const response = await tokenRouteTest()
        .send({ username: 'foo' });
      expectTokenRouteFail(response, 'Password invalid.');
    });

    it('if username and password are present, but not valid', async () => {
      const response = await tokenRouteTest()
        .send({ username: 'foo', password: 'bar' });
      expectTokenRouteFail(response, 'Credentials invalid.');
    });
  });

  describe('responds with status code 200', () => {
    it('if a valid username and password are present', async () => {
      const response = await tokenRouteTest()
        .send({ username: 'alice', password: 'supersecretpassword1234' });
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBeDefined();
      expect(response.text).not.toBe('');
    });
  });
});

describe('/twiml', () => {
  function twimlRouteTest() {
    const app = createExpressApp(mockTwilioCredentials);
    return request(app).post('/twiml');
  }

  describe('responds with status code 400', () => {
    it('if "to" is missing', async () => {
      const response = await twimlRouteTest()
        .send({ username: 'alice', password: 'supersecretpassword1234' });
      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBe('Missing "To".');
    });

    it('if "recipientType" is missing', async () => {
      const response = await twimlRouteTest()
        .send({
          username: 'alice',
          password: 'supersecretpassword1234',
          To: 'bob'
        });
      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBe('Invalid "recipientType".');
    });

    it('if "recipientType" is invalid', async () => {
      const response = await twimlRouteTest()
        .send({
          username: 'alice',
          password: 'supersecretpassword1234',
          To: 'bob',
          recipientType: 'foobar'
        });
      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBe('Invalid "recipientType".');
    });
  });

  describe('responds with status code 200', () => {
    it('if a valid username and password are present', async () => {
      const response = await twimlRouteTest()
        .send({
          username: 'alice',
          password: 'supersecretpassword1234',
          To: 'bob',
          recipientType: 'client'
        });
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/xml/);
      expect(response.text).toBeDefined();
      expect(response.text).not.toBe('');
    });
  });
});
