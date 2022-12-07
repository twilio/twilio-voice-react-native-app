import { getEnvVar, getPort, getTwilioCredentials } from '../../utils/env';
import * as dotenv from 'dotenv';

const mockDotenv = jest.mocked(dotenv);

// Retain a permanent reference to the original process environment before any
// alterations can occur
const env: NodeJS.ProcessEnv = process.env;

const mockEnv = {
  ACCOUNT_SID: 'ACCOUNT_SID',
  API_KEY_SID: 'API_KEY_SID',
  API_KEY_SECRET: 'API_KEY_SECRET',
  CALLER_ID: 'CALLER_ID',
  OUTGOING_APPLICATION_SID: 'OUTGOING_APPLICATION_SID',
  PUSH_CREDENTIAL_SID: 'PUSH_CREDENTIAL_SID',
};

describe('env', () => {
  beforeEach(() => {
    // Restore the process environment before each test
    process.env = env;
  });

  it('should have used dotenv', () => {
    expect(mockDotenv.config.mock.calls).toEqual([[]]);
  });

  describe('getEnvVar(varKey: string)', () => {
    it('reads the process environment', () => {
      process.env = { foo: 'bar' };
      const res = getEnvVar('foo');
      expect(res).toBe('bar');
    });

    it('returns undefined when an env var is not set', () => {
      process.env = {};
      expect(getEnvVar('foo')).toBe(undefined);
    });
  });

  describe('getPort()', () => {
    it('returns undefined when the port env var is missing', () => {
      process.env = {};
      expect(getPort()).toBe(undefined);
    })

    it('returns undefined on an invalid port', () => {
      process.env = { PORT: 'foobar' };
      expect(getPort()).toBe(undefined);
    });

    it('parses a valid port', () => {
      process.env = { PORT: '3003' };
      const res = getPort();
      expect(res).toEqual(3003);
    })
  });

  describe('getTwilioCredentials()', () => {
    it('returns full credentials if all env vars are present', () => {
      process.env = mockEnv;
      const res = getTwilioCredentials();
      expect(res).toBeDefined();
    });

    it('returns undefined if some env vars are not present', () => {
      const res = getTwilioCredentials();
      expect(res).toBeUndefined();
    });
  });
});
