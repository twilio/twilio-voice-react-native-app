import { getEnvVar, getPort } from '../../util/env';
import * as dotenv from 'dotenv';

const mockDotenv = jest.mocked(dotenv);

// Retain a permanent reference to the original process environment before any
// alterations can occur
const env: NodeJS.ProcessEnv = process.env;

beforeEach(() => {
  // Restore the process environment before each test
  process.env = env;
});

describe('env', () => {
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
});
