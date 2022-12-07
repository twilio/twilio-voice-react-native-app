import request from 'supertest';
import { createExpressApp } from '../server';

jest.unmock('express');
jest.unmock('twilio');

jest.mock('../utils/log');

const mockTwilioCredentials = {
  accountSid: 'f',
  apiKeySid: 'o',
  apiKeySecret: 'o',
  outgoingApplicationSid: 'b',
  phoneNumber: 'a',
  pushCredentialSid: 'r',
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

  describe('responds with status code 403', () => {
    function expectTwimlRouteFail(
      response: request.Response,
      responseText: string
    ) {
      expect(response.status).toBe(403);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBe(responseText);
    }

    it('if neither username or password are present', async () => {
      const response = await twimlRouteTest();
      expect(response.status).toBe(403);
    });

    it('if username is not present', async () => {
      const response = await twimlRouteTest()
        .send({ password: 'bar' });
      expectTwimlRouteFail(response, 'Username invalid.');
    });

    it('if password is not present', async () => {
      const response = await twimlRouteTest()
        .send({ username: 'foo' });
      expectTwimlRouteFail(response, 'Password invalid.');
    });

    it('if username and password are present, but not valid', async () => {
      const response = await twimlRouteTest()
        .send({ username: 'foo', password: 'bar' });
      expectTwimlRouteFail(response, 'Credentials invalid.');
    });
  });

  describe('responds with status code 401', () => {
    it('if "to" is missing', async () => {
      const response = await twimlRouteTest()
        .send({ username: 'alice', password: 'supersecretpassword1234' });
      expect(response.status).toBe(401);
      expect(response.headers['content-type']).toMatch(/text/);
      expect(response.text).toBe('Missing "to".');
    });
  });

  describe('responds with status code 200', () => {
    it('if a valid username and password are present', async () => {
      const response = await twimlRouteTest()
        .send({ username: 'alice', password: 'supersecretpassword1234', to: 'bob' });
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/xml/);
      expect(response.text).toBeDefined();
      expect(response.text).not.toBe('');
    });
  });
});
