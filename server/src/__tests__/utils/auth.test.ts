import { getUserInfo } from '../../utils/auth';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

jest.mock('axios', () => {
  return {
    ...(jest.requireActual('axios') as object),
    create: jest.fn().mockReturnValue(jest.requireActual('axios')),
  };
});

const mockAdapter = new MockAdapter(axios);

describe('auth utils', () => {
  describe('getUserInfo', () => {
    it('should return success', async () => {
      const userInfo = { name: 'foo' };
      mockAdapter.onGet().reply(200, userInfo);
      const response = await getUserInfo('auth0Url', 'auth0Token');
      expect(response).toEqual({ success: true, userInfo });
    });

    it('should handle error', async () => {
      mockAdapter.onGet().reply(400);
      const response = await getUserInfo('auth0Url', 'auth0Token');
      expect(response.success).toEqual(false);
    });
  });
});
