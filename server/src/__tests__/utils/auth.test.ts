import { getUserInfo } from '../../utils/auth';

import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('auth utils', () => {
  describe('getUserInfo', () => {
    it('should return success', async () => {
      const mockedResponse = {
        data: { name: 'foo' },
        status: 200,
        statusText: 'OK',
      };
      mockedAxios.get.mockResolvedValueOnce(mockedResponse);
      const response = await getUserInfo('auth0Url', 'auth0Token');
      expect(response).toEqual({ success: true, userInfo: { name: 'foo' } });
    });

    it('should handle error', async () => {
      const mockedResponse = {
        status: 500,
        statusText: 'ERROR',
      };
      mockedAxios.get.mockRejectedValueOnce(mockedResponse);
      const response = await getUserInfo('auth0Url', 'auth0Token');
      expect(response.success).toEqual(false);
    });
  });
});
