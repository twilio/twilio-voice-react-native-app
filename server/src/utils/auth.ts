import axios, { type AxiosError } from 'axios';

export type UserInfo = {
  email: string;
  email_verified: string;
  name: string;
  nickname: string;
  picture: string;
  sub: string;
  updated_at: string;
};

export type UserInfoResponse =
  | {
      success: true;
      userInfo: UserInfo;
    }
  | {
      success: false;
      reason: 'AXIOS_ERROR';
      error: AxiosError;
    };

export async function getUserInfo(
  auth0Url: string,
  auth0Token: string
): Promise<UserInfoResponse> {
  const userInfoUrl = `${auth0Url}/userinfo`;
  const headers = { 'Authorization': `Bearer ${auth0Token}` };
  const response = await axios.get(userInfoUrl, { headers })
    .then((value) => ({ success: true as const, value }))
    .catch((error) => ({ success: false as const, error }));

  if (!response.success) {
    return {
      success: false,
      reason: 'AXIOS_ERROR',
      error: response.error,
    };
  }

  return {
    success: true,
    userInfo: response.value.data,
  };
}
