import {
  createSampleAuthenticationMiddleware
} from '../../middlewares/sample-auth';
import { warn } from '../../utils/log';

jest.mock('../../utils/log');

const mockWarn = jest.mocked(warn);

describe('createSampleAuthenticationMiddleware()', () => {
  it('returns a middleware function', () => {
    const auth = createSampleAuthenticationMiddleware();
    expect(typeof auth).toBe('function');
  });

  it('warns that the middleware is unsuitable for production', () => {
    mockWarn.mockClear();
    createSampleAuthenticationMiddleware();
    expect(mockWarn.mock.calls).toHaveLength(1);
  })

  describe('the middleware function', () => {
    it('authenticates a user', () => {
      const mockReq = {
        body: { username: 'alice', password: 'supersecretpassword1234' },
      };
      const mockRes: {
        locals: Record<any, any>;
        status: jest.Mock;
        send: jest.Mock
      } = {
        locals: {},
        status: jest.fn(() => mockRes),
        send: jest.fn(() => mockRes),
      };
      const mockNext = jest.fn();
      const auth = createSampleAuthenticationMiddleware();
      auth(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status.mock.calls).toEqual([]);
      expect(mockRes.send.mock.calls).toEqual([]);
    });

    it('does not authenticate invalid credentials', () => {
      const mockReq = {
        body: { username: 'alice', password: 'nottherightpassword' },
      };
      const mockRes: {
        locals: Record<any, any>;
        status: jest.Mock;
        send: jest.Mock
      } = {
        locals: {},
        status: jest.fn(() => mockRes),
        send: jest.fn(() => mockRes),
      };
      const mockNext = jest.fn();
      const auth = createSampleAuthenticationMiddleware();
      auth(mockReq as any, mockRes as any, mockNext);
      expect(mockRes.status.mock.calls).toEqual([[403]]);
      expect(mockRes.send.mock.calls).toEqual([['Credentials invalid.']]);
    });
  });
});
